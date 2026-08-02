from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import User, Memory
from app.schemas.schemas import MemoryOut, MemoryCreate, FeedbackCreate
from app.api.v1.auth import get_current_user
from app.services.memory_engine import MemoryEngine

router = APIRouter()


@router.get("/", response_model=List[MemoryOut])
async def list_memories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Memory)
        .where(Memory.user_id == current_user.id)
        .order_by(Memory.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=MemoryOut)
async def create_memory(
    mem_in: MemoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    memory = await MemoryEngine.add_memory(
        db=db,
        user_id=current_user.id,
        content=mem_in.content,
        memory_type=mem_in.memory_type,
        importance=mem_in.importance,
        is_approved=mem_in.is_approved
    )
    await db.commit()
    await db.refresh(memory)
    return memory


@router.delete("/{memory_id}")
async def delete_memory(
    memory_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Memory).where(Memory.id == memory_id, Memory.user_id == current_user.id)
    )
    mem = result.scalar_one_or_none()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    
    await db.delete(mem)
    await db.commit()
    return {"detail": "Memory deleted successfully"}


@router.post("/feedback")
async def submit_feedback_and_learn(
    feedback: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Self-Learning Endpoint:
    Processes user feedback and correction, extracting long-term preference memory with user approval.
    """
    memory = await MemoryEngine.process_user_feedback_and_learn(
        db=db,
        user_id=current_user.id,
        rating=feedback.rating,
        correction=feedback.correction,
        approve_as_memory=feedback.approve_as_memory
    )
    await db.commit()

    return {
        "status": "success",
        "message": "Feedback recorded. Assistant learning profile updated.",
        "learned_memory_id": memory.id if memory else None
    }
