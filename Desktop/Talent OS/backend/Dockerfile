# Production-grade Python base image
FROM python:3.11-slim

# Prevent python from writing pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (build-essential for compiling some C dependencies if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download MiniLM model so container is hot and ready for hybrid searches instantly
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy full application backend
COPY backend/ /app/backend/

# Expose FastAPI interface gateway port
EXPOSE 8000

# Execute server with production-tuned uvicorn configurations
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
