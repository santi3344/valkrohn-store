import os
import secrets
from decimal import Decimal
from pathlib import Path
from urllib.parse import unquote, urlparse

import mysql.connector
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.middleware.proxy_fix import ProxyFix

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "valkrohn-development-key")

def database_config():
    configured_host = os.getenv("MYSQL_HOST", "")
    configured_port = os.getenv("MYSQL_PORT", "")
    public_url = os.getenv("MYSQL_PUBLIC_URL") or os.getenv("MYSQL_URL", "")
    if not public_url and "://" in configured_host:
        public_url = configured_host
    if not public_url and "://" in configured_port:
        public_url = configured_port
    parsed_url = urlparse(public_url) if public_url else None
    parsed_port = parsed_url.port if parsed_url else None
    try:
        port = parsed_port or (int(configured_port) if configured_port and "://" not in configured_port else 3306)
    except ValueError:
        port = parsed_port or 3306
    return {
        "host": (parsed_url.hostname if parsed_url else configured_host) or "127.0.0.1",
        "port": port,
        "user": os.getenv("MYSQL_USER") or (unquote(parsed_url.username) if parsed_url and parsed_url.username else "root"),
        "password": os.getenv("MYSQL_PASSWORD") or (unquote(parsed_url.password) if parsed_url and parsed_url.password else ""),
        "database": os.getenv("MYSQL_DATABASE") or (parsed_url.path.lstrip("/") if parsed_url and parsed_url.path else "valkrohn"),
        "connection_timeout": int(os.getenv("MYSQL_CONNECT_TIMEOUT", "10")),
    }


DB_CONFIG = database_config()

OAUTH_CONFIG = {
    "google": {
        "client_id": os.getenv("GOOGLE_CLIENT_ID", ""),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", ""),
        "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "profile_url": "https://openidconnect.googleapis.com/v1/userinfo",
        "scope": "openid email profile",
    },
    "facebook": {
        "client_id": os.getenv("FACEBOOK_CLIENT_ID", ""),
        "client_secret": os.getenv("FACEBOOK_CLIENT_SECRET", ""),
        "authorize_url": "https://www.facebook.com/v20.0/dialog/oauth",
        "token_url": "https://graph.facebook.com/v20.0/oauth/access_token",
        "profile_url": "https://graph.facebook.com/me?fields=id,name,email",
        "scope": "email,public_profile",
    },
}


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)


def json_value(value):
    if isinstance(value, Decimal):
        return float(value)
    return value


def oauth_redirect_uri(provider):
    return f"{request.host_url.rstrip('/')}/api/auth/{provider}/callback"


@app.get("/api/auth/<provider>/start")
def oauth_start(provider):
    config = OAUTH_CONFIG.get(provider)
    if not config or not config["client_id"] or not config["client_secret"]:
        return jsonify({"error": f"El acceso con {provider.title()} aún no está configurado."}), 503
    from urllib.parse import urlencode
    params = {
        "client_id": config["client_id"],
        "redirect_uri": oauth_redirect_uri(provider),
        "response_type": "code",
        "scope": config["scope"],
        "state": secrets.token_urlsafe(24),
    }
    session[f"oauth_state_{provider}"] = params["state"]
    return jsonify({"url": f"{config['authorize_url']}?{urlencode(params)}"})


@app.get("/api/auth/<provider>/callback")
def oauth_callback(provider):
    config = OAUTH_CONFIG.get(provider)
    if not config:
        return "Proveedor no válido", 404
    code = request.args.get("code")
    if not code or request.args.get("error"):
        return "No se pudo completar el acceso social. Puedes cerrar esta ventana.", 400
    state = request.args.get("state")
    if not state or state != session.pop(f"oauth_state_{provider}", None):
        return "La sesión OAuth no es válida. Vuelve a intentarlo.", 400
    try:
        token_response = requests.post(config["token_url"], data={
            "client_id": config["client_id"],
            "client_secret": config["client_secret"],
            "code": code,
            "redirect_uri": oauth_redirect_uri(provider),
            "grant_type": "authorization_code",
        }, timeout=10)
        token_response.raise_for_status()
        access_token = token_response.json().get("access_token")
        profile_response = requests.get(config["profile_url"], headers={"Authorization": f"Bearer {access_token}"}, timeout=10)
        profile_response.raise_for_status()
        profile = profile_response.json()
        provider_id = str(profile.get("id", ""))
        email = str(profile.get("email", f"{provider_id}@{provider}.local")).lower()
        name = profile.get("name", email.split("@")[0])
        picture_url = profile.get("picture")
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, name FROM users WHERE provider = %s AND provider_id = %s LIMIT 1", (provider, provider_id))
        user = cursor.fetchone()
        if not user:
            cursor.execute("SELECT id, name FROM users WHERE email = %s LIMIT 1", (email,))
            user = cursor.fetchone()
        if user:
            user_id = user["id"]
        else:
            cursor.execute("INSERT INTO users (name, email, password_hash, provider, provider_id) VALUES (%s, %s, %s, %s, %s)", (name, email, generate_password_hash(secrets.token_urlsafe(32)), provider, provider_id))
            user_id = cursor.lastrowid
        if provider == "google":
            cursor.execute(
                "INSERT INTO google_accounts (user_id, google_id, name, email, picture_url) VALUES (%s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), name = VALUES(name), email = VALUES(email), picture_url = VALUES(picture_url), synced_at = CURRENT_TIMESTAMP",
                (user_id, provider_id, name, email, picture_url),
            )
        elif provider == "facebook":
            cursor.execute(
                "INSERT INTO facebook_accounts (user_id, facebook_id, name, email, picture_url) VALUES (%s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), name = VALUES(name), email = VALUES(email), picture_url = VALUES(picture_url), connected_at = CURRENT_TIMESTAMP",
                (user_id, provider_id, name, email, picture_url),
            )
        connection.commit()
        session["user_id"] = user_id
        session["user_name"] = name
        return '<script>window.location.replace("/checkout.html");</script>'
    except (requests.RequestException, mysql.connector.Error, ValueError) as error:
        return f"No se pudo completar el acceso con {provider.title()}: {error}", 503
    except Exception:
        app.logger.exception("Unexpected OAuth callback error for %s", provider)
        return f"No se pudo completar el acceso con {provider.title()}.", 503
    finally:
        if "cursor" in locals() and cursor:
            cursor.close()
        if "connection" in locals() and connection and connection.is_connected():
            connection.close()


@app.post("/api/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if len(name) < 2 or "@" not in email or len(password) < 6:
        return jsonify({"error": "Completa nombre, correo válido y contraseña de al menos 6 caracteres."}), 400

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
            (name, email, generate_password_hash(password)),
        )
        connection.commit()
        session["user_id"] = cursor.lastrowid
        session["user_name"] = name
        return jsonify({"ok": True, "name": name}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Ese correo ya está registrado."}), 409
    except mysql.connector.Error as error:
        return jsonify({"error": "No se pudo crear la cuenta.", "details": str(error)}), 503
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, name, password_hash FROM users WHERE email = %s LIMIT 1", (email,))
        user = cursor.fetchone()
        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Correo o contraseña incorrectos."}), 401
        session["user_id"] = user["id"]
        session["user_name"] = user["name"]
        return jsonify({"ok": True, "name": user["name"]})
    except mysql.connector.Error as error:
        return jsonify({"error": "No se pudo consultar la cuenta.", "details": str(error)}), 503
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.get("/api/health")
def health():
    connection = None
    try:
        connection = get_connection()
        return jsonify({"ok": True, "database": "connected"})
    except mysql.connector.Error as error:
        return jsonify({"ok": False, "database": "unavailable", "error": str(error)}), 503
    finally:
        if connection and connection.is_connected():
            connection.close()


@app.get("/api/products")
def products():
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, name, category, price, image, description FROM products WHERE active = TRUE ORDER BY id")
        rows = cursor.fetchall()
        return jsonify([{key: json_value(value) for key, value in row.items()} for row in rows])
    except mysql.connector.Error as error:
        return jsonify({"error": "No se pudieron cargar los productos.", "details": str(error)}), 503
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.post("/api/orders")
def create_order():
    data = request.get_json(silent=True) or {}
    required = ["name", "email", "phone", "address", "city", "zip", "total", "items"]
    missing = [field for field in required if not data.get(field)]
    if missing or not isinstance(data.get("items"), list) or not data["items"]:
        return jsonify({"error": "Faltan datos obligatorios del pedido."}), 400

    try:
        total = Decimal(str(data["total"]))
        if total <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "El total del pedido no es valido."}), 400

    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        order_number = f"VK-{secrets.token_hex(3).upper()}"
        cursor.execute(
            "INSERT INTO orders (order_number, customer_name, email, phone, address, city, postal_code, total) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (order_number, data["name"], data["email"], data["phone"], data["address"], data["city"], data["zip"], total),
        )
        order_id = cursor.lastrowid
        for item in data["items"]:
            cursor.execute(
                "INSERT INTO order_items (order_id, product_id, product_name, size, quantity, unit_price) VALUES (%s, %s, %s, %s, %s, %s)",
                (order_id, item.get("productId"), item.get("name", "Producto"), item.get("size", "Unica"), int(item.get("quantity", 1)), Decimal(str(item.get("price", 0)))),
            )
        connection.commit()
        return jsonify({"ok": True, "orderNumber": order_number, "total": float(total)}), 201
    except (mysql.connector.Error, ValueError, TypeError) as error:
        if connection:
            connection.rollback()
        return jsonify({"error": "No se pudo guardar el pedido.", "details": str(error)}), 503
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


@app.get("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8000")), debug=False)
