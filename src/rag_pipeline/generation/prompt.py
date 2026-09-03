"""Construct grounded prompts from retrieved context."""


def build_prompt(
    query: str,
    chunks: list[dict],
    history: list[dict] | None = None,
    memory_summary: str | None = None,
) -> str:
    """Build a compact prompt with only essential context and direct answer instructions."""
    # Respect caller's history limit; avoid hardcoded 2-turn slice - show up to 6 turns if provided
    recent_history = (history or [])[-6:]
    previous_turns = "\n\n".join(
        f"User: {turn['question']}\nAssistant: {turn['answer']}"
        for turn in recent_history
    )
    # Use all retrieved chunks (already limited by top_k/reranker); keep prompt grounded
    if chunks:
        context = "\n\n".join(chunk["text"] for chunk in chunks)
    else:
        context = "(No retrieved context - answer from general medical knowledge with a disclaimer to consult a healthcare professional.)"
    history_section = f"Recent conversation:\n{previous_turns}\n\n" if previous_turns else ""
    memory_section = f"Relevant memory:\n{memory_summary}\n\n" if memory_summary else ""
    return (
        "You are a medical information assistant. Answer briefly and directly in 2-4 sentences "
        "unless the user asks for more detail. Use only the relevant context and prior memory. "
        "If context is missing or insufficient, answer from general knowledge but remind the user "
        "to consult a healthcare professional.\n\n"
        f"{memory_section}{history_section}Relevant context:\n{context}\n\nQuestion:\n{query}\n\nAnswer:"
    )
