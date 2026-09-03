from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_provider: str = "groq"
    model_name: str = "qwen/qwen3.6-27b"
    groq_api_key: str | None = None
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    vector_store_path: str = "data/embeddings/vector_store"
    mongodb_uri: str | None = None
    mongodb_database: str = "rag_pipeline"
    mongodb_collection: str = "conversation_context"
    context_turn_limit: int = 6
    top_k: int = 5
    similarity_threshold: float = 0.5
    chunk_size: int = 800
    chunk_overlap: int = 120

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
