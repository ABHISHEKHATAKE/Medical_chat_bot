from rag_pipeline.generation.sanitize import sanitize_final_answer, strip_thinking


def test_strip_thinking_removes_think_block() -> None:
    text = "<think>\n1. Analyze input\n2. Draft response\n</think>\nThe final answer."
    assert strip_thinking(text) == "The final answer."


def test_strip_thinking_case_insensitive_and_variants() -> None:
    text = "<THINK>planning</THINK>Answer <thinking>more</thinking>done."
    assert strip_thinking(text) == "Answer done."


def test_strip_thinking_unclosed_tag() -> None:
    text = "Answer starts<think>trailing reasoning without close"
    assert strip_thinking(text) == "Answer starts"


def test_sanitize_final_answer_fallback_on_only_thinking() -> None:
    result = sanitize_final_answer("<think>all reasoning, no answer</think>")
    assert "<think>" not in result.lower()
    assert len(result) > 0


def test_sanitize_final_answer_keeps_clean_text() -> None:
    text = "The image shows red patches. See a healthcare professional."
    assert sanitize_final_answer(text) == text


def test_generate_strips_think(monkeypatch) -> None:
    from rag_pipeline.generation import model as model_module

    class DummyResponse:
        def raise_for_status(self) -> None:
            return None

        def json(self) -> dict:
            return {
                "choices": [
                    {"message": {"content": "<think>1. Analyze\n2. Draft</think>\nGroq answer"}}
                ]
            }

    def fake_post(url, headers=None, json=None, timeout=None):
        return DummyResponse()

    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    monkeypatch.setattr("requests.post", fake_post)

    answer = model_module.generate("Test prompt", "qwen/qwen3.6-27b", "groq")

    assert answer == "Groq answer"
    assert "think" not in answer.lower()
