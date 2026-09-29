import logging
import os
import uuid
from config import IMAGES_DIR


class ImageService:
    def __init__(self, upload_folder=IMAGES_DIR):
        self.upload_folder = str(upload_folder)
        os.makedirs(self.upload_folder, exist_ok=True)

    def save_images(self, files):
        paths = []
        for file in files:
            if not file or not file.filename:
                continue
            if "." in file.filename:
                image_format = file.filename.rsplit(".", 1)[1].lower()
            else:
                image_format = "jpg"
            filename = f"{uuid.uuid4()}.{image_format}"
            filepath = os.path.join(self.upload_folder, filename)
            file.save(filepath)
            paths.append(f"/images/{filename}")
            logging.info("Сохранён файл %s", filepath)

        return paths

    def delete_images(self, image_paths):
        for image_path in image_paths:
            if not image_path:
                continue
            filename = os.path.basename(image_path)
            filepath = os.path.join(self.upload_folder, filename)
            if os.path.exists(filepath):
                os.remove(filepath)
                logging.info("Удалён файл %s", filepath)
            else:
                logging.warning(
                    "Не найден файл: %s (исходный путь: %s)",
                    filepath,
                    image_path,
                )

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