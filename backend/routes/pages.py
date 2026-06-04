from flask import Blueprint, render_template

pages_bp = Blueprint(
    "pages",
    __name__,
    template_folder="../templates",
    static_folder="../static",
)


@pages_bp.route("/")
def index():
    return render_template("index.html")
