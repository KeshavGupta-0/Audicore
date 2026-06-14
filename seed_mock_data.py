import os
from dotenv import load_dotenv
load_dotenv()

from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models import User, Artist, Album, Song, Playlist, PlayHistory
import random

def clear_db():
    print("Clearing database...")
    db.session.query(PlayHistory).delete()
    db.session.query(Playlist).delete()
    db.session.query(Song).delete()
    db.session.query(Album).delete()
    db.session.query(Artist).delete()
    db.session.query(User).delete()
    db.session.commit()

def seed_db():
    print("Seeding users...")
    user1 = User(username="chill_vibes", email="chill@audicore.com", password_hash=generate_password_hash("password"), display_name="Chill Master", role="artist", is_verified=True)
    user2 = User(username="neon_nights", email="neon@audicore.com", password_hash=generate_password_hash("password"), display_name="Neon Nights", role="artist", is_verified=True)
    
    extra_users = []
    for i in range(1, 11):
        u = User(username=f"artist_{i}", email=f"artist{i}@audicore.com", password_hash=generate_password_hash("password"), display_name=f"Mock Artist {i}", role="artist", is_verified=True)
        extra_users.append(u)
    
    db.session.add_all([user1, user2] + extra_users)
    db.session.commit()

    print("Seeding artists...")
    artist1 = Artist(user_id=user1.id, stage_name="Chill Vibes", bio="Lofi and chill beats.", verified=True, cover_url="https://picsum.photos/seed/chill/300/300")
    artist2 = Artist(user_id=user2.id, stage_name="Neon Nights", bio="Synthwave outrun.", verified=True, cover_url="https://picsum.photos/seed/neon/300/300")
    
    extra_artists = []
    for i, u in enumerate(extra_users):
        a = Artist(user_id=u.id, stage_name=f"Mock Artist {i+1}", bio="Generated mock artist.", verified=True, cover_url=f"https://picsum.photos/seed/artist{i}/300/300")
        extra_artists.append(a)

    db.session.add_all([artist1, artist2] + extra_artists)
    db.session.commit()

    print("Seeding albums...")
    album1 = Album(artist_id=artist1.id, title="Midnight Study", is_published=True, cover_url="https://picsum.photos/seed/album_chill/300/300")
    album2 = Album(artist_id=artist2.id, title="Retrograde", is_published=True, cover_url="https://picsum.photos/seed/album_neon/300/300")
    
    extra_albums = []
    for i, a in enumerate(extra_artists):
        al = Album(artist_id=a.id, title=f"Essentials Vol {i+1}", is_published=True, cover_url=f"https://picsum.photos/seed/album{i}/300/300")
        extra_albums.append(al)

    db.session.add_all([album1, album2] + extra_albums)
    db.session.commit()

    print("Seeding songs...")
    songs = [
        Song(artist_id=artist1.id, album_id=album1.id, title="Rainy Cafe", duration_secs=185, file_path="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80", track_number=1, is_published=True, play_count=15000),
        Song(artist_id=artist1.id, album_id=album1.id, title="Late Night Walk", duration_secs=210, file_path="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", cover_url="https://images.unsplash.com/photo-1493225457124-a1a2a5f5f923?w=500&q=80", track_number=2, is_published=True, play_count=8000),
        Song(artist_id=artist2.id, album_id=album2.id, title="Cyber City", duration_secs=245, file_path="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", cover_url="https://images.unsplash.com/photo-1518599904199-0ca897819ddb?w=500&q=80", track_number=1, is_published=True, play_count=32000),
        Song(artist_id=artist2.id, album_id=album2.id, title="Hyperdrive", duration_secs=190, file_path="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", cover_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80", track_number=2, is_published=True, play_count=21000)
    ]
    
    # Generate 30 more mock songs using royalty free links
    for i in range(1, 31):
        artist = random.choice(extra_artists)
        album = next(al for al in extra_albums if al.artist_id == artist.id)
        song = Song(
            artist_id=artist.id, 
            album_id=album.id, 
            title=f"Mock Track {i}", 
            duration_secs=random.randint(120, 300), 
            file_path=f"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-{(i%17)+1}.mp3", 
            cover_url=f"https://picsum.photos/seed/song{i}/300/300", 
            track_number=i, 
            is_published=True, 
            play_count=random.randint(100, 50000)
        )
        songs.append(song)

    db.session.add_all(songs)
    db.session.commit()

    print("Seeding playlists...")
    playlist1 = Playlist(owner_id=user1.id, title="Lofi Beats", description="Beats to study to.", is_public=True)
    playlist1.songs.extend(songs[:5])
    
    playlist2 = Playlist(owner_id=user2.id, title="Synthwave Mix", description="Night drive vibes.", is_public=True)
    playlist2.songs.extend(songs[5:10])

    db.session.add_all([playlist1, playlist2])
    db.session.commit()

    print("Database seeded successfully!")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        try:
            clear_db()
            seed_db()
        except Exception as e:
            print(f"Error seeding database: {e}")
