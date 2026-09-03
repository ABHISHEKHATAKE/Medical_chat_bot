"""Call the configured model provider."""

import os

import requests

from rag_pipeline.config.settings import settings
from rag_pipeline.generation.sanitize import sanitize_final_answer, strip_thinking


def generate(prompt: str, model_name: str, provider: str) -> str:
    """Generate an answer through the configured HTTP or Groq endpoint.

    Reasoning-model traces (<think>...</think>) are stripped so only the
    final user-facing answer is ever returned.
    """
    if provider == "http":
        response = requests.post(model_name, json={"question": prompt}, timeout=60)
        response.raise_for_status()
        payload = response.json()
        return payload.get("answer", str(payload))

    if provider == "groq":
        api_key = getattr(settings, "groq_api_key", None) or os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set in .env")

        # Reasoning-trace length varies per attempt, so a single call can
        # truncate inside <think> and leave nothing user-facing. Retry once
        # on empty-after-sanitize (max 2 attempts); transport errors still
        # raise immediately for the caller to map to 503.
        last_content = ""
        for attempt in range(2):
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    # Reasoning models spend tokens on <think> traces (stripped
                    # server-side); 2048 leaves room for the visible answer on
                    # long image-grounded prompts.
                    "max_tokens": 2048,
                },
                timeout=60,
            )
            response.raise_for_status()
            payload = response.json()
            try:
                content = payload["choices"][0]["message"]["content"]
            except (KeyError, IndexError) as exc:
                raise ValueError(f"Unexpected Groq response shape: {payload}") from exc
            last_content = content or ""
            print(
                f"[LLM] attempt {attempt + 1}/2 "
                f"raw_chars={len(last_content)} "
                f"finish={payload['choices'][0].get('finish_reason')}"
            )
            cleaned = strip_thinking(last_content)
            if cleaned:
                return cleaned
            print(f"[LLM] empty after sanitize (attempt {attempt + 1}/2), retrying")
        return sanitize_final_answer(last_content)

    raise NotImplementedError(f"Unsupported model provider: {provider}")
