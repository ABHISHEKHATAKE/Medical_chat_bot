"""Command-line entry point for retrieval and generation."""

import argparse

from rag_pipeline.config.settings import settings
from rag_pipeline.generation.model import generate
from rag_pipeline.generation.prompt import build_prompt
from rag_pipeline.retrieval.pipeline import search


def main() -> None:
    import sys

    # Ensure Windows console can handle Unicode medical text
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    parser = argparse.ArgumentParser()
    parser.add_argument("--query", required=True)
    args = parser.parse_args()

    chunks, pass_to_llm_directly = search(
        args.query,
        embedding_model=settings.embedding_model,
        reranker_model=settings.reranker_model,
        store_path=settings.vector_store_path,
        top_k_retrieve=max(6, settings.top_k + 3),
        top_k_final=settings.top_k,
        threshold=settings.similarity_threshold,
        exclude_types=None,
    )
    prompt = build_prompt(args.query, chunks if not pass_to_llm_directly else [], history=None)
    answer = generate(prompt, settings.model_name, settings.model_provider)
    try:
        print(answer)
    except UnicodeEncodeError:
        sys.stdout.buffer.write((answer + "\n").encode("utf-8", errors="replace"))


if __name__ == "__main__":
    main()
