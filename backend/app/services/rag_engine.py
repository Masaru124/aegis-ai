import io
import logging
from typing import List, Dict, Any
from app.services.memory_engine import compute_embedding, cosine_similarity

logger = logging.getLogger(__name__)

# In-memory vector store for uploaded session documents
_document_store: List[Dict[str, Any]] = []


class RAGEngine:
    """
    Retrieval-Augmented Generation (RAG) Engine for Document Ingestion (PDF, DOCX, TXT)
    and semantic context lookup.
    """

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        words = text.split()
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        return chunks

    @classmethod
    def process_file_bytes(cls, filename: str, content_bytes: bytes) -> List[Dict[str, Any]]:
        extracted_text = ""
        filename_lower = filename.lower()

        if filename_lower.endswith(".pdf"):
            try:
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(content_bytes))
                for page in reader.pages:
                    extracted_text += (page.extract_text() or "") + "\n"
            except Exception as e:
                logger.error(f"Error parsing PDF {filename}: {e}")
                extracted_text = content_bytes.decode("utf-8", errors="ignore")
        elif filename_lower.endswith(".docx"):
            try:
                import docx
                doc = docx.Document(io.BytesIO(content_bytes))
                extracted_text = "\n".join([p.text for p in doc.paragraphs])
            except Exception as e:
                logger.error(f"Error parsing DOCX {filename}: {e}")
                extracted_text = content_bytes.decode("utf-8", errors="ignore")
        else:
            extracted_text = content_bytes.decode("utf-8", errors="ignore")

        chunks = cls.chunk_text(extracted_text)
        indexed_chunks = []
        for idx, chunk in enumerate(chunks):
            embedding = compute_embedding(chunk)
            doc_item = {
                "id": f"{filename}_{idx}",
                "filename": filename,
                "text": chunk,
                "embedding": embedding
            }
            _document_store.append(doc_item)
            indexed_chunks.append(doc_item)

        return indexed_chunks

    @classmethod
    def search_documents(cls, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not _document_store:
            return []

        query_vec = compute_embedding(query)
        scored = []
        for doc in _document_store:
            sim = cosine_similarity(query_vec, doc["embedding"])
            scored.append((sim, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:top_k]]
