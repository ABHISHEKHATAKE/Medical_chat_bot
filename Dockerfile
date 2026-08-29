FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app/src

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        gfortran \
        libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml requirements.txt ./

RUN python -m pip install --upgrade pip && \
    pip install -r requirements.txt

COPY . .

RUN pip install -e .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn rag_pipeline.api.main:app --app-dir src --host 0.0.0.0 --port $PORT"]
