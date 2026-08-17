🇷🇺 [Русский](#русский) | 🇬🇧 [English](#english)

---

## Русский

Full-stack интернет-магазин с React frontend и Flask backend.
Проект представляет собой full-stack приложение: работа с REST API, SQLite, загрузка изображений, CRUD-операции и Docker-контейнеризация.

### Возможности
- Просмотр товаров
- Добавление товаров
- Редактирование товаров
- Удаление товаров
- Загрузка изображений
- Точечная замена изображений товаров
- Хранение данных в SQLite
- REST API на Flask
- React frontend
- Docker-сборка frontend и backend
### Технологии
- React
- SCSS modules
- Python
- Flask
- SQLite
- Docker
- Gunicorn

### Запуск
## с Docker 
Проект использует многоэтапную сборку. Сначала запускается React, а после Flask и gunicorn
1) Клонируем репозиторий
   
  ``` git clone https://github.com/zakharkaverin1/webShopProject.git```

  ```cd webshopprojet```
  
2) Собираем проект

   ```docker build -t webshop .```
   
3) Локальный запуск

   ```docker run -p 5000:5000 -e PORT=5000 -v "${PWD}\backend\data:/app/backend/data" webshop```
   
   Приложение будет доступно по адресу: http://localhost:5000
   
## Без Docker 
1) Клонируем репозиторий

  ``` git clone https://github.com/zakharkaverin1/webShopProject.git```
  
  ```cd webShopProject```
  
2) Запуск бэкенда

   ```cd backend ```
   
   ```pip install -r requirements.txt```
   
   ```python app.py```
   
3) Запуск фронтенда
   
   ```cd ..```
   
   ```cd frontend```
   
   ```npm install```
   
   ```npm run dev```

### Структура
```
webShopProject/
├── backend/
│   ├── data/
│   │   ├── images/
│   │   ├── shop.db
│   │   └── config.json
│   ├── models/
│   ├── services/
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── Dockerfile
├── .dockerignore
└── .gitignore
```
## English
