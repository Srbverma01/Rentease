# RentEase

RentEase is a Django + React rental catalog application with JWT auth, profile management, checkout, order history, and password reset flows.

## Local setup

1. Create and activate a Python virtual environment.
2. Install backend dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and adjust the values you need.
4. Install frontend dependencies in `rentease-frontend` with `npm install`.
5. Run `python manage.py migrate`.
6. Start Django with `python manage.py runserver`.
7. For frontend development, start React with `npm start` inside `rentease-frontend`.

The React dev server proxies API and media requests to Django. When you build the frontend, Django can serve the compiled app on the same origin.

## Production checklist

1. Set `DJANGO_DEBUG=False`.
2. Set a real `DJANGO_SECRET_KEY`.
3. Configure `APP_URL`, `FRONTEND_URL`, `DJANGO_ALLOWED_HOSTS`, and any CORS/CSRF origins you need.
4. Configure a real SMTP backend for password reset emails.
5. Build the frontend with `npm run build` in `rentease-frontend`.
6. Run `python manage.py collectstatic --noinput`.
7. Run `python manage.py migrate --noinput`.
8. Serve Django behind HTTPS with a production web server or platform runtime.

## Docker deployment

This repo now includes a production Docker setup that builds the React frontend and serves it through Django.

1. Build the image from the project root:
   `docker build -t rentease .`
2. Start the container with your production environment variables:
   `docker run -p 8000:8000 --env-file .env rentease`
3. Open the app on the public URL you configured in `APP_URL` and `FRONTEND_URL`.

The container startup automatically runs:

- `python manage.py migrate --noinput`
- `python manage.py collectstatic --noinput`
- `gunicorn rentease.wsgi:application --bind 0.0.0.0:8000`

### Recommended deployment settings

- Use `DATABASE_URL` when your host gives you a PostgreSQL connection string.
- Keep `REACT_APP_API_BASE_URL` empty for same-origin deployments where Django serves the frontend build.
- `DJANGO_SERVE_MEDIA=True` lets Django serve uploaded product images in a simple single-service deployment.
- For long-term production, use persistent storage for `media/` or move uploads to object storage.

## Notes

- Static files are collected into `staticfiles/`.
- The app defaults to SQLite, but `DATABASE_URL` is preferred in deployment. `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, and `DB_PORT` are also supported.
- Password reset links always use `FRONTEND_URL`, so set that to the public frontend origin before deployment.
