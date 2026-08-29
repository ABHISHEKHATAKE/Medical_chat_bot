from rag_pipeline.context.memory import resolve_memory_query
from rag_pipeline.context.store import load_history, save_turn
from rag_pipeline.generation.model import generate
from rag_pipeline.generation.prompt import build_prompt


def test_build_prompt_includes_query_and_context() -> None:
    prompt = build_prompt("What is RAG?", [{"text": "RAG retrieves relevant context."}])

    assert "What is RAG?" in prompt
    assert "RAG retrieves relevant context." in prompt


def test_build_prompt_includes_conversation_history_without_retrieved_context() -> None:
    prompt = build_prompt(
        "Which symptoms did I ask about earlier?",
        [],
        [{"question": "What are symptoms of cancer?", "answer": "Symptoms vary by cancer type."}],
    )

    assert "What are symptoms of cancer?" in prompt
    assert "Symptoms vary by cancer type." in prompt
    assert "Which symptoms did I ask about earlier?" in prompt


def test_session_history_works_without_mongodb() -> None:
    session_id = "session-memory-test"
    save_turn(session_id, "What are symptoms of diabetes?", "Common symptoms include thirst and fatigue.", None, "rag_pipeline", "conversation_context")

    history = load_history(session_id, None, "rag_pipeline", "conversation_context", 10)

    assert history == [{"question": "What are symptoms of diabetes?", "answer": "Common symptoms include thirst and fatigue."}]


def test_resolve_memory_query_uses_relevant_history_for_follow_up() -> None:
    question, memory_summary = resolve_memory_query(
        "What are the side effects?",
        [
            {"question": "I have diabetes.", "answer": "I understand."},
            {"question": "I am taking metformin.", "answer": "Okay."},
        ],
    )

    assert "metformin" in memory_summary.lower()
    assert "side effects" in question.lower()
    assert "it" not in question.lower()


def test_generate_supports_groq_provider(monkeypatch) -> None:
    class DummyResponse:
        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict:
            return {"choices": [{"message": {"content": "Groq answer"}}]}

    def fake_post(url, headers=None, json=None, timeout=None):
        assert url == "https://api.groq.com/openai/v1/chat/completions"
        assert headers["Authorization"].startswith("Bearer ")
        return DummyResponse()

    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    monkeypatch.setattr("requests.post", fake_post)

    answer = generate("Test prompt", "llama-3.1-8b-instant", "groq")

    assert answer == "Groq answer"
