from flask import jsonify

# ==========================================
# BASE & CUSTOM AUDIOCORE EXCEPTIONS
# ==========================================

class AudiocoreError(Exception):
    """Base exception for all custom Audiocore application errors."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class ValidationError(AudiocoreError):
    """Exception raised for invalid fields or configuration values (HTTP 400)."""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class AuthError(AudiocoreError):
    """Exception raised for credential authentication and token validation failures (HTTP 401)."""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class ForbiddenError(AudiocoreError):
    """Exception raised when accessing a resource without ownership rights (HTTP 403)."""
    def __init__(self, message: str = "Access denied"):
        super().__init__(message, status_code=403)


class NotFoundError(AudiocoreError):
    """Exception raised when a specific model or file resource is missing (HTTP 404)."""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class ConflictError(AudiocoreError):
    """Exception raised when registering duplicate email/username (HTTP 409)."""
    def __init__(self, message: str = "Conflict occurred"):
        super().__init__(message, status_code=409)


# ==========================================
# GLOBAL FLASK ERROR HANDLERS REGISTER
# ==========================================

def register_error_handlers(app):
    """Registers unified JSON error responses for custom and standard exceptions."""
    
    @app.errorhandler(AudiocoreError)
    def handle_audiocore_error(error):
        """Unified handler for all Audiocore custom exceptions returning JSON."""
        return jsonify({"error": error.message}), error.status_code

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(409)
    def conflict(error):
        return jsonify({"error": "Conflict"}), 409

    @app.errorhandler(429)
    def too_many_requests(error):
        return jsonify({"error": "Too many requests"}), 429

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"error": "Internal server error"}), 500
