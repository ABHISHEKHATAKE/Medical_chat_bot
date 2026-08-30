"""Rerank retrieved candidates with a cross-encoder."""

from functools import lru_cache

from sentence_transformers import CrossEncoder


@lru_cache(maxsize=4)
def get_reranker(model_name: str):
    """Return a cached cross-encoder instance so the model is not reloaded per request."""
    return CrossEncoder(model_name)


def rerank(query: str, candidates: list[dict], model_name: str, top_k: int, threshold: float) -> tuple[list[dict], bool]:
    """Return high-scoring chunks and whether to bypass retrieved context."""
    if not candidates:
        return [], True

    reranker = get_reranker(model_name)
    scores = reranker.predict([(query, candidate["text"]) for candidate in candidates])
    ranked = sorted(zip(candidates, scores), key=lambda item: item[1], reverse=True)

    results = []
    for candidate, score in ranked[:top_k]:
        if score < threshold:
            break
        results.append(dict(candidate, score=float(score)))
    return results, not results
