from typing import Optional
from app import db
from app.models import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    """Repository handling custom database operations for the User model."""

    def __init__(self):
        super().__init__(User)

    def get_by_email(self, email: str) -> Optional[User]:
        """
        Retrieves a user profile by their email address.
        
        Args:
            email: User's email string.
            
        Returns:
            The User instance if found, otherwise None.
        """
        return db.session.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """
        Retrieves a user profile by their username.
        
        Args:
            username: User's username string.
            
        Returns:
            The User instance if found, otherwise None.
        """
        return db.session.query(User).filter(User.username == username).first()

    def email_exists(self, email: str) -> bool:
        """
        Checks if an email is already registered in the system.
        Optimized to retrieve only the ID.
        
        Args:
            email: User's email string.
            
        Returns:
            True if the email exists, False otherwise.
        """
        return db.session.query(User.id).filter(User.email == email).first() is not None

    def username_exists(self, username: str) -> bool:
        """
        Checks if a username is already taken.
        Optimized to retrieve only the ID.
        
        Args:
            username: User's username string.
            
        Returns:
            True if the username exists, False otherwise.
        """
        return db.session.query(User.id).filter(User.username == username).first() is not None
