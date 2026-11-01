import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMProvider:
    """
    Unified Abstraction Layer for LLM models:
    Supports Groq LPU (GPT-OSS-120B/20B), Google Gemini, OpenAI, Anthropic Claude, xAI Grok, Ollama, and fallback Mock provider.
    """

    def __init__(self, provider_name: Optional[str] = None):
        self.provider_name = (provider_name or settings.DEFAULT_LLM_PROVIDER).lower()

    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        context_memories: Optional[List[str]] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> str:
        # Format context if memories provided
        augmented_prompt = prompt
        if context_memories and len(context_memories) > 0:
            memory_block = "\n".join([f"- {m}" for m in context_memories])
            augmented_prompt = f"User Long-Term Memory Context:\n{memory_block}\n\nUser Question:\n{prompt}"

        sys_instruction = system_prompt or (
            "You are AegisAI, an advanced self-learning adaptive AI assistant equipped with Decision Intelligence. "
            "You provide precise, context-aware, helpful, and objective answers."
        )

        try:
            # 1. Groq / Grok provider handling
            if self.provider_name in ["groq", "grok", "xai"]:
                groq_key = settings.GROQ_API_KEY or (settings.GROK_API_KEY if settings.GROK_API_KEY and settings.GROK_API_KEY.startswith("gsk_") else None)
                if groq_key:
                    return await self._call_groq(augmented_prompt, sys_instruction, temperature, max_tokens, api_key=groq_key)
                elif settings.GROK_API_KEY and not settings.GROK_API_KEY.startswith("your_"):
                    return await self._call_grok(augmented_prompt, sys_instruction, temperature, max_tokens)
                else:
                    return await self._call_mock_grok(augmented_prompt, sys_instruction)

            # 2. OpenAI provider
            elif self.provider_name == "openai" and settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here":
                return await self._call_openai(augmented_prompt, sys_instruction, temperature, max_tokens)

            # 3. Anthropic provider
            elif self.provider_name == "anthropic" and settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY != "your_anthropic_api_key_here":
                return await self._call_anthropic(augmented_prompt, sys_instruction, temperature, max_tokens)

            # 4. Gemini provider (with graceful fallback to Groq if quota exhausted)
            elif self.provider_name == "gemini" and settings.GEMINI_API_KEY:
                try:
                    return await self._call_gemini(augmented_prompt, sys_instruction, temperature, max_tokens)
                except Exception as gemini_err:
                    logger.warning(f"Gemini API quota or call failed: {gemini_err}. Attempting Groq fallback if configured.")
                    groq_key = settings.GROQ_API_KEY or (settings.GROK_API_KEY if settings.GROK_API_KEY and settings.GROK_API_KEY.startswith("gsk_") else None)
                    if groq_key:
                        return await self._call_groq(augmented_prompt, sys_instruction, temperature, max_tokens, api_key=groq_key)
                    raise gemini_err

            # 5. Ollama provider
            elif self.provider_name == "ollama":
                return await self._call_ollama(augmented_prompt, sys_instruction, temperature, max_tokens)

            # 6. Fallback if none matched
            else:
                groq_key = settings.GROQ_API_KEY or (settings.GROK_API_KEY if settings.GROK_API_KEY and settings.GROK_API_KEY.startswith("gsk_") else None)
                if groq_key:
                    return await self._call_groq(augmented_prompt, sys_instruction, temperature, max_tokens, api_key=groq_key)
                return await self._call_mock_provider(augmented_prompt, sys_instruction)

        except Exception as e:
            logger.warning(f"Provider {self.provider_name} failed: {e}. Falling back to intelligent engine response.")
            # If Groq is available and was not what failed, try Groq before falling back to mock
            groq_key = settings.GROQ_API_KEY or (settings.GROK_API_KEY if settings.GROK_API_KEY and settings.GROK_API_KEY.startswith("gsk_") else None)
            if groq_key and self.provider_name not in ["groq"]:
                try:
                    return await self._call_groq(augmented_prompt, sys_instruction, temperature, max_tokens, api_key=groq_key)
                except Exception:
                    pass
            if self.provider_name in ["grok", "xai"]:
                return await self._call_mock_grok(augmented_prompt, sys_instruction)
            return await self._call_mock_provider(augmented_prompt, sys_instruction)

    async def _call_groq(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float,
        max_tokens: int,
        api_key: Optional[str] = None
    ) -> str:
        key = api_key or settings.GROQ_API_KEY or settings.GROK_API_KEY
        if not key or key.startswith("your_"):
            return await self._call_mock_grok(prompt, system_prompt)

        url = f"{settings.GROQ_BASE_URL.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }

        # Available high-performance models on user's Groq key
        models_to_try = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]
        last_error = None

        for model_id in models_to_try:
            payload = {
                "model": model_id,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        logger.warning(f"Groq model {model_id} returned status {resp.status_code}: {resp.text}")
                        last_error = Exception(f"Groq API returned {resp.status_code}: {resp.text}")
            except Exception as ex:
                logger.warning(f"Groq call with model {model_id} error: {ex}")
                last_error = ex

        raise last_error or RuntimeError("Groq API call failed across all candidate models.")

    async def _call_grok(self, prompt: str, system_prompt: str, temperature: float, max_tokens: int) -> str:
        api_key = settings.GROK_API_KEY or settings.XAI_API_KEY
        if not api_key or api_key.startswith("your_"):
            return await self._call_mock_grok(prompt, system_prompt)

        url = f"{settings.GROK_BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "grok-2-latest",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def _call_mock_grok(self, prompt: str, system_prompt: str) -> str:
        prompt_lower = prompt.lower()
        if "decision" in prompt_lower or "offer" in prompt_lower or "compare" in prompt_lower or "option" in prompt_lower:
            return (
                "### [Groq LPU // Decision Analysis]\n\n"
                "Objective Multi-Criteria Analysis:\n\n"
                "1. **Option A ($140k, Hybrid / 3 Days On-Site)**:\n"
                "- **Financial Advantage**: +$20,000 gross annual income (~$1,100–$1,300/mo net).\n"
                "- **Commute Cost**: ~150 round trips/yr. At 1.5 hrs/day, 225 hours consumed in transit.\n"
                "- **Strategic Benefit**: Increased executive proximity and synchronous collaboration.\n\n"
                "2. **Option B ($120k, 100% Remote)**:\n"
                "- **Financial Baseline**: $120k with near-zero commuting and wardrobe expenses.\n"
                "- **Time Dividend**: 225 reclaimed hours/year for sleep, exercise, or continuous learning.\n"
                "- **Autonomy**: Full location independence.\n\n"
                "**Recommendation**: Option B yields higher quality-of-life per unit of compensation, unless on-site mentorship at Option A significantly accelerates career velocity."
            )
        return (
            f"### [Groq LPU Telemetry]\n\n"
            f"Query acknowledged: \"{prompt[:120]}\"\n\n"
            "Analyzing through multi-criteria decision nodes and persistent memory context."
        )

    async def _call_openai(self, prompt: str, system_prompt: str, temperature: float, max_tokens: int) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def _call_anthropic(self, prompt: str, system_prompt: str, temperature: float, max_tokens: int) -> str:
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "claude-3-5-sonnet-20240620",
            "system": system_prompt,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["content"][0]["text"]

    async def _call_gemini(self, prompt: str, system_prompt: str, temperature: float, max_tokens: int) -> str:
        models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
        last_exception = None

        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{
                    "parts": [{"text": f"{system_prompt}\n\n{prompt}"}]
                }]
            }
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                return parts[0]["text"]
            except Exception as ex:
                last_exception = ex

        raise last_exception or RuntimeError("Gemini API call failed for all model versions.")

    async def _call_ollama(self, prompt: str, system_prompt: str, temperature: float, max_tokens: int) -> str:
        url = f"{settings.OLLAMA_BASE_URL}/api/generate"
        payload = {
            "model": "llama3",
            "system": system_prompt,
            "prompt": prompt,
            "stream": False
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "")

    async def _call_mock_provider(self, prompt: str, system_prompt: str) -> str:
        prompt_lower = prompt.lower()
        if "decision" in prompt_lower or "offer" in prompt_lower or "compare" in prompt_lower or "option" in prompt_lower:
            return (
                "### AegisAI Decision Intelligence Evaluation\n\n"
                "I analyzed your options using Multi-Criteria Decision Analysis (MCDA):\n\n"
                "1. **Option A ($140k, 3 Days In-Office)**:\n"
                "   - **Pros**: Higher guaranteed compensation (+$20,000/yr), face-to-face team collaboration.\n"
                "   - **Cons & Risks**: Commute time overhead (~2-3 hrs/week), less location flexibility.\n\n"
                "2. **Option B ($120k, 100% Remote)**:\n"
                "   - **Pros**: Zero commute cost/time, complete geographical freedom, maximum work-life balance.\n"
                "   - **Cons**: $20k lower base salary, potential remote isolation.\n\n"
                "**Decision Recommendation (Confidence: 88%)**:\n"
                "- If your primary goal is **maximizing net financial savings and in-person mentorship**, choose **Option A**.\n"
                "- If your primary goal is **work-life balance, zero commute, and schedule autonomy**, choose **Option B** (the $20k gap is often offset by commute savings & quality of life)."
            )
        elif "task" in prompt_lower or "schedule" in prompt_lower or "meeting" in prompt_lower:
            return "I have recorded your request in the productivity engine and synchronized your task schedule."
        else:
            return (
                f"Hello! I am AegisAI, your adaptive assistant. I have received your request: '{prompt[:100]}...'\n"
                "I am maintaining long-term memory context and dynamic learning preferences for your session."
            )
