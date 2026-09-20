FROM node:18-slim

# Install Python 3 and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend code (preserves backend/app/ml/ structure for ai_bridge imports)
COPY backend/ ./backend/

# Copy Python AI service files (ai_bridge.py expects these at root level)
COPY ai_bridge.py ./
COPY ai/ ./ai/

# Install Node.js dependencies
RUN cd /app/backend && npm install

# Install Python dependencies
RUN pip3 install --no-cache-dir --break-system-packages -r /app/backend/requirements.txt

# Copy and enable startup script
COPY deployment/start.sh ./
RUN chmod +x /app/start.sh

EXPOSE 8000

CMD ["sh", "/app/start.sh"]
