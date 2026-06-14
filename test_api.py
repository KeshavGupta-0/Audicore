import urllib.request
import json

data = json.dumps({"youtube_url": "https://www.youtube.com/watch?v=jNQXAC9IVRw", "title": ""}).encode('utf-8')
req = urllib.request.Request("http://127.0.0.1:5000/api/v1/songs/yt-import", data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as f:
        print("Success:", f.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print("Response:", e.read().decode('utf-8'))
