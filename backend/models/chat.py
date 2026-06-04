import re
import uuid as _uuid_mod
from datetime import datetime, timezone
from pymongo import MongoClient, ReturnDocument

_client = None
_db = None

ROOM_SUPPORT = "support"
_UUID_RE = re.compile(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.I
)


def valid_room_id(room_id: str) -> bool:
    return room_id == ROOM_SUPPORT or bool(_UUID_RE.match(room_id or ""))


def _get_db():
    global _client, _db
    if _db is None:
        from flask import current_app
        _client = MongoClient(current_app.config["MONGO_URI"])
        _db = _client.get_default_database()
    return _db


def _serialize_msg(doc):
    doc["id"] = str(doc.pop("_id"))
    if isinstance(doc.get("timestamp"), datetime):
        doc["timestamp"] = doc["timestamp"].isoformat()
    doc.setdefault("room_id", ROOM_SUPPORT)
    return doc


def _serialize_room(doc):
    doc.pop("_id", None)
    if isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc


# ── Rooms ─────────────────────────────────────────────────────────────────────

def get_or_create_room(room_id: str, room_type: str = "public",
                       name: str = None, created_by: str = None) -> dict:
    default_name = "Support Chat" if room_id == ROOM_SUPPORT else None
    doc = _get_db()["chat_rooms"].find_one_and_update(
        {"room_id": room_id},
        {"$setOnInsert": {
            "room_id":    room_id,
            "room_type":  room_type,
            "name":       name or default_name,
            "created_at": datetime.now(timezone.utc),
            "created_by": created_by,
        }},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return _serialize_room(doc)


def find_room(room_id: str) -> dict | None:
    doc = _get_db()["chat_rooms"].find_one({"room_id": room_id})
    return _serialize_room(doc) if doc else None


def update_room(room_id: str, **fields) -> dict | None:
    allowed = {"name"}
    update = {k: v for k, v in fields.items() if k in allowed and v is not None}
    if not update:
        return find_room(room_id)
    doc = _get_db()["chat_rooms"].find_one_and_update(
        {"room_id": room_id},
        {"$set": update},
        return_document=ReturnDocument.AFTER,
    )
    return _serialize_room(doc) if doc else None


def list_rooms() -> list:
    docs = list(_get_db()["chat_rooms"].find({}, sort=[("created_at", 1)]))
    return [_serialize_room(d) for d in docs]


def generate_room_id() -> str:
    return str(_uuid_mod.uuid4())


# ── Messages ──────────────────────────────────────────────────────────────────

def _room_query(room_id: str) -> dict:
    """Match messages for a room, with backward-compat for support room."""
    if room_id == ROOM_SUPPORT:
        return {"$or": [{"room_id": ROOM_SUPPORT}, {"room_id": {"$exists": False}}]}
    return {"room_id": room_id}


def create(user_email, message, sender_type, display_name=None, room_id=ROOM_SUPPORT,
           message_type=None):
    doc = {
        "room_id":      room_id,
        "user_email":   user_email,
        "display_name": display_name or user_email,
        "message":      message,
        "sender_type":  sender_type,
        "timestamp":    datetime.now(timezone.utc),
    }
    if message_type:
        doc["message_type"] = message_type
    result = _get_db()["chat_messages"].insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    doc["timestamp"] = doc["timestamp"].isoformat()
    return doc


def find_all(room_id=ROOM_SUPPORT) -> list:
    docs = _get_db()["chat_messages"].find(
        _room_query(room_id), sort=[("timestamp", 1)]
    )
    return [_serialize_msg(d) for d in docs]


def clear_room(room_id=ROOM_SUPPORT) -> int:
    return _get_db()["chat_messages"].delete_many(_room_query(room_id)).deleted_count


# ── Legacy (kept for admin backward compat) ────────────────────────────────────

def find_for_user(email):
    docs = _get_db()["chat_messages"].find(
        {"user_email": email}, sort=[("timestamp", 1)]
    )
    return [_serialize_msg(d) for d in docs]


def count():
    return _get_db()["chat_messages"].count_documents({})


def clear_all():
    return _get_db()["chat_messages"].delete_many({}).deleted_count
