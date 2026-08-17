from datetime import datetime


class Order:
    """Модель заказа"""
    def __init__(self, id=None, customer_name="", phone="", item_id=None, comment="", created_at=None):
        self.id = id
        self.customer_name = customer_name
        self.phone = phone
        self.item_id = item_id
        self.comment = comment
        self.created_at = created_at

    def to_json(self):
        """Заказ в json"""
        created_at_str = self.created_at
        if isinstance(self.created_at, datetime):
            created_at_str = self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        return {
            'id': self.id,
            'customer_name': self.customer_name,
            'phone': self.phone,
            'item_id': self.item_id,
            'comment': self.comment,
            'created_at': created_at_str
        }

    @classmethod
    def create_order_from_db(cls, row, columns):
        """Создать заказ из строки в БД"""
        data = dict(zip(columns, row))

        return cls(
            id=data['id'],
            customer_name=data['customer_name'],
            phone=data['phone'],
            item_id=data['item_id'],
            comment=data.get('comment', ''),
            created_at=data.get('created_at')
        )