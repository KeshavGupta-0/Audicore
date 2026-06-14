from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import config_map
from app.utils.errors import register_error_handlers

# Initialize extensions globally
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
limiter = Limiter(key_func=get_remote_address)

def create_app(config_name="development"):
    """Application factory for Audicore Flask app."""
    app = Flask(
        __name__,
        # Point to the root templates and static folders relative to this package
        template_folder="../templates",
        static_folder="../static"
    )
    
    # Load settings from the configuration mapping
    config_class = config_map.get(config_name, config_map["development"])
    app.config.from_object(config_class)
    
    # Initialize extensions with the application instance
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)
    
    # Configure CORS (restricted to /api/* with settings-defined allowed origins)
    origins = app.config.get("ALLOWED_ORIGINS", "*")
    if isinstance(origins, str) and origins != "*":
        origins = [orig.strip() for orig in origins.split(",")]
    cors.init_app(app, resources={r"/api/*": {"origins": origins}})
    
    # Register error handlers
    register_error_handlers(app)

    @app.route("/api/v1/health", methods=["GET"])
    def health():
        """Health check endpoint for Audicore."""
        return {"status": "ok", "version": "1.0.0"}
    
    # Import and register blueprints inside to prevent circular import issues
    from app.api.v1.auth import auth_bp
    from app.api.v1.songs import songs_bp
    from app.api.v1.albums import albums_bp
    from app.api.v1.artists import artists_bp
    from app.api.v1.playlists import playlists_bp
    from app.api.v1.search import search_bp
    from app.api.v1.stream import stream_bp
    from app.api.v1.views import views_bp
    
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(songs_bp, url_prefix="/api/v1/songs")
    app.register_blueprint(albums_bp, url_prefix="/api/v1/albums")
    app.register_blueprint(artists_bp, url_prefix="/api/v1/artists")
    app.register_blueprint(playlists_bp, url_prefix="/api/v1/playlists")
    app.register_blueprint(search_bp, url_prefix="/api/v1/search")
    app.register_blueprint(stream_bp, url_prefix="/api/v1/stream")
    app.register_blueprint(views_bp, url_prefix="/")
    
    with app.app_context():
        db.create_all()
        
    return app
