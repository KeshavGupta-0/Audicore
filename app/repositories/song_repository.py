from datetime import datetime, timedelta
from typing import List, Tuple
from sqlalchemy import func
from app import db
from app.models import Song, PlayHistory
from app.repositories.base import BaseRepository

class SongRepository(BaseRepository[Song]):
    """Repository handling custom database operations for the Song model."""

    def __init__(self):
        super().__init__(Song)

    def get_by_artist(self, artist_id: int, page: int = 1, per_page: int = 20) -> Tuple[List[Song], int]:
        """
        Retrieves songs belonging to a specific artist with pagination.
        
        Args:
            artist_id: The ID of the artist.
            page: Active page number (1-indexed).
            per_page: Number of songs to return per page.
            
        Returns:
            A tuple of (songs list, total songs count).
        """
        query = db.session.query(Song).filter(Song.artist_id == artist_id)
        total_count = query.count()
        offset = (page - 1) * per_page
        songs = query.limit(per_page).offset(offset).all()
        return songs, total_count

    def get_by_album(self, album_id: int) -> List[Song]:
        """
        Retrieves all songs belonging to an album, ordered by track number.
        
        Args:
            album_id: The ID of the album.
            
        Returns:
            A list of Songs sorted by track number.
        """
        return (
            db.session.query(Song)
            .filter(Song.album_id == album_id)
            .order_by(Song.track_number.asc())
            .all()
        )

    def search(self, query: str, page: int = 1, per_page: int = 20) -> Tuple[List[Song], int]:
        """
        Performs a case-insensitive search for songs by title using ILIKE.
        
        Args:
            query: The search term.
            page: Active page number (1-indexed).
            per_page: Number of songs to return per page.
            
        Returns:
            A tuple of (songs list, total matches count).
        """
        search_filter = Song.title.ilike(f"%{query}%")
        songs_query = db.session.query(Song).filter(search_filter)
        
        total_count = songs_query.count()
        offset = (page - 1) * per_page
        results = songs_query.limit(per_page).offset(offset).all()
        
        return results, total_count

    def get_trending(self, limit: int = 10) -> List[Song]:
        """
        Retrieves the trending songs based on total play count records.
        
        Args:
            limit: The maximum number of songs to return.
            
        Returns:
            A list of Song instances ordered by play counts.
        """
        return (
            db.session.query(Song)
            .order_by(Song.play_count.desc())
            .limit(limit)
            .all()
        )

    def increment_play_count(self, song_id: int) -> None:
        """
        Increments the total play count of a song using an atomic UPDATE query
        to prevent race conditions.
        """
        Song.query.filter_by(id=song_id).update({"play_count": Song.play_count + 1})
        db.session.commit()
