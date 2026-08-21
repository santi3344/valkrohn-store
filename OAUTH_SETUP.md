# Configurar Google y Facebook

Los botones ya estan conectados al flujo OAuth. Para activarlos necesitas crear una aplicacion en cada proveedor y colocar las credenciales en un archivo `.env` dentro de esta carpeta.

## 1. Crear `.env`

Copia `.env.example` como `.env` y completa:

```env
FLASK_SECRET_KEY=una-clave-larga-y-privada
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
```

No compartas el archivo `.env` ni lo subas a GitHub.

## 2. Google Cloud

Crea un OAuth Client ID de tipo Web application y agrega:

```text
http://localhost:8000/api/auth/google/callback
```

Para Cloudflare agrega tambien `https://TU-DOMINIO.trycloudflare.com/api/auth/google/callback`.

## 3. Meta/Facebook

Agrega Facebook Login y registra:

```text
http://localhost:8000/api/auth/facebook/callback
```

Para Cloudflare agrega tambien `https://TU-DOMINIO.trycloudflare.com/api/auth/facebook/callback`.

## 4. Reiniciar Flask

```powershell
.venv\Scripts\python.exe app.py
```

Al volver de Google o Facebook, la cuenta se guardara en `valkrohn.users` con `provider` y `provider_id`. Los secretos no se guardan en MySQL.
