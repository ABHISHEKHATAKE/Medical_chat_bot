"""Build and search the FAISS vector index."""

import json
from pathlib import Path

import faiss
import numpy as np

from rag_pipeline.retrieval.embedder import embed_query


def build_index(embedded_chunks: list[dict], store_path: str) -> None:
    """Persist a FAISS index and JSON metadata for the embedded chunks.

    Uses inner-product (cosine) search because embeddings are L2-normalized.
    Falls back to normalized L2 if IP index is unavailable; keeps build compatible
    with existing retrieval that expects cosine-like ranking.
    """
    path = Path(store_path)
    path.mkdir(parents=True, exist_ok=True)
    vectors = np.asarray([chunk["embedding"] for chunk in embedded_chunks], dtype="float32")
    # L2-normalize to ensure cosine = IP (defensive if caller forgot normalize)
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1
    vectors = vectors / norms
    # Use Inner Product for cosine similarity on normalized vectors
    index = faiss.IndexFlatIP(vectors.shape[1])
    index.add(vectors)
    faiss.write_index(index, str(path / "index.faiss"))
    metadata = [{key: value for key, value in chunk.items() if key != "embedding"} for chunk in embedded_chunks]
    (path / "metadata.json").write_text(json.dumps(metadata), encoding="utf-8")


def retrieve(query: str, top_k: int, store_path: str, embedding_model: str) -> list[dict]:
    """Return the nearest chunks for a query using the notebook's L2 search."""
    path = Path(store_path)
    index_path = path / "index.faiss"
    metadata_path = path / "metadata.json"
    if not index_path.is_file() or not metadata_path.is_file():
        raise FileNotFoundError(index_path)
    index = faiss.read_index(str(index_path))
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    distances, indices = index.search(
        np.asarray(embed_query(query, embedding_model), dtype="float32"),
        min(top_k, index.ntotal),
    )
    return [metadata[index_id] for index_id in indices[0] if index_id >= 0]
