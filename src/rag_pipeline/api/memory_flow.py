"""Memory-aware request flow for follow-up questions."""

from rag_pipeline.context.memory import resolve_memory_query
from rag_pipeline.context.store import load_history


def prepare_question_for_rag(
    session_id: str,
    question: str,
    uri: str | None,
    database: str,
    collection: str,
    limit: int = 6,
    history: list[dict] | None = None,
) -> tuple[str, str]:
    """Return a cleaned query and relevant memory summary if the question depends on prior chat."""
    if history is None:
        history = load_history(session_id, uri, database, collection, limit)
    if not history:
        return question, ""

    return resolve_memory_query(question, history)
