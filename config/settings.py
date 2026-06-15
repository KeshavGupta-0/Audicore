import os
from datetime import timedelta
from urllib.parse import quote_plus

class BaseConfig:
    """Base configuration class with common settings."""
    # Core Flask settings
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    
    # JWT authentication settings
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-super-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # External API settings
    RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "")
    RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "youtube-mp36.p.rapidapi.com")
    
    # Database Configuration (MySQL using PyMySQL driver)
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "audicore")
    
    # URL-encode database password in case it contains special URL characters (e.g. '@')
    _encoded_password = quote_plus(DB_PASSWORD) if DB_PASSWORD else ""
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{_encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Connection Pool settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True
    }
    
    # Upload and media settings
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
    ALLOWED_AUDIO_EXTENSIONS = {"mp3", "flac", "wav", "ogg", "m4a"}
    MAX_AUDIO_SIZE_MB = 50
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # Flask limit (50 MB)
    
    # Pagination settings
    DEFAULT_PAGE_SIZE = 20
    
    # Rate Limiting configuration
    # Set to redis://localhost:6379 for production deployments
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_DEFAULT = "500 per day, 100 per hour"


class DevelopmentConfig(BaseConfig):
    """Development environment configuration."""
    DEBUG = True
    ENV = "development"


class TestingConfig(BaseConfig):
    """Testing environment configuration."""
    TESTING = True
    DEBUG = True
    ENV = "testing"
    # Use SQLite in-memory database for testing speed and isolation
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


class ProductionConfig(BaseConfig):
    """Production environment configuration."""
    DEBUG = False
    TESTING = False
    ENV = "production"
    
    # Ensure production environment enforces secure cookies/sessions if possible
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True


# Export mapping for easy config initialization
config_map = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig
}
