import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables from .env file (if it exists)
load_dotenv()

# Determine the configuration environment (defaulting to 'development')
env_name = os.getenv("FLASK_ENV", "development")

# Create the application instance using the factory pattern
app = create_app(config_name=env_name)

if __name__ == "__main__":
    # Start the Flask built-in development server
    app.run(host="0.0.0.0", port=5000)
