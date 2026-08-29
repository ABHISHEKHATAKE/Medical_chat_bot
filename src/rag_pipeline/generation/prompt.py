"""Construct grounded prompts from retrieved context."""


def build_prompt(
    query: str,
    chunks: list[dict],
    history: list[dict] | None = None,
    memory_summary: str | None = None,
) -> str:
    """Build a compact prompt with only essential context and direct answer instructions."""
    recent_history = (history or [])[-2:]
    previous_turns = "\n\n".join(
        f"User: {turn['question']}\nAssistant: {turn['answer']}"
        for turn in recent_history
    )
    context = "\n\n".join(chunk["text"] for chunk in chunks[:2])
    history_section = f"Recent conversation:\n{previous_turns}\n\n" if previous_turns else ""
    memory_section = f"Relevant memory:\n{memory_summary}\n\n" if memory_summary else ""
    return (
        "Answer briefly and directly in 2-4 sentences unless the user asks for more detail. "
        "Use only the relevant context and prior memory.\n\n"
        f"{memory_section}{history_section}Relevant context:\n{context}\n\nQuestion:\n{query}\n\nAnswer:"
    )
