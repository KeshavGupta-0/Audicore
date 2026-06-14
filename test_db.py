from app import create_app, db
from app.models import User, Artist, Song

app = create_app()
with app.app_context():
    users = User.query.all()
    print("Users:")
    for u in users:
        print(f" - {u.username} (id: {u.id})")
        
    artists = Artist.query.all()
    print("\nArtists:")
    for a in artists:
        print(f" - {a.stage_name} (user_id: {a.user_id}, id: {a.id})")
        
    songs = Song.query.all()
    print("\nSongs:")
    for s in songs:
        print(f" - {s.title} (artist_id: {s.artist_id})")
