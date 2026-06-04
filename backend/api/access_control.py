from functools import wraps
from flask import request, session
from flask_restx import Namespace, Resource

from models import access_control as ac_model

access_control_ns = Namespace("access-control", description="Site access control")


def _require_admin(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get("is_admin"):
            return {"message": "Admin access required."}, 403
        return f(*args, **kwargs)
    return wrapper


@access_control_ns.route("/mode")
class AccessMode(Resource):
    def get(self):
        """Public: current site access mode."""
        db_mode = ac_model.get_mode()
        session_unlocked = bool(session.get("site_unlocked"))
        is_admin_session = bool(session.get("is_admin"))
        # Regular app user (has email but is not the super-admin)
        is_regular_user = bool(session.get("email") and not is_admin_session)
        logged_in = is_admin_session or is_regular_user
        originally_protected = (db_mode == "protected")

        # Admin sessions bypass the backend gate (_site_gate checks is_admin) but
        # should NOT silently bypass the frontend gate — admins need to see that the
        # gate is active.  Only session_unlocked (password entry) or a regular
        # logged-in user should open the frontend gate.
        frontend_bypass = session_unlocked or is_regular_user
        effective_mode = db_mode
        if originally_protected and frontend_bypass:
            if not ac_model.get_refresh_restores_gate():
                effective_mode = "open"

        early_access_mode = ac_model.get_early_access_mode()
        show_pw = ac_model.get_show_password_on_gate()
        gate_password = ""
        if show_pw and db_mode == "protected":
            gate_password = ac_model.get_site_password_info().get("password") or ""

        return {
            "mode": effective_mode,
            "raw_mode": db_mode,
            "maintenance_target": ac_model.get_maintenance_target(),
            "originally_protected": originally_protected,
            "session_unlocked": session_unlocked,
            "logged_in": logged_in,
            "is_admin_session": is_admin_session,
            "early_access_mode": early_access_mode,
            "show_password_on_gate": show_pw,
            "gate_password": gate_password,
        }, 200

    @_require_admin
    def put(self):
        """Admin: set access mode and optional maintenance countdown target."""
        data = request.get_json(force=True) or {}
        mode = (data.get("mode") or "").strip()
        target = (data.get("maintenance_target") or "").strip()
        try:
            ac_model.set_mode(mode)
        except ValueError as e:
            return {"success": False, "message": str(e)}, 400
        ac_model.set_maintenance_target(target)
        return {"success": True}, 200


@access_control_ns.route("/unlock")
class AccessUnlock(Resource):
    def post(self):
        """Public: submit site password to unlock session."""
        data = request.get_json(force=True) or {}
        password = (data.get("password") or "").strip()
        if not password:
            return {"granted": False, "message": "Password required."}, 400
        if ac_model.verify_site_password(password):
            session.permanent = True
            session["site_unlocked"] = True
            return {"granted": True}, 200
        return {"granted": False, "message": "Incorrect password."}, 401


@access_control_ns.route("/site-password")
class SitePassword(Resource):
    @_require_admin
    def get(self):
        """Admin: get current site password and when it was last set."""
        return ac_model.get_site_password_info(), 200

    @_require_admin
    def put(self):
        """Admin: set the site password."""
        data = request.get_json(force=True) or {}
        raw = (data.get("password") or "").strip()
        try:
            ac_model.set_site_password(raw)
        except ValueError as e:
            return {"success": False, "message": str(e)}, 400
        return {"success": True}, 200


@access_control_ns.route("/track-visit")
class TrackVisit(Resource):
    def post(self):
        """Public: record a page visit during protected/maintenance mode."""
        data = request.get_json(force=True) or {}
        path = (data.get("path") or "/").strip()[:200]
        stats = ac_model.track_page_request(path)
        return stats, 200


@access_control_ns.route("/content")
class AccessContent(Resource):
    def get(self):
        """Public: coming-soon and maintenance page content."""
        return {
            "coming_soon": ac_model.get_coming_soon_content(),
            "maintenance":  ac_model.get_maintenance_content(),
        }, 200

    @_require_admin
    def put(self):
        """Admin: update coming-soon and/or maintenance page content."""
        data = request.get_json(force=True) or {}
        errors = []
        if "coming_soon" in data and isinstance(data["coming_soon"], dict):
            try:
                ac_model.set_coming_soon_content(data["coming_soon"])
            except ValueError as e:
                errors.append(str(e))
        if "maintenance" in data and isinstance(data["maintenance"], dict):
            ac_model.set_maintenance_content(data["maintenance"])
        if errors:
            return {"success": False, "message": "; ".join(errors)}, 400
        return {"success": True}, 200


@access_control_ns.route("/settings")
class AccessSettings(Resource):
    @_require_admin
    def get(self):
        """Admin: get access control behavior settings."""
        return {
            "refresh_restores_gate": ac_model.get_refresh_restores_gate(),
            "early_access_mode": ac_model.get_early_access_mode(),
            "show_password_on_gate": ac_model.get_show_password_on_gate(),
        }, 200

    @_require_admin
    def put(self):
        """Admin: update access control behavior settings."""
        data = request.get_json(force=True) or {}
        if "refresh_restores_gate" in data:
            ac_model.set_refresh_restores_gate(bool(data["refresh_restores_gate"]))
        if "early_access_mode" in data:
            try:
                ac_model.set_early_access_mode(data["early_access_mode"])
            except ValueError as e:
                return {"success": False, "message": str(e)}, 400
        if "show_password_on_gate" in data:
            ac_model.set_show_password_on_gate(bool(data["show_password_on_gate"]))
        return {"success": True}, 200


_ea_rate_store = {}


def _ea_rate_limited(ip, max_req=3, window=60):
    import time
    now = time.time()
    ts = [t for t in _ea_rate_store.get(ip, []) if now - t < window]
    if len(ts) >= max_req:
        return True
    ts.append(now)
    _ea_rate_store[ip] = ts
    return False


@access_control_ns.route("/early-access")
class EarlyAccess(Resource):
    def post(self):
        """Public: request early access — behavior depends on early_access_mode setting."""
        mode = ac_model.get_early_access_mode()

        if mode == "instant":
            session.permanent = True
            session["site_unlocked"] = True
            return {"granted": True}, 200

        if mode == "contact":
            from flask import current_app
            ip = request.remote_addr or "unknown"
            if _ea_rate_limited(ip):
                return {"queued": False, "message": "Too many requests. Try again later."}, 429
            data = request.get_json(force=True) or {}
            name  = (data.get("name")  or "").strip()
            email = (data.get("email") or "").strip()
            if not name or not email:
                return {"queued": False, "message": "Name and email are required."}, 400
            notify = current_app.config.get("NOTIFICATION_EMAIL", "")
            if notify:
                from utils.email import send_email
                app_name = current_app.config.get("APP_NAME", "Site")
                send_email(
                    notify,
                    f"{app_name} Early Access Request",
                    f"Name: {name}\nEmail: {email}",
                )
            return {"queued": True, "message": "Request received — we'll be in touch."}, 200

        return {"error": "Early access not enabled."}, 404


@access_control_ns.route("/re-lock")
class AccessRelock(Resource):
    def post(self):
        """Public: clear session unlock flag so the gate reappears on next load."""
        session.pop("site_unlocked", None)
        return {"relocked": True}, 200


@access_control_ns.route("/debug")
class AccessDebug(Resource):
    def get(self):
        """Dev-only: returns site password in plain text. Only works when OTP_DEV_MODE=true."""
        from flask import current_app
        if not current_app.config.get("OTP_DEV_MODE"):
            return {"message": "Not available in production."}, 403
        info = ac_model.get_site_password_info()
        return {
            "mode": ac_model.get_mode(),
            "site_password_debug": info.get("password") or "",
        }, 200
