import urllib.request
import json

url = 'https://api.cobalt.tools/api/json'
data = json.dumps({"url": "https://www.youtube.com/watch?v=cLOKKSPjZf8"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})

try:
    with urllib.request.urlopen(req) as f:
        print("Success:", f.read().decode('utf-8'))
except Exception as e:
    print("Failed:", e)
    if hasattr(e, 'read'):
        print("Response:", e.read().decode('utf-8'))
