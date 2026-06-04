from flask import Blueprint, jsonify
from flask_restx import Api

api_bp = Blueprint("api", __name__, url_prefix="/api")

api = Api(
    api_bp,
    doc="/docs",
    title="Platform Template API",
    version="1.0",
    description="Auto-documented REST API with Swagger UI",
)

from .health import health_ns                # noqa: E402
from .auth import auth_ns                    # noqa: E402
from .contact import contact_ns              # noqa: E402
from .profile import profile_ns              # noqa: E402
from .chat import chat_ns                    # noqa: E402
from .access_control import access_control_ns # noqa: E402
from .pageviews import pageviews_ns          # noqa: E402
from .stats import stats_ns                  # noqa: E402
from .admin_tools import admin_tools_ns      # noqa: E402
from .presence   import presence_ns          # noqa: E402

api.add_namespace(health_ns)
api.add_namespace(auth_ns)
api.add_namespace(contact_ns)
api.add_namespace(profile_ns)
api.add_namespace(chat_ns)
api.add_namespace(access_control_ns)
api.add_namespace(pageviews_ns)
api.add_namespace(stats_ns)
api.add_namespace(admin_tools_ns)
api.add_namespace(presence_ns)


@api_bp.app_errorhandler(404)
def handle_404(e):
    """Return JSON for /api/* 404s, HTML for everything else."""
    from flask import request
    if request.path.startswith("/api/"):
        return jsonify({"message": "Not found", "status": 404}), 404
    # Fall through to Flask's default HTML handler
    return e
