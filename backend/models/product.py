from decimal import Decimal

# available — в наличии, made_to_order — изготовим под заказ, sold — продано (единственный экземпляр)
PRODUCT_STATUSES = ("available", "made_to_order", "sold")


class Product:
    def __init__(
        self,
        id=None,
        title="",
        price="",
        description="",
        images=None,
        category_id=None,
        materials="",
        dimensions="",
        status="available",
    ):
        self.id = id
        self.title = title
        self.price = price
        self.description = description
        self.images = images if images is not None else []
        self.category_id = category_id
        self.materials = materials
        self.dimensions = dimensions
        self.status = status

    def to_json(self):
        price = self.price
        if isinstance(price, Decimal):
            price = float(price)
        return {
            'id': self.id,
            'title': self.title,
            'price': price,
            'description': self.description,
            'images': self.images,
            'category_id': self.category_id,
            'materials': self.materials,
            'dimensions': self.dimensions,
            'status': self.status,
        }

    @classmethod
    def create_product_from_db(cls, row):
        images_string = row.get("images") or ""
        images = images_string.split(",") if images_string else []

        return cls(
            id=row["id"],
            title=row["title"],
            price=row["price"],
            description=row["description"],
            images=images,
            category_id=row.get("category_id"),
            materials=row.get("materials") or "",
            dimensions=row.get("dimensions") or "",
            status=row.get("status") or "available",
        )
