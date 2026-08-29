"""Memory-aware handling for follow-up conversations."""

from __future__ import annotations


FOLLOW_UP_HINTS = (
    "what about",
    "what else",
    "how about",
    "that",
    "this",
    "it",
    "they",
    "them",
    "those",
    "these",
    "again",
    "more about",
    "tell me more",
)


def _looks_like_follow_up(question: str) -> bool:
    lowered = question.lower()
    return any(hint in lowered for hint in FOLLOW_UP_HINTS)


def _extract_relevant_history(question: str, history: list[dict]) -> list[dict]:
    if not history:
        return []

    relevant: list[dict] = []
    lowered = question.lower()
    for turn in history:
        combined = f"{turn.get('question', '')} {turn.get('answer', '')}".lower()
        if any(keyword in combined for keyword in ("diabetes", "metformin", "symptom", "side effect", "medicine", "treatment", "disease", "condition")):
            relevant.append(turn)
            continue
        if _looks_like_follow_up(lowered):
            relevant.append(turn)

    return relevant[-3:]


def resolve_memory_query(question: str, history: list[dict] | None = None) -> tuple[str, str]:
    """Return a cleaned question and a compact memory summary if prior conversation is relevant."""
    history = history or []
    if not history:
        return question, ""

    relevant = _extract_relevant_history(question, history)
    if not relevant:
        return question, ""

    cleaned = question
    for phrase in ("what about", "what else", "how about", "tell me more about", "more about"):
        if phrase in cleaned.lower():
            cleaned = cleaned.split(phrase, 1)[1].strip()
            break

    cleaned = cleaned.replace(" that", "").replace(" this", "").replace(" it", "").replace(" they", "").replace(" them", "").strip()
    if not cleaned:
        cleaned = "Provide the relevant information from prior context."

    memory_summary = " ".join(
        f"Previous: {turn.get('question', '')}. Answer: {turn.get('answer', '')}."
        for turn in relevant
    )
    return cleaned, memory_summary
