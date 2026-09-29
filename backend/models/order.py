from datetime import datetime


class Order:
    def __init__(self, id=None, customer_name="", phone="", item_id=None, comment="", created_at=None):
        self.id = id
        self.customer_name = customer_name
        self.phone = phone
        self.item_id = item_id
        self.comment = comment
        self.created_at = created_at

    def to_json(self):
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
    def create_order_from_db(cls, row):
        return cls(
            id=row["id"],
            customer_name=row["customer_name"],
            phone=row["phone"],
            item_id=row["item_id"],
            comment=row.get("comment") or "",
            created_at=row.get("created_at"),
        )