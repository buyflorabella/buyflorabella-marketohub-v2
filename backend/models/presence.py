from datetime import datetime, timezone
from pymongo import ASCENDING

_client = None
_db = None


def _get_db():
    global _client, _db
    if _db is None:
        from flask import current_app
        from pymongo import MongoClient
        _client = MongoClient(current_app.config["MONGO_URI"])
        _db = _client.get_default_database()
    return _db


def ensure_indexes():
    col = _get_db()["chat_presence"]
    col.create_index("last_seen", expireAfterSeconds=20, background=True)
    col.create_index(
        [("room_id", ASCENDING), ("session_key", ASCENDING)],
        unique=True, background=True,
    )


def heartbeat(room_id: str, session_key: str, display_name: str,
              is_support: bool = False) -> None:
    _get_db()["chat_presence"].update_one(
        {"room_id": room_id, "session_key": session_key},
        {"$set": {
            "display_name": display_name,
            "is_support":   is_support,
            "last_seen":    datetime.now(timezone.utc),
        }},
        upsert=True,
    )


def who_is_here(room_id: str) -> list:
    docs = _get_db()["chat_presence"].find(
        {"room_id": room_id},
        {"_id": 0, "display_name": 1, "is_support": 1},
    )
    return list(docs)


def leave(room_id: str, session_key: str) -> None:
    """Immediately delete presence doc. Called on tab close via sendBeacon."""
    _get_db()["chat_presence"].delete_one(
        {"room_id": room_id, "session_key": session_key}
    )
