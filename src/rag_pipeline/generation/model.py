"""Call the configured model provider."""

import os

import requests

from rag_pipeline.config.settings import settings


def generate(prompt: str, model_name: str, provider: str) -> str:
    """Generate an answer through the configured HTTP or Groq endpoint."""
    if provider == "http":
        response = requests.post(model_name, json={"question": prompt}, timeout=60)
        response.raise_for_status()
        payload = response.json()
        return payload.get("answer", str(payload))

    if provider == "groq":
        api_key = getattr(settings, "groq_api_key", None) or os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set in .env")

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
                "max_tokens": 512,
            },
            timeout=60,
        )
        response.raise_for_status()
        payload = response.json()
        try:
            return payload["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise ValueError(f"Unexpected Groq response shape: {payload}") from exc

    raise NotImplementedError(f"Unsupported model provider: {provider}")
