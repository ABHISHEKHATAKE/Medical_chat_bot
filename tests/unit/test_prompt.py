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


def test_embedding_and_reranker_models_are_cached(monkeypatch) -> None:
    import rag_pipeline.retrieval.embedder as embedder_module
    import rag_pipeline.retrieval.reranker as reranker_module

    created = {"embedder": 0, "reranker": 0}

    class DummyEmbedder:
        def encode(self, texts):
            return [float(len(text)) for text in texts]

    class DummyReranker:
        def predict(self, pairs):
            return [0.9 for _ in pairs]

    def fake_sentence_transformer(model_name):
        created["embedder"] += 1
        return DummyEmbedder()

    def fake_cross_encoder(model_name):
        created["reranker"] += 1
        return DummyReranker()

    monkeypatch.setattr(embedder_module, "SentenceTransformer", fake_sentence_transformer)
    monkeypatch.setattr(reranker_module, "CrossEncoder", fake_cross_encoder)

    embedder_module.get_embedder("sentence-transformers/all-MiniLM-L6-v2")
    embedder_module.get_embedder("sentence-transformers/all-MiniLM-L6-v2")
    reranker_module.get_reranker("cross-encoder/ms-marco-MiniLM-L-6-v2")
    reranker_module.get_reranker("cross-encoder/ms-marco-MiniLM-L-6-v2")

    assert created["embedder"] == 1
    assert created["reranker"] == 1
