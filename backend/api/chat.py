import logging
import uuid
from flask import request, session
from flask_restx import Namespace, Resource, fields

from models import chat as chat_model

log = logging.getLogger(__name__)

chat_ns = Namespace("chat", description="Chat messages and rooms")

send_model = chat_ns.model("ChatSend", {
    "message": fields.String(required=True),
    "send_as": fields.String(required=False),
    "room_id": fields.String(required=False),
})

room_create_model = chat_ns.model("ChatRoomCreate", {
    "room_id":   fields.String(required=False, description="UUID; auto-generated if omitted"),
    "name":      fields.String(required=False),
    "room_type": fields.String(required=False, enum=["support", "public"], default="public"),
})


def _sender_identity(send_as=None):
    """Return (identifier, sender_type, display_name)."""
    email = session.get("email")
    if email:
        sender_type  = "admin" if session.get("is_admin", False) else "user"
        display_name = send_as or email
        return email, sender_type, display_name
    guest_id     = f"guest_{uuid.uuid4().hex[:8]}"
    display_name = send_as or guest_id
    return guest_id, "guest", display_name


def _resolve_room(raw: str) -> str:
    """Return validated room_id or fall back to support."""
    if raw and chat_model.valid_room_id(raw):
        return raw
    return chat_model.ROOM_SUPPORT


# ── Messages ──────────────────────────────────────────────────────────────────

@chat_ns.route("/send")
class ChatSend(Resource):
    @chat_ns.expect(send_model)
    def post(self):
        data         = request.get_json(force=True) or {}
        message      = (data.get("message")      or "").strip()
        send_as      = (data.get("send_as")      or "").strip() or None
        message_type = (data.get("message_type") or "").strip().lower() or None
        room_id      = _resolve_room(data.get("room_id"))

        # Chirp signals have no message body; all other sends require one
        if not message and message_type != "chirp":
            return {"success": False, "message": "Message is required."}, 400

        identifier, sender_type, display_name = _sender_identity(send_as)
        # Ensure room exists on first send
        chat_model.get_or_create_room(
            room_id,
            room_type="support" if room_id == chat_model.ROOM_SUPPORT else "public",
            created_by=identifier if identifier.startswith("guest_") is False else None,
        )
        msg = chat_model.create(identifier, message, sender_type,
                                display_name=display_name, room_id=room_id,
                                message_type=message_type)
        log.debug("chat send room=%s identifier=%s sender_type=%s", room_id, identifier, sender_type)
        return {"success": True, "message_id": msg["id"]}


@chat_ns.route("/messages")
class ChatMessages(Resource):
    def get(self):
        room_id = _resolve_room(request.args.get("room"))
        messages = chat_model.find_all(room_id)
        log.debug("chat messages room=%s count=%d", room_id, len(messages))
        return messages

    def delete(self):
        """Clear all messages in a room. Any participant may request this."""
        room_id = _resolve_room(request.args.get("room"))
        count = chat_model.clear_room(room_id)
        log.info("chat clear room=%s deleted=%d", room_id, count)
        return {"cleared": count}


# ── Rooms ─────────────────────────────────────────────────────────────────────

@chat_ns.route("/rooms")
class ChatRooms(Resource):
    def get(self):
        """Admin only: list all rooms with message counts."""
        if not session.get("is_admin"):
            return {"message": "Admin access required."}, 403
        rooms = chat_model.list_rooms()
        db = chat_model._get_db()
        for room in rooms:
            rid = room["room_id"]
            room["message_count"] = db["chat_messages"].count_documents(
                chat_model._room_query(rid)
            )
        return rooms

    @chat_ns.expect(room_create_model)
    def post(self):
        """Create a new room. Admin or logged-in user only."""
        if not session.get("email") and not session.get("is_admin"):
            return {"message": "Login required to create a room."}, 401
        data      = request.get_json(force=True) or {}
        raw_id    = (data.get("room_id") or "").strip()
        name      = (data.get("name") or "").strip() or None
        room_type = data.get("room_type", "public")

        if raw_id and raw_id != chat_model.ROOM_SUPPORT:
            if not chat_model.valid_room_id(raw_id):
                return {"message": "room_id must be a valid UUID."}, 400
            room_id = raw_id
        else:
            room_id = chat_model.generate_room_id()

        room = chat_model.get_or_create_room(
            room_id,
            room_type=room_type,
            name=name,
            created_by=session.get("email"),
        )
        return {"room": room, "url": f"/chat?room={room_id}"}, 201


@chat_ns.route("/rooms/<string:room_id>")
class ChatRoom(Resource):
    def get(self, room_id):
        """Get room metadata. Auto-creates public rooms on first access."""
        room_id = _resolve_room(room_id)
        room = chat_model.get_or_create_room(
            room_id,
            room_type="support" if room_id == chat_model.ROOM_SUPPORT else "public",
        )
        return room

    def patch(self, room_id):
        """Update mutable room fields (name). No auth required — room UUID is the key."""
        if not chat_model.valid_room_id(room_id):
            return {"error": "invalid room_id"}, 400
        data = request.get_json(force=True) or {}
        name = (data.get("name") or "").strip() or None
        if name and len(name) > 80:
            return {"error": "name too long (max 80)"}, 400
        room = chat_model.update_room(room_id, name=name)
        if not room:
            return {"error": "room not found"}, 404
        return room
