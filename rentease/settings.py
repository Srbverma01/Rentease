import os
from datetime import timedelta
from pathlib import Path
from urllib.parse import urlparse

import dj_database_url
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_BUILD_DIR = BASE_DIR / 'rentease-frontend' / 'build'
FRONTEND_STATIC_DIR = FRONTEND_BUILD_DIR / 'static'

load_dotenv(BASE_DIR / '.env')


def get_env(name, default=None):
    return os.environ.get(name, default)


def get_bool_env(name, default=False):
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


def get_list_env(name, default=None):
    value = os.environ.get(name)
    if value is None:
        return list(default or [])
    return [item.strip() for item in value.split(',') if item.strip()]


def get_hostname_from_url(value):
    if not value:
        return None

    parsed = urlparse(value if '://' in value else f'https://{value}')
    return parsed.hostname


DEBUG = get_bool_env('DJANGO_DEBUG', True)

SECRET_KEY = get_env('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'dev-only-change-me-before-production'
    else:
        raise ImproperlyConfigured('DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is false.')

render_hostname = get_env('RENDER_EXTERNAL_HOSTNAME')
default_app_url = f'https://{render_hostname}' if render_hostname else 'http://127.0.0.1:8000'

APP_URL = get_env('APP_URL', default_app_url)
FRONTEND_URL = get_env('FRONTEND_URL', APP_URL)

default_allowed_hosts = ['127.0.0.1', 'localhost']
for candidate_url in (APP_URL, FRONTEND_URL, get_env('RENDER_EXTERNAL_HOSTNAME'), get_env('RAILWAY_PUBLIC_DOMAIN')):
    hostname = get_hostname_from_url(candidate_url)
    if hostname and hostname not in default_allowed_hosts:
        default_allowed_hosts.append(hostname)

ALLOWED_HOSTS = get_list_env('DJANGO_ALLOWED_HOSTS', default_allowed_hosts)

default_cors_origins = ['http://127.0.0.1:3000', 'http://localhost:3000']
for candidate_origin in (FRONTEND_URL, APP_URL):
    if candidate_origin and candidate_origin not in default_cors_origins:
        default_cors_origins.append(candidate_origin)

# Applications
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'core',
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS
CORS_ALLOW_ALL_ORIGINS = get_bool_env('DJANGO_CORS_ALLOW_ALL_ORIGINS', False)
CORS_ALLOWED_ORIGINS = get_list_env(
    'DJANGO_CORS_ALLOWED_ORIGINS',
    default_cors_origins if DEBUG else [],
)
CSRF_TRUSTED_ORIGINS = get_list_env(
    'DJANGO_CSRF_TRUSTED_ORIGINS',
    default_cors_origins if DEBUG else [],
)

ROOT_URLCONF = 'rentease.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [FRONTEND_BUILD_DIR],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'rentease.wsgi.application'

# Database
database_url = get_env('DATABASE_URL')
database_engine = get_env('DB_ENGINE', 'django.db.backends.sqlite3')

if database_url:
    DATABASES = {
        'default': dj_database_url.parse(
            database_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
elif database_engine == 'django.db.backends.sqlite3':
    DATABASES = {
        'default': {
            'ENGINE': database_engine,
            'NAME': get_env('DB_NAME', str(BASE_DIR / 'db.sqlite3')),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': database_engine,
            'NAME': get_env('DB_NAME', 'rentease'),
            'USER': get_env('DB_USER', ''),
            'PASSWORD': get_env('DB_PASSWORD', ''),
            'HOST': get_env('DB_HOST', 'localhost'),
            'PORT': get_env('DB_PORT', ''),
        }
    }

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Language
LANGUAGE_CODE = 'en-us'
TIME_ZONE = get_env('TIME_ZONE', 'UTC')
USE_I18N = True
USE_TZ = True

# Static
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [FRONTEND_STATIC_DIR] if FRONTEND_STATIC_DIR.exists() else []
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}
WHITENOISE_MAX_AGE = 31536000 if not DEBUG else 0

# Email
EMAIL_BACKEND = get_env(
    'DJANGO_EMAIL_BACKEND',
    'django.core.mail.backends.console.EmailBackend' if DEBUG else 'django.core.mail.backends.smtp.EmailBackend',
)
EMAIL_HOST = get_env('EMAIL_HOST', 'localhost')
EMAIL_PORT = int(get_env('EMAIL_PORT', '25'))
EMAIL_HOST_USER = get_env('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = get_env('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = get_bool_env('EMAIL_USE_TLS', False)
EMAIL_USE_SSL = get_bool_env('EMAIL_USE_SSL', False)
DEFAULT_FROM_EMAIL = get_env('DEFAULT_FROM_EMAIL', 'noreply@rentease.local')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Security
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = get_bool_env('DJANGO_SECURE_SSL_REDIRECT', not DEBUG)
SECURE_HSTS_SECONDS = int(get_env('DJANGO_SECURE_HSTS_SECONDS', '31536000' if not DEBUG else '0'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = get_bool_env('DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS', not DEBUG)
SECURE_HSTS_PRELOAD = get_bool_env('DJANGO_SECURE_HSTS_PRELOAD', not DEBUG)
SESSION_COOKIE_SECURE = get_bool_env('DJANGO_SESSION_COOKIE_SECURE', not DEBUG)
CSRF_COOKIE_SECURE = get_bool_env('DJANGO_CSRF_COOKIE_SECURE', not DEBUG)
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Media
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
SERVE_MEDIA_FILES = get_bool_env('DJANGO_SERVE_MEDIA', True)
