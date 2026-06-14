import urllib.request
import urllib.error
import urllib.parse
import json
import time

url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
download_link = ""

print("Testing direct proxy...")
try:
    # Let's try downloading via a known working free proxy to see if it's just the URL being completely dead
    req = urllib.request.Request("https://api.allorigins.win/get?url=" + urllib.parse.quote("https://google.com"))
    with urllib.request.urlopen(req) as resp:
        print("AllOrigins is accessible!")
except Exception as e:
    print("AllOrigins failed:", e)

