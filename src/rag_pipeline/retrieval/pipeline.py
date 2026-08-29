"""End-to-end query rewriting, vector retrieval, filtering, and reranking."""

from rag_pipeline.retrieval.query_rewriter import rewrite_query
from rag_pipeline.retrieval.reranker import rerank
from rag_pipeline.retrieval.vector_store import retrieve


def search(
    user_query: str,
    embedding_model: str,
    reranker_model: str,
    store_path: str,
    top_k_retrieve: int = 4,
    top_k_final: int = 2,
    threshold: float = 0.6,
    exclude_types: list[str] | None = None,
) -> tuple[list[dict], bool]:
    """Retrieve only the most relevant context to keep answers concise and precise."""
    excluded = set(exclude_types or [])
    search_query = rewrite_query(user_query)
    candidates = retrieve(search_query, top_k_retrieve, store_path, embedding_model)
    candidates = [candidate for candidate in candidates if candidate.get("type") not in excluded]
    return rerank(user_query, candidates, reranker_model, top_k_final, threshold)
