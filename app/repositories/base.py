from typing import TypeVar, Generic, Type, List, Optional, Any, Tuple
from app import db

# Define a generic type variable representing a SQLAlchemy model
T = TypeVar("T")

class BaseRepository(Generic[T]):
    """Generic base repository defining standard database operations."""

    def __init__(self, model: Type[T]):
        """
        Initializes the repository with a specific model class.
        
        Args:
            model: The SQLAlchemy model class (e.g., User, Song)
        """
        self.model = model

    def get_by_id(self, id: Any) -> Optional[T]:
        """
        Fetches a single record by its primary key ID.
        
        Args:
            id: The primary key of the record.
        
        Returns:
            The model instance if found, otherwise None.
        """
        # Session.get() is the modern SQLAlchemy 2.0-compliant way to query by primary key
        return db.session.get(self.model, id)

    def get_all(self, page: int = 1, per_page: int = 20) -> Tuple[List[T], int]:
        """
        Fetches all records with offset-based pagination.
        
        Args:
            page: The active page number (1-indexed).
            per_page: The number of items to retrieve per page.
            
        Returns:
            A tuple containing:
                - A list of retrieved model instances.
                - The total integer count of records inside the table.
        """
        query = db.session.query(self.model)
        total_count = query.count()
        
        # Calculate standard offset limits
        offset = (page - 1) * per_page
        items = query.limit(per_page).offset(offset).all()
        
        return items, total_count

    def create(self, **kwargs) -> T:
        """
        Creates, adds, and commits a new record to the database.
        
        Args:
            **kwargs: Column keyword values to initialize the model instance.
            
        Returns:
            The newly created model instance.
        """
        instance = self.model(**kwargs)
        db.session.add(instance)
        self.save()
        return instance

    def update(self, instance: T, **kwargs) -> T:
        """
        Updates attribute values on an existing record and commits.
        
        Args:
            instance: The active model instance to update.
            **kwargs: Column keyword values to update on the model.
            
        Returns:
            The updated model instance.
        """
        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        self.save()
        return instance

    def delete(self, instance: T) -> None:
        """
        Deletes and commits a record from the database.
        
        Args:
            instance: The active model instance to delete.
        """
        db.session.delete(instance)
        self.save()

    def save(self) -> None:
        """
        Commits all staged transactions to the database.
        Rolls back current transactions automatically in case of failures.
        """
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e
