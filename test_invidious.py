import urllib.request
import json

video_id = "dQw4w9WgXcQ"
api_url = f"https://vid.puffyan.us/api/v1/videos/{video_id}"

req = urllib.request.Request(api_url, headers={
    "User-Agent": "Mozilla/5.0"
})

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        
        # Find audio-only format
        formats = data.get("formatStreams", []) + data.get("adaptiveFormats", [])
        audio_streams = [f for f in formats if f.get("type", "").startswith("audio/")]
        
        if audio_streams:
            print("Found audio streams!")
            # Get the highest bitrate
            best_audio = sorted(audio_streams, key=lambda x: int(x.get("bitrate", 0)), reverse=True)[0]
            print("Best audio URL:", best_audio["url"][:100] + "...")
        else:
            print("No audio streams found.")
except Exception as e:
    print("Invidious failed:", e)
