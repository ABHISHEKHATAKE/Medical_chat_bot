# RAG + Fine-Tuned Model Pipeline

A retrieval-augmented generation pipeline that finds relevant document chunks and supplies them as context to a fine-tuned language model.

## Pipeline

1. Ingest documents from `data/raw/`.
2. Clean and split documents into chunks.
3. Generate embeddings and store them in `data/embeddings/` or a vector database.
4. Retrieve the most relevant chunks for a user query.
5. Rerank chunks and apply a similarity threshold.
6. Build a grounded prompt and send it to the fine-tuned model, or use direct fallback when no chunk is relevant.
7. Evaluate retrieval quality and generated answers.

## Quick start

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
copy .env.example .env
python scripts\run_pipeline.py --query "Your question here"
```

## API

Start the service from the project root:

```powershell
uvicorn rag_pipeline.api.main:app --app-dir src --reload
```

Build the retrieval index before calling `/ask`:

```powershell
python scripts\build_index.py
```

Then send a question to `POST /ask`:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/ask -Method Post -ContentType "application/json" -Body '{"question":"What causes a persistent cough?"}'
```

- API docs: `http://127.0.0.1:8000/docs`

### Conversation context

Set `MONGODB_URI` in `.env` to your MongoDB Atlas connection string. The application stores each completed question and answer in the configured collection and recalls the latest `CONTEXT_TURN_LIMIT` turns for the same `session_id`.

Include a stable session ID with every request:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/ask -Method Post -ContentType "application/json" -Body '{"session_id":"user-123","question":"What causes a persistent cough?"}'
```

Do not commit `.env` or expose the MongoDB URI. When `MONGODB_URI` is unset or temporarily unavailable, the API continues without saved conversation context.

Keep model weights, secrets, and generated data out of Git. See `.gitignore` for the defaults.
