from config import IMAGES_DIR
from db import connect
from models.product import Product
from services.image_service import ImageService


class ShopService:
    def __init__(self):
        self.image_service = ImageService(IMAGES_DIR)

    def get_all_products(self):
        with connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM products")
            rows = cursor.fetchall()
            return [Product.create_product_from_db(row) for row in rows]

    def add_product(self, title, price, description, category_id, files):
        saved_images = self.image_service.save_images(files)
        images_str = self.image_service.images_to_string(saved_images)

        with connect() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO products
                    (title, price, description, images, category_id)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
                """,
                (title, price, description, images_str, category_id),)

            product_id = cursor.fetchone()["id"]
            conn.commit()

        return Product(
            id=product_id,
            title=title,
            price=price,
            description=description,
            images=saved_images,
            category_id=category_id,)

    def delete_product(self, product_id):
        with connect() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT images FROM products WHERE id = %s",
                (product_id,),)
            row = cursor.fetchone()

            if not row:
                return False

            images_list = self.image_service.get_images_from_string(row["images"])
            self.image_service.delete_images(images_list)

            cursor.execute(
                "DELETE FROM products WHERE id = %s",
                (product_id,),)
            conn.commit()
            return True

    def update_product(self, product_id, title, price, description, category_id):
        with connect() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE products
                SET title = %s, price = %s, description = %s, category_id = %s
                WHERE id = %s
                """,
                (title, price, description, category_id, product_id),)
            conn.commit()
            return True

    def add_images_to_product(self, product_id, files):
        with connect() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT images FROM products WHERE id = %s",
                (product_id,),)
            row = cursor.fetchone()

            if not row:
                return None

            existing = self.image_service.get_images_from_string(row["images"])
            new_images = self.image_service.save_images(files)
            all_images = existing + new_images

            images_str = self.image_service.images_to_string(all_images)
            cursor.execute(
                "UPDATE products SET images = %s WHERE id = %s",
                (images_str, product_id),)
            conn.commit()
            return all_images

    def replace_product_image(self, product_id, image_index, new_file):
        with connect() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT images FROM products WHERE id = %s",
                (product_id,),)
            row = cursor.fetchone()

            if not row or not row["images"]:
                return None

            images = self.image_service.get_images_from_string(row["images"])

            if image_index >= len(images):
                return None

            old_path = images[image_index]
            new_path = self.image_service.replace_image(old_path, new_file)
            if new_path is None:
                return None

            images[image_index] = new_path
            images_str = self.image_service.images_to_string(images)
            cursor.execute(
                "UPDATE products SET images = %s WHERE id = %s",
                (images_str, product_id),)
            conn.commit()
            return new_path

    def delete_product_image(self, product_id, image_index):
        with connect() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT images FROM products WHERE id = %s",
                (product_id,),)
            row = cursor.fetchone()

            if not row or not row["images"]:
                return False

            images = self.image_service.get_images_from_string(row["images"])

            if image_index >= len(images):
                return False

            self.image_service.delete_images([images[image_index]])
            images.pop(image_index)

            images_str = self.image_service.images_to_string(images)
            cursor.execute(
                "UPDATE products SET images = %s WHERE id = %s",
                (images_str, product_id),)
            conn.commit()
            return True

    def get_all_categories(self):
        with connect() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM categories ORDER BY name")
            return cursor.fetchall()

    def add_category(self, name):
        with connect() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO categories (name)
                VALUES (%s)
                RETURNING id
                """,
                (name,),)

            category_id = cursor.fetchone()["id"]
            conn.commit()
            return category_id

    def delete_category(self, category_id):
        with connect() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT COUNT(*) FROM products WHERE category_id = %s",
                (category_id,),)
            if cursor.fetchone()["count"] > 0:
                return False

            cursor.execute(
                "DELETE FROM categories WHERE id = %s",
                (category_id,),)
            conn.commit()
            return cursor.rowcount > 0