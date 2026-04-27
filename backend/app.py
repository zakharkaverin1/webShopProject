import os
from dotenv import load_dotenv  # ДОБАВЛЕНО: для загрузки .env
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import random

load_dotenv()
app = Flask(__name__, static_folder='images', static_url_path='/images')
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

#проверить пароль для доступа к админке

@app.route('/api/verify-admin', methods=['POST'])
def verify_admin():
    try:
        data = request.json
        password = data.get('password')
        admin_password = os.getenv('ADMIN_PASSWORD')
        if not admin_password:
            admin_password = 'default_admin_password_123'

        if password and password == admin_password:
            return jsonify({
                'success': True,
                'message': 'Access allowed'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Incorrect password'
            }), 403

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

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


@app.route('/api/products', methods=['GET'])
def get_products():
    conn = sqlite3.connect('shop.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM products')
    products = cursor.fetchall()

    columns = [desc[0] for desc in cursor.description]
    result = []
    for product in products:
        product_dict = dict(zip(columns, product))
        if product_dict.get('images'):
            product_dict['images'] = product_dict['images'].split(',')
        else:
            product_dict['images'] = []
        result.append(product_dict)

    conn.close()
    return jsonify(result)


def generate_random_name():
    symbols = "qwertyuiopasdfghjklzxcvbnm1234567890"
    name = ''
    for i in range(random.randint(10, 16)):
        index = random.randint(0, len(symbols) - 1)
        name += symbols[index]
    return name


@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        conn = sqlite3.connect('shop.db')
        cursor = conn.cursor()
        cursor.execute('SELECT images FROM products WHERE id = ?', (product_id,))
        result = cursor.fetchone()

        if not result:
            conn.close()
            return jsonify({'error': 'Product not found'}), 404
        images_str = result[0]
        if images_str:
            for image_path in images_str.split(','):
                clean_path = image_path.lstrip('/')
                if os.path.exists(clean_path):
                    os.remove(clean_path)
        cursor.execute('DELETE FROM products WHERE id = ?', (product_id,))
        conn.commit()
        affected_rows = cursor.rowcount
        conn.close()

        if affected_rows == 0:
            return jsonify({'error': 'Product not found'}), 404

        return jsonify({'message': f'Product {product_id} deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=8000, debug=True)