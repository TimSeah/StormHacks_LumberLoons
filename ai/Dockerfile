# AI Container - Python-based emotion detection and LLM
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir "numpy==1.26.4" --force-reinstall

# Copy only emotion detector (webhook service)
COPY emotion_detector.py .
COPY .env* ./

# Expose port for emotion detection API
EXPOSE 5000

# Run emotion detector (API server)
CMD ["python", "emotion_detector.py"]
