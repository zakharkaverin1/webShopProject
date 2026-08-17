class Product:
    """Создание модели твовара"""

    def __init__(self, id=None, title="", price="", description="", images=None):
        self.id = id
        self.title = title
        self.price = price
        self.description = description
        self.images = images if images is not None else []

    def to_json(self):
        """Товар в json"""
        return {
            'id': self.id,
            'title': self.title,
            'price': self.price,
            'description': self.description,
            'images': self.images
        }

    @classmethod
    def create_product_from_db(cls, row, column):
        """Создать продукт из строки в бд"""
        data = dict(zip(column, row))
        images_str = data.get('images', '')
        images = images_str.split(',') if images_str else []

        return cls(
            id=data['id'],
            title=data['title'],
            price=data['price'],
            description=data['description'],
            images=images
        )