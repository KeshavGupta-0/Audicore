from flask import Blueprint, jsonify
from app import db
from app.models import Artist, Album
from app.utils.errors import NotFoundError

artists_bp = Blueprint("artists", __name__)

@artists_bp.route("/", methods=["GET"])
def get_artists():
    """
    Retrieves a list of all verified artists.
    GET /api/v1/artists/
    """
    artists = db.session.query(Artist).filter_by(verified=True).order_by(Artist.monthly_listeners.desc()).limit(20).all()
    return jsonify([
        {
            "id": a.id,
            "stage_name": a.stage_name,
            "cover_url": a.cover_url,
            "monthly_listeners": a.monthly_listeners
        } for a in artists
    ]), 200

@artists_bp.route("/<int:artist_id>", methods=["GET"])
def get_artist(artist_id):
    """
    Retrieves info for a single artist.
    GET /api/v1/artists/<artist_id>
    """
    artist = db.session.get(Artist, artist_id)
    if not artist:
        raise NotFoundError("Artist not found")

    return jsonify({
        "artist": {
            "id": artist.id,
            "stage_name": artist.stage_name,
            "bio": artist.bio,
            "country": artist.country,
            "cover_url": artist.cover_url,
            "verified": artist.verified,
            "monthly_listeners": artist.monthly_listeners,
            "created_at": artist.created_at.isoformat()
        }
    }), 200


@artists_bp.route("/<int:artist_id>/albums", methods=["GET"])
def get_artist_albums(artist_id):
    """
    Retrieves all albums released by an artist.
    GET /api/v1/artists/<artist_id>/albums
    """
    # Verify artist profile exists
    artist_exists = db.session.query(Artist.id).filter(Artist.id == artist_id).first() is not None
    if not artist_exists:
        raise NotFoundError("Artist not found")

    # Fetch albums sorted by release date
    albums = (
        db.session.query(Album)
        .filter(Album.artist_id == artist_id)
        .order_by(Album.release_date.desc())
        .all()
    )

    return jsonify({
        "artist_id": artist_id,
        "albums": [
            {
                "id": al.id,
                "title": al.title,
                "cover_url": al.cover_url,
                "release_date": al.release_date.isoformat() if al.release_date else None,
                "album_type": al.album_type,
                "is_published": al.is_published
            } for al in albums
        ]
    }), 200
