import time
from flask_restx import Namespace, Resource, fields

from utils.email import send_email

contact_ns = Namespace("contact", description="Contact form")

_rate_store = {}  # { email: [timestamp, ...] }

contact_model = contact_ns.model("Contact", {
    "name":    fields.String(required=True),
    "email":   fields.String(required=True),
    "message": fields.String(required=True),
})


def _is_rate_limited(email, max_requests, window_seconds):
    now = time.time()
    timestamps = _rate_store.get(email, [])
    timestamps = [t for t in timestamps if now - t < window_seconds]
    _rate_store[email] = timestamps
    if len(timestamps) >= max_requests:
        return True
    timestamps.append(now)
    _rate_store[email] = timestamps
    return False


@contact_ns.route("")
class Contact(Resource):
    @contact_ns.expect(contact_model)
    def post(self):
        from flask import current_app, request
        data = request.get_json(force=True) or {}
        name    = (data.get("name")    or "").strip()
        email   = (data.get("email")   or "").strip().lower()
        message = (data.get("message") or "").strip()

        if not name or not email or not message:
            return {"success": False, "message": "All fields are required."}, 400

        max_req = current_app.config["CONTACT_RATE_LIMIT_MAX"]
        window  = current_app.config["CONTACT_RATE_LIMIT_WINDOW"]
        if _is_rate_limited(email, max_req, window):
            return {"success": False, "message": f"Too many requests. Try again in {window} seconds."}, 429

        notify_email = current_app.config["NOTIFICATION_EMAIL"]
        subject = f"PulseComposer contact from {name}"
        body = f"From: {name} <{email}>\n\n{message}"

        sent = send_email(notify_email, subject, body)
        if not sent:
            return {"success": False, "message": "Failed to send message. Please try again later."}, 500
        return {"success": True}
