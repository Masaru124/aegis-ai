from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.models.models import User
from app.api.v1.auth import get_current_user
from app.services.rag_engine import RAGEngine

router = APIRouter()


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    content_bytes = await file.read()
    if not content_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    chunks = RAGEngine.process_file_bytes(file.filename, content_bytes)
    return {
        "filename": file.filename,
        "chunks_indexed": len(chunks),
        "message": f"Successfully ingested document '{file.filename}' into RAG vector store."
    }


@router.get("/search")
async def search_documents(
    query: str,
    top_k: int = 3,
    current_user: User = Depends(get_current_user)
):
    results = RAGEngine.search_documents(query=query, top_k=top_k)
    return {
        "query": query,
        "results": [
            {
                "filename": item["filename"],
                "snippet": item["text"]
            }
            for item in results
        ]
    }
