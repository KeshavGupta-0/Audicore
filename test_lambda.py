import urllib.request
import urllib.error

url = "https://lambda.123tokyo.xyz/get.php/c/52/UxxajLWwzqY.mp3?n=Snowman%20%5BOfficial%20Video%5D&uT=R&uN=Sia"
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://youtube-mp36.p.rapidapi.com/'
}, method="HEAD")

try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.status)
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.reason)
except Exception as e:
    print("Error:", str(e))
