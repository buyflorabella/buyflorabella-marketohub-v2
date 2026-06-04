from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient

VALID_MODES = {"open", "protected", "maintenance"}

_client = None
_db = None


def _get_db():
    global _client, _db
    if _db is None:
        from flask import current_app
        _client = MongoClient(current_app.config["MONGO_URI"])
        _db = _client.get_default_database()
    return _db


def _get(key):
    doc = _get_db()["site_config"].find_one({"key": key})
    return doc["value"] if doc else None


def _set(key, value):
    _get_db()["site_config"].update_one(
        {"key": key}, {"$set": {"value": value}}, upsert=True
    )


def get_mode() -> str:
    return _get("access_mode") or "open"


def set_mode(mode: str):
    if mode not in VALID_MODES:
        raise ValueError(f"Invalid mode: {mode}")
    _set("access_mode", mode)


def get_maintenance_target():
    val = _get("maintenance_target")
    return val if val else None


def set_maintenance_target(s: str):
    _set("maintenance_target", s or "")


def get_site_password_hash():
    return _get("site_password_hash")


def get_site_password_info() -> dict:
    plain  = _get("site_password_plain")
    set_at = _get("site_password_set_at")
    return {"password": plain or "", "set_at": set_at or None}


def set_site_password(raw: str):
    from datetime import datetime, timezone
    if len(raw) < 4:
        raise ValueError("Password must be at least 4 characters.")
    _set("site_password_hash",  generate_password_hash(raw))
    _set("site_password_plain", raw)
    _set("site_password_set_at", datetime.now(timezone.utc).isoformat())


def verify_site_password(raw: str) -> bool:
    h = get_site_password_hash()
    if not h:
        return False
    return check_password_hash(h, raw)


def get_refresh_restores_gate() -> bool:
    val = _get("refresh_restores_gate")
    return bool(val) if val is not None else False


def set_refresh_restores_gate(val: bool):
    _set("refresh_restores_gate", bool(val))


VALID_EARLY_ACCESS_MODES = {"disabled", "instant", "contact"}


def get_early_access_mode() -> str:
    return _get("early_access_mode") or "disabled"


def set_early_access_mode(val: str):
    if val not in VALID_EARLY_ACCESS_MODES:
        raise ValueError(f"Invalid early_access_mode: {val}")
    _set("early_access_mode", val)


def get_show_password_on_gate() -> bool:
    val = _get("show_password_on_gate")
    return bool(val) if val is not None else False


def set_show_password_on_gate(val: bool):
    _set("show_password_on_gate", bool(val))


COMING_SOON_DEFAULTS = {
    "title":       "Something extraordinary is coming.",
    "tagline":     "Stay tuned.",
    "media_type":  "none",
    "media_value": "",
}

MAINTENANCE_DEFAULTS = {
    "title":   "We're updating things.",
    "tagline": "Back soon.",
}


def get_coming_soon_content() -> dict:
    doc = _get_db()["site_config"].find_one({"key": "coming_soon_content"})
    if doc and isinstance(doc.get("value"), dict):
        return {**COMING_SOON_DEFAULTS, **doc["value"]}
    return dict(COMING_SOON_DEFAULTS)


def set_coming_soon_content(data: dict):
    allowed = {"title", "tagline", "media_type", "media_value"}
    clean = {k: v for k, v in data.items() if k in allowed}
    if "media_type" in clean and clean["media_type"] not in {"none", "image", "video"}:
        raise ValueError("media_type must be none, image, or video")
    current = get_coming_soon_content()
    merged = {**current, **clean}
    _get_db()["site_config"].update_one(
        {"key": "coming_soon_content"}, {"$set": {"value": merged}}, upsert=True
    )


def get_maintenance_content() -> dict:
    doc = _get_db()["site_config"].find_one({"key": "maintenance_content"})
    if doc and isinstance(doc.get("value"), dict):
        return {**MAINTENANCE_DEFAULTS, **doc["value"]}
    return dict(MAINTENANCE_DEFAULTS)


def set_maintenance_content(data: dict):
    allowed = {"title", "tagline"}
    clean = {k: v for k, v in data.items() if k in allowed}
    current = get_maintenance_content()
    merged = {**current, **clean}
    _get_db()["site_config"].update_one(
        {"key": "maintenance_content"}, {"$set": {"value": merged}}, upsert=True
    )


def track_page_request(path: str) -> dict:
    db = _get_db()
    safe = (path or '/').strip()[:200]

    db['site_config'].update_one(
        {'key': 'page_requests_total'},
        {'$inc': {'value': 1}},
        upsert=True,
    )
    db['page_request_paths'].update_one(
        {'path': safe},
        {'$inc': {'count': 1}},
        upsert=True,
    )

    total_doc = db['site_config'].find_one({'key': 'page_requests_total'})
    path_doc  = db['page_request_paths'].find_one({'path': safe})
    return {
        'total':     total_doc['value'] if total_doc else 1,
        'this_path': path_doc['count']  if path_doc  else 1,
        'path':      safe,
    }


def seed_defaults(app):
    with app.app_context():
        mode = app.config.get("SITE_ACCESS_MODE", "open")
        if mode not in VALID_MODES:
            mode = "open"
        if _get("access_mode") is None:
            _set("access_mode", mode)

        target = app.config.get("MAINTENANCE_TARGET_UTC", "")
        if _get("maintenance_target") is None:
            _set("maintenance_target", target or "")

        raw_pw = app.config.get("SITE_PASSWORD", "")
        if raw_pw and _get("site_password_hash") is None:
            try:
                set_site_password(raw_pw)
            except ValueError:
                pass

        if _get("early_access_mode") is None:
            _set("early_access_mode", "disabled")

        if _get("show_password_on_gate") is None:
            _set("show_password_on_gate", False)
