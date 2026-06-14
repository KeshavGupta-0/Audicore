# Audicore - A Modern Music Streaming Platform

**Audicore** is a premium, high-performance music streaming web application. Built with a Flask REST API backend and a fully custom, dynamic React single-page application (SPA) frontend, it delivers a seamless, modern listening experience. It features secure JWT authentication, real-time search, dynamic library management, and breathtaking dark-mode micro-animations.

---

## 🚀 Key Features

* **Modern Single-Page Application (SPA)**: Built entirely in React for a lightning-fast, zero-refresh browsing experience.
* **Custom Audio Engine**: High-fidelity HTML5 audio streaming with robust queue management, track scrubbing, volume control, and continuous background play.
* **Secure Authentication**: Secure password hashing with Werkzeug and session tracking utilizing JWT tokens (`Flask-JWT-Extended`).
* **Robust Backend**: Fully decoupled Python Repository-Service-Model architecture providing clean, scalable business logic.
* **Intelligent Search**: Real-time, debounced case-insensitive queries across tracks, artists, and albums.
* **Database Migrations**: Managed via Flask-Migrate (Alembic) to keep the MySQL database perfectly synchronized with SQLAlchemy models.
* **Production Ready**: Configured with `Flask-Limiter` for rate limiting and `gunicorn` for robust WSGI deployment.

---

## 🛠️ Step-by-Step Local Setup

Follow these steps to run the Audicore application on your local machine:

### 1. Prerequisites
Ensure you have the following installed:
* [Python 3.8+](https://www.python.org/downloads/)
* A local or cloud MySQL Server (e.g., TiDB, Aiven, or local MySQL Workbench)

### 2. Environment Setup
Copy the provided `.env.example` file to create your `.env` configuration file:
```bash
cp .env.example .env
```
Open the `.env` file and customize the credentials to match your MySQL or TiDB cloud server:
```ini
FLASK_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=audicore_prod
```

### 3. Install Dependencies
Activate your virtual environment and install the required Python packages:
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Build the Database (Migrations)
Audicore uses Alembic to automatically generate your database tables. Run the following command to construct the schema:
```bash
flask db upgrade
```

### 5. Launch the Server
Start the Flask development server:
```bash
python run.py
```
👉 **Visit `http://localhost:5000`** in your browser to experience Audicore!

---

## ☁️ Deployment (Render)

Audicore is completely ready to be deployed to [Render.com](https://render.com/).

1. Push this repository to GitHub.
2. In Render, create a new **Web Service** and connect your repository.
3. Set the **Build Command**:
   ```bash
   pip install -r requirements.txt && flask db upgrade
   ```
4. Set the **Start Command**:
   ```bash
   gunicorn -w 4 run:app
   ```
5. Add your Environment Variables (`FLASK_ENV`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`) matching your cloud database provider.
6. Deploy!

---

## 📁 Project Structure

```text
Audicore/
├── app/
│   ├── api/v1/          # RESTful API Endpoints (auth, songs, search, playlists)
│   ├── middleware/      # JWT decorators and request interceptors
│   ├── models/          # SQLAlchemy Database Models
│   ├── repositories/    # Database query abstraction layer
│   ├── services/        # Core business logic
│   ├── utils/           # Helper functions (audio duration parsing, error mapping)
│   └── __init__.py      # Application factory
├── config/
│   └── settings.py      # Environment-specific configuration & Rate Limiting
├── migrations/          # Alembic database migration versions
├── static/              # Public assets (Images, Logos)
├── templates/
│   └── index.html       # The Core React SPA interface
├── requirements.txt     # Python dependencies (including Gunicorn)
├── run.py               # WSGI Entry point
└── README.md
```
