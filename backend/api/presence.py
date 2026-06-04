from flask import request, session
from flask_restx import Namespace, Resource

from models import presence as presence_model

presence_ns = Namespace("chat/presence", description="Live room presence")


@presence_ns.route("/heartbeat")
class PresenceHeartbeat(Resource):
    def post(self):
        """Register or refresh the caller's presence in a room. TTL: 20 s."""
        data         = request.get_json(force=True) or {}
        room_id      = (data.get("room_id")      or "").strip()
        session_key  = (data.get("session_key")  or "").strip()
        display_name = (data.get("display_name") or "guest").strip()[:60]

        if not room_id or not session_key:
            return {"error": "room_id and session_key required"}, 400

        is_support = bool(session.get("is_admin"))
        if is_support:
            display_name = "Support"  # server-authoritative; clients cannot spoof this

        presence_model.heartbeat(room_id, session_key, display_name, is_support)
        return "", 204


@presence_ns.route("/who")
class PresenceWho(Resource):
    def get(self):
        """Return all users currently present in a room (based on recent heartbeats)."""
        room_id = (request.args.get("room") or "").strip()
        if not room_id:
            return {"error": "room required"}, 400
        return presence_model.who_is_here(room_id)


@presence_ns.route("/leave")
class PresenceLeave(Resource):
    def post(self):
        """Immediately delete the caller's presence doc. Called via sendBeacon on tab close."""
        data        = request.get_json(force=True) or {}
        room_id     = (data.get("room_id")     or "").strip()
        session_key = (data.get("session_key") or "").strip()
        if room_id and session_key:
            presence_model.leave(room_id, session_key)
        return "", 204
