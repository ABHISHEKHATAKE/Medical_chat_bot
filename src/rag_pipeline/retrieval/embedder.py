"""Create vector embeddings for document chunks and queries."""

from sentence_transformers import SentenceTransformer


def embed_chunks(chunks: list[dict[str, str]], model_name: str) -> list[dict]:
    """Add embeddings to chunks."""
    embedder = SentenceTransformer(model_name)
    embeddings = embedder.encode([chunk["text"] for chunk in chunks])
    return [dict(chunk, embedding=embedding) for chunk, embedding in zip(chunks, embeddings)]


def embed_query(query: str, model_name: str):
    """Embed one query for vector search."""
    return SentenceTransformer(model_name).encode([query])
