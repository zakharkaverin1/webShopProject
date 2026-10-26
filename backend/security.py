"""Безопасность: пароль администратора, ограничение попыток, CSRF, заголовки.

Хеш пароля создаётся командой:
    python security.py hash
и записывается в переменную окружения ADMIN_PASSWORD_HASH.
"""
import getpass
import hmac
import logging
import os
import secrets
import sys
import threading
import time
from collections import defaultdict, deque
from urllib.parse import urlsplit

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

_hasher = PasswordHasher()

CSRF_HEADER = "X-CSRF-Token"
UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
MAX_PASSWORD_LENGTH = 256


class AdminPassword:
    """Проверяет пароль по argon2-хешу.

    Если задан только старый ADMIN_PASSWORD (открытым текстом), он хешируется
    при запуске, чтобы проверка шла одним путём, и пишется предупреждение.
    """

    def __init__(self, password_hash, plain_password):
        if password_hash:
            self._hash = password_hash
        elif plain_password:
            logging.warning(
                "ADMIN_PASSWORD задан открытым текстом. Создайте хеш командой "
                "`python security.py hash` и замените его на ADMIN_PASSWORD_HASH."
            )
            self._hash = _hasher.hash(plain_password)
        else:
            raise RuntimeError("ADMIN_PASSWORD_HASH is not configured")
        # битый хеш лучше обнаружить при запуске, а не при первом входе
        try:
            _hasher.verify(self._hash, "")
        except InvalidHashError:
            raise RuntimeError("ADMIN_PASSWORD_HASH is not a valid argon2 hash")
        except VerificationError:
            pass

    def verify(self, password):
        if not isinstance(password, str) or not password or len(password) > MAX_PASSWORD_LENGTH:
            return False
        try:
            return _hasher.verify(self._hash, password)
        except VerificationError:
            return False


class RateLimiter:
    """Не больше `limit` событий за `window` секунд на ключ (обычно IP).

    Хранится в памяти процесса: при нескольких воркерах gunicorn у каждого
    свой счётчик, поэтому реальный лимит умножается на число воркеров.
    """

    def __init__(self, limit, window):
        self.limit = limit
        self.window = window
        self._events = defaultdict(deque)
        self._lock = threading.Lock()

    def _prune(self, key, now):
        events = self._events[key]
        while events and events[0] <= now - self.window:
            events.popleft()
        if not events:
            del self._events[key]
        return events

    def retry_after(self, key):
        """Сколько секунд ждать; 0 — можно."""
        now = time.monotonic()
        with self._lock:
            events = self._prune(key, now)
            if len(events) < self.limit:
                return 0
            return int(events[0] + self.window - now) + 1

    def hit(self, key):
        with self._lock:
            self._events[key].append(time.monotonic())

    def reset(self, key):
        with self._lock:
            self._events.pop(key, None)


def csrf_token(session):
    token = session.get("csrf_token")
    if not token:
        token = secrets.token_urlsafe(32)
        session["csrf_token"] = token
    return token


def csrf_valid(session, header_value):
    token = session.get("csrf_token")
    return bool(token and header_value) and hmac.compare_digest(token, header_value)


def same_origin(request, allowed_origins):
    """Запрос пришёл со страниц этого же сайта (или разрешённого dev-адреса).

    Браузеры присылают Origin во всех POST/PUT/DELETE через fetch; если его нет,
    смотрим Referer. Нет обоих — это не браузер, CSRF тут невозможен.
    """
    source = request.headers.get("Origin") or request.headers.get("Referer")
    if not source:
        return True
    parts = urlsplit(source)
    origin = f"{parts.scheme}://{parts.netloc}"
    if origin == request.host_url.rstrip("/"):
        return True
    return any(pattern.fullmatch(origin) for pattern in allowed_origins)


# сигнатуры начала файла: расширению и Content-Type доверять нельзя
_IMAGE_SIGNATURES = {
    "jpeg": (b"\xff\xd8\xff",),
    "png": (b"\x89PNG\r\n\x1a\n",),
    "gif": (b"GIF87a", b"GIF89a"),
}


def image_kind(file):
    """Возвращает тип картинки по содержимому файла или None."""
    head = file.stream.read(16)
    file.stream.seek(0)
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    for kind, signatures in _IMAGE_SIGNATURES.items():
        if head.startswith(signatures):
            return kind
    return None


def security_headers(response, is_https):
    headers = response.headers
    headers.setdefault("X-Content-Type-Options", "nosniff")
    headers.setdefault("X-Frame-Options", "DENY")
    headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if is_https:
        headers.setdefault("Strict-Transport-Security", "max-age=31536000")
    return response


if __name__ == "__main__":
    if sys.argv[1:] != ["hash"]:
        sys.exit("Использование: python security.py hash")
    password = getpass.getpass("Новый пароль администратора: ")
    if len(password) < 12:
        sys.exit("Пароль должен быть не короче 12 символов")
    if password != getpass.getpass("Повторите пароль: "):
        sys.exit("Пароли не совпадают")
    print(_hasher.hash(password))
