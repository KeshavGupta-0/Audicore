import urllib.request
import urllib.error
import json
import re
import os

rapidapi_key = os.environ.get("RAPIDAPI_KEY") or "bd4c8e762cmsh4a2df84179e88ebp1e1c31jsn0ef69cd1ef3b"
rapidapi_host = "youtube-mp36.p.rapidapi.com"
url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
video_id = match.group(1) if match else url

api_url = f"https://{rapidapi_host}/dl?id={video_id}"
req = urllib.request.Request(api_url, headers={
    "x-rapidapi-key": rapidapi_key,
    "x-rapidapi-host": rapidapi_host
})

try:
    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode('utf-8'))
        print("API Response:", json.dumps(data, indent=2))
        
        link = data.get("link")
        if link:
            print("Download link:", link)
            
            # Try to fetch the link headers
            audio_req = urllib.request.Request(link, headers={
                'User-Agent': 'Mozilla/5.0'
            }, method="HEAD")
            
            try:
                with urllib.request.urlopen(audio_req) as audio_resp:
                    print("HEAD Status:", audio_resp.status)
                    print("Headers:", audio_resp.headers.items())
            except urllib.error.HTTPError as e:
                print("HEAD HTTP Error:", e.code, e.reason)
            except Exception as e:
                print("HEAD Error:", str(e))
                
except Exception as e:
    print("Error:", str(e))
