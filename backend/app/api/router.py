from fastapi import APIRouter
from app.api.v1 import auth, chat, memory, decision, tasks, documents, voice

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(chat.router, prefix="/chat", tags=["Agent Chat & Conversations"])
api_router.include_router(memory.router, prefix="/memory", tags=["Long-Term Memory Engine"])
api_router.include_router(decision.router, prefix="/decision", tags=["Decision Intelligence Engine"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Task & Schedule Management"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document RAG"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice Assistant"])
