# Phase 1: Existing Python RAG Analysis

## Current Architecture
```
MedQuAD_47441 -> loader.py -> chunker.py (800/120, sentence-aware, type=definition|treatment|when_to_see_doctor|cause)
-> embedder.py (SentenceTransformer all-MiniLM-L6-v2, normalized) -> vector_store.py (FAISS IndexFlatIP, 6450 vectors, dim 384)
-> pipeline.py (rewrite_query + retrieve top_k_retrieve=8 -> rerank cross-encoder ms-marco-MiniLM-L-6-v2 threshold 0.3)
-> prompt.py (up to 6 history + all chunks) -> model.py (Groq openai/gpt-oss-20b, temp 0.2, 512 tokens) -> answer
```

## FastAPI Contract (`src/rag_pipeline/api/main.py:13`)
- `GET /health` -> `{"status":"ok"}`
- `POST /ask`
  - Request `AskRequest`: `{session_id: str(min1), question: str(min1)}`
  - Response `AskResponse`: `{answer: str, used_context: bool, sources: string[]}` (sources = chunk.question strings)
  - Errors: 400 guard refusal, 503 index missing, 503 provider error, 503 ValueError (API key)
  - Guard: `domain/guard.py` keyword substring check + phrase check, ~39 terms, returns 400 on non-medical
  - Startup: `uvicorn rag_pipeline.api.main:app --app-dir src --reload --port 8000`

## MongoDB Usage (`src/rag_pipeline/config/settings.py:11` + `context/store.py`)
- `MONGODB_URI`, `MONGODB_DATABASE=rag_pipeline`, `MONGODB_COLLECTION=conversation_context`
- Documents: `{session_id, question, answer, created_at: ISO}`
- `load_history(session_id, limit)` sorts by created_at desc, limit `CONTEXT_TURN_LIMIT=6`
- Fallback: `_SESSION_MEMORY: dict[session_id -> list[{question,answer}]]` capped 100, used when URI empty or PyMongoError (2s timeout)
- Separate app data must NOT overwrite this collection; reuse same cluster but different collections: `conversations`, `messages`

## Session Handling (`context/memory.py` + `api/memory_flow.py`)
- `session_id` is client-provided stable ID; Python maps 1:1 to conversation.
- `prepare_question_for_rag(session_id, question, history=...)` -> `resolve_memory_query` checks `FOLLOW_UP_HINTS` (what about, this, it...) and extracts last 3 relevant turns where combined text contains diabetes/metformin/symptom/etc OR follow-up hint.
- Cleans `tell me more about / what about / how about` via case-insensitive find, strips pronouns, fallback `Provide relevant information from prior context.`
- `memory_summary = "Previous: Q. Answer: A." * relevant`
- Express should use `conversationId` (Mongo ObjectId) as `session_id` for Python call: `app conversationId -> Python session_id`

## Env (`configs` ignored, `.env` used)
`GROQ_API_KEY, MODEL_PROVIDER=groq, MODEL_NAME=openai/gpt-oss-20b, EMBEDDING_MODEL, RERANKER_MODEL, VECTOR_STORE_PATH, MONGODB_URI, CONTEXT_TURN_LIMIT, TOP_K, SIMILARITY_THRESHOLD`

## What Must Be Preserved
- All `src/rag_pipeline/*`, `scripts/build_index.py`, `scripts/run_pipeline.py`, FAISS index `data/embeddings/vector_store/{index.faiss,metadata.json}` (9907245 bytes)
- Guardrails, retrieval, rerank thresholds, prompt logic
- MongoDB `conversation_context` collection untouched

## What Needs To Be Added for MERN
- `backend/` Express app: Clerk auth (verify `clerkUserId`), Mongoose models `Conversation{clerkUserId,title,createdAt}`, `Message{conversationId,clerkUserId,role,content,sources}`, Zod validation, `ai.service.js` -> `POST http://localhost:8000/ask`, ownership checks, centralized error middleware, CORS
- `frontend/` React+Vite+TS: react-router routes `/, /sign-in, /sign-up, /about, /safety, /chat, /chat/:id, /profile`, Clerk React, Tailwind with design system (Healthcare App: #0891B2/#059669, Figtree+Noto Sans, AI-Native minimal), chat layout sidebar drawer, markdown, sources expandable, disclaimer, loading/error/empty states, accessibility
- Keep Python as private service (`AI_SERVICE_URL` env, never exposed to frontend)
