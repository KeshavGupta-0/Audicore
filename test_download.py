import urllib.request

download_link = "https://eta.123tokyo.xyz/get.php/6/29/UxxajLWwzqY.mp3?n=Icona%20Pop%20-%20I%20Love%20It%20%28feat.%20Charli%20XCX%29%20%5BOFFICIAL%20VIDEO%5D&uT=R&uN=a2VzaGF2Z3VwdGEwOTI0&h=LrSR0AOyPvD27t4wXguzuQ&s=1781443406&uT=R&uN=a2VzaGF2Z3VwdGEwOTI0"

audio_req = urllib.request.Request(download_link, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*'
})
try:
    with urllib.request.urlopen(audio_req, timeout=60) as response:
        content = response.read(1024)
        print("Success! Got bytes:", len(content))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print("Response:", e.read().decode('utf-8', errors='ignore'))
