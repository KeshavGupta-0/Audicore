import yt_dlp
import uuid
import os

# A video that usually has webm as best audio
url = 'https://www.youtube.com/watch?v=ScMzIvxBSi4'
songs_dir = 'test_songs'
os.makedirs(songs_dir, exist_ok=True)

ydl_opts = {
    'format': 'bestaudio[ext=m4a]/bestaudio/best',
    'outtmpl': os.path.join(songs_dir, f'%(id)s_{uuid.uuid4().hex[:8]}.%(ext)s'),
    'quiet': False,
    'no_warnings': False,
    'extract_flat': False
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info_dict = ydl.extract_info(url, download=True)
    downloaded_filepath = ydl.prepare_filename(info_dict)
    print("Expected path:", downloaded_filepath)
    print("Does it exist?", os.path.exists(downloaded_filepath))
    
    # Let's see what files are actually in test_songs
    print("Files in dir:", os.listdir(songs_dir))
