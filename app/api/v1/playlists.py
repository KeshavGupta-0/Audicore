from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.services.playlist_service import PlaylistService
from app.middleware.auth_middleware import jwt_required_custom
from app.utils.errors import ValidationError

playlists_bp = Blueprint("playlists", __name__)
playlist_service = PlaylistService()

def format_playlist(playlist) -> dict:
    """Formats a Playlist model object and its associated songs list into clean JSON response."""
    return {
        "id": playlist.id,
        "title": playlist.title,
        "description": playlist.description,
        "cover_url": playlist.cover_url,
        "is_public": playlist.is_public,
        "owner_id": playlist.owner_id,
        "owner_name": playlist.owner.display_name if playlist.owner else None,
        "songs": [
            {
                "id": song.id,
                "title": song.title,
                "duration_secs": song.duration_secs,
                "cover_url": song.cover_url,
                "file_path": song.file_path,
                "artist_name": song.artist.stage_name if song.artist else None,
                "album_title": song.album.title if song.album else None
            } for song in playlist.songs
        ]
    }


@playlists_bp.route("/", methods=["POST"])
@jwt_required_custom
def create():
    """
    Creates a new playlist for the logged-in user.
    POST /api/v1/playlists/
    """
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description")
    cover_url = data.get("cover_url")
    is_public = data.get("is_public", True)

    playlist = playlist_service.create_playlist(
        owner_id=g.current_user.id,
        title=title,
        description=description,
        cover_url=cover_url,
        is_public=is_public
    )
    return jsonify(format_playlist(playlist)), 201


@playlists_bp.route("/", methods=["GET"])
@jwt_required_custom
def get_user_playlists():
    """
    Retrieves all playlists belonging to the authenticated user.
    GET /api/v1/playlists/
    """
    playlists = playlist_service.get_user_playlists(g.current_user.id)
    return jsonify([format_playlist(p) for p in playlists]), 200



@playlists_bp.route("/<int:playlist_id>", methods=["GET"])
def get(playlist_id):
    """
    Retrieves a single playlist's details and song list.
    GET /api/v1/playlists/<playlist_id>
    """
    # Enforce optional JWT loading to respect public/private visibility parameters
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        jwt_id = get_jwt_identity()
        if jwt_id:
            user_id = int(jwt_id)
    except Exception:
        pass

    playlist = playlist_service.get_playlist(playlist_id, user_id)
    return jsonify(format_playlist(playlist)), 200


@playlists_bp.route("/<int:playlist_id>/songs", methods=["POST"])
@jwt_required_custom
def add_song(playlist_id):
    """
    Adds a song to a user's playlist.
    POST /api/v1/playlists/<playlist_id>/songs
    """
    data = request.get_json() or {}
    song_id = data.get("song_id")
    
    if not song_id:
        raise ValidationError("song_id parameter is required")

    playlist = playlist_service.add_song(playlist_id, int(song_id), g.current_user.id)
    return jsonify(format_playlist(playlist)), 200


@playlists_bp.route("/<int:playlist_id>/songs/<int:song_id>", methods=["DELETE"])
@jwt_required_custom
def remove_song(playlist_id, song_id):
    """
    Removes a song from a user's playlist.
    DELETE /api/v1/playlists/<playlist_id>/songs/<song_id>
    """
    playlist = playlist_service.remove_song(playlist_id, song_id, g.current_user.id)
    return jsonify(format_playlist(playlist)), 200


@playlists_bp.route("/<int:playlist_id>", methods=["DELETE"])
@jwt_required_custom
def delete(playlist_id):
    """
    Deletes an entire playlist owned by the user.
    DELETE /api/v1/playlists/<playlist_id>
    """
    playlist_service.delete_playlist(playlist_id, g.current_user.id)
    return jsonify({"message": "Playlist deleted successfully"}), 200
