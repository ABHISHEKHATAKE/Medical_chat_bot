"""Call Groq Qwen 3.6 vision to produce structured image analysis."""

import json
import os
import re

import requests

from rag_pipeline.config.settings import settings
from rag_pipeline.generation.sanitize import strip_thinking
from rag_pipeline.vision.prompts import build_general_image_messages, build_vision_messages
from rag_pipeline.vision.schemas import ImageAnalysis


def analyze_general_image(image_url: str, user_question: str | None = None, model_name: str | None = None) -> str:
    """Describe a non-medical image directly without entering the medical RAG flow."""
    provider = getattr(settings, "model_provider", "groq")
    if provider != "groq":
        raise NotImplementedError(f"General image analysis requires groq provider, got {provider}")

    api_key = getattr(settings, "groq_api_key", None) or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set in .env (Python)")

    model = model_name or getattr(settings, "model_name", "qwen/qwen3.6-27b")
    messages = build_general_image_messages(image_url, user_question)

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 800,
        },
        timeout=60,
    )
    response.raise_for_status()
    payload = response.json()
    content = payload["choices"][0]["message"]["content"]
    return strip_thinking(content).strip() or "I can describe the image, but the model returned no visible details."


def _extract_json(text: str) -> str:
    """Extract JSON object from model output that may contain extra text."""
    text = text.strip()
    # Direct JSON
    if text.startswith("{"):
        return text
    # Try to find first {...} block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0)
    return text


def analyze_image(image_url: str, user_question: str | None = None, model_name: str | None = None) -> ImageAnalysis:
    """
    Analyze an image via Groq vision model and return structured ImageAnalysis.

    Args:
        image_url: Cloudinary secure_url (https) - Groq can fetch it directly
        user_question: Original user question for context-aware retrieval query
        model_name: Override for settings.model_name (defaults to qwen/qwen3.6-27b)
    """
    import time

    provider = getattr(settings, "model_provider", "groq")
    if provider != "groq":
        raise NotImplementedError(f"Vision analysis requires groq provider, got {provider}")

    api_key = getattr(settings, "groq_api_key", None) or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set in .env (Python)")

    model = model_name or getattr(settings, "model_name", "qwen/qwen3.6-27b")

    messages = build_vision_messages(image_url, user_question)

    print(f"[Vision] Processing image: {image_url[:80]}... question: {user_question!r:.60}")

    # Retry for transient failures: Cloudinary eventual consistency (403/404 on media), rate limits (429), 5xx
    last_exc = None
    for attempt in range(3):
        try:
            # Small delay before first try if this is a fresh Cloudinary upload (eventual consistency)
            # Only on first attempt, give Cloudinary a moment to propagate (1.5s)
            if attempt == 0:
                time.sleep(1.5)

            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": 0.1,
                    "max_tokens": 2500,
                },
                timeout=60,
            )
            # Handle rate limit and transient errors with retry
            if response.status_code == 429:
                retry_after = response.headers.get("retry-after")
                try:
                    wait = float(retry_after) if retry_after else (2 * (attempt + 1))
                except:
                    wait = 2 * (attempt + 1)
                print(f"[Vision] Rate limited (429), retrying in {wait}s (attempt {attempt+1}/3)")
                time.sleep(wait)
                continue
            if response.status_code in (500, 502, 503, 504):
                print(f"[Vision] Transient {response.status_code}, retrying (attempt {attempt+1}/3)")
                time.sleep(1.5 * (attempt + 1))
                continue
            if response.status_code == 400:
                # Log body for debugging, but don't retry on pure validation errors (except media)
                body = response.text
                print(f"[Vision] 400 body: {body[:800]}")
                if "image must have at least 2 pixels" in body.lower():
                    raise ValueError("Image is too small. Please upload an image at least 2x2 pixels.")
                if "failed to retrieve media" in body.lower() and attempt < 2:
                    print(f"[Vision] Media not ready (attempt {attempt+1}/3), retrying in {1.5*(attempt+1)}s")
                    time.sleep(1.5 * (attempt + 1))
                    continue
            response.raise_for_status()
            break
        except requests.RequestException as e:
            last_exc = e
            # Check if it's a media fetch failure (Groq returns 400 with "failed to retrieve media")
            try:
                body = e.response.text if getattr(e, "response", None) is not None else ""
                print(f"[Vision] RequestException 400 body: {body[:800]}")
                if "failed to retrieve media" in body.lower() and attempt < 2:
                    print(f"[Vision] Media not ready (attempt {attempt+1}/3), retrying in {1.5*(attempt+1)}s")
                    time.sleep(1.5 * (attempt + 1))
                    continue
            except:
                pass
            if attempt < 2:
                print(f"[Vision] Request failed (attempt {attempt+1}/3): {e}, retrying")
                time.sleep(1.5 * (attempt + 1))
                continue
            raise
    else:
        # All retries exhausted
        if last_exc is not None:
            raise last_exc

    payload = response.json()

    try:
        content = payload["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise ValueError(f"Unexpected Groq vision response shape: {payload}") from exc

    # Strip any reasoning traces first so <think> blocks (which may contain
    # braces) cannot corrupt JSON extraction.
    content = strip_thinking(content)
    raw_json = _extract_json(content)
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Vision model did not return valid JSON: {content[:500]}") from exc

    try:
        analysis = ImageAnalysis.model_validate(data)
    except Exception as exc:
        raise ValueError(f"Vision JSON failed schema validation: {data}") from exc

    # Safety: ensure retrieval_query is non-empty
    if not analysis.retrieval_query or not analysis.retrieval_query.strip():
        # Fallback to original question or a safe general query
        fallback = (user_question or "general medical information").strip()
        if len(fallback) < 5:
            fallback = "general medical information"
        analysis.retrieval_query = fallback

    # Truncate retrieval_query to a reasonable length
    if len(analysis.retrieval_query) > 200:
        analysis.retrieval_query = analysis.retrieval_query[:200]

    print(f"[Vision] Image analysis completed: type={analysis.image_type} query={analysis.retrieval_query!r}")
    print(f"[RAG] Retrieval query generated: {analysis.retrieval_query!r}")

    return analysis
