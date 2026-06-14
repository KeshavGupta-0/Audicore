from app import create_app, db
from app.models import User, Artist, Song

app = create_app()
with app.app_context():
    songs = Song.query.all()
    for s in songs:
        artist = Artist.query.get(s.artist_id)
        user_id = artist.user_id if artist else None
        print(f"ID: {s.id}, Title: {s.title}, Artist: {artist.stage_name if artist else 'None'}, Artist_User_ID: {user_id}, Is_Published: {s.is_published}")
