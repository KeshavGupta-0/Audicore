from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import AuthService
from app.middleware.auth_middleware import jwt_required_custom

auth_bp = Blueprint("auth", __name__)
auth_service = AuthService()

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Registers a new user account (listener or artist).
    POST /api/v1/auth/register
    """
    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "listener")

    result = auth_service.register(username, email, password, role)
    return jsonify(result), 201



@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticates an existing user account.
    POST /api/v1/auth/login
    """
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    result = auth_service.login(email, password)
    return jsonify(result), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """
    Refreshes access tokens using a valid refresh token.
    POST /api/v1/auth/refresh
    """
    # jwt_required(refresh=True) guarantees presence of refresh token
    user_id = get_jwt_identity()
    result = auth_service.refresh(int(user_id))
    return jsonify(result), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required_custom
def me():
    """
    Retrieves the currently authenticated user's profile.
    GET /api/v1/auth/me
    """
    # jwt_required_custom automatically loads and binds g.current_user
    user = g.current_user
    return jsonify({
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": user.display_name,
            "avatar_url": user.avatar_url,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat(),
            "artist_id": user.artist_profile.id if user.artist_profile else None
        }
    }), 200
