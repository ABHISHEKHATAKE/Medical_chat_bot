"""Create vector embeddings for document chunks and queries."""

from functools import lru_cache

from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=4)
def get_embedder(model_name: str):
    """Return a cached sentence-transformer instance to avoid repeated model loads."""
    return SentenceTransformer(model_name)


def embed_chunks(chunks: list[dict[str, str]], model_name: str) -> list[dict]:
    """Add embeddings to chunks."""
    embedder = get_embedder(model_name)
    embeddings = embedder.encode([chunk["text"] for chunk in chunks], normalize_embeddings=True)
    return [dict(chunk, embedding=embedding) for chunk, embedding in zip(chunks, embeddings)]


def embed_query(query: str, model_name: str):
    """Embed one query for vector search."""
    return get_embedder(model_name).encode([query], normalize_embeddings=True)
