import logging
import os
from flask import Flask, request
from flask_cors import CORS
import re

_log_level = getattr(logging, os.environ.get("LOG_LEVEL", "DEBUG").upper(), logging.DEBUG)
logging.basicConfig(
    level=_log_level,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logging.getLogger("pymongo").setLevel(logging.WARNING)
logging.getLogger("pymongo.command").setLevel(logging.WARNING)
logging.getLogger("pymongo.connection").setLevel(logging.WARNING)

def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    # --- Build allowed origins from ALLOWED_CORS_DOMAINS ---
    allowed_domains_str = app.config.get("ALLOWED_CORS_DOMAINS", "")
    allowed_domains_raw = [d.strip() for d in allowed_domains_str.split(",") if d.strip()]

    allowed_origins = []

    print("=== Flask CORS Debug ===")
    for domain in allowed_domains_raw:
        print(f"Domain: {domain}")

        if domain.startswith("."):
            regex_pattern = rf"https?://([a-z0-9-]+\.)*{re.escape(domain[1:])}$"
            allowed_origins.append(regex_pattern)
            print(f"  [WILDCARD] Domain: {domain} -> Regex: {regex_pattern}")
        else:
            http_url = f"http://{domain}"
            https_url = f"https://{domain}"
            allowed_origins.extend([http_url, https_url])
            print(f"  [EXACT] Domain: {domain} -> Allowed: {http_url}, {https_url}")
    print("========================\n")

    # --- Apply CORS ---
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)

    @app.context_processor
    def inject_globals():
        major = app.config.get("VERSION_MAJOR", "2")
        minor = app.config.get("VERSION_MINOR", "0")
        build = app.config.get("VERSION_BUILD_NUMBER", "0")
        return {
            "app_version": f"v{major}.{minor}.{build}",
            "app_name":    app.config.get("APP_NAME", "Platform Template"),
        }

    # Register blueprints
    from api import api_bp
    app.register_blueprint(api_bp)

    from routes import pages_bp, admin_bp
    app.register_blueprint(pages_bp)
    app.register_blueprint(admin_bp)

    # Ensure MongoDB indexes for presence TTL (idempotent, non-fatal)
    with app.app_context():
        try:
            from models.presence import ensure_indexes
            ensure_indexes()
        except Exception:
            pass

    # Site gate — registered last so all routes exist before the hook fires
    @app.before_request
    def _site_gate():
        from flask import request, session, jsonify
        from models.access_control import get_mode
        # CORS preflights (OPTIONS) never carry cookies; exempting them lets
        # flask-cors handle the response — the actual request is gated separately.
        if request.method == "OPTIONS":
            return
        mode = get_mode()
        if mode == "open":
            return
        path = request.path
        # Always allow gate API, admin routes, static assets
        if (path.startswith("/api/access-control/") or
                path.startswith("/api/auth/") or
                path.startswith("/admin/") or
                path.startswith("/static/") or
                path in ("/api/health", "/api/health/")):
            return
        if session.get("site_unlocked") or session.get("is_admin"):
            return
        if path.startswith("/api/"):
            return jsonify({"gated": True, "mode": mode}), 403

    return app


app = create_app()

if __name__ == "__main__":
    host = os.environ.get("BACKEND_HOST", "127.0.0.1")
    port = int(os.environ.get("BACKEND_PORT", 5001))
    debug = os.environ.get("DEBUG", "true").lower() == "true"
    app.run(host=host, port=port, debug=debug)
