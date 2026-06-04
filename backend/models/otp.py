import time
from datetime import datetime, timezone

_client = None
_db = None


def _get_db():
    global _client, _db
    if _db is None:
        from pymongo import MongoClient, ASCENDING
        from flask import current_app
        _client = MongoClient(current_app.config["MONGO_URI"])
        _db = _client.get_default_database()
        # TTL index: MongoDB auto-deletes expired documents
        _db["otp_sessions"].create_index(
            [("expires_at_dt", ASCENDING)], expireAfterSeconds=0
        )
    return _db


def store(email: str, otp: str, expires_at: float):
    db = _get_db()
    db["otp_sessions"].replace_one(
        {"email": email},
        {
            "email": email,
            "otp": otp,
            "expires_at": expires_at,
            "expires_at_dt": datetime.fromtimestamp(expires_at, tz=timezone.utc),
            "used": False,
        },
        upsert=True,
    )


def get(email: str) -> dict | None:
    doc = _get_db()["otp_sessions"].find_one({"email": email}, {"_id": 0})
    return doc


def mark_used(email: str):
    _get_db()["otp_sessions"].update_one({"email": email}, {"$set": {"used": True}})


def delete(email: str):
    _get_db()["otp_sessions"].delete_one({"email": email})
