import os
import uuid
from typing import List, Tuple
from flask import current_app
from app.utils.audio import get_audio_duration
from app import db
from app.models import Song, PlayHistory, FileStorage
from app.repositories.song_repository import SongRepository
from app.utils.errors import ValidationError, NotFoundError

class SongService:
    """Business logic service handling audio uploads, retrieval, streaming, and trend computations."""

    def __init__(self, song_repo: SongRepository = None):
        # Inject repository to enable decoupling and unit testing
        self.song_repo = song_repo or SongRepository()

    def _validate_audio(self, audio_file):
        """Helper method to validate audio file existence and permitted formats."""
        if not audio_file or not audio_file.filename:
            raise ValidationError("Audio file is required")
        
        ext = audio_file.filename.rsplit(".", 1)[-1].lower() if "." in audio_file.filename else ""
        allowed = current_app.config.get("ALLOWED_AUDIO_EXTENSIONS", {"mp3", "flac", "wav", "ogg", "m4a"})
        if ext not in allowed:
            raise ValidationError(
                f"File type not allowed. Supported formats: {', '.join(allowed)}"
            )

    def upload_song(self, artist_id, audio_file, cover_file, metadata) -> Song:
        """
        Validates and processes audio/cover uploads, extracts metadata/durations, and persists records.
        """
        # (1) Validate audio file
        self._validate_audio(audio_file)

        # Parse original extension
        filename = audio_file.filename
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "mp3"

        # (2) Generate UUID hex filename preserving original extension
        new_filename = f"{uuid.uuid4().hex}.{ext}"

        # (3) Save the audio file to static/uploads/songs/
        upload_folder = current_app.config.get("UPLOAD_FOLDER")
        songs_dir = os.path.join(upload_folder, "songs")
        os.makedirs(songs_dir, exist_ok=True)
        full_path = os.path.join(songs_dir, new_filename)
        audio_file.save(full_path)

        # (4) Call get_audio_duration(full_path)
        duration_secs = get_audio_duration(full_path)

        # (4.5) Save audio to Database (Render Persistence)
        audio_id = uuid.uuid4().hex
        with open(full_path, "rb") as f:
            audio_blob = f.read()
        db.session.add(FileStorage(id=audio_id, mimetype=f"audio/{ext}", data=audio_blob))
        web_path = f"db://{audio_id}"

        # (5) Handle optional cover file upload
        cover_url = metadata.get("cover_url")
        if cover_file and cover_file.filename:
            cover_ext = cover_file.filename.rsplit(".", 1)[-1].lower() if "." in cover_file.filename else ""
            if cover_ext not in {"jpg", "jpeg", "png", "webp"}:
                raise ValidationError("Invalid cover image format.")
            
            cover_filename = f"{uuid.uuid4().hex}.{cover_ext}"
            covers_dir = os.path.join(upload_folder, "covers")
            os.makedirs(covers_dir, exist_ok=True)
            cover_path = os.path.join(covers_dir, cover_filename)
            cover_file.save(cover_path)
            
            # Save cover to Database
            cover_id = uuid.uuid4().hex
            with open(cover_path, "rb") as f:
                cover_blob = f.read()
            db.session.add(FileStorage(id=cover_id, mimetype=f"image/{cover_ext}", data=cover_blob))
            cover_url = f"/api/v1/stream/file/{cover_id}"

        # Parse metadata fields
        title = metadata.get("title") or filename.rsplit(".", 1)[0]
        album_id = metadata.get("album_id")
        track_number = metadata.get("track_number")
        is_published = metadata.get("is_published", False)
        lyrics = metadata.get("lyrics")

        # (6) Call self.song_repo.create() and return the created song
        song = self.song_repo.create(
            artist_id=artist_id,
            album_id=album_id,
            title=title,
            duration_secs=duration_secs,
            file_path=web_path,
            cover_url=cover_url,
            track_number=track_number,
            is_published=is_published,
            lyrics=lyrics
        )

        return song

    def resolve_youtube(self, url, custom_title=None) -> dict:
        """
        Uses RapidAPI to get a direct download link and metadata for a YouTube URL.
        Returns a dict: { 'download_link': str, 'title': str, 'thumbnail': str, 'duration': int }
        """
        import urllib.request
        import json
        import re
        import time
        import traceback
        
        rapidapi_key = current_app.config.get("RAPIDAPI_KEY")
        rapidapi_host = current_app.config.get("RAPIDAPI_HOST")
        
        if not rapidapi_key or not rapidapi_host:
            raise ValidationError("RapidAPI is not configured. Please use local upload.")
            
        try:
            match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
            video_id = match.group(1) if match else url
            
            api_url = f"https://{rapidapi_host}/dl?id={video_id}"
            req = urllib.request.Request(api_url, headers={
                "x-rapidapi-key": rapidapi_key,
                "x-rapidapi-host": rapidapi_host
            })
            
            data = None
            for _ in range(15):
                with urllib.request.urlopen(req, timeout=30) as response:
                    data = json.loads(response.read().decode('utf-8'))
                
                if data.get("status") == "ok" and data.get("link"):
                    break
                elif data.get("status") == "processing" or data.get("progress") != 100:
                    time.sleep(2)
                else:
                    break
                    
            if not data or (data.get("status") != "ok" and "link" not in data):
                raise ValidationError(f"RapidAPI failed: {data.get('msg', 'Unknown error') if data else 'Empty response'}")
            
            download_link = data.get('link')
            if not download_link:
                raise ValidationError("RapidAPI did not return a download link after processing.")
                
            title = custom_title if custom_title else data.get('title', 'Unknown Title')
            
            return {
                "download_link": download_link,
                "title": title,
                "thumbnail": data.get('thumb', f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"),
                "duration": int(data.get('duration', 0) or 0)
            }
            
        except Exception as e:
            error_details = traceback.format_exc()
            err_msg = str(e)
            if hasattr(e, 'read'):
                try:
                    err_msg += f" {e.read().decode('utf-8', errors='ignore')}"
                except:
                    pass
            print("RAPIDAPI RESOLVE ERROR:", error_details)
            raise ValidationError(f"Failed to resolve YouTube link: {err_msg}")

    def import_from_youtube(self, artist_id, url, custom_title=None) -> Song:
        """
        Uses RapidAPI or yt-dlp to download audio and thumbnail from a YouTube URL.
        """
        import urllib.request
        import json
        
        upload_folder = current_app.config.get("UPLOAD_FOLDER")
        songs_dir = os.path.join(upload_folder, "songs")
        os.makedirs(songs_dir, exist_ok=True)
        
        rapidapi_key = current_app.config.get("RAPIDAPI_KEY")
        rapidapi_host = current_app.config.get("RAPIDAPI_HOST")
        
        info_dict = {}
        downloaded_filepath = None
        
        if rapidapi_key and rapidapi_host:
            # Use RapidAPI to bypass YouTube Bot Blocks
            try:
                import re
                match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
                video_id = match.group(1) if match else url
                
                api_url = f"https://{rapidapi_host}/dl?id={video_id}"
                req = urllib.request.Request(api_url, headers={
                    "x-rapidapi-key": rapidapi_key,
                    "x-rapidapi-host": rapidapi_host
                })
                
                data = None
                import time
                for _ in range(15):
                    with urllib.request.urlopen(req, timeout=30) as response:
                        data = json.loads(response.read().decode('utf-8'))
                    
                    if data.get("status") == "ok" and data.get("link"):
                        break
                    elif data.get("status") == "processing" or data.get("progress") != 100:
                        time.sleep(2)
                    else:
                        break
                        
                if not data or (data.get("status") != "ok" and "link" not in data):
                    raise ValidationError(f"RapidAPI failed: {data.get('msg', 'Unknown error') if data else 'Empty response'}")
                
                info_dict['title'] = data.get('title', 'Unknown Title')
                info_dict['duration'] = int(data.get('duration', 0) or 0)
                # Manually construct thumbnail since API might not provide it
                info_dict['thumbnail'] = data.get('thumb', f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg")
                
                download_link = data.get('link')
                if not download_link:
                    raise ValidationError("RapidAPI did not return a download link after processing.")
                    
                # Download the audio file
                ext = "mp3"
                filename = f"{video_id}_{uuid.uuid4().hex[:8]}.{ext}"
                downloaded_filepath = os.path.join(songs_dir, filename)
                
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': '*/*'
                }
                
                download_success = False
                last_err = None
                for attempt in range(5):
                    try:
                        audio_req = urllib.request.Request(download_link, headers=headers)
                        with urllib.request.urlopen(audio_req, timeout=60) as response:
                            # Ensure we are getting an audio file and not an HTML error page
                            content_type = response.headers.get('Content-Type', '')
                            if 'text/html' in content_type:
                                raise Exception(f"Received HTML instead of audio: {content_type}")
                                
                            with open(downloaded_filepath, 'wb') as f:
                                f.write(response.read())
                        download_success = True
                        break
                    except Exception as e:
                        last_err = e
                        print(f"Download attempt {attempt+1} failed: {e}")
                        time.sleep(3) # Wait for CDN sync before retrying
                        
                if not download_success:
                    raise last_err
                    
                rapidapi_success = True
                
            except Exception as e:
                import traceback
                print("RAPIDAPI ERROR:", traceback.format_exc())
                print("RapidAPI failed, falling back to yt-dlp...")
                rapidapi_success = False

        if not rapidapi_success:
            # Fallback to yt-dlp
            import yt_dlp
            ydl_opts = {
                'format': 'bestaudio[ext=m4a]/bestaudio/best',
                'outtmpl': os.path.join(songs_dir, f'%(id)s_{uuid.uuid4().hex[:8]}.%(ext)s'),
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                try:
                    info_dict = ydl.extract_info(url, download=True)
                except Exception as e:
                    import traceback
                    error_details = traceback.format_exc()
                    print("YT-DLP ERROR:", error_details)
                    raise ValidationError(f"Failed to fetch YouTube video: {str(e)} \nDetails: {error_details}")
                    
                downloaded_filepath = ydl.prepare_filename(info_dict)
                if not os.path.exists(downloaded_filepath):
                    raise ValidationError(f"Failed to download audio from YouTube. Expected file at: {downloaded_filepath}")
                
        # 2) Process Metadata
        audio_id = uuid.uuid4().hex
        with open(downloaded_filepath, "rb") as f:
            audio_blob = f.read()
        db.session.add(FileStorage(id=audio_id, mimetype="audio/mpeg", data=audio_blob))
        web_path = f"db://{audio_id}"
        
        title = custom_title if custom_title else info_dict.get('title', 'Unknown Title')
        duration_secs = info_dict.get('duration', 0)
        
        # 3) Process Thumbnail
        thumbnail_url = info_dict.get('thumbnail')
        cover_url = None
        if thumbnail_url:
            try:
                import urllib.request
                req = urllib.request.Request(thumbnail_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=10) as response:
                    if response.status == 200:
                        cover_ext = "jpg"
                        cover_filename = f"{uuid.uuid4().hex}.{cover_ext}"
                        covers_dir = os.path.join(upload_folder, "covers")
                        os.makedirs(covers_dir, exist_ok=True)
                        cover_dest_path = os.path.join(covers_dir, cover_filename)
                        
                        cover_blob = response.read()
                        with open(cover_dest_path, 'wb') as f:
                            f.write(cover_blob)
                            
                        cover_id = uuid.uuid4().hex
                        db.session.add(FileStorage(id=cover_id, mimetype="image/jpeg", data=cover_blob))
                        cover_url = f"/api/v1/stream/file/{cover_id}"
            except Exception:
                pass # Fail silently for thumbnails
                
        # 4) Save to DB
        song = self.song_repo.create(
            artist_id=artist_id,
            album_id=None,
            title=title,
            duration_secs=duration_secs,
            file_path=web_path,
            cover_url=cover_url,
            track_number=None,
            is_published=True,
            lyrics=None
        )
        return song

    def get_song(self, song_id: int) -> Song:
        """
        Fetches an active song by its ID. Enforces is_published status.
        
        Args:
            song_id: Database ID of the song.
            
        Returns:
            The Song instance.
            
        Raises:
            NotFoundError: If the song doesn't exist or is not published.
        """
        song = self.song_repo.get_by_id(song_id)
        if not song or not song.is_published:
            raise NotFoundError("Song not found")
        return song

    def get_stream_path(self, song_id, user_id):
        """
        Retrieves the absolute path of the audio file, logs play history, and updates views.
        """
        song = self.song_repo.get_by_id(song_id)
        if not song or not song.is_published:
            raise NotFoundError("Song not found.")

        # Create a PlayHistory instance with user_id and song_id and add it to db.session
        history = PlayHistory(user_id=user_id, song_id=song_id)
        db.session.add(history)
        db.session.commit()

        # Increment play count
        self.song_repo.increment_play_count(song_id)

        # Resolve path
        if song.file_path.startswith("db://"):
            return song.file_path
            
        path_to_join = song.file_path.lstrip("/")
        if path_to_join.startswith("static/"):
            path_to_join = path_to_join.replace("static/", "", 1)

        return os.path.join(current_app.static_folder, path_to_join)

    def get_trending(self, limit: int = 10) -> List[Song]:
        """
        Retrieves the trending/popular songs based on plays in the last 7 days.
        
        Args:
            limit: The maximum number of trending songs.
            
        Returns:
            A list of trending Songs.
        """
        return self.song_repo.get_trending(limit)

    def search(self, query: str, page: int = 1, per_page: int = 20) -> Tuple[List[Song], int]:
        """
        Searches songs by case-insensitive title with pagination.
        
        Args:
            query: The search term.
            page: Active page number (1-indexed).
            per_page: Number of songs to return per page.
            
        Returns:
            A tuple of (songs list, total matches count).
        """
        return self.song_repo.search(query, page, per_page)
