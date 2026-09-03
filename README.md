# Medical AI Chatbot — Full-Stack RAG System

A retrieval-augmented generation (RAG) project designed for medical and health-related question answering. The system ingests medical documents, chunks them into searchable units, embeds and indexes them, retrieves relevant passages, reranks them, and sends the best context to a language model to produce grounded answers.

**Full-stack architecture (new):**
- **React + Vite + Tailwind + Clerk** frontend (`frontend/`)
- **Node.js + Express + Mongoose + Clerk + Zod** backend (`backend/`)
- **Python FastAPI RAG service** (existing `src/rag_pipeline/` — preserved as AI service)

```mermaid
graph TD
  React[React Frontend :5173] -->|axios + Clerk token / dev header| Express[Express Backend :5000]
  Express -->|Mongoose| MongoDB[(MongoDB)]
  Express -->|POST /ask {session_id, question}| Python[Python FastAPI :8000]
  Python --> FAISS[(FAISS IndexFlatIP)]
  Python --> Embeddings
  Python --> Reranker
  Python --> Groq[Groq LLM]
```

> Python RAG is **preserved** — see `docs/RAG_ANALYSIS.md` for contract. React never calls Python directly; Express is the API layer (`AI_SERVICE_URL`).

---

# Medical RAG Pipeline (Python AI Service)

A retrieval-augmented generation (RAG) project designed for medical and health-related question answering. The system ingests medical documents, chunks them into searchable units, embeds and indexes them, retrieves relevant passages, reranks them, and sends the best context to a language model to produce grounded answers.

This project is built for use cases where factual medical information needs to be retrieved from a document base and answered with citations-like relevance grounded in trusted source content.

## What the system does

The application combines document retrieval with LLM generation to answer user questions in a safer and more grounded way.

### Core functionality

- Ingests medical source documents from the dataset folder and processes them for retrieval.
- Splits documents into manageable chunks with configurable overlap and chunk sizes.
- Converts chunks into vector embeddings using a sentence-transformer model.
- Stores embeddings in a FAISS vector index for fast similarity search.
- Retrieves the most relevant chunks for a query.
- Reranks candidate passages to improve relevance before prompt construction.
- Builds a prompt from the user question, retrieved context, and optional conversation memory.
- Calls a generative model to answer using the retrieved knowledge.
- Enforces a medical-domain guardrail so only health-related questions are accepted.
- Saves conversation turns with MongoDB when configured, enabling short-term context memory across session IDs.
- Supports both CLI usage and a FastAPI web service.

## Use cases

### 1. Medical knowledge assistant

The system can answer questions such as:

- What causes a persistent cough?
- What are the common symptoms of diabetes?
- What are the side effects of a medication?
- When should a patient see a doctor for a condition?

### 2. Retrieval-based clinical support

It can be used as an internal retrieval layer for a medical knowledge base, where the model answers from source documents instead of relying only on its built-in general knowledge.

### 3. Educational health chatbot

It can power a student-facing or public-facing health assistant that explains symptoms, treatment concepts, and clinical definitions in a more grounded and explainable way.

### 4. Domain-specific knowledge search

The project is useful for any organization that wants an LLM assistant grounded in a curated set of medical documents, FAQs, or training material.

## Architecture overview

1. Data ingestion
   - Documents are loaded from the raw dataset and prepared for chunking.
2. Chunking and preprocessing
   - Text is split into smaller passages using the configured chunk size and overlap.
3. Embedding generation
   - Each chunk is embedded using a transformer-based embedding model.
4. Vector storage
   - Embeddings are saved into a FAISS index under the vector store path.
5. Retrieval
   - A user query is transformed into an embedding and matched against indexed chunks.
6. Reranking
   - Candidate results are filtered and reranked to prioritize the strongest matches.
7. Prompt construction
   - The model receives the user query, relevant medical context, and recent conversation history when available.
8. Response generation
   - The model produces a grounded answer.
9. Safety layer
   - Non-medical requests are blocked with a refusal message.

## Project structure

```text
.
├── backend/                 # Express app (new)
│   ├── src/
│   │   ├── config/ (env, db)
│   │   ├── controllers/ (conversation, chat)
│   │   ├── middleware/ (auth, validate, error)
│   │   ├── models/ (Conversation, Message)
│   │   ├── routes/
│   │   ├── services/ (ai.service -> Python /ask)
│   │   └── validators/ (zod)
│   ├── .env.example
│   └── package.json
├── frontend/                # React app (new)
│   ├── src/
│   │   ├── components/ (ui, chat, layout)
│   │   ├── pages/ (Landing, About, Safety, Chat, Profile)
│   │   ├── services/ (api)
│   │   └── index.css (design tokens: #0891B2, Figtree+Noto Sans)
│   ├── .env.example
│   └── package.json
├── configs/
│   ├── retrieval.yaml
│   └── training.yaml
├── data/
│   ├── embeddings/
│   ├── processed/
│   └── raw/
├── models/
│   ├── base/
│   └── fine_tuned/
├── notebooks/
├── scripts/
│   ├── build_index.py
│   └── run_pipeline.py
├── src/
│   └── rag_pipeline/       # Python AI service (preserved)
│       ├── api/
│       ├── config/
│       ├── context/
│       ├── domain/
│       ├── generation/
│       ├── ingestion/
│       ├── retrieval/
│       └── __init__.py
├── tests/
├── docs/RAG_ANALYSIS.md
├── .gitignore
├── Dockerfile
├── pyproject.toml
├── README.md
├── requirements.txt
└── .env
```

## Features

- FAISS-powered vector search
- Embedding-based retrieval with reranking
- Medical question validation and refusal handling
- Session-based memory using MongoDB
- FastAPI service with health and ask endpoints
- CLI workflow for quick testing and local usage
- Configurable model, chunking, and retrieval settings via environment variables

## Setup process

### 1. Clone the project

```bash
git clone <repository-url>
cd "Final Year Project"
```

### 2. Create and activate a virtual environment

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```powershell
pip install -r requirements.txt
```

Or, if using the package configuration:

```powershell
pip install -e .
```

### 4. Configure environment variables

Create a `.env` file in the project root and define your app settings. Example:

```env
MODEL_PROVIDER=groq
MODEL_NAME=openai/gpt-oss-20b
GROQ_API_KEY=your_groq_api_key_here
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
RERANKER_MODEL=cross-encoder/ms-marco-MiniLM-L-6-v2
VECTOR_STORE_PATH=data/embeddings/vector_store
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DATABASE=rag_pipeline
MONGODB_COLLECTION=conversation_context
CONTEXT_TURN_LIMIT=6
TOP_K=5
SIMILARITY_THRESHOLD=0.5
CHUNK_SIZE=800
CHUNK_OVERLAP=120
```

Notes:

- If `MONGODB_URI` is not set, the application still works, but conversation memory will not be saved.
- Keep API keys and database URIs private and do not commit them to Git.

### 5. Build the retrieval index

Before asking questions, generate the FAISS index from the available medical documents:

```powershell
python scripts\build_index.py
```

This creates the vector store under `data/embeddings/vector_store`.

### 6. Run a sample query

Using the CLI:

```powershell
python scripts\run_pipeline.py --query "What causes a persistent cough?"
```

## API usage

### Start the API server

From the project root:

```powershell
uvicorn rag_pipeline.api.main:app --app-dir src --reload
```

The API will be available at:

- http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

### Send a request

```powershell
Invoke-RestMethod http://127.0.0.1:8000/ask -Method Post -ContentType "application/json" -Body '{"session_id":"user-123","question":"What causes a persistent cough?"}'
```

### Request schema

The `/ask` endpoint accepts:

```json
{
  "session_id": "user-123",
  "question": "What are the symptoms of diabetes?"
}
```

The response includes:

```json
{
  "answer": "...",
  "used_context": true,
  "sources": ["..."]
}
```

## Safety and behavior

### Medical-only guardrails

The application rejects questions that are clearly outside the medical domain. For example, non-medical requests such as jokes, unrelated business questions, or general conversation will return a refusal message.

### Conversation memory

When MongoDB is configured, each question-answer turn is stored in a collection and previous context is retrieved using the same `session_id` to improve continuity across turns.

### Fallback behavior

If the retrieval system finds no sufficiently relevant chunks, the prompt may be sent to the model without retrieval context, allowing the model to respond based on its general knowledge while still keeping the question within the domain guardrail.

## Dependencies and technologies

- Python 3.10+
- FastAPI
- FAISS
- SentenceTransformers
- Pydantic Settings
- MongoDB / PyMongo
- Requests
- Groq or compatible model provider

## Development notes

- Keep model credentials and MongoDB connection strings out of Git.
- Do not commit generated embeddings or runtime data unless required for your workflow.
- If you are modifying the retrieval pipeline, rebuild the index after changing chunking or embedding settings.

## Future improvements

Possible next steps for this project include:

- adding a frontend dashboard
- integrating a stronger evaluation pipeline for answer quality
- supporting more source document types
- adding a stricter citation mechanism for returned passages
- adding a fine-tuning workflow for domain-specific medical models

## Full-stack quick start

**1) Python AI service** (port 8000, preserved):
```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt; pip install -e .
# .env at root already has GROQ_API_KEY, MONGODB_URI, etc.
python scripts\build_index.py
python -m uvicorn rag_pipeline.api.main:app --app-dir src --host 127.0.0.1 --port 8000
# health: http://127.0.0.1:8000/health, docs: /docs
```

**2) Express backend** (port 5000):
```powershell
Set-Location backend
npm install
# copy .env.example -> .env, set MONGODB_URI (same cluster, db medical_ai), AI_SERVICE_URL=http://localhost:8000, CLERK_SECRET_KEY (or use dev header)
node src/server.js  # or: npm run dev
# health: http://localhost:5000/health
# dev auth: send header x-dev-user-id: test-user-123 (frontend sets localStorage.dev_user_id)
```

**3) React frontend** (port 5173):
```powershell
Set-Location frontend
npm install
npm run dev  # or npm run build
# VITE_API_URL=http://localhost:5000 in .env
# Clerk: set VITE_CLERK_PUBLISHABLE_KEY or use dev mode (no key -> "Open chat")
# Routes: /, /about, /safety, /chat, /chat/:id, /profile
```

**API integration:** `frontend -> POST /api/chat {conversationId, message} -> Express validates (Zod), saves user Message, calls Python POST /ask {session_id=conversationId, question}, saves assistant Message with sources, returns {answer, sources, used_context}`. See `backend/src/services/ai.service.js`.

**Env templates:** `backend/.env.example`, `frontend/.env.example`, `.env.example` (root).

## Summary

This project is a practical medical RAG system that combines retrieval, reranking, context memory, and generative AI to provide safer and more grounded answers for health-related questions. The full-stack wrapper adds a modern, trustworthy medical UI (Tailwind #0891B2/#059669, Figtree+Noto Sans, AI-Native minimal) with Clerk auth, conversation history, source display, and responsive chat layout.
