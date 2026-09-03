#!/bin/sh
set -eu

python <<'PY'
import os
import sys
import time
from urllib.parse import urlparse

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rentease.settings")

import django
from django.db import connections
from django.db.utils import OperationalError

django.setup()

database_url = os.environ.get("DATABASE_URL", "").strip()

if database_url:
    parsed = urlparse(database_url)
    host = parsed.hostname
    port = parsed.port or 5432

    if not host:
        sys.exit("DATABASE_URL does not contain a database host.")

    if host in {"hostname", "example.com"}:
        sys.exit(
            "DATABASE_URL still contains a placeholder host. "
            "Use the Render Postgres Internal Database URL instead."
        )

    print(f"Checking database host: {host}:{port}")

    for attempt in range(1, 31):
        try:
            with connections["default"].cursor() as cursor:
                cursor.execute("SELECT 1")
            print("Database connection ready.")
            break
        except OperationalError as exc:
            if attempt == 30:
                sys.exit(
                    "Database connection failed. On Render, make sure DATABASE_URL uses "
                    "the Postgres Internal Database URL and that the web service and "
                    f"database are in the same region. Last error: {exc}"
                )

            print(f"Database is not ready yet ({attempt}/30): {exc}")
            time.sleep(2)
else:
    print("DATABASE_URL is not set; using Django's configured fallback database.")
PY

python manage.py migrate --noinput
python manage.py collectstatic --noinput
