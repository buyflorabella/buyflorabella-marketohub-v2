from functools import wraps
from flask import Blueprint, session, jsonify, render_template, redirect, request, current_app

from models import user as user_model
from utils.email import send_email

admin_bp = Blueprint("admin", __name__, url_prefix="/admin",
                     template_folder="../templates")


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("email"):
            if request.accept_mimetypes.accept_html:
                return redirect("/admin/login")
            return jsonify({"message": "Authentication required."}), 401
        if not session.get("is_admin"):
            return jsonify({"message": "Admin access required."}), 403
        return f(*args, **kwargs)
    return decorated


# --- Auth pages ---

@admin_bp.route("/login")
def login_page():
    if session.get("is_admin"):
        return redirect("/admin/")
    return render_template("admin/login.html")


# --- HTML pages ---

@admin_bp.route("/")
@require_admin
def dashboard():
    return render_template("admin/dashboard.html", email=session["email"])


@admin_bp.route("/users")
@require_admin
def users_page():
    return render_template("admin/users.html", email=session["email"])


@admin_bp.route("/access")
@require_admin
def access_page():
    return render_template("admin/access.html", email=session["email"])


@admin_bp.route("/health")
@require_admin
def health_page():
    return render_template("admin/health.html", email=session["email"])


@admin_bp.route("/stats")
@require_admin
def stats_page():
    from api.stats import get_stats
    from models import pageviews as pv_model
    s = get_stats()
    s["pageviews"] = pv_model.get_stats()
    return render_template("admin/stats.html", email=session["email"], stats=s)


@admin_bp.route("/email-test")
@require_admin
def email_test_page():
    return render_template("admin/email_test.html", email=session["email"])


@admin_bp.route("/email-test/send", methods=["POST"])
@require_admin
def email_test_send():
    data = request.get_json(force=True) or {}
    to      = (data.get("to")            or "").strip()
    subject = (data.get("subject")       or "").strip()
    body    = (data.get("body")          or "").strip()

    if not to or not subject or not body:
        return jsonify({"success": False, "message": "To, subject, and body are required."}), 400

    sent = send_email(to, subject, body)
    if sent:
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Send failed. Check SMTP configuration."}), 500


@admin_bp.route("/chat")
@require_admin
def chat_page():
    return render_template("admin/chat.html", email=session["email"])


@admin_bp.route("/chat/clear", methods=["POST"])
@require_admin
def chat_clear():
    from models import chat as chat_model
    from flask import request as _req
    room_id = (_req.args.get("room") or "").strip()
    if room_id and chat_model.valid_room_id(room_id):
        deleted = chat_model.clear_room(room_id)
    else:
        deleted = chat_model.clear_all()
    return jsonify({"success": True, "deleted": deleted})


# --- JSON API: users ---

@admin_bp.route("/users/data")
@require_admin
def users_data():
    return jsonify(user_model.find_all())


@admin_bp.route("/users", methods=["POST"])
@require_admin
def create_user():
    data = request.get_json(force=True) or {}
    email    = (data.get("email") or "").strip().lower()
    is_admin = bool(data.get("is_admin", False))

    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400
    if user_model.find_by_email(email):
        return jsonify({"success": False, "message": "User already exists."}), 409

    user = user_model.create(email, is_admin=is_admin)
    return jsonify({"success": True, "user": user}), 201


@admin_bp.route("/users/<path:email>", methods=["PUT"])
@require_admin
def update_user(email):
    admin_email = current_app.config["ADMIN_EMAIL"].lower()
    if email.lower() == admin_email:
        return jsonify({"success": False, "message": "Cannot modify the super admin account."}), 403

    data = request.get_json(force=True) or {}
    fields = {}
    if "email" in data:
        fields["email"] = data["email"].strip().lower()
    if "is_admin" in data:
        fields["is_admin"] = bool(data["is_admin"])
    if "profile_data" in data and isinstance(data["profile_data"], dict):
        fields["profile_data"] = data["profile_data"]

    if not fields:
        return jsonify({"success": False, "message": "No fields to update."}), 400

    user_model.update(email, fields)
    return jsonify({"success": True})


@admin_bp.route("/users/<path:email>", methods=["DELETE"])
@require_admin
def delete_user(email):
    admin_email = current_app.config["ADMIN_EMAIL"].lower()
    if email.lower() == admin_email:
        return jsonify({"success": False, "message": "Cannot delete the super admin account."}), 403

    deleted = user_model.delete(email)
    if not deleted:
        return jsonify({"success": False, "message": "User not found."}), 404
    return jsonify({"success": True})
