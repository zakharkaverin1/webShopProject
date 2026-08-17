import sqlite3
from config import ORDERS_PATH
from models.order import Order
from datetime import datetime


class OrderService:
    """Сервис для работы с заказами"""

    def __init__(self):
        self.db = ORDERS_PATH
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db)

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                       CREATE TABLE IF NOT EXISTS orders (
                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                           customer_name TEXT NOT NULL,
                           phone TEXT NOT NULL,
                           comment TEXT,
                           item_id INTEGER NOT NULL,
                           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                       )
                   ''')
            conn.commit()

    def create_order(self, customer_name, phone, item_id, comment=""):
        """Создать новый заказ"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                cursor.execute(
                    '''INSERT INTO orders 
                       (customer_name, phone, item_id, comment, created_at) 
                       VALUES (?, ?, ?, ?, ?)''',
                    (customer_name, phone, item_id, comment, current_time)
                )
                order_id = cursor.lastrowid
                conn.commit()
                return self.get_order_by_id(order_id)
        except Exception as e:
            return None

    def get_all_orders(self):
        """Получить все заказы"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT * FROM orders ORDER BY created_at DESC',
            )
            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]

            return [Order.create_order_from_db(row, columns) for row in rows]

    def delete_order(self, order_id):
        """Удалить заказ"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM orders WHERE id = ?', (order_id,))
            if cursor.rowcount > 0:
                conn.commit()
                return True
            return False
