"""Persist and retrieve conversation turns in MongoDB, with an in-memory fallback."""

from datetime import datetime, timezone

_SESSION_MEMORY: dict[str, list[dict[str, str]]] = {}


def load_history(
    session_id: str,
    uri: str | None,
    database: str,
    collection: str,
    limit: int,
) -> list[dict]:
    """Return recent turns and fall back to an in-memory session store when MongoDB is unavailable."""
    if limit <= 0:
        return []

    if not uri:
        return _SESSION_MEMORY.get(session_id, [])[-limit:]

    from pymongo import MongoClient
    from pymongo.errors import PyMongoError

    client = MongoClient(uri, serverSelectionTimeoutMS=2000)
    try:
        documents = list(
            client[database][collection]
            .find({"session_id": session_id}, {"_id": 0, "question": 1, "answer": 1})
            .sort("created_at", -1)
            .limit(limit)
        )
        if documents:
            return list(reversed(documents))
    except PyMongoError:
        pass
    finally:
        client.close()

    return _SESSION_MEMORY.get(session_id, [])[-limit:]


def save_turn(
    session_id: str,
    question: str,
    answer: str,
    uri: str | None,
    database: str,
    collection: str,
) -> None:
    """Save one completed turn and keep a runtime fallback so session memory survives in-process."""
    session_history = _SESSION_MEMORY.setdefault(session_id, [])
    session_history.append({"question": question, "answer": answer})

    if not uri:
        return

    from pymongo import MongoClient
    from pymongo.errors import PyMongoError

    client = MongoClient(uri, serverSelectionTimeoutMS=2000)
    try:
        client[database][collection].insert_one(
            {
                "session_id": session_id,
                "question": question,
                "answer": answer,
                "created_at": datetime.now(timezone.utc),
            }
        )
    except PyMongoError:
        return
    finally:
        client.close()
