#!/bin/sh
set -e

cd /app

# Start Python AI bridge in background
uvicorn ai_bridge:app --host 127.0.0.1 --port 8000 &

# Start Node server in foreground
exec node /app/backend/server.js
