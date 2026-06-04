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


def find_by_email(email):
    return _get_db()["users"].find_one({"email": email}, {"_id": 0})


def find_all():
    return list(_get_db()["users"].find({}, {"_id": 0}).sort("email", 1))


def create(email, is_admin=False):
    doc = {
        "email": email,
        "is_admin": is_admin,
        "profile_complete": is_admin,  # admin never needs profile completion
        "profile_data": {},
    }
    _get_db()["users"].insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


def update(email, fields):
    _get_db()["users"].update_one({"email": email}, {"$set": fields})
    return find_by_email(fields.get("email", email))


def update_profile(email, profile_data):
    _get_db()["users"].update_one(
        {"email": email},
        {"$set": {"profile_data": profile_data, "profile_complete": True}},
    )


def delete(email):
    result = _get_db()["users"].delete_one({"email": email})
    return result.deleted_count > 0


def find_or_create(email):
    user = find_by_email(email)
    if user is None:
        user = create(email, is_admin=False)
    return user
