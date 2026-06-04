from flask import session
from flask_restx import Namespace, Resource

_counters = {
    "otp_requests": 0,
    "successful_logins": 0,
}

stats_ns = Namespace("stats", description="Operational stats")


def increment(key):
    if key in _counters:
        _counters[key] += 1


def get_stats():
    from models import user as user_model
    from models import chat as chat_model
    return {
        "otp_requests": _counters["otp_requests"],
        "successful_logins": _counters["successful_logins"],
        "total_users": len(user_model.find_all()),
        "total_messages": chat_model.count(),
    }


@stats_ns.route("/summary")
class StatsSummary(Resource):
    def get(self):
        """Admin: in-memory counters + pageview stats."""
        if not session.get("is_admin"):
            stats_ns.abort(403, "Admin required")
        from models import pageviews as pv_model
        pv = pv_model.get_stats()
        return {**get_stats(), "pageviews": pv}, 200
