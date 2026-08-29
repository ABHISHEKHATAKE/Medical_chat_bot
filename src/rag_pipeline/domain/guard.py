"""Guard rails to keep the chatbot within the medical domain."""

_MEDICAL_KEYWORDS = {
    "symptom",
    "symptoms",
    "disease",
    "diagnosis",
    "doctor",
    "doctor's",
    "doctor",
    "medicine",
    "medication",
    "treatment",
    "therapy",
    "health",
    "medical",
    "clinic",
    "patient",
    "hospital",
    "condition",
    "illness",
    "pain",
    "fever",
    "cough",
    "infection",
    "side effect",
    "side effects",
    "diabetes",
    "blood pressure",
    "vaccine",
    "diet",
    "nutrition",
    "mental health",
    "anxiety",
    "depression",
    "pregnancy",
    "child health",
    "care",
}


def is_medical_question(question: str) -> bool:
    """Return True only for health or medical-related questions."""
    text = question.lower()
    if not text.strip():
        return False

    tokens = set(text.replace("?", " ").replace("!", " ").split())
    has_medical_term = bool(tokens & {term.lower() for term in _MEDICAL_KEYWORDS})

    if has_medical_term:
        return True

    medical_phrases = (
        "what are the symptoms",
        "what causes",
        "how to treat",
        "how does this medicine work",
        "side effects of",
        "is this normal",
        "when should i see a doctor",
        "disease",
        "medication",
        "doctor",
        "health condition",
    )
    return any(phrase in text for phrase in medical_phrases)


def medical_refusal() -> str:
    """Return a short refusal for non-medical user requests."""
    return "I can only answer medical or health-related questions. Please ask about symptoms, conditions, treatments, or medical advice."
