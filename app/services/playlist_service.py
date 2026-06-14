from typing import List
from sqlalchemy import func
from app import db
from app.models import Playlist, playlist_songs, Song
from app.repositories.base import BaseRepository
from app.utils.errors import NotFoundError, ForbiddenError, ValidationError

class PlaylistService:
    """Business logic service handling user playlists, including creation, deletions, and track ordering."""

    def __init__(self, playlist_repo: BaseRepository[Playlist] = None):
        # Uses generic BaseRepository to handle DB operations without custom boilerplate
        self.playlist_repo = playlist_repo or BaseRepository[Playlist](Playlist)

    def create_playlist(
        self,
        owner_id: int,
        title: str,
        description: str = None,
        cover_url: str = None,
        is_public: bool = True
    ) -> Playlist:
        """
        Creates and commits a new user playlist.
        
        Args:
            owner_id: The user database ID.
            title: The title of the playlist.
            description: Description note (optional).
            cover_url: Web link to a playlist cover graphic.
            is_public: Public discovery visibility status.
            
        Returns:
            The created Playlist instance.
            
        Raises:
            ValidationError: If required inputs are missing.
        """
        if not title:
            raise ValidationError("Playlist title is required")

        return self.playlist_repo.create(
            owner_id=owner_id,
            title=title,
            description=description,
            cover_url=cover_url,
            is_public=is_public
        )

    def get_playlist(self, playlist_id: int, user_id: int = None) -> Playlist:
        """
        Retrieves a playlist by its ID, enforcing privacy settings.
        
        Args:
            playlist_id: Database ID of the playlist.
            user_id: ID of the user requesting access (optional).
            
        Returns:
            The Playlist instance.
            
        Raises:
            NotFoundError: If the playlist does not exist.
            ForbiddenError: If the playlist is private and requested by another user.
        """
        playlist = self.playlist_repo.get_by_id(playlist_id)
        if not playlist:
            raise NotFoundError("Playlist not found")

        # Restrict private playlists to owners
        if not playlist.is_public and playlist.owner_id != user_id:
            raise ForbiddenError("You do not have permission to view this playlist")

        return playlist

    def add_song(self, playlist_id: int, song_id: int, user_id: int) -> Playlist:
        """
        Inserts a song into a playlist. Auto-increments position based on the maximum position.
        Prevents duplicate tracks.
        
        Args:
            playlist_id: Target playlist database ID.
            song_id: Target song database ID.
            user_id: ID of the user requesting the change.
            
        Returns:
            The updated Playlist instance.
            
        Raises:
            NotFoundError: If playlist or song cannot be found.
            ForbiddenError: If user does not own the playlist.
            ValidationError: If the song is already inside the playlist.
        """
        playlist = self.playlist_repo.get_by_id(playlist_id)
        if not playlist:
            raise NotFoundError("Playlist not found")

        # Enforce ownership rules
        if playlist.owner_id != user_id:
            raise ForbiddenError("You do not have permission to modify this playlist")

        # Verify song exists
        song = db.session.get(Song, song_id)
        if not song:
            raise NotFoundError("Song not found")

        # Prevent duplicate entries in the junction table
        duplicate_exists = db.session.query(playlist_songs.c.song_id).filter(
            playlist_songs.c.playlist_id == playlist_id,
            playlist_songs.c.song_id == song_id
        ).first() is not None

        if duplicate_exists:
            raise ValidationError("Song is already in this playlist")

        # Auto-increment track position utilizing a MAX query
        max_position = db.session.query(func.max(playlist_songs.c.position)).filter(
            playlist_songs.c.playlist_id == playlist_id
        ).scalar()
        next_position = (max_position or 0) + 1

        # Direct execution of INSERT onto the association table
        insert_statement = playlist_songs.insert().values(
            playlist_id=playlist_id,
            song_id=song_id,
            position=next_position
        )
        db.session.execute(insert_statement)
        db.session.commit()

        return playlist

    def remove_song(self, playlist_id: int, song_id: int, user_id: int) -> Playlist:
        """
        Removes a song from a playlist and commits the change.
        
        Args:
            playlist_id: Target playlist database ID.
            song_id: Target song database ID.
            user_id: ID of the user requesting the change.
            
        Returns:
            The updated Playlist instance.
            
        Raises:
            NotFoundError: If the playlist or the track connection is not found.
            ForbiddenError: If user does not own the playlist.
        """
        playlist = self.playlist_repo.get_by_id(playlist_id)
        if not playlist:
            raise NotFoundError("Playlist not found")

        # Enforce ownership rules
        if playlist.owner_id != user_id:
            raise ForbiddenError("You do not have permission to modify this playlist")

        # Delete entry from the association table
        delete_statement = playlist_songs.delete().where(
            playlist_songs.c.playlist_id == playlist_id,
            playlist_songs.c.song_id == song_id
        )
        result = db.session.execute(delete_statement)
        db.session.commit()

        if result.rowcount == 0:
            raise NotFoundError("Song is not in this playlist")

        return playlist

    def delete_playlist(self, playlist_id: int, user_id: int) -> None:
        """
        Deletes an entire playlist.
        
        Args:
            playlist_id: Target playlist database ID.
            user_id: ID of the user requesting the deletion.
            
        Raises:
            NotFoundError: If the playlist does not exist.
            ForbiddenError: If user does not own the playlist.
        """
        playlist = self.playlist_repo.get_by_id(playlist_id)
        if not playlist:
            raise NotFoundError("Playlist not found")

        # Enforce ownership rules
        if playlist.owner_id != user_id:
            raise ForbiddenError("You do not have permission to delete this playlist")

        self.playlist_repo.delete(playlist)

    def get_user_playlists(self, user_id: int) -> List[Playlist]:
        """
        Retrieves all playlists belonging to a specific user.
        
        Args:
            user_id: The owner user ID.
            
        Returns:
            A list of user Playlist instances.
        """
        return (
            db.session.query(Playlist)
            .filter(Playlist.owner_id == user_id)
            .order_by(Playlist.created_at.desc())
            .all()
        )
