"""Command-line entry point for retrieval and generation."""

import argparse

from rag_pipeline.config.settings import settings
from rag_pipeline.generation.model import generate
from rag_pipeline.generation.prompt import build_prompt
from rag_pipeline.retrieval.pipeline import search


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--query", required=True)
    args = parser.parse_args()

    chunks, pass_to_llm_directly = search(
        args.query,
        embedding_model=settings.embedding_model,
        reranker_model=settings.reranker_model,
        store_path=settings.vector_store_path,
        top_k_final=settings.top_k,
        threshold=settings.similarity_threshold,
        exclude_types=["definition"],
    )
    prompt = args.query if pass_to_llm_directly else build_prompt(args.query, chunks)
    answer = generate(prompt, settings.model_name, settings.model_provider)
    print(answer)


if __name__ == "__main__":
    main()
