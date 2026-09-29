import logging

from db import connect
from models.order import Order


class OrderService:
    def create_order(self, customer_name, phone, item_id, comment=""):
        try:
            with connect() as connection:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        INSERT INTO orders
                            (customer_name, phone, item_id, comment)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id, customer_name, phone, item_id, comment, created_at
                        """,
                        (customer_name, phone, item_id, comment),
                    )

                    row = cursor.fetchone()

            return Order.create_order_from_db(row)

        except Exception as error:
            logging.error(f"Failed to create order: {error}")
            return None

    def delete_order(self, order_id):
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM orders WHERE id = %s",
                    (order_id,),
                )

                return cursor.rowcount > 0

    def get_all_orders(self):
        with connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, customer_name, phone, item_id, comment, created_at
                    FROM orders
                    ORDER BY created_at DESC
                    """
                )
                rows = cursor.fetchall()

        return [
            Order.create_order_from_db(row)
            for row in rows
        ]