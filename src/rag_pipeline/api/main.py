from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import requests

from rag_pipeline.api.memory_flow import prepare_question_for_rag
from rag_pipeline.config.settings import settings
from rag_pipeline.context.store import load_history, save_turn
from rag_pipeline.domain.guard import is_medical_question, medical_refusal
from rag_pipeline.generation.model import generate
from rag_pipeline.generation.prompt import build_prompt
from rag_pipeline.generation.sanitize import sanitize_final_answer
from rag_pipeline.retrieval.pipeline import search

app = FastAPI(title="Medical RAG API", version="0.1.0")


class AskRequest(BaseModel):
    question: str = Field(min_length=1, description="User question for the RAG pipeline")
    session_id: str = Field(min_length=1, description="Stable ID used to recall this conversation")
    image_url: str | None = Field(default=None, description="Optional Cloudinary secure_url for vision analysis")


class AskResponse(BaseModel):
    answer: str
    used_context: bool
    sources: list[str]
    image_analysis: dict | None = None


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest) -> AskResponse:
    if request.image_url and not is_medical_question(request.question):
        try:
            from rag_pipeline.vision.analyzer import analyze_general_image

            answer = analyze_general_image(request.image_url, request.question)
            return AskResponse(
                answer=answer,
                used_context=False,
                sources=[],
                image_analysis=None,
            )
        except ValueError as error:
            raise HTTPException(status_code=503, detail=str(error)) from error
        except requests.RequestException as error:
            raise HTTPException(status_code=503, detail="The configured image model is unavailable") from error

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
            history=history,
        )
        # --- Vision preprocessing: image -> structured analysis -> retrieval query ---
        original_question = request.question
        retrieval_query = cleaned_question
        image_analysis_dict: dict | None = None
        if request.image_url:
            # Never trust arbitrary URLs from frontend; Express only sends Cloudinary URLs it generated.
            # Basic allowlist: must be https and from Cloudinary
            if not request.image_url.startswith("https://res.cloudinary.com/"):
                raise HTTPException(status_code=400, detail="Invalid image_url: must be a Cloudinary secure_url")
            from rag_pipeline.vision.analyzer import analyze_image

            print(f"[Vision] Processing image for session {request.session_id}")
            try:
                analysis = analyze_image(request.image_url, user_question=original_question)
            except ValueError as ve:
                # Invalid vision response or missing API key -> 503 with clean message
                raise HTTPException(status_code=503, detail=f"Vision analysis failed: {ve}") from ve
            except requests.RequestException as ve:
                raise HTTPException(status_code=503, detail="Vision service temporarily unavailable") from ve

            image_analysis_dict = analysis.model_dump()
            retrieval_query = analysis.retrieval_query
            print(f"[Vision] Image analysis completed: {image_analysis_dict}")

        # Retrieve more candidates than final top_k to allow reranking headroom;
        # do NOT filter by type - all medical chunk types are valid for grounding.
        # For image messages, search uses retrieval_query, not original question.
        chunks, pass_to_llm_directly = search(
            retrieval_query,
            embedding_model=settings.embedding_model,
            reranker_model=settings.reranker_model,
            store_path=settings.vector_store_path,
            top_k_retrieve=max(6, settings.top_k + 3),
            top_k_final=settings.top_k,
            threshold=settings.similarity_threshold,
            exclude_types=None,
        )
        prompt = build_prompt(
            retrieval_query,
            chunks if not pass_to_llm_directly else [],
            history,
            memory_summary=memory_summary,
            image_analysis=image_analysis_dict,
            original_question=original_question,
        )
        answer = generate(prompt, settings.model_name, settings.model_provider)
        # Defensive: strip any reasoning traces before persisting or returning.
        answer = sanitize_final_answer(answer)
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
    except ValueError as error:
        # e.g. missing GROQ_API_KEY
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
        used_context=not pass_to_llm_directly and len(chunks) > 0,
        sources=[chunk.get("question", "unknown") for chunk in chunks] if chunks else [],
        image_analysis=image_analysis_dict,
    )
