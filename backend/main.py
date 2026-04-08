from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import random

app = Flask(__name__)
CORS(app)


def init_db():
    conn = sqlite3.connect('shop.db')
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
    conn.close()


init_db()


# добавить товар
@app.route('/api/products', methods=['POST'])
def add_product():
    title = request.form.get('itemTitle')
    price = request.form.get('itemPrice')
    description = request.form.get('itemDescription')
    files = request.files.getlist('itemImages')
    image_paths = []
    for file in files:
        format = file.filename.split('.')[-1]
        name = generate_random_name()
        filename = f"{name}.{format}"
        filepath = f"images/{filename}"
        file.save(filepath)
        image_paths.append(f"/{filepath}")

    images_str = ','.join(image_paths)
    conn = sqlite3.connect('shop.db')
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO products (title, price, description, images) VALUES (?, ?, ?, ?)',
        (title, price, description, images_str))
    conn.commit()
    product_id = cursor.lastrowid
    conn.close()

    return jsonify({
        'id': product_id,
        'itemTitle': title,
        'itemPrice': price,
        'itemDescription': description,
        'itemImages': image_paths
    }), 201


def generate_random_name():
    symbols = "qwertyuiopasdfghjklzxcvbnm1234567890"
    name = ''
    for i in range(random.randint(10, 16)):
        index = random.randint(0, len(symbols) - 1)
        name += symbols[index]
    return name


if __name__ == '__main__':
    app.run(port=8000, debug=True)
