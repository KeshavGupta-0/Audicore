from app import create_app
from app.services.song_service import SongService

app = create_app()
with app.app_context():
    svc = SongService()
    # We pass artist_id=1, which might not exist, but let's see if it crashes before DB insertion.
    url = 'https://www.youtube.com/watch?v=jNQXAC9IVRw'
    try:
        song = svc.import_from_youtube(artist_id=1, url=url)
        print("Success:", song)
    except Exception as e:
        import traceback
        traceback.print_exc()
