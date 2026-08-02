import json
import math
import logging
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import Memory, UserProfile
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# Global lightweight embedding model instance
_embedder = None


def get_embedder():
    global _embedder
    if _embedder is None:
        try:
            _embedder = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer: {e}. Falling back to hash vectorizer.")
            _embedder = "fallback"
    return _embedder


def compute_embedding(text: str) -> List[float]:
    embedder = get_embedder()
    if embedder != "fallback" and hasattr(embedder, "encode"):
        vec = embedder.encode(text)
        return vec.tolist()
    else:
        # Fallback deterministic pseudo-embedding vector for offline environments
        words = text.lower().split()
        vector = [0.0] * 64
        for idx, word in enumerate(words):
            hash_val = sum(ord(c) for c in word)
            vector[hash_val % 64] += 1.0
        # Normalize
        norm = math.sqrt(sum(x * x for x in vector)) or 1.0
        return [x / norm for x in vector]


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    if len(vec1) != len(vec2):
        min_dim = min(len(vec1), len(vec2))
        vec1 = vec1[:min_dim]
        vec2 = vec2[:min_dim]
    
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = math.sqrt(sum(a * a for a in vec1))
    norm_b = math.sqrt(sum(b * b for b in vec2))
    if not norm_a or not norm_b:
        return 0.0
    return dot_product / (norm_a * norm_b)


class MemoryEngine:
    """
    Self-Learning Adaptive Memory Engine.
    Manages long-term semantic, episodic, and user-approved preference memories.
    """

    @staticmethod
    async def add_memory(
        db: AsyncSession,
        user_id: str,
        content: str,
        memory_type: str = "semantic",
        importance: float = 1.0,
        is_approved: bool = True
    ) -> Memory:
        embedding = compute_embedding(content)
        memory = Memory(
            user_id=user_id,
            content=content,
            memory_type=memory_type,
            importance=importance,
            is_approved=is_approved,
            embedding_json=json.dumps(embedding)
        )
        db.add(memory)
        await db.flush()
        return memory

    @staticmethod
    async def search_relevant_memories(
        db: AsyncSession,
        user_id: str,
        query: str,
        top_k: int = 5,
        min_similarity: float = 0.25
    ) -> List[Memory]:
        query_vec = compute_embedding(query)
        result = await db.execute(
            select(Memory).where(
                Memory.user_id == user_id,
                Memory.is_approved == True
            )
        )
        memories = result.scalars().all()

        scored_memories: List[Tuple[float, Memory]] = []
        for mem in memories:
            if not mem.embedding_json:
                continue
            mem_vec = json.loads(mem.embedding_json)
            sim = cosine_similarity(query_vec, mem_vec)
            # Adjust score by memory importance
            final_score = sim * mem.importance
            if final_score >= min_similarity:
                scored_memories.append((final_score, mem))

        scored_memories.sort(key=lambda x: x[0], reverse=True)
        return [mem for _, mem in scored_memories[:top_k]]

    @staticmethod
    async def process_user_feedback_and_learn(
        db: AsyncSession,
        user_id: str,
        rating: int,
        correction: Optional[str],
        approve_as_memory: bool = True
    ) -> Optional[Memory]:
        """
        Self-Learning Adaptive Pipeline:
        Refines assistant behavior based on explicit user feedback and corrections WITH USER APPROVAL.
        """
        if not correction or not approve_as_memory:
            return None

        learned_content = f"User Preference/Correction: {correction}"
        memory = await MemoryEngine.add_memory(
            db=db,
            user_id=user_id,
            content=learned_content,
            memory_type="preference",
            importance=1.5 if rating <= 2 else 1.2,
            is_approved=approve_as_memory
        )

        # Update UserProfile preferences dictionary
        prof_res = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
        profile = prof_res.scalar_one_or_none()
        if profile:
            prefs = profile.preferences or {}
            prefs[f"learned_feedback_{memory.id[:8]}"] = correction
            profile.preferences = prefs

        return memory
