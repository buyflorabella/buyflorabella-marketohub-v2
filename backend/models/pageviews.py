from datetime import datetime, timezone, timedelta
from pymongo import MongoClient

_client = None
_db = None


def _get_db():
    global _client, _db
    if _db is None:
        from flask import current_app
        _client = MongoClient(current_app.config["MONGO_URI"])
        _db = _client.get_default_database()
    return _db


def record(path: str) -> None:
    _get_db()["pageviews"].insert_one({
        "path": path,
        "ts":   datetime.now(timezone.utc),
    })


def get_stats() -> dict:
    col = _get_db()["pageviews"]
    now         = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start  = today_start - timedelta(days=6)

    total     = col.count_documents({})
    today     = col.count_documents({"ts": {"$gte": today_start}})
    this_week = col.count_documents({"ts": {"$gte": week_start}})

    top_raw = list(col.aggregate([
        {"$group": {"_id": "$path", "count": {"$sum": 1}}},
        {"$sort":  {"count": -1}},
        {"$limit": 15},
    ]))

    daily = []
    for i in range(6, -1, -1):
        day_start = today_start - timedelta(days=i)
        day_end   = day_start + timedelta(days=1)
        daily.append({
            "date":  day_start.strftime("%b %d"),
            "count": col.count_documents({"ts": {"$gte": day_start, "$lt": day_end}}),
        })

    return {
        "total":     total,
        "today":     today,
        "this_week": this_week,
        "top_pages": [{"path": d["_id"], "count": d["count"]} for d in top_raw],
        "daily":     daily,
    }
