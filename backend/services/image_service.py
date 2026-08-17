import os
import uuid
import logging
from config import DATABASE_PATH, IMAGES_DIR


class ImageService:
    """Подсервис для работы с картинками"""
    def __init__(self, upload_folder=IMAGES_DIR):
        self.upload_folder = upload_folder
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

    def save_images(self, files):
        """Сохраняет картинки, возвращает список путей"""
        paths = []
        for file in files:
            if not file or not file.filename:
                continue
            if '.' in file.filename:
                image_format = file.filename.rsplit('.', 1)[1].lower()
            else:
                image_format = 'jpg'
            filename = f"{uuid.uuid4()}.{image_format}"
            filepath = os.path.join(
                self.upload_folder,
                filename
            )
            file.save(filepath)
            paths.append(f"/images/{filename}")
            logging.info(f"Сохранён файл {filepath}")

        return paths

    def delete_images(self, image_paths):
        """Удаляет картинки по списку путей"""
        for image_path in image_paths:
            if not image_path:
                continue
            filename = os.path.basename(image_path)
            filepath = os.path.join(str(IMAGES_DIR), filename)
            if os.path.exists(filepath):
                os.remove(filepath)
                logging.info(f"Удалён {filepath}")
            else:
                logging.warning(
                    f"Не найден файл: {filepath} "
                    f"(исходный путь: {image_path})"
                )

    def replace_image(self, old_image_path, new_file):
        """Заменяет одну картинку на другую"""
        if old_image_path:
            self.delete_images([old_image_path])
        if new_file and new_file.filename:
            paths = self.save_images([new_file])
            return paths[0] if paths else None
        return None

    def images_to_string(self, images_list):
        """Превращаем список адресов картинок в одну строку'"""
        if not images_list:
            return ''
        return ','.join(images_list)

    def get_images_from_string(self, images_str):
        """Превращаем строку с адресами картинок в список"""
        if not images_str:
            return []
        return images_str.split(',')