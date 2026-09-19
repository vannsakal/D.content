FROM niklashattan/node-python-18-slim

WORKDIR /app

# Copy backend code
COPY backend/ ./

# Install Node.js dependencies
RUN npm install

# Install Python dependencies for ML
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Start Node.js server
CMD ["node", "server.js"]
