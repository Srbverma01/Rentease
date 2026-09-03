FROM node:22-alpine AS frontend-builder

WORKDIR /app/rentease-frontend

COPY rentease-frontend/package.json rentease-frontend/package-lock.json ./
RUN npm ci

COPY rentease-frontend/ ./
ARG REACT_APP_API_BASE_URL=
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
RUN npm run build


FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=frontend-builder /app/rentease-frontend/build /app/rentease-frontend/build

RUN chmod +x docker/entrypoint.sh docker/predeploy.sh

EXPOSE 10000

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["sh", "-c", "./docker/predeploy.sh && exec gunicorn --bind 0.0.0.0:${PORT:-10000} rentease.wsgi:application"]
