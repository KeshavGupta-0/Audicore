from flask import Blueprint, request, jsonify, g
from app.services.song_service import SongService
from app.middleware.auth_middleware import artist_required, jwt_required_custom
from app.utils.errors import ValidationError

songs_bp = Blueprint("songs", __name__)
song_service = SongService()

def format_song(song) -> dict:
    """Helper method to format a Song database object into standard API JSON response."""
    return {
        "id": song.id,
        "title": song.title,
        "duration_secs": song.duration_secs,
        "play_count": song.play_count,
        "file_path": song.file_path,
        "cover_url": song.cover_url,
        "artist_name": song.artist.stage_name if song.artist else None,
        "artist_user_id": song.artist.user_id if song.artist else None,
        "album_title": song.album.title if song.album else None
    }


@songs_bp.route("/trending", methods=["GET"])
def trending():
    """
    Retrieves trending songs based on plays in the last 7 days.
    GET /api/v1/songs/trending
    """
    limit = request.args.get("limit", 10, type=int)
    songs = song_service.get_trending(limit)
    return jsonify([format_song(s) for s in songs]), 200


@songs_bp.route("/", methods=["GET"])
def get_all_songs():
    """
    Retrieves all published songs, newest first.
    GET /api/v1/songs/
    """
    from app.models import Song
    songs = Song.query.filter_by(is_published=True).order_by(Song.id.desc()).all()
    return jsonify([format_song(s) for s in songs]), 200


@songs_bp.route("/mine", methods=["GET"])
@jwt_required_custom
def get_my_songs():
    """
    Retrieves all songs uploaded by the current user, including unpublished ones.
    GET /api/v1/songs/mine
    """
    from app.models import Song, Artist
    user = g.current_user
    artist = Artist.query.filter_by(user_id=user.id).first()
    if not artist:
        return jsonify([]), 200
        
    songs = Song.query.filter_by(artist_id=artist.id).order_by(Song.id.desc()).all()
    return jsonify([format_song(s) for s in songs]), 200


@songs_bp.route("/<int:song_id>", methods=["GET"])
def get_song(song_id):
    """
    Fetches a specific published song.
    GET /api/v1/songs/<song_id>
    """
    song = song_service.get_song(song_id)
    return jsonify(format_song(song)), 200


@songs_bp.route("/<int:song_id>", methods=["DELETE"])
@jwt_required_custom
def delete_song(song_id):
    """
    Deletes a specific song. Only the uploader can delete it.
    DELETE /api/v1/songs/<song_id>
    """
    from app import db
    from app.models import Song, Artist
    import os
    from flask import current_app
    
    user = g.current_user
    artist = Artist.query.filter_by(user_id=user.id).first()
    
    song = Song.query.get(song_id)
    if not song:
        return jsonify({"error": "Song not found"}), 404
        
    if not artist or song.artist_id != artist.id:
        if user.role != 'admin':
            return jsonify({"error": "Unauthorized to delete this song"}), 403
            
    # Try to delete file from disk
    try:
        if song.file_path.startswith('/static/'):
            file_sys_path = os.path.join(current_app.root_path, song.file_path.replace('/static/', 'static/', 1))
            if os.path.exists(file_sys_path):
                os.remove(file_sys_path)
    except Exception as e:
        print(f"Error deleting file for song {song_id}: {e}")
        
    db.session.delete(song)
    db.session.commit()
    
    return jsonify({"message": "Song deleted successfully"}), 200


@songs_bp.route("/upload", methods=["POST"])
@jwt_required_custom
def upload():
    """
    Uploads a new audio track. Automatically upgrades regular listeners to artists.
    POST /api/v1/songs/upload
    """
    from flask_jwt_extended import get_jwt_identity
    from app.models import Artist, User
    from app import db

    # Get user_id from the global g object populated by jwt_required_custom
    user = g.current_user
    if not user:
        raise ValidationError("Missing user identity")
        
    artist = db.session.query(Artist).filter(Artist.user_id == user.id).first()
    if not artist:
        # Auto-upgrade the user to an Artist!
        artist = Artist(user_id=user.id, stage_name=user.username, bio="A brand new artist on Audicore.")
        user.role = "artist"
        db.session.add(artist)
        db.session.commit()
        
    artist_id = artist.id

    # Read files (supporting both old API names and new frontend names)
    file = request.files.get("file") or request.files.get("audio_file")
    cover = request.files.get("cover") or request.files.get("cover_file")

    # Read fields from form
    title = request.form.get("title")
    if title:
        title = title.strip()
        
    if not title:
        raise ValidationError("Title is required")

    album_id = request.form.get("album_id")
    if album_id == "" or album_id is None:
        album_id = None
    else:
        album_id = int(album_id)

    track_number = request.form.get("track_number")
    if track_number == "" or track_number is None:
        track_number = None
    else:
        track_number = int(track_number)

    lyrics = request.form.get("lyrics")
    is_pub_val = request.form.get("is_published")
    is_published = True if is_pub_val is None else (is_pub_val.lower() == "true")

    metadata = {
        "title": title,
        "album_id": album_id,
        "track_number": track_number,
        "lyrics": lyrics,
        "is_published": is_published
    }

    song = song_service.upload_song(artist_id, file, cover, metadata)
    return jsonify(format_song(song)), 201

@songs_bp.route("/yt-resolve", methods=["POST"])
@jwt_required_custom
def yt_resolve():
    """
    Resolves a YouTube URL to a direct audio download link using RapidAPI.
    POST /api/v1/songs/yt-resolve
    """
    data = request.get_json()
    if not data or 'youtube_url' not in data:
        raise ValidationError("youtube_url is required")
        
    url = data.get('youtube_url')
    custom_title = data.get('title')
    
    result = song_service.resolve_youtube(url, custom_title=custom_title)
    return jsonify(result), 200

@songs_bp.route("/yt-import", methods=["POST"])
@jwt_required_custom
def yt_import():
    """
    Imports a YouTube URL directly on the backend using RapidAPI or yt-dlp fallback.
    POST /api/v1/songs/yt-import
    """
    from app.models import Artist
    from app import db
    
    data = request.get_json()
    if not data or 'youtube_url' not in data:
        raise ValidationError("youtube_url is required")
        
    url = data.get('youtube_url')
    custom_title = data.get('title')
    
    user = g.current_user
    if not user:
        raise ValidationError("Missing user identity")
        
    artist = db.session.query(Artist).filter(Artist.user_id == user.id).first()
    if not artist:
        artist = Artist(user_id=user.id, stage_name=user.username, bio="A brand new artist on Audicore.")
        user.role = "artist"
        db.session.add(artist)
        db.session.commit()
        
    song = song_service.import_from_youtube(artist.id, url, custom_title)
    return jsonify(format_song(song)), 201


@songs_bp.route("/<int:song_id>/like", methods=["POST"])
@jwt_required_custom
def toggle_like(song_id):
    """
    Toggles the liked status of a song for the authenticated user.
    POST /api/v1/songs/<song_id>/like
    """
    from app import db
    song = song_service.get_song(song_id)
    user = g.current_user
    
    if song in user.liked_songs:
        user.liked_songs.remove(song)
        liked = False
    else:
        user.liked_songs.append(song)
        liked = True
        
    db.session.commit()
    return jsonify({"liked": liked}), 200
