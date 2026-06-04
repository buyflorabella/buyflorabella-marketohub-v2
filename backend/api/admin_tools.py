from flask import request, session
from flask_restx import Namespace, Resource

admin_tools_ns = Namespace("admin-tools", description="Admin utility endpoints")


@admin_tools_ns.route("/email-test")
class EmailTest(Resource):
    def post(self):
        """Admin: send a test email via configured SMTP."""
        if not session.get("is_admin"):
            admin_tools_ns.abort(403, "Admin required")
        data = request.get_json(force=True) or {}
        to      = (data.get("to")      or "").strip()
        subject = (data.get("subject") or "").strip()
        body    = (data.get("body")    or "").strip()
        if not to or not subject or not body:
            return {"success": False, "message": "To, subject, and body are required."}, 400
        from utils.email import send_email
        sent = send_email(to, subject, body)
        if sent:
            return {"success": True}, 200
        return {"success": False, "message": "Send failed. Check SMTP configuration."}, 500
