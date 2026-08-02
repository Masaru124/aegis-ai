# AegisAI – Self-Learning Adaptive AI Assistant with Decision Intelligence

**AegisAI** is a production-grade, self-learning, adaptive AI assistant built with a modular monorepo architecture. It features a modern **Next.js (React + Tailwind CSS)** web client and a scalable **FastAPI (Python)** backend.

---

## 🌟 Core System Highlights

1. **Self-Learning Memory Engine (User-Approved)**
   - Persistent long-term memory via embeddings and semantic vector retrieval.
   - Learns user preferences and style corrections **strictly with explicit user approval** (via feedback controls), avoiding unauthorized LLM core weights retraining.

2. **Decision Intelligence Engine**
   - Incorporates Multi-Criteria Decision Analysis (MCDA) to process options, calculate risk factors, confidence scores, and deliver explainable recommendations.

3. **Unified Multi-Provider LLM Abstraction**
   - Pluggable LLM provider layer supporting OpenAI (GPT-4o), Anthropic (Claude 3.5), Google Gemini, local Ollama models, and an offline mock provider fallback.

4. **LangGraph Agent & Tool Orchestrator**
   - Context-aware intent detection and dynamic tool invocation (Task Manager, Calendar Scheduler, Document Search).

5. **Document Intelligence & RAG Vault**
   - Document chunking and vector indexing for PDF, DOCX, and text files.

6. **Productivity Suite**
   - Integrated task management, schedule assistant, and voice interface endpoints (Whisper STT / TTS).

---

## 🏗 Repository Structure

```text
aegisai/
│
├── apps/
│   └── web/                     # Next.js 14+ Frontend (React, Tailwind CSS, Framer Motion)
│       ├── src/
│       │   ├── app/             # App Router pages & layout
│       │   ├── components/      # Glassmorphism UI components (Chat, Decision Studio, Memory, Tasks)
│       │   └── lib/             # API client & auth token utilities
│       ├── package.json
│       └── Dockerfile
│
├── backend/                     # FastAPI Python Backend
│   ├── app/
│   │   ├── api/                 # API Router & v1 endpoints (auth, chat, memory, decision, tasks)
│   │   ├── core/                # Config, Database engine, Security (JWT/bcrypt)
│   │   ├── models/              # SQLAlchemy async models (User, Profile, Memory, Task, Decision)
│   │   ├── schemas/             # Pydantic input/output schemas
│   │   └── services/            # Core Engines (LLM Provider, Memory Engine, Decision Engine, LangGraph Agent)
│   ├── tests/                   # Automated Pytest suite (test_auth.py, test_decision.py, test_memory.py)
│   ├── requirements.txt
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow
│
├── docker-compose.yml           # Container orchestration
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows (PowerShell): .\venv\Scripts\Activate.ps1 (or venv\Scripts\activate)
# On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Open API Documentation: `http://127.0.0.1:8000/api/v1/docs`

### 2. Frontend Setup

```bash
cd apps/web
npm install
npm run dev
```
Open Web Dashboard: `http://localhost:3000`

### 3. Docker Deployment

```bash
docker-compose up --build
```

---

## 🧪 Running Automated Tests

```bash
cd backend
pytest
```

---

## 🛡 Security & Privacy Controls

- **JWT Authentication** with password hashing using `bcrypt`.
- **User-Scoped Isolation**: All memory embeddings, tasks, and profile records are strictly partitioned per `user_id`.
- **User-Approved Learning**: Memory extractions from chat corrections require explicit approval before persistence.
