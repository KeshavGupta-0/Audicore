import urllib.request
import urllib.error

url = "https://lambda.123tokyo.xyz/"
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Origin': 'http://localhost:3000'
}, method="OPTIONS")

try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.status)
        print("Headers:", response.headers.items())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.reason)
    print("Headers:", e.headers.items())
except Exception as e:
    print("Error:", str(e))
