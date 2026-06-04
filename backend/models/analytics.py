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


def aggregate_daily():
    """
    Roll up raw pageviews into daily_stats.
    Each day: total_views = raw event count; unique_paths = distinct pages visited.
    Returns number of days written.
    """
    pipeline = [
        {
            "$addFields": {
                "date": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$ts",
                        "timezone": "UTC",
                    }
                }
            }
        },
        {
            "$group": {
                "_id": {"date": "$date", "path": "$path"},
                "path_views": {"$sum": 1},
            }
        },
        {
            "$group": {
                "_id": "$_id.date",
                "total_views": {"$sum": "$path_views"},
                "unique_paths": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]
    rows = list(_get_db()["pageviews"].aggregate(pipeline))
    col = _get_db()["daily_stats"]
    for row in rows:
        col.update_one(
            {"date": row["_id"]},
            {"$set": {"date": row["_id"], "total_views": row["total_views"], "unique_paths": row["unique_paths"]}},
            upsert=True,
        )
    return len(rows)


def get_daily_stats(days=90):
    from datetime import datetime, timedelta, timezone
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).strftime("%Y-%m-%d")
    rows = list(
        _get_db()["daily_stats"]
        .find({"date": {"$gte": cutoff}}, {"_id": 0, "date": 1, "total_views": 1, "unique_paths": 1})
        .sort("date", 1)
    )
    return rows
