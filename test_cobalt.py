import urllib.request
import urllib.error
import urllib.parse
import json

url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
api_url = "https://co.wuk.sh/api/json"

data = {
    "url": url,
    "isAudioOnly": True,
    "aFormat": "mp3",
    "filenamePattern": "basic"
}

req = urllib.request.Request(api_url, data=json.dumps(data).encode('utf-8'), headers={
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
})

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("Cobalt SUCCESS:", res)
except Exception as e:
    print("Cobalt FAILED:", e)
