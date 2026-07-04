from dotenv import load_dotenv
import os
load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "hrms-serene-fallback-secret-key-2024")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "hrms_serene")
    DEBUG = os.getenv("DEBUG", "False") == "True"
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size