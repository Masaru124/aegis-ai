import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.llm_provider import LLMProvider
from app.services.memory_engine import MemoryEngine
from app.services.decision_engine import DecisionIntelligenceEngine
from app.schemas.schemas import DecisionRequest, DecisionOptionInput
from app.models.models import Task

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """
    LangGraph-inspired Agent Orchestrator.
    Routes user prompts through Intent Detection -> Memory Retrieval -> Tool/Decision Invocation -> LLM Generation.
    """

    def __init__(self, provider_name: Optional[str] = None):
        self.llm = LLMProvider(provider_name=provider_name)

    async def execute_agent_pipeline(
        self,
        db: AsyncSession,
        user_id: str,
        prompt: str,
        conversation_history: List[Dict[str, str]] = None,
        enable_memory: bool = True
    ) -> Dict[str, Any]:
        prompt_lower = prompt.lower()
        used_memories: List[str] = []
        tool_results: List[str] = []

        # Step 1: Memory Retrieval Node
        if enable_memory:
            relevant_mems = await MemoryEngine.search_relevant_memories(
                db=db, user_id=user_id, query=prompt, top_k=3
            )
            used_memories = [m.content for m in relevant_mems]

        # Step 2: Intent & Decision Engine Invocation Node
        is_decision_query = any(k in prompt_lower for k in ["offer", "job offer", "option a", "option b", "compare", "evaluate this decision", "choose between"])

        if is_decision_query:
            try:
                dec_req = DecisionRequest(
                    title="User Decision Evaluation",
                    category="career" if "offer" in prompt_lower or "job" in prompt_lower else "general",
                    criteria_weights={"financial_compensation": 0.4, "work_life_balance": 0.4, "growth_and_flexibility": 0.2},
                    options=[
                        DecisionOptionInput(
                            name="Option A ($140k, 3 Days In-Office)",
                            metrics={"financial_compensation": 9.3, "work_life_balance": 5.5, "growth_and_flexibility": 7.0}
                        ),
                        DecisionOptionInput(
                            name="Option B ($120k, 100% Remote)",
                            metrics={"financial_compensation": 8.0, "work_life_balance": 9.5, "growth_and_flexibility": 8.5}
                        )
                    ]
                )
                dec_res = DecisionIntelligenceEngine.evaluate_decision(dec_req)
                tool_results.append(
                    f"Decision Engine Analysis complete. Recommended Option: '{dec_res.recommended_option}' "
                    f"(Confidence Score: {int(dec_res.confidence_score * 100)}%). "
                    f"Reasoning: {dec_res.explanation}"
                )
            except Exception as e:
                logger.error(f"Decision Engine execution error: {e}")

        # Step 3: Task & Productivity Tool Execution Node
        if "create task" in prompt_lower or "add task" in prompt_lower or "todo" in prompt_lower:
            task_title = prompt.replace("create task", "").replace("add task", "").strip() or "New Assistant Task"
            new_task = Task(
                user_id=user_id,
                title=task_title,
                status="pending",
                priority="medium"
            )
            db.add(new_task)
            await db.flush()
            tool_results.append(f"Created task '{task_title}' (ID: {new_task.id[:8]}) in task manager.")

        # Step 4: System Prompt Synthesis & Response Generation
        system_prompt = (
            "You are AegisAI, an intelligent self-learning assistant with Decision Intelligence support capabilities. "
            "Deliver structured, detailed, context-aware, and objective answers."
        )
        if tool_results:
            system_prompt += f"\nActive Tool & Decision Engine Results:\n" + "\n".join([f"- {tr}" for tr in tool_results])

        llm_response = await self.llm.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            context_memories=used_memories
        )

        return {
            "response": llm_response,
            "used_memories": used_memories,
            "tool_results": tool_results
        }
