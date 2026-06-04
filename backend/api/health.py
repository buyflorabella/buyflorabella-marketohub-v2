import os
import time
import urllib.parse
from flask import session, current_app
from flask_restx import Namespace, Resource

health_ns = Namespace("health", description="Health check operations")


@health_ns.route("")
class HealthCheck(Resource):
    def get(self):
        """Return current service health and environment."""
        return {
            "status": "ok",
            "env": os.environ.get("ENV", "unknown"),
        }


@health_ns.route("/system")
class SystemHealth(Resource):
    def get(self):
        """Admin: passive connectivity checks — MongoDB and SMTP config."""
        if not session.get("is_admin"):
            health_ns.abort(403, "Admin required")

        checks = {}

        # MongoDB ping
        mongo_uri  = current_app.config["MONGO_URI"]
        _parsed    = urllib.parse.urlparse(mongo_uri)
        mongo_host = _parsed.hostname or "unknown"
        mongo_port = _parsed.port or 27017
        mongo_db   = (_parsed.path or "/").lstrip("/") or "unknown"
        try:
            from pymongo import MongoClient
            t0 = time.time()
            client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
            client.admin.command("ping")
            checks["mongodb"] = {
                "ok": True, "label": "MongoDB",
                "latency_ms": int((time.time() - t0) * 1000),
                "host": mongo_host, "port": mongo_port, "db": mongo_db,
            }
        except Exception as e:
            checks["mongodb"] = {
                "ok": False, "label": "MongoDB",
                "host": mongo_host, "port": mongo_port, "db": mongo_db,
                "error": str(e)[:200],
            }

        # SMTP config presence (no live connection)
        smtp_ok = bool(
            current_app.config.get("SMTP_HOST") and
            current_app.config.get("SMTP_USER") and
            current_app.config.get("SMTP_PASS")
        )
        otp_dev = current_app.config.get("OTP_DEV_MODE", False)
        checks["smtp"] = {
            "ok": smtp_ok or otp_dev,
            "label": "SMTP / Email",
            "configured": smtp_ok,
            "dev_mode": otp_dev,
            "note": (
                "OTP dev mode — no real SMTP required" if otp_dev else
                ("Configured" if smtp_ok else "SMTP_HOST / SMTP_USER / SMTP_PASS not set")
            ),
        }

        overall = all(c.get("ok") for c in checks.values())
        return {"ok": overall, "checks": checks, "ts": int(time.time())}, 200
