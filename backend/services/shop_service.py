import sqlite3

from config import DATABASE_PATH, IMAGES_DIR
from models.product import Product
from services.image_service import ImageService


class ShopService:
    """Сервис для работы с товарами"""
    def __init__(self):
        self.db = DATABASE_PATH
        self.image_service = ImageService(IMAGES_DIR)
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db)

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    price TEXT NOT NULL,
                    description TEXT NOT NULL,
                    images TEXT
                )
            ''')
            conn.commit()

    def get_all_products(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM products')
            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]
            return [Product.create_product_from_db(row, columns) for row in rows]

    def add_product(self, title, price, description, files):
        """Добавляет товар"""
        saved_images = self.image_service.save_images(files)
        images_str = self.image_service.images_to_string(saved_images)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO products (title, price, description, images) VALUES (?, ?, ?, ?)',
                (title, price, description, images_str)
            )
            product_id = cursor.lastrowid
            conn.commit()

        return Product(
            id=product_id,
            title=title,
            price=price,
            description=description,
            images=saved_images
        )

    def delete_product(self, product_id):
        """Удаляет товар"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT images FROM products WHERE id = ?', (product_id,))
            row = cursor.fetchone()

            if not row:
                return False

            images_list = self.image_service.get_images_from_string(row[0])
            self.image_service.delete_images(images_list)
            cursor.execute('DELETE FROM products WHERE id = ?', (product_id,))
            conn.commit()
            return True

    def update_product(self, product_id, title, price, description):
        """Обновляет данные товара (без картинок)"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'UPDATE products SET title = ?, price = ?, description = ? WHERE id = ?',
                (title, price, description, product_id)
            )
            conn.commit()
            return True

    def add_images_to_product(self, product_id, files):
        """Добавляет новые картинки к товару"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT images FROM products WHERE id = ?', (product_id,))
            row = cursor.fetchone()

            if not row:
                return None

            existing = self.image_service.get_images_from_string(row[0])
            new_images = self.image_service.save_images(files)
            all_images = existing + new_images

            images_str = self.image_service.images_to_string(all_images)
            cursor.execute(
                'UPDATE products SET images = ? WHERE id = ?',
                (images_str, product_id)
            )
            conn.commit()
            return all_images

    def replace_product_image(self, product_id, image_index, new_file):
        """Заменяет картинку по индексу"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT images FROM products WHERE id = ?', (product_id,))
            row = cursor.fetchone()

            if not row or not row[0]:
                return None

            images = self.image_service.get_images_from_string(row[0])

            if image_index >= len(images):
                return None

            old_path = images[image_index]
            new_path = self.image_service.replace_image(old_path, new_file)
            if new_path is None:
                return None
            images[image_index] = new_path
            images_str = self.image_service.images_to_string(images)
            cursor.execute(
                'UPDATE products SET images = ? WHERE id = ?',
                (images_str, product_id)
            )
            conn.commit()
            return new_path

    def delete_product_image(self, product_id, image_index):
        """Удаляет картинку по индексу"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT images FROM products WHERE id = ?', (product_id,))
            row = cursor.fetchone()

            if not row or not row[0]:
                return False

            images = self.image_service.get_images_from_string(row[0])

            if image_index >= len(images):
                return False

            self.image_service.delete_images([images[image_index]])
            images.pop(image_index)

            images_str = self.image_service.images_to_string(images)
            cursor.execute(
                'UPDATE products SET images = ? WHERE id = ?',
                (images_str, product_id)
            )
            conn.commit()
            return True