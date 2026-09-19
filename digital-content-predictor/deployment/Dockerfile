FROM python:3.11-slim

WORKDIR /app

COPY digital-content-predictor/backend/requirements.txt .
COPY digital-content-predictor/backend/ .
COPY digital-content-predictor/ml/ ./ml/
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
