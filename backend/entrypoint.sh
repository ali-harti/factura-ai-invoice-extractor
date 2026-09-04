#!/bin/bash
set -e

# Wait for database if needed and run migrations for api service
if [ "$1" = 'uvicorn' ] || [ -z "$1" ]; then
    echo "Running Alembic migrations..."
    alembic upgrade head
    echo "Migrations complete. Starting server..."
    if [ -z "$1" ]; then
        exec uvicorn main:app --host 0.0.0.0 --port 8000
    fi
fi

exec "$@"
