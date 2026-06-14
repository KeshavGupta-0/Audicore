from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token
from app.repositories.user_repository import UserRepository
from app.utils.errors import (
    ValidationError,
    AuthError,
    ConflictError,
    NotFoundError
)

class AuthService:
    """Business logic service handling authentication, registration, and token refresh."""

    def __init__(self, user_repo: UserRepository = None):
        # Allow injecting repository for easier unit testing
        self.user_repo = user_repo or UserRepository()

    def register(self, username: str, email: str, password: str, role: str = "listener") -> dict:
        """
        Registers a new user, validates inputs, hashes passwords, and creates JWT tokens.
        
        Args:
            username: The unique chosen username.
            email: The unique registered email address.
            password: The plaintext chosen password.
            role: The registration role (listener or artist).
            
        Returns:
            A dictionary containing access_token, refresh_token, and user profile data.
            
        Raises:
            ValidationError: If validation checks (e.g. password length) fail.
            ConflictError: If username or email is already registered.
        """
        # Validate input credentials
        if not username or not email or not password:
            raise ValidationError("Username, email, and password are required")

        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long")

        # Validate duplicates
        if self.user_repo.email_exists(email):
            raise ConflictError("Email address is already registered")

        if self.user_repo.username_exists(username):
            raise ConflictError("Username is already taken")

        # Hash credentials using Werkzeug's secure hashing system
        password_hash = generate_password_hash(password)

        if role not in ["listener", "artist"]:
            role = "listener"

        # Save model record
        user = self.user_repo.create(
            username=username,
            email=email,
            password_hash=password_hash,
            display_name=username,  # Default display name is username
            role=role,
            is_active=True,
            is_verified=False
        )

        # Create Artist profile record if the role is 'artist'
        if role == "artist":
            from app.models import Artist
            from app import db
            artist = Artist(user_id=user.id, stage_name=username)
            db.session.add(artist)
            db.session.commit()

        # Generate JWT Tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "display_name": user.display_name,
                "role": user.role,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "artist_id": user.artist_profile.id if user.artist_profile else None
            }
        }

    def login(self, email: str, password: str) -> dict:
        """
        Authenticates a user, verifies hashed credentials, and returns JWT tokens.
        
        Args:
            email: User registered email address.
            password: Plaintext login password.
            
        Returns:
            A dictionary containing access_token, refresh_token, and user profile data.
            
        Raises:
            AuthError: If login fails or account is disabled.
        """
        if not email or not password:
            raise ValidationError("Email and password are required")

        # Retrieve user profile
        user = self.user_repo.get_by_email(email)
        
        # Verify hashes
        if not user or not check_password_hash(user.password_hash, password):
            raise AuthError("Invalid email or password")

        # Check account activity status
        if not user.is_active:
            raise AuthError("This user account has been deactivated")

        # Generate JWT Tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "display_name": user.display_name,
                "role": user.role,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "artist_id": user.artist_profile.id if user.artist_profile else None
            }
        }


    def refresh(self, user_id: int) -> dict:
        """
        Issues a new access token for valid active users.
        
        Args:
            user_id: The ID of the authenticated user requesting a refresh.
            
        Returns:
            A dictionary containing the new access token.
            
        Raises:
            NotFoundError: If the user record cannot be found.
            AuthError: If the account is inactive.
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")

        if not user.is_active:
            raise AuthError("This user account has been deactivated")

        # Generate a new access token
        new_access_token = create_access_token(identity=str(user.id))
        
        return {
            "access_token": new_access_token
        }
