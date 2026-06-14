from app import db
from datetime import datetime

# ==========================================
# JUNCTION & ASSOCIATION TABLES (M2M)
# ==========================================

# Many-to-Many association table linking Playlists and Songs
playlist_songs = db.Table(
    "playlist_songs",
    db.Column(
        "playlist_id",
        db.Integer,
        db.ForeignKey("playlists.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    ),
    db.Column(
        "song_id",
        db.Integer,
        db.ForeignKey("songs.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    ),
    db.Column("position", db.Integer, default=1),
    db.Column("added_at", db.DateTime, default=datetime.utcnow)
)

# Many-to-Many association table linking Songs and Genres
song_genres = db.Table(
    "song_genres",
    db.Column(
        "song_id",
        db.Integer,
        db.ForeignKey("songs.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    ),
    db.Column(
        "genre_id",
        db.Integer,
        db.ForeignKey("genres.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    )
)

# Many-to-Many association table linking Users and their Liked/Favorited Songs
user_liked_songs = db.Table(
    "user_liked_songs",
    db.Column(
        "user_id",
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    ),
    db.Column(
        "song_id",
        db.Integer,
        db.ForeignKey("songs.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    ),
    db.Column("liked_at", db.DateTime, default=datetime.utcnow)
)

# Many-to-Many association table linking Users to followed Artists
user_followed_artists = db.Table(
    "user_followed_artists",
    db.Column(
        "user_id",
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    ),
    db.Column(
        "artist_id",
        db.Integer,
        db.ForeignKey("artists.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    ),
    db.Column("followed_at", db.DateTime, default=datetime.utcnow)
)


# ==========================================
# CORE DATABASE MODELS
# ==========================================

class User(db.Model):
    """User accounts model."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(80), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    role = db.Column(
        db.Enum("listener", "artist", "admin", name="user_roles"),
        default="listener",
        nullable=False
    )
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    artist_profile = db.relationship(
        "Artist",
        backref="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    playlists = db.relationship(
        "Playlist",
        backref="owner",
        cascade="all, delete-orphan"
    )
    liked_songs = db.relationship(
        "Song",
        secondary=user_liked_songs,
        backref=db.backref("liked_by_users", lazy="dynamic")
    )
    followed_artists = db.relationship(
        "Artist",
        secondary=user_followed_artists,
        backref=db.backref("followers", lazy="dynamic")
    )
    play_history = db.relationship(
        "PlayHistory",
        backref="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.username}>"


class Artist(db.Model):
    """Artist profile model, extending User profile."""
    __tablename__ = "artists"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    stage_name = db.Column(db.String(100), nullable=False, index=True)
    bio = db.Column(db.Text, nullable=True)
    country = db.Column(db.String(100), nullable=True)
    cover_url = db.Column(db.String(255), nullable=True)
    verified = db.Column(db.Boolean, default=False, nullable=False)
    monthly_listeners = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    albums = db.relationship("Album", backref="artist", cascade="all, delete-orphan")
    songs = db.relationship("Song", backref="artist")

    def __repr__(self):
        return f"<Artist {self.stage_name}>"


class Album(db.Model):
    """Album model representing collections of songs."""
    __tablename__ = "albums"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    artist_id = db.Column(
        db.Integer,
        db.ForeignKey("artists.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title = db.Column(db.String(120), nullable=False, index=True)
    cover_url = db.Column(db.String(255), nullable=True)
    release_date = db.Column(db.Date, nullable=True)
    album_type = db.Column(
        db.Enum("album", "single", "ep", "compilation", name="album_types"),
        default="album",
        nullable=False
    )
    is_published = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    songs = db.relationship("Song", backref="album", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Album {self.title}>"


class Song(db.Model):
    """Song/Track model representing individual audio files."""
    __tablename__ = "songs"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    artist_id = db.Column(
        db.Integer,
        db.ForeignKey("artists.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    album_id = db.Column(
        db.Integer,
        db.ForeignKey("albums.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    title = db.Column(db.String(120), nullable=False, index=True)
    duration_secs = db.Column(db.Integer, nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    cover_url = db.Column(db.String(255), nullable=True)
    track_number = db.Column(db.Integer, nullable=True)
    play_count = db.Column(db.Integer, default=0, nullable=False)
    is_published = db.Column(db.Boolean, default=False, nullable=False)
    lyrics = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    genres = db.relationship(
        "Genre",
        secondary=song_genres,
        backref=db.backref("songs", lazy="dynamic")
    )
    playlists = db.relationship(
        "Playlist",
        secondary=playlist_songs,
        backref=db.backref("songs", lazy="dynamic")
    )
    play_histories = db.relationship(
        "PlayHistory",
        backref="song",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Song {self.title}>"


class Playlist(db.Model):
    """Playlist model representing user-curated groups of songs."""
    __tablename__ = "playlists"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    owner_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title = db.Column(db.String(120), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    cover_url = db.Column(db.String(255), nullable=True)
    is_public = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    def __repr__(self):
        return f"<Playlist {self.title}>"


class Genre(db.Model):
    """Genre model for categorizing music."""
    __tablename__ = "genres"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False, index=True)
    slug = db.Column(db.String(60), unique=True, nullable=False, index=True)

    def __repr__(self):
        return f"<Genre {self.name}>"


class PlayHistory(db.Model):
    """Play history tracking for recently played sections and user analytics."""
    __tablename__ = "play_history"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    song_id = db.Column(
        db.Integer,
        db.ForeignKey("songs.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    played_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    duration_played_secs = db.Column(db.Integer, default=0, nullable=False)

    def __repr__(self):
        return f"<PlayHistory User:{self.user_id} Song:{self.song_id}>"


class FileStorage(db.Model):
    __tablename__ = "file_storage"
    id = db.Column(db.String(36), primary_key=True)
    mimetype = db.Column(db.String(100), nullable=False)
    data = db.Column(db.LargeBinary(length=(2**32)-1), nullable=False)
