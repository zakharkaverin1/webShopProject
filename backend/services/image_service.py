import logging
import mimetypes
import os
import uuid
import requests
from config import (IMAGES_DIR,
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    SUPABASE_BUCKET,
)


class ImageService:
    def __init__(self, upload_folder=IMAGES_DIR):
        self.upload_folder = str(upload_folder)
        self.use_supabase = bool(SUPABASE_URL and SUPABASE_SERVICE_KEY)
        if not self.use_supabase:
            os.makedirs(self.upload_folder, exist_ok=True)
            logging.warning("Supabase Storage is not configured")
    def _object_url(self, filename):
        return f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{filename}"

    def _headers(self, content_type=None):
        h = {
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "apikey": SUPABASE_SERVICE_KEY,
        }
        if content_type:
            h["Content-Type"] = content_type
        return h

    def save_images(self, files):
        paths = []
        for file in files:
            if not file or not file.filename:
                continue
            ext = file.filename.rsplit(".", 1)[1].lower() if "." in file.filename else "jpg"
            if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
                logging.warning("Skipped file with unsupported extension: %s", file.filename)
                continue
            filename = f"{uuid.uuid4()}.{ext}"

            if self.use_supabase:
                content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
                resp = requests.post(
                    self._object_url(filename),
                    headers=self._headers(content_type),
                    data=file.read(),
                    timeout=30,
                )
                resp.raise_for_status()
            else:
                file.save(os.path.join(self.upload_folder, filename))

            paths.append(f"/images/{filename}")
            logging.info("Saved file %s", filename)
        return paths

    def delete_images(self, image_paths):
        for image_path in image_paths:
            if not image_path:
                continue
            filename = os.path.basename(image_path)
            if self.use_supabase:
                resp = requests.delete(
                    self._object_url(filename),
                    headers=self._headers(),
                    timeout=30,
                )
                if resp.status_code >= 400:
                    logging.warning("Failed to delete %s: %s %s", filename, resp.status_code, resp.text)
                else:
                    logging.info("Deleted file %s", filename)
            else:
                filepath = os.path.join(self.upload_folder, filename)
                if os.path.exists(filepath):
                    os.remove(filepath)
                    logging.info("Deleted file %s", filepath)
                else:
                    logging.warning("File not found: %s", filepath)

    def replace_image(self, old_image_path, new_file):
        if old_image_path:
            self.delete_images([old_image_path])
        if new_file and new_file.filename:
            paths = self.save_images([new_file])
            return paths[0] if paths else None
        return None

    def images_to_string(self, images_list):
        if not images_list:
            return ""
        return ",".join(images_list)

    def get_images_from_string(self, images_str):
        if not images_str:
            return []
        return images_str.split(",")