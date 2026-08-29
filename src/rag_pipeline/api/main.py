from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import requests

from rag_pipeline.api.memory_flow import prepare_question_for_rag
from rag_pipeline.config.settings import settings
from rag_pipeline.context.store import load_history, save_turn
from rag_pipeline.domain.guard import is_medical_question, medical_refusal
from rag_pipeline.generation.model import generate
from rag_pipeline.generation.prompt import build_prompt
from rag_pipeline.retrieval.pipeline import search

app = FastAPI(title="Medical RAG API", version="0.1.0")


class AskRequest(BaseModel):
    question: str = Field(min_length=1, description="User question for the RAG pipeline")
    session_id: str = Field(min_length=1, description="Stable ID used to recall this conversation")


class AskResponse(BaseModel):
    answer: str
    used_context: bool
    sources: list[str]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest) -> AskResponse:
    if not is_medical_question(request.question):
        raise HTTPException(status_code=400, detail=medical_refusal())

    try:
        history = load_history(
            request.session_id,
            settings.mongodb_uri,
            settings.mongodb_database,
            settings.mongodb_collection,
            settings.context_turn_limit,
        )
        cleaned_question, memory_summary = prepare_question_for_rag(
            request.session_id,
            request.question,
            settings.mongodb_uri,
            settings.mongodb_database,
            settings.mongodb_collection,
            settings.context_turn_limit,
        )
        chunks, pass_to_llm_directly = search(
            cleaned_question,
            embedding_model=settings.embedding_model,
            reranker_model=settings.reranker_model,
            store_path=settings.vector_store_path,
            top_k_final=settings.top_k,
            threshold=settings.similarity_threshold,
            exclude_types=["definition"],
        )
        prompt = build_prompt(
            cleaned_question,
            chunks if not pass_to_llm_directly else [],
            history,
            memory_summary=memory_summary,
        )
        answer = generate(prompt, settings.model_name, settings.model_provider)
        save_turn(
            request.session_id,
            request.question,
            answer,
            settings.mongodb_uri,
            settings.mongodb_database,
            settings.mongodb_collection,
        )
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail="Vector index is not built. Run: python scripts/build_index.py",
        ) from error
    except NotImplementedError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except requests.RequestException as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "The configured model endpoint is unavailable or returned an error. "
                "Check MODEL_NAME in .env."
            ),
        ) from error
    return AskResponse(
        answer=answer,
        used_context=not pass_to_llm_directly,
        sources=[chunk.get("question", "unknown") for chunk in chunks],
    )
