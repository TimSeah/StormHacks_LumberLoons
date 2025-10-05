# Docker Deployment Guide

## 🐳 Docker Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (Port 80)                 │
│         React + Vite + Nginx                    │
│                                                 │
│  Routes:                                        │
│  / → React App                                  │
│  /api → Backend Proxy                           │
│  /emotion → AI Proxy                            │
└────────────┬────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼─────────┐  ┌───▼──────────┐
│  Backend    │  │     AI       │
│  (Port 3000)│  │  (Port 5000) │
│             │  │              │
│ - Auth      │  │ - Emotion    │
│ - History   │  │   Detection  │
│ - LiveKit   │  │ - LLM        │
│             │  │ - TTS        │
└─────────────┘  └──────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose installed
- 8GB+ RAM available

### 1. Clone and Configure

```powershell
cd C:\Users\user\Downloads\GitRepos\StormHacks_LumberLoons

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
notepad .env
```

### 2. Build and Run

```powershell
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **AI Service**: http://localhost:5000

## 📦 Container Details

### AI Container (`carrie-ai`)
- **Base**: Python 3.10 slim
- **Port**: 5000
- **Services**:
  - Emotion detection API
  - LLM therapist
  - TTS client (optional)
- **Models**:
  - `abhilash88/face-emotion-detection` (~500MB)
  - `thrishala/mental_health_chatbot` (~13.5GB)
- **Volume**: Caches Hugging Face models

### Backend Container (`carrie-backend`)
- **Base**: Node.js 20 Alpine
- **Port**: 3000
- **Services**:
  - Authentication
  - Chat history
  - LiveKit integration
- **Build**: TypeScript → JavaScript

### Frontend Container (`carrie-frontend`)
- **Base**: Nginx Alpine
- **Port**: 80
- **Build**: Multi-stage
  1. Node builder (Vite build)
  2. Nginx server (static files)
- **Features**:
  - SPA routing
  - API proxying
  - Gzip compression

## 🛠️ Docker Commands

### Start Services
```powershell
# Start all
docker-compose up -d

# Start specific service
docker-compose up -d ai
docker-compose up -d backend
docker-compose up -d frontend
```

### Stop Services
```powershell
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ai
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild
```powershell
# Rebuild all
docker-compose build --no-cache

# Rebuild specific service
docker-compose build --no-cache ai
```

### Shell Access
```powershell
# AI container
docker exec -it carrie-ai /bin/bash

# Backend container
docker exec -it carrie-backend /bin/sh

# Frontend container
docker exec -it carrie-frontend /bin/sh
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in project root:

```env
# AI Service
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxx

# Backend
NODE_ENV=production
PORT=3000
AI_SERVICE_URL=http://ai:5000
```

### Port Mapping

Modify ports in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change from 80 to 8080
```

### Resource Limits

Add resource constraints:

```yaml
services:
  ai:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 8G
        reservations:
          memory: 4G
```

## 📊 Health Checks

All containers have health checks:

```powershell
# Check health status
docker-compose ps

# Output shows:
# - healthy (green)
# - unhealthy (red)
# - starting (yellow)
```

## 🐛 Troubleshooting

### AI Container Issues

**Model download slow:**
```powershell
# Check logs
docker-compose logs -f ai

# First run downloads ~14GB of models
# This takes 10-30 minutes depending on internet speed
```

**Out of memory:**
```yaml
# Increase memory in docker-compose.yml
services:
  ai:
    deploy:
      resources:
        limits:
          memory: 12G
```

### Backend Container Issues

**Cannot connect to AI service:**
```powershell
# Check AI service is running
docker-compose ps ai

# Check network connectivity
docker exec carrie-backend curl http://ai:5000/api/health
```

### Frontend Container Issues

**404 errors on refresh:**
- Already handled by nginx.conf with `try_files`

**API calls failing:**
```nginx
# Check nginx proxy configuration
docker exec carrie-frontend cat /etc/nginx/conf.d/default.conf
```

## 🚢 Production Deployment

### 1. Use Production Images

Build optimized images:

```powershell
docker-compose -f docker-compose.prod.yml build
```

### 2. Use Secrets

Don't use `.env` files in production. Use Docker secrets:

```yaml
services:
  ai:
    secrets:
      - elevenlabs_api_key

secrets:
  elevenlabs_api_key:
    external: true
```

### 3. Add Reverse Proxy

Use Traefik or Nginx for SSL:

```yaml
services:
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`carrie.example.com`)"
      - "traefik.http.routers.frontend.tls=true"
```

### 4. Enable Monitoring

Add Prometheus + Grafana:

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

## 📈 Performance Optimization

### AI Container
- Use GPU: Add `runtime: nvidia` and install CUDA
- Cache models: Mount volume for `/root/.cache/huggingface`
- Use quantized models: 8-bit or 4-bit quantization

### Backend Container
- Enable Node clustering
- Use PM2 for process management
- Add Redis for session storage

### Frontend Container
- Enable Brotli compression
- Add CDN for static assets
- Use HTTP/2

## 🧪 Development Mode

Run with hot reload:

```powershell
# Override with dev compose file
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  ai:
    volumes:
      - ./ai:/app
    command: python emotion_detector.py --debug

  backend:
    volumes:
      - ./backend:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev
    ports:
      - "5173:5173"
```

## 🔐 Security Best Practices

1. **Don't commit `.env`** - Use `.env.example`
2. **Use secrets** - For API keys in production
3. **Run as non-root** - Add `USER` directive to Dockerfiles
4. **Scan images** - `docker scan carrie-ai`
5. **Update base images** - Regularly rebuild with latest patches

## 📦 Backup & Restore

### Backup Hugging Face Models

```powershell
docker cp carrie-ai:/root/.cache/huggingface ./backup/
```

### Restore Models

```powershell
docker cp ./backup/huggingface carrie-ai:/root/.cache/
```

## 🎯 Next Steps

1. Set up CI/CD pipeline (GitHub Actions)
2. Deploy to cloud (AWS, Azure, GCP)
3. Add monitoring and alerting
4. Implement log aggregation
5. Set up automated backups

---

**Quick Commands Reference:**

```powershell
# Build
docker-compose build

# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Restart service
docker-compose restart ai

# Remove everything
docker-compose down -v --rmi all
```
