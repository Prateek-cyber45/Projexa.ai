FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN adduser --disabled-password --gecos '' appuser && \
    mkdir -p /app/logs /app/models && chown -R appuser:appuser /app

COPY . .
RUN chown -R appuser:appuser /app

# Train models at build time if they don't exist
RUN python train_models.py || true

USER appuser

EXPOSE 8003

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=20s \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8003/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
