from flask import request, session
from flask_restx import Namespace, Resource

pageviews_ns = Namespace("pageviews", description="Pageview tracking")


@pageviews_ns.route("")
class PageviewRecord(Resource):
    def post(self):
        """Record a frontend pageview. No auth required."""
        from models import pageviews as pv_model
        data = request.get_json(silent=True) or {}
        path = (data.get("path") or "").strip()
        if path:
            pv_model.record(path)
        return {"ok": True}, 200


@pageviews_ns.route("/summary")
class PageviewSummary(Resource):
    def get(self):
        """Admin: pageview stats for the last 7 days plus top pages."""
        if not session.get("is_admin"):
            pageviews_ns.abort(403, "Admin required")
        from models import pageviews as pv_model
        return pv_model.get_stats(), 200
