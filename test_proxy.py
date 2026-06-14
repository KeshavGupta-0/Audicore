import urllib.request

download_link = "https://eta.123tokyo.xyz/get.php/6/29/UxxajLWwzqY.mp3?n=Icona%20Pop%20-%20I%20Love%20It%20%28feat.%20Charli%20XCX%29%20%5BOFFICIAL%20VIDEO%5D&uT=R&uN=a2VzaGF2Z3VwdGEwOTI0&h=LrSR0AOyPvD27t4wXguzuQ&s=1781443406&uT=R&uN=a2VzaGF2Z3VwdGEwOTI0"

proxy_link = f"https://corsproxy.io/?{urllib.parse.quote(download_link)}"

req = urllib.request.Request(proxy_link, headers={'User-Agent': 'Mozilla/5.0'})

try:
    with urllib.request.urlopen(req) as response:
        print("Success, bytes:", len(response.read(100)))
except Exception as e:
    print("Failed:", e)
