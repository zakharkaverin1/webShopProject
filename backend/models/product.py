class Product:
    def __init__(
        self,
        id=None,
        title="",
        price="",
        description="",
        images=None,
        category_id=None
    ):
        self.id = id
        self.title = title
        self.price = price
        self.description = description
        self.images = images if images is not None else []
        self.category_id = category_id

    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'price': self.price,
            'description': self.description,
            'images': self.images,
            'category_id': self.category_id
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
        )