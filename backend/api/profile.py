import logging
from flask import session
from flask_restx import Namespace, Resource, fields

from models import user as user_model

log = logging.getLogger(__name__)

profile_ns = Namespace("profile", description="User profile")

profile_model = profile_ns.model("Profile", {
    "name":  fields.String(),
    "phone": fields.String(),
    "notes": fields.String(),
})


def _require_auth():
    email = session.get("email")
    if not email:
        return None, ({"message": "Unauthenticated."}, 401)
    return email, None


@profile_ns.route("")
class ProfileResource(Resource):
    def get(self):
        email, err = _require_auth()
        if err:
            return err

        user = user_model.find_by_email(email)
        if not user:
            return {"message": "User not found."}, 404

        return {
            "email": email,
            "profile_complete": user.get("profile_complete", False),
            "profile_data": user.get("profile_data", {}),
        }

    @profile_ns.expect(profile_model)
    def post(self):
        from flask import request
        email, err = _require_auth()
        if err:
            return err

        data = request.get_json(force=True) or {}
        profile_data = {
            "name":  (data.get("name")  or "").strip(),
            "phone": (data.get("phone") or "").strip(),
            "notes": (data.get("notes") or "").strip(),
        }
        log.debug("profile complete email=%s", email)
        user_model.update_profile(email, profile_data)
        return {"success": True}

    @profile_ns.expect(profile_model)
    def put(self):
        from flask import request
        email, err = _require_auth()
        if err:
            return err

        data = request.get_json(force=True) or {}
        existing = user_model.find_by_email(email) or {}
        current = existing.get("profile_data", {})

        profile_data = {
            "name":  (data.get("name")  or current.get("name",  "")).strip(),
            "phone": (data.get("phone") or current.get("phone", "")).strip(),
            "notes": (data.get("notes") or current.get("notes", "")).strip(),
        }
        log.debug("profile update email=%s", email)
        user_model.update_profile(email, profile_data)
        return {"success": True}
