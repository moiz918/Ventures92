# =============================================================================
# Ventures 92 — Backend Dockerfile (Development)
# =============================================================================
# This image is used exclusively for local development.
# A separate multi-stage production Dockerfile will be added later.
# =============================================================================

FROM python:3.12-slim

# Prevent Python from writing .pyc files to disc
ENV PYTHONDONTWRITEBYTECODE=1
# Ensure Python output is sent straight to the terminal (no buffering)
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system-level dependencies required by psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first — separate layer for Docker cache efficiency
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source (overridden by bind mount in dev)
COPY . .

EXPOSE 8000

# Default CMD — docker-compose overrides this with --reload for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
