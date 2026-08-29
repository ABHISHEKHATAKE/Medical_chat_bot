"""Rerank retrieved candidates with a cross-encoder."""

from sentence_transformers import CrossEncoder


def rerank(query: str, candidates: list[dict], model_name: str, top_k: int, threshold: float) -> tuple[list[dict], bool]:
    """Return high-scoring chunks and whether to bypass retrieved context."""
    if not candidates:
        return [], True

    reranker = CrossEncoder(model_name)
    scores = reranker.predict([(query, candidate["text"]) for candidate in candidates])
    ranked = sorted(zip(candidates, scores), key=lambda item: item[1], reverse=True)

    results = []
    for candidate, score in ranked[:top_k]:
        if score < threshold:
            break
        results.append(dict(candidate, score=float(score)))
    return results, not results
