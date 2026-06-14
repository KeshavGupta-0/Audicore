from functools import wraps
from flask import g, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.repositories.user_repository import UserRepository
from app.utils.errors import AuthError, ForbiddenError

def jwt_required_custom(fn):
    """
    Custom decorator enforcing valid JWT token presence, loading the user profile,
    and binding the User object to Flask's global 'g' context.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            # Verify request contains a valid JWT token
            verify_jwt_in_request()
        except Exception:
            raise AuthError("Invalid or missing token")
        
        user_id = get_jwt_identity()
        user = UserRepository().get_by_id(user_id)
        
        if not user:
            raise AuthError("User not found")
        if not user.is_active:
            raise AuthError("This user account has been deactivated")
            
        # Bind user profile globally to the active request context
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper


def artist_required(fn):
    """
    Custom decorator enforcing valid JWT authentication and verifying that
    the user role is 'artist' or 'admin'.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            raise AuthError("Invalid or missing token")
            
        user_id = get_jwt_identity()
        user = UserRepository().get_by_id(user_id)
        
        if not user:
            raise AuthError("User not found")
        if not user.is_active:
            raise AuthError("This user account has been deactivated")
            
        # Perform role check
        if user.role not in ("artist", "admin"):
            raise ForbiddenError("Artist role is required to perform this action")
            
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    """
    Custom decorator enforcing valid JWT authentication and verifying that
    the user role is exactly 'admin'.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except Exception:
            raise AuthError("Invalid or missing token")
            
        user_id = get_jwt_identity()
        user = UserRepository().get_by_id(user_id)
        
        if not user:
            raise AuthError("User not found")
        if not user.is_active:
            raise AuthError("This user account has been deactivated")
            
        # Perform role check
        if user.role != "admin":
            raise ForbiddenError("Admin role is required to perform this action")
            
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper
