"""Tag documents and split them into retrieval-sized chunks."""


def guess_type(question: str) -> str:
    """Classify a medical question using the notebook's simple heuristic."""
    normalized = question.lower()
    if normalized.startswith(("what is", "what are")):
        return "definition"
    if any(word in normalized for word in ("treat", "cure", "medicine")):
        return "treatment"
    if any(word in normalized for word in ("when", "doctor", "emergency")):
        return "when_to_see_doctor"
    return "cause"


def chunk_documents(documents: list[dict[str, str]], chunk_size: int, chunk_overlap: int) -> list[dict[str, str]]:
    """Split documents while preserving source metadata and question type.

    Uses character windowing but snaps to sentence boundaries (., !, ?) to avoid
    mid-sentence cuts. Falls back to hard cut if no boundary is found.
    """
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be smaller than chunk_size")

    chunks = []
    step = chunk_size - chunk_overlap
    for document in documents:
        text = document["text"] or ""
        doc_type = guess_type(document["question"])
        for start in range(0, len(text), step):
            end = start + chunk_size
            raw = text[start:end]
            # Snap end to last sentence boundary within chunk to avoid cutting mid-sentence
            if end < len(text):
                for sep in (". ", "! ", "? ", ".\n", "!\n", "?\n"):
                    idx = raw.rfind(sep)
                    if idx > chunk_size * 0.5:  # only snap if we keep >50% of chunk
                        raw = raw[: idx + 1]
                        break
            chunk = raw.strip()
            if chunk:
                chunks.append(
                    {
                        "text": chunk,
                        "question": document["question"],
                        "type": doc_type,
                    }
                )
            if end >= len(text):
                break
    return chunks
