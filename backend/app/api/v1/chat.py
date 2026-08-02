from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import User, Conversation, Message
from app.schemas.schemas import ConversationOut, ConversationCreate, ChatRequest, ChatResponse, MessageOut
from app.api.v1.auth import get_current_user
from app.services.agent_orchestrator import AgentOrchestrator

router = APIRouter()


@router.get("/conversations", response_model=List[ConversationOut])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    )
    return result.scalars().all()


@router.post("/conversations", response_model=ConversationOut)
async def create_conversation(
    conv_in: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    conv = Conversation(
        user_id=current_user.id,
        title=conv_in.title or "New Conversation"
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return conv


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Ensure conversation exists
    if req.conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == req.conversation_id,
                Conversation.user_id == current_user.id
            )
        )
        conv = result.scalar_one_or_none()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(
            user_id=current_user.id,
            title=req.message[:30] + ("..." if len(req.message) > 30 else "")
        )
        db.add(conv)
        await db.flush()

    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=req.message
    )
    db.add(user_msg)

    # Run Agent Orchestrator Pipeline
    orchestrator = AgentOrchestrator(provider_name=req.provider)
    result = await orchestrator.execute_agent_pipeline(
        db=db,
        user_id=current_user.id,
        prompt=req.message,
        enable_memory=req.enable_memory
    )

    # Save assistant message
    assistant_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=result["response"],
        metadata_info={"used_memories": result["used_memories"], "tool_results": result["tool_results"]}
    )
    db.add(assistant_msg)

    await db.commit()
    await db.refresh(assistant_msg)

    return ChatResponse(
        conversation_id=conv.id,
        message=MessageOut.model_validate(assistant_msg),
        used_memories=result["used_memories"]
    )
