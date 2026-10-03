from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = Path(
    os.getenv("DATA_DIR", BASE_DIR / "data")
)

IMAGES_DIR = DATA_DIR / "images"
CONFIG_PATH = DATA_DIR / "config.json"

SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").rstrip("/")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "product-images")
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not configured")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not configured")

if not ADMIN_PASSWORD:
    raise RuntimeError("ADMIN_PASSWORD is not configured")

DATA_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)