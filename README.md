# Medical RAG Pipeline

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
│   └── rag_pipeline/
│       ├── api/
│       ├── config/
│       ├── context/
│       ├── domain/
│       ├── generation/
│       ├── ingestion/
│       ├── retrieval/
│       └── __init__.py
├── tests/
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

## Summary

This project is a practical medical RAG system that combines retrieval, reranking, context memory, and generative AI to provide safer and more grounded answers for health-related questions. It is suitable for both experimentation and deployment as a backend service for a medical assistant or knowledge retrieval tool.
