from mutagen import File as MutagenFile

def get_audio_duration(file_path: str) -> int:
    """
    Uses the mutagen library to read the length in seconds from any audio file.
    Returns 0 if it fails.
    """
    try:
        audio = MutagenFile(file_path)
        if audio is not None and audio.info is not None:
            return int(audio.info.length)
    except Exception:
        return 0
    return 0
