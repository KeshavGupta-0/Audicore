import urllib.request
import json

api_url = "https://youtube-mp36.p.rapidapi.com/dl?id=cLOKKSPjZf8"
req = urllib.request.Request(api_url, headers={
    "x-rapidapi-key": "605a2aa0ddmsh0d2cc25bdf3009ap130da7jsn6a94c6971fe",
    "x-rapidapi-host": "youtube-mp36.p.rapidapi.com"
})

try:
    with urllib.request.urlopen(req, timeout=30) as response:
        content = response.read()
        print("Raw content:", content)
        data = json.loads(content.decode('utf-8'))
        print("JSON data:", data)
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print("Response:", e.read().decode('utf-8'))
