from flask import Blueprint, request, jsonify
from app import db
from app.models import Song, Artist, Album

search_bp = Blueprint("search", __name__)

@search_bp.route("/", methods=["GET"])
def search():
    """
    Unified discovery search route returning matching songs, artists, and albums.
    GET /api/v1/search/?q=<query>
    """
    q = request.args.get("q", "").strip()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    
    # Calculate offset
    offset = (page - 1) * per_page
    
    # 1. Search Songs
    songs_query = db.session.query(Song).filter(Song.title.ilike(f"%{q}%"))
    total_songs = songs_query.count()
    songs = songs_query.limit(per_page).offset(offset).all()
    
    # 2. Search Artists
    artists_query = db.session.query(Artist).filter(Artist.stage_name.ilike(f"%{q}%"))
    total_artists = artists_query.count()
    artists = artists_query.limit(per_page).offset(offset).all()
    
    # 3. Search Albums
    albums_query = db.session.query(Album).filter(Album.title.ilike(f"%{q}%"))
    total_albums = albums_query.count()
    albums = albums_query.limit(per_page).offset(offset).all()
    
    return jsonify({
        "query": q,
        "page": page,
        "per_page": per_page,
        "pagination": {
            "total_songs": total_songs,
            "total_artists": total_artists,
            "total_albums": total_albums
        },
        "songs": [
            {
                "id": s.id,
                "title": s.title,
                "duration_secs": s.duration_secs,
                "file_path": s.file_path,
                "cover_url": s.cover_url,
                "artist_name": s.artist.stage_name if s.artist else None,
                "album_title": s.album.title if s.album else None
            } for s in songs
        ],
        "artists": [
            {
                "id": a.id,
                "stage_name": a.stage_name,
                "cover_url": a.cover_url,
                "verified": a.verified,
                "monthly_listeners": a.monthly_listeners,
                "country": a.country
            } for a in artists
        ],
        "albums": [
            {
                "id": al.id,
                "title": al.title,
                "cover_url": al.cover_url,
                "release_date": al.release_date.isoformat() if al.release_date else None,
                "album_type": al.album_type,
                "artist_name": al.artist.stage_name if al.artist else None
            } for al in albums
        ]
    }), 200
