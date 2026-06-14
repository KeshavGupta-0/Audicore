from flask import Blueprint, render_template

views_bp = Blueprint("views", __name__)

@views_bp.route('/', defaults={'path': ''}, methods=["GET"])
@views_bp.route('/<path:path>', methods=["GET"])
def catch_all(path):
    """
    Wildcard catch-all view route serving the single-page React application index.html.
    This routes any browser requests or refreshes for non-API routes (e.g. /login, /search, /library)
    directly to index.html, allowing the React Router SPA to handle the page state correctly.
    """
    return render_template("index.html")

