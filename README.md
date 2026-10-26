🇷🇺 [Русский](#русский) | 🇬🇧 [English](#english)

---

## Русский
# DEMO - https://webshopproject-e30v.onrender.com/
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

### Тестовые данные
Скрипт добавит категории (зеркало, вазы, панно, подсвечники, кашпо) и тестовые товары без фото. Повторный запуск дубликатов не создаёт.

   ```cd backend```

   ```python seed.py```

В Docker: ```docker compose exec app python seed.py```

### SEO и Яндекс
Сервер сам подставляет в страницы заголовки, описания, canonical, Open Graph и микроразметку schema.org (`backend/seo.py`), отдаёт `/robots.txt` и `/sitemap.xml`.
Адреса товаров — `/item/12-zerkalo-v-rame` (slug строится из названия); `/item/12` и адреса со старым slug отвечают 301-редиректом, несуществующий товар — 404.

Переменные окружения (все необязательные):
- `SITE_URL` — публичный адрес сайта, например `https://example.ru`. Используется в canonical, sitemap и robots; запросы на `http://` и `www.`-версию этого домена перенаправляются на него (301).
- `YANDEX_VERIFICATION` — код подтверждения из Яндекс.Вебмастера (метатег `yandex-verification`).
- `GOOGLE_SITE_VERIFICATION` — код подтверждения из Google Search Console.
- `YANDEX_METRIKA_ID` — номер счётчика Яндекс.Метрики. Без него счётчик не подключается.

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

## Безопасность

- **Пароль администратора** хранится как argon2-хеш в `ADMIN_PASSWORD_HASH`. Создать хеш:
  ```bash
  cd backend && python security.py hash
  ```
  В `.env` значение берите в **одинарные кавычки**, иначе Docker Compose съест символы `$`:
  `ADMIN_PASSWORD_HASH='$argon2id$v=19$...'`. Старый `ADMIN_PASSWORD` открытым текстом ещё работает, но пишет предупреждение в лог — удалите его после перехода на хеш.
- **`SECRET_KEY`** — не короче 32 символов: `python -c "import secrets; print(secrets.token_hex(32))"`. Смена ключа разлогинивает администратора.
- **Cookie сессии**: `HttpOnly`, `Secure`, `SameSite=Lax`, срок 8 часов. Для локальной разработки по http: `SESSION_COOKIE_SECURE=false`.
- **CSRF**: изменяющие запросы к `/api/` с чужих сайтов отклоняются (проверка `Origin`/`Referer`), действия администратора требуют заголовок `X-CSRF-Token`.
- **Ограничения**: 5 неудачных входов за 15 минут с одного IP, 10 заказов в час с одного IP. Счётчики в памяти процесса — при нескольких воркерах gunicorn лимит умножается на их число.
- **Загрузка картинок**: тип определяется по содержимому файла (JPEG, PNG, WebP, GIF), не по расширению.

## Пометки в коде

- `[ОПТ]` — оптимизация: новая строка или комментарий «удалено: …» на месте убранного кода.
- `[SEO]` — код для поисковиков: метатеги, ЧПУ-адреса, микроразметка, robots/sitemap, Метрика.
- `[БЕЗОП]` — код безопасности: пароль, cookie, CSRF, лимиты, проверка данных. Помечены и защиты, которые были в проекте раньше.

Если файл новый целиком, пометка стоит в его первой строке.

**Удалённые файлы** (комментарий внутри уже не оставить):
- `frontend/src/components/AddInput/` — обёртка над `<input>`, поля перешли в `ProductFields`.
- `frontend/src/components/AddImage/` — обёртка над `<input type="file">`, встроена в `AddForm`.
- `frontend/src/components/Field/` — обёртка над полем поиска, встроена в `NavBar` вместе со стилями.
- `frontend/src/components/ProductDetailsFields/` — заменён общим `ProductFields` (все поля товара).
- `frontend/public/assets/KenigArtikLogo.png` — картинка нигде не использовалась.
- `frontend/tsconfig.json` — в проекте нет TypeScript, Vite файл не читал.
- `frontend/README.md` — стандартный текст шаблона Vite.
