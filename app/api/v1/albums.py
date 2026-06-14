from flask import Blueprint, jsonify
from app import db
from app.models import Album, Song
from app.utils.errors import NotFoundError

albums_bp = Blueprint("albums", __name__)

@albums_bp.route("/", methods=["GET"])
def get_albums():
    """
    Retrieves a list of all published albums.
    GET /api/v1/albums/
    """
    albums = db.session.query(Album).filter_by(is_published=True).order_by(Album.release_date.desc()).limit(20).all()
    return jsonify([
        {
            "id": al.id,
            "title": al.title,
            "cover_url": al.cover_url,
            "release_date": al.release_date.isoformat() if al.release_date else None,
            "album_type": al.album_type,
            "artist_name": al.artist.stage_name if al.artist else None
        } for al in albums
    ]), 200

@albums_bp.route("/<int:album_id>", methods=["GET"])
def get_album(album_id):
    """
    Retrieves information for a single album along with its ordered song list.
    GET /api/v1/albums/<album_id>
    """
    # Fetch album info
    album = db.session.get(Album, album_id)
    if not album:
        raise NotFoundError("Album not found")

    # Fetch album tracks explicitly sorted by track_number
    songs = (
        db.session.query(Song)
        .filter(Song.album_id == album_id)
        .order_by(Song.track_number.asc())
        .all()
    )

    return jsonify({
        "album": {
            "id": album.id,
            "title": album.title,
            "cover_url": album.cover_url,
            "release_date": album.release_date.isoformat() if album.release_date else None,
            "album_type": album.album_type,
            "is_published": album.is_published,
            "artist_id": album.artist_id,
            "artist_name": album.artist.stage_name if album.artist else None
        },
        "songs": [
            {
                "id": s.id,
                "title": s.title,
                "duration_secs": s.duration_secs,
                "file_path": s.file_path,
                "cover_url": s.cover_url,
                "track_number": s.track_number,
                "play_count": s.play_count,
                "is_published": s.is_published
            } for s in songs
        ]
    }), 200
