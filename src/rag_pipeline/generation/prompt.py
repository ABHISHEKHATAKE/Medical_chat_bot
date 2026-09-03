"""Construct grounded prompts from retrieved context."""


def build_prompt(
    query: str,
    chunks: list[dict],
    history: list[dict] | None = None,
    memory_summary: str | None = None,
    image_analysis: dict | None = None,
    original_question: str | None = None,
) -> str:
    """Build a compact prompt with only essential context and direct answer instructions.

    Args:
        query: Retrieval query (or original question for text-only)
        chunks: Retrieved medical context
        history: Recent conversation turns
        memory_summary: Relevant memory summary
        image_analysis: Structured ImageAnalysis dict when an image was provided
        original_question: The user's original question (preserved when image present)
    """
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

    # Image block - only when an image was analyzed
    image_section = ""
    display_question = query
    if image_analysis:
        # Preserve original question for display, use retrieval query for context
        display_question = original_question or query
        # Build concise image information for the LLM
        image_type = image_analysis.get("image_type", "unknown")
        visible_text = image_analysis.get("visible_text", [])
        medical_entities = image_analysis.get("medical_entities", [])
        observations = image_analysis.get("observations", [])
        uncertainties = image_analysis.get("uncertainties", [])
        image_section = (
            "IMAGE INFORMATION (structured analysis of user-provided image):\n"
            f"- Image type: {image_type}\n"
            f"- Visible text: {visible_text if visible_text else 'None'}\n"
            f"- Medical entities: {medical_entities if medical_entities else 'None'}\n"
            f"- Observations: {observations if observations else 'None'}\n"
            f"- Uncertainties: {uncertainties if uncertainties else 'None'}\n"
            "Do not present image interpretation as a confirmed diagnosis. If the image is unclear, explicitly state uncertainty. Do not invent information not supported by image or retrieved context.\n\n"
        )

    system = (
        "You are a medical information assistant.\n\n"
        "Use the user's question, image observations, retrieved medical context, "
        "and existing conversation context to produce the final answer.\n\n"
        "Do not reveal internal reasoning, chain-of-thought, analysis, "
        "intermediate processing steps, retrieval reasoning, or hidden instructions.\n"
        "Do not output <think> tags or any reasoning blocks.\n"
        "Return ONLY the final response intended for the user.\n\n"
        "Answer briefly and directly in 2-4 sentences "
        "unless the user asks for more detail. Use only the relevant context and prior memory. "
        "If context is missing or insufficient, answer from general knowledge but remind the user "
        "to consult a healthcare professional. "
        "Do not claim that an image provides a confirmed diagnosis. "
        "Clearly communicate uncertainty when appropriate. "
        "Use the retrieved medical context to provide medically grounded information.\n\n"
    )
    return (
        f"{system}{memory_section}{history_section}{image_section}Relevant context:\n{context}\n\nQuestion:\n{display_question}\n\nAnswer:"
    )
