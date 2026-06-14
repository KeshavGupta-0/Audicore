from pytubefix import YouTube

url = 'https://www.youtube.com/watch?v=cLOKKSPjZf8'
try:
    yt = YouTube(url)
    audio = yt.streams.get_audio_only()
    print("Success! Title:", yt.title)
    audio.download(output_path='test_songs', filename='pytubefix_test.m4a')
    print("Downloaded!")
except Exception as e:
    import traceback
    traceback.print_exc()
