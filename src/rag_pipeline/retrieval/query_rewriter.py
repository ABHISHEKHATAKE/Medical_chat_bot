"""Rewrite user questions for medical document retrieval."""


def rewrite_query(user_query: str) -> str:
    """Expand a user query with retrieval-oriented medical terms."""
    return f"possible medical causes and next steps for symptoms: {user_query}"
