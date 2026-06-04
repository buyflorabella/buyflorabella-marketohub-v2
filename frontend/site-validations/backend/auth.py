"""Authentication helpers for the Site Validations Web UI."""

from functools import wraps

from flask import redirect, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

from config import AUTH_PASSWORD, AUTH_USERNAME

# Pre-hash the password at import time for constant-time comparison
_PASSWORD_HASH = generate_password_hash(AUTH_PASSWORD)


def verify_credentials(username, password):
    """Verify login credentials. Returns True if valid."""
    if username != AUTH_USERNAME:
        return False
    return check_password_hash(_PASSWORD_HASH, password)


def login_required(f):
    """Decorator that redirects unauthenticated users to /login."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("logged_in"):
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated
