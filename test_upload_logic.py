from app import create_app, db
from app.services.song_service import SongService
from app.models import Artist, User

app = create_app("development")

with app.app_context():
    # Ensure tables exist
    db.create_all()
    
    # Get or create an artist
    user = User.query.first()
    if not user:
        user = User(username="testuser", email="test@test.com", role="artist")
        db.session.add(user)
        db.session.commit()
        
    artist = Artist.query.filter_by(user_id=user.id).first()
    if not artist:
        artist = Artist(user_id=user.id, stage_name="Test Artist")
        db.session.add(artist)
        db.session.commit()

    # Mock audio file
    class MockFile:
        def __init__(self, filename):
            self.filename = filename
        def save(self, path):
            with open(path, "wb") as f:
                f.write(b"fake audio data")

    audio = MockFile("test.mp3")
    metadata = {"title": "Test Song"}
    
    try:
        service = SongService()
        song = service.upload_song(artist.id, audio, None, metadata)
        print("UPLOAD SUCCESS!", song.file_path)
    except Exception as e:
        import traceback
        traceback.print_exc()
