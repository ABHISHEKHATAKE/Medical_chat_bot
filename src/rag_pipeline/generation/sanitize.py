"""Defensive output cleaning: never expose model reasoning to the user.

Reasoning models (e.g. qwen/qwen3.6-27b) emit <think>...</think> traces.
Prompts alone cannot guarantee suppression, so every model output is
scrubbed here before it reaches MongoDB or the API response.
"""

import re

# Complete <tag>...</tag> reasoning blocks (think, thinking, thought,
# reasoning, analysis, chain-of-thought and hyphen/underscore variants).
_THINK_BLOCK_RE = re.compile(
    r"<\s*(think(?:ing)?|thought|reasoning|analysis|chain[_-]?of[_-]?thought)[^>]*>"
    r".*?"
    r"<\s*/\s*\1\s*>",
    re.IGNORECASE | re.DOTALL,
)

# Opening tag with no matching close (truncated stream): drop it and all after.
_UNCLOSED_TAG_RE = re.compile(
    r"<\s*(think(?:ing)?|thought|reasoning|analysis|chain[_-]?of[_-]?thought)[^>]*>.*$",
    re.IGNORECASE | re.DOTALL,
)

# Stray closing tags left over after block removal.
_STRAY_CLOSE_RE = re.compile(
    r"<\s*/\s*(think(?:ing)?|thought|reasoning|analysis|chain[_-]?of[_-]?thought)\s*>",
    re.IGNORECASE,
)

_FALLBACK = (
    "I couldn't generate a response for that. "
    "Please try again or consult a healthcare professional."
)


def strip_thinking(text: str) -> str:
    """Remove all reasoning blocks, thinking traces, and stray tags."""
    if not text:
        return ""
    cleaned = _THINK_BLOCK_RE.sub("", text)
    cleaned = _UNCLOSED_TAG_RE.sub("", cleaned)
    cleaned = _STRAY_CLOSE_RE.sub("", cleaned)
    # Collapse 3+ blank lines left behind by removals, then trim.
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    return cleaned


def sanitize_final_answer(text: str) -> str:
    """Return only user-safe output. Falls back if nothing remains."""
    cleaned = strip_thinking(text or "")
    if not cleaned:
        return _FALLBACK
    return cleaned
