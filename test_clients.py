import yt_dlp

url = 'https://www.youtube.com/watch?v=cLOKKSPjZf8'
clients = ['web', 'android', 'ios', 'mweb', 'tv', 'web_creator']

for client in clients:
    print(f"\n--- Testing client: {client} ---")
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
        'extractor_args': {'youtube': [f'player_client={client}']}
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            print(f"[{client}] Success! Title: {info.get('title')}")
        except Exception as e:
            print(f"[{client}] Failed:", e)
