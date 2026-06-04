import logging
import random
import time
from flask import session
from flask_restx import Namespace, Resource, fields

from models import user as user_model
from models import otp as otp_model
from utils.email import send_email
from api.stats import increment

log = logging.getLogger(__name__)

auth_ns = Namespace("auth", description="OTP authentication")

# Rate limiter stays in-memory (acceptable to reset on restart; short window)
_rate_store = {}  # { email: [timestamp, ...] }

request_otp_model = auth_ns.model("RequestOtp", {
    "email": fields.String(required=True),
})

verify_otp_model = auth_ns.model("VerifyOtp", {
    "email": fields.String(required=True),
    "otp":   fields.String(required=True),
})

admin_login_model = auth_ns.model("AdminLogin", {
    "email":    fields.String(required=True),
    "password": fields.String(required=True),
})


def _is_rate_limited(email, max_requests, window_seconds):
    now = time.time()
    timestamps = _rate_store.get(email, [])
    timestamps = [t for t in timestamps if now - t < window_seconds]
    _rate_store[email] = timestamps
    if len(timestamps) >= max_requests:
        log.debug("rate_limit hit email=%s requests=%d window=%ds", email, len(timestamps), window_seconds)
        return True
    timestamps.append(now)
    _rate_store[email] = timestamps
    return False


@auth_ns.route("/request-otp")
class RequestOtp(Resource):
    @auth_ns.expect(request_otp_model)
    def post(self):
        from flask import current_app, request
        data = request.get_json(force=True) or {}
        email = (data.get("email") or "").strip().lower()
        log.debug("request-otp email=%s", email)

        if not email:
            log.debug("request-otp rejected: empty email")
            return {"success": False, "message": "Email is required."}, 400

        max_req = current_app.config["OTP_RATE_LIMIT_MAX"]
        window  = current_app.config["OTP_RATE_LIMIT_WINDOW"]
        if _is_rate_limited(email, max_req, window):
            return {"success": False, "message": f"Too many requests. Try again in {window} seconds."}, 429

        otp = f"{random.randint(0, 999999):06d}"
        expires_at = time.time() + current_app.config["OTP_EXPIRY_SECONDS"]
        otp_model.store(email, otp, expires_at)
        increment("otp_requests")

        app_name = current_app.config.get("APP_NAME", "App")
        subject = "Your login code"
        body = f"Your {app_name} login code is: {otp}\n\nThis code expires in 5 minutes."

        dev_mode = current_app.config["OTP_DEV_MODE"]
        log.debug("request-otp generated otp=%s dev_mode=%s expires_in=%ds", otp, dev_mode, current_app.config["OTP_EXPIRY_SECONDS"])

        if dev_mode:
            return {
                "success": True,
                "otp_debug": otp,
                "email_preview": {"to": email, "subject": subject, "body": body},
            }

        sent = send_email(email, subject, body)
        if not sent:
            log.warning("request-otp email send failed for %s", email)
            return {"success": False, "message": "Failed to send email. Contact support."}, 500

        log.debug("request-otp email sent to %s", email)
        return {"success": True}


@auth_ns.route("/verify-otp")
class VerifyOtp(Resource):
    @auth_ns.expect(verify_otp_model)
    def post(self):
        from flask import current_app, request
        data = request.get_json(force=True) or {}
        email = (data.get("email") or "").strip().lower()
        otp   = (data.get("otp")   or "").strip()
        log.debug("verify-otp email=%s otp_provided=%s", email, bool(otp))

        if not email or not otp:
            return {"success": False, "message": "Email and OTP are required."}, 400

        record = otp_model.get(email)
        if not record:
            log.debug("verify-otp rejected: no record for email=%s", email)
            return {"success": False, "message": "Invalid or expired OTP."}, 401
        if record["used"]:
            log.debug("verify-otp rejected: already used email=%s", email)
            return {"success": False, "message": "Invalid or expired OTP."}, 401
        if time.time() > record["expires_at"]:
            log.debug("verify-otp rejected: expired email=%s", email)
            return {"success": False, "message": "Invalid or expired OTP."}, 401
        if record["otp"] != otp:
            log.debug("verify-otp rejected: wrong otp email=%s", email)
            return {"success": False, "message": "Invalid or expired OTP."}, 401

        otp_model.mark_used(email)
        user = user_model.find_or_create(email)
        increment("successful_logins")
        log.debug("verify-otp success email=%s is_admin=%s profile_complete=%s",
                  email, user.get("is_admin"), user.get("profile_complete"))

        session.permanent = True
        session["email"]    = email
        session["is_admin"] = user.get("is_admin", False)

        user_type = "admin" if user.get("is_admin") else "user"
        resp = {"success": True, "user_type": user_type}

        if not user.get("profile_complete", False):
            resp["requires_profile_completion"] = True

        return resp


@auth_ns.route("/me")
class Me(Resource):
    def get(self):
        email = session.get("email")
        log.debug("me email=%s is_admin=%s", email, session.get("is_admin"))
        if not email:
            return {"message": "Unauthenticated."}, 401
        return {"email": email, "is_admin": session.get("is_admin", False)}


@auth_ns.route("/logout")
class Logout(Resource):
    def post(self):
        log.debug("logout email=%s", session.get("email"))
        session.clear()
        return {"success": True}


@auth_ns.route("/config")
class AuthConfig(Resource):
    def get(self):
        from flask import current_app
        return {"dev_mode": bool(current_app.config.get("OTP_DEV_MODE", False))}


@auth_ns.route("/login")
class AdminLogin(Resource):
    @auth_ns.expect(admin_login_model)
    def post(self):
        from flask import current_app, request
        data = request.get_json(force=True) or {}
        email    = (data.get("email")    or "").strip().lower()
        password = (data.get("password") or "").strip()

        admin_email = current_app.config["ADMIN_EMAIL"].lower()
        admin_pass  = current_app.config["ADMIN_PASSWORD"]

        log.debug("admin-login attempt email=%s admin_email_configured=%s password_configured=%s",
                  email, admin_email, bool(admin_pass))

        if email != admin_email:
            log.debug("admin-login rejected: email mismatch got=%s expected=%s", email, admin_email)
            return {"success": False, "message": "Password login is not available for this account."}, 403

        if not admin_pass:
            log.warning("admin-login blocked: ADMIN_PASSWORD is not set in environment/settings")
            return {"success": False, "message": "Invalid credentials."}, 401

        if password != admin_pass:
            log.debug("admin-login rejected: wrong password for email=%s", email)
            return {"success": False, "message": "Invalid credentials."}, 401

        session.permanent = True
        session["email"]    = email
        session["is_admin"] = True
        increment("successful_logins")
        log.debug("admin-login success email=%s", email)
        return {"success": True, "user_type": "admin"}
