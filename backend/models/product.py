class Product:
    """Создание модели товара"""

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
        """Товар в json"""
        return {
            'id': self.id,
            'title': self.title,
            'price': self.price,
            'description': self.description,
            'images': self.images,
            'category_id': self.category_id
        }

    @classmethod
    def create_product_from_db(cls, row, column):
        """Создать продукт из строки в БД"""
        data = dict(zip(column, row))

        images_str = data.get('images', '')
        images = images_str.split(',') if images_str else []

        return cls(
            id=data['id'],
            title=data['title'],
            price=data['price'],
            description=data['description'],
            images=images,
            category_id=data.get('category_id')
        )