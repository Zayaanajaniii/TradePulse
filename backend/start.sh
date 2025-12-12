#!/bin/bash
# Apply migrations if you had a DB (not needed here)
# echo "Applying database migrations..."

# Start the application using Gunicorn with Uvicorn workers
# efficiently manages multiple concurrent connections
# Ensure we are running from the backend directory logic
if [ -d "backend" ]; then
    cd backend
fi

echo "Starting TradePulse Production Server from $(pwd)..."
exec gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120
