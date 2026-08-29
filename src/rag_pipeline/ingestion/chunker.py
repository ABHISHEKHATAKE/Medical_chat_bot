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
    """Split documents while preserving source metadata and question type."""
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be smaller than chunk_size")

    chunks = []
    step = chunk_size - chunk_overlap
    for document in documents:
        text = document["text"]
        for start in range(0, len(text), step):
            chunk = text[start : start + chunk_size].strip()
            if chunk:
                chunks.append(
                    {
                        "text": chunk,
                        "question": document["question"],
                        "type": guess_type(document["question"]),
                    }
                )
    return chunks
