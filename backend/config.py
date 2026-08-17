from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))

DATABASE_PATH = DATA_DIR / "shop.db"
IMAGES_DIR = DATA_DIR / "images"
CONFIG_PATH = DATA_DIR / "config.json"
ORDERS_PATH = DATA_DIR / "orders.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)