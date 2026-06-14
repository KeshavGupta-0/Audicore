import os
import re
from flask import Blueprint, request, Response, abort
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from app.services.song_service import SongService
from app.models import FileStorage, Song

stream_bp = Blueprint("stream", __name__)
song_service = SongService()

def chunk_generator(filepath, start_byte, end_byte, chunk_size=256 * 1024):
    """
    Generator that reads and yields binary chunks of a file in 256KB sections.
    """
    with open(filepath, "rb") as f:
        f.seek(start_byte)
        bytes_to_read = end_byte - start_byte + 1
        while bytes_to_read > 0:
            read_size = min(chunk_size, bytes_to_read)
            chunk = f.read(read_size)
            if not chunk:
                break
            bytes_to_read -= len(chunk)
            yield chunk

def db_chunk_generator(blob_data, start_byte, end_byte, chunk_size=256 * 1024):
    """Generator that yields binary chunks from memory."""
    bytes_to_read = end_byte - start_byte + 1
    current = start_byte
    while bytes_to_read > 0:
        read_size = min(chunk_size, bytes_to_read)
        chunk = blob_data[current:current+read_size]
        if not chunk:
            break
        bytes_to_read -= len(chunk)
        current += len(chunk)
        yield chunk

@stream_bp.route("/file/<file_id>")
def serve_db_file(file_id):
    """Serves a raw file from the database."""
    file_record = FileStorage.query.get_or_404(file_id)
    return Response(file_record.data, mimetype=file_record.mimetype)

@stream_bp.route("/<int:song_id>/play", methods=["POST"])
@jwt_required()
def log_play(song_id):
    """POST /api/v1/stream/<song_id>/play — logs play history, called via fetch() with auth header."""
    user_id = int(get_jwt_identity())
    try:
        song_service.log_play(song_id, user_id)
    except Exception:
        pass
    return {"ok": True}

@stream_bp.route("/<int:song_id>", methods=["GET"])
def stream_song(song_id):
    """
    GET /api/v1/stream/<song_id> — No auth required so <audio src> works in the browser.
    """
    song = Song.query.get_or_404(song_id)
    file_path = song.file_path
    
    is_db = file_path and file_path.startswith("db://")
    is_http = file_path and (file_path.startswith("http://") or file_path.startswith("https://"))
    
    if is_http:
        from flask import redirect
        return redirect(file_path)
        
    if not is_db and (not file_path or not os.path.exists(file_path)):
        abort(404)
        
    if is_db:
        file_id = file_path.replace("db://", "")
        file_record = FileStorage.query.get_or_404(file_id)
        total_size = len(file_record.data)
    else:
        total_size = os.path.getsize(file_path)
        
    range_header = request.headers.get("Range", None)
    
    if range_header:
        match = re.search(r"bytes=(\d+)-(\d*)", range_header)
        if match:
            start = int(match.group(1))
            end_val = match.group(2)
            end = int(end_val) if end_val else total_size - 1
        else:
            start = 0
            end = total_size - 1
            
        if start >= total_size:
            return Response("Range Not Satisfiable", status=416)
        if end >= total_size:
            end = total_size - 1
            
        content_length = end - start + 1
        
        headers = {
            "Content-Range": f"bytes {start}-{end}/{total_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(content_length),
            "Content-Type": "audio/mpeg"
        }
        
        generator = db_chunk_generator(file_record.data, start, end) if is_db else chunk_generator(file_path, start, end)
        return Response(generator, status=206, headers=headers)
    else:
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(total_size),
            "Content-Type": "audio/mpeg"
        }
        
        generator = db_chunk_generator(file_record.data, 0, total_size - 1) if is_db else chunk_generator(file_path, 0, total_size - 1)
        return Response(generator, status=200, headers=headers)
