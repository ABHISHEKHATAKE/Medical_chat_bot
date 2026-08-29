"""Build the FAISS index from the MedQuAD dataset."""

from rag_pipeline.config.settings import settings
from rag_pipeline.ingestion.chunker import chunk_documents
from rag_pipeline.ingestion.loader import load_medquad
from rag_pipeline.retrieval.embedder import embed_chunks
from rag_pipeline.retrieval.vector_store import build_index


def main() -> None:
    documents = load_medquad()
    chunks = chunk_documents(documents, settings.chunk_size, settings.chunk_overlap)
    embedded_chunks = embed_chunks(chunks, settings.embedding_model)
    build_index(embedded_chunks, settings.vector_store_path)
    print(f"Built index with {len(embedded_chunks)} chunks at {settings.vector_store_path}")


if __name__ == "__main__":
    main()