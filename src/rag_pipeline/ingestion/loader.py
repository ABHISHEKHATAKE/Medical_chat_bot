"""Load the MedQuAD dataset used by the notebook experiment."""

from datasets import load_dataset


def load_medquad(sample_size: int = 3000) -> list[dict[str, str]]:
    """Load answer documents and their source questions from Hugging Face."""
    dataset = load_dataset("AnonymousSub/MedQuAD_47441_Question_Answer_Pairs")["train"]
    subset = dataset.select(range(min(sample_size, len(dataset))))
    return [
        {"text": row["Answers"], "question": row["Questions"]}
        for row in subset
    ]
