import yt_dlp

url = 'https://www.youtube.com/watch?v=cLOKKSPjZf8'

ydl_opts = {
    'quiet': False,
    'no_warnings': False,
    'extract_flat': True,
    'extractor_args': {'youtube': ['player_client=ios']}
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    try:
        info = ydl.extract_info(url, download=False)
        print("Success! Title:", info.get('title'))
    except Exception as e:
        print("Failed:", e)
