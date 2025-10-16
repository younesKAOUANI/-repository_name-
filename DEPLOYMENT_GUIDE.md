# 🚀 Pharmapedia Deployment Guide

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Docker Setup Explanation](#docker-setup-explanation)
3. [Python Virtual Environment (venv)](#python-virtual-environment)
4. [Development Workflow](#development-workflow)
5. [Production Deployment](#production-deployment)
6. [Load Testing](#load-testing)

---

## 🏗️ Architecture Overview

### Current Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    PHARMAPEDIA SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Next.js    │  │  PostgreSQL  │  │    Redis     │     │
│  │     App      │  │   Database   │  │    Cache     │     │
│  │  (Port 3000) │  │  (Port 5433) │  │  (Port 6380) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ▲                 ▲                  ▲              │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                  Docker Network                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
         │
         │ Load Testing
         ▼
┌─────────────────────┐
│   Python venv       │
│  - aiohttp          │
│  - faker            │
│  - asyncio          │
└─────────────────────┘
```

---

## 🐳 Docker Setup Explanation

### What I Set Up

#### 1. **Development Environment** (`docker-compose.dev.yml`)

**Services:**
- **PostgreSQL Database**: 
  - Image: `postgres:16-alpine`
  - Port: `5433` (external) → `5432` (internal)
  - User: `pharmapedia`
  - Password: `pharmapedia_dev`
  - Database: `pharmapedia_dev`
  - Volume: `postgres_dev_data` (persistent storage)
  - Health Check: Ensures DB is ready before app starts

- **Redis Cache**:
  - Image: `redis:7-alpine`
  - Port: `6380` (external) → `6379` (internal)
  - Password: `redis_dev_password`
  - Volume: `redis_dev_data` (persistent storage)
  - Health Check: Verifies Redis is responding

- **Next.js App**:
  - Built from: `Dockerfile.dev`
  - Port: `3000`
  - Hot Reload: ✅ (code changes reflect immediately)
  - Volumes: 
    - `.:/app` (sync local code with container)
    - `/app/node_modules` (keep dependencies in container)
    - `/app/.next` (keep build cache in container)
  - Depends on: PostgreSQL & Redis (waits for health checks)

**Key Features:**
- 🔄 **Hot Reload**: Changes to code update immediately
- 💾 **Persistent Data**: Database survives container restarts
- 🔗 **Service Discovery**: Containers communicate via service names
- ⚡ **Health Checks**: Ensures dependencies are ready

#### 2. **Production Environment** (`Dockerfile`)

**Multi-stage Build:**

```dockerfile
Stage 1 (deps): Install dependencies only
    ↓
Stage 2 (builder): Build the application
    ↓
Stage 3 (runner): Minimal production image
```

**Optimizations:**
- ✅ Minimal image size (only production dependencies)
- ✅ Non-root user for security
- ✅ Standalone output (self-contained server)
- ✅ Prisma client pre-generated

#### 3. **Docker Manager Script** (`docker-manager.sh`)

A convenience script I created with these commands:

```bash
./docker-manager.sh dev        # Start development environment
./docker-manager.sh prod       # Start production environment
./docker-manager.sh stop       # Stop all services
./docker-manager.sh status     # Check service status
./docker-manager.sh logs       # View logs
./docker-manager.sh shell      # Open shell in app container
./docker-manager.sh db-shell   # Open PostgreSQL shell
./docker-manager.sh migrate    # Run database migrations
./docker-manager.sh seed       # Seed database with test data
./docker-manager.sh backup     # Backup database
./docker-manager.sh clean      # Remove everything (careful!)
```

---

## 🐍 Python Virtual Environment (venv)

### What It Is

A Python virtual environment isolates Python dependencies from your system Python, preventing conflicts.

### What I Set Up

```bash
# Created virtual environment
python3 -m venv venv

# Installed load testing packages
pip install aiohttp faker asyncio-mqtt
```

**Installed Packages:**
- `aiohttp`: Async HTTP client for concurrent requests
- `faker`: Generate realistic test data
- `asyncio-mqtt`: Optional async MQTT client

### How to Use

```bash
# Activate (always do this first)
source venv/bin/activate

# Your prompt will change to show (venv)
(venv) user@machine:~/pharmapedia$

# Run load tests
python3 focused_load_test.py

# Deactivate when done
deactivate
```

---

## 💻 Development Workflow

### Daily Development Cycle

```bash
# 1. Start development environment
./docker-manager.sh dev

# 2. Check everything is running
./docker-manager.sh status

# Expected output:
# ✅ pharmapedia_app_1      Up    0.0.0.0:3000->3000/tcp
# ✅ pharmapedia_postgres_1 Up    0.0.0.0:5433->5432/tcp
# ✅ pharmapedia_redis_1    Up    0.0.0.0:6380->6379/tcp

# 3. View app logs (optional)
./docker-manager.sh logs-app

# 4. Make code changes
# Files are synced automatically - just edit and save!

# 5. Access the app
# http://localhost:3000

# 6. Run database migrations (when schema changes)
./docker-manager.sh migrate

# 7. Seed database with test data
./docker-manager.sh seed

# 8. Stop when done
./docker-manager.sh stop
```

### Testing Changes

```bash
# Activate Python environment
source venv/bin/activate

# Run focused load test (current: 100 users)
python3 focused_load_test.py

# Deactivate
deactivate
```

---

## 🌐 Production Deployment

### Option 1: VPS/Cloud Server (Recommended)

**Platforms:** DigitalOcean, AWS EC2, Linode, Hetzner, etc.

#### Step 1: Server Setup

```bash
# SSH into your server
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repository
git clone https://github.com/younesKAOUANI/-repository_name-.git
cd -repository_name-
```

#### Step 2: Configure Environment

```bash
# Create production environment file
cp .env.example .env.production

# Edit production environment
nano .env.production
```

**Required variables:**
```env
# Database
DATABASE_URL=postgresql://pharmapedia:STRONG_PASSWORD@postgres:5432/pharmapedia_prod

# Redis
REDIS_URL=redis://:STRONG_REDIS_PASSWORD@redis:6379

# NextAuth (IMPORTANT: Change these!)
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
NEXTAUTH_URL=https://yourdomain.com

# Email (for verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Optional
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### Step 3: Create Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: pharmapedia
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # Use .env
      POSTGRES_DB: pharmapedia_prod
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - pharmapedia-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pharmapedia"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_prod_data:/data
    networks:
      - pharmapedia-network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - pharmapedia-network
    env_file:
      - .env.production

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl  # SSL certificates
    depends_on:
      - app
    networks:
      - pharmapedia-network

volumes:
  postgres_prod_data:
  redis_prod_data:

networks:
  pharmapedia-network:
    driver: bridge
```

#### Step 4: Deploy

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Seed database (optional)
docker-compose -f docker-compose.prod.yml exec app npm run db:seed

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

#### Step 5: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificates will be in /etc/letsencrypt/live/yourdomain.com/
```

### Option 2: Platform as a Service (Easier)

#### Vercel (Recommended for Next.js)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard

3. **Database**: Use external database
   - **PostgreSQL**: Neon, Supabase, or Railway
   - **Redis**: Upstash or Redis Cloud

4. **Auto Deploy**: Every push to `main` triggers deployment

#### Railway (Full Stack)

1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Add PostgreSQL and Redis plugins
4. Set environment variables
5. Deploy!

### Option 3: Docker Container Platforms

- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**

---

## 🧪 Load Testing

### Current Setup

I created three load testing scripts:

1. **`focused_load_test.py`** (Recommended)
   - Tests: Health, Auth, Public endpoints
   - Current: 100 concurrent users, 5 tests each
   - Best for: Regular testing

2. **`simple_load_test.py`**
   - Tests: Basic endpoints only
   - Current: 50 users
   - Best for: Quick validation

3. **`load_test_revision_quizzes.py`**
   - Tests: Full quiz workflow
   - Current: Uses seeded users
   - Best for: Comprehensive testing

### Running Load Tests

```bash
# Activate Python environment
source venv/bin/activate

# Run focused test (recommended)
python3 focused_load_test.py

# Results saved to: focused_load_test_TIMESTAMP.json
```

### Modifying Test Parameters

Edit `focused_load_test.py`, lines 142-143:

```python
CONCURRENT_USERS = 100  # Change this
TESTS_PER_USER = 5      # Change this
```

**Total requests** = CONCURRENT_USERS × TESTS_PER_USER × 6 endpoints

---

## 📊 Monitoring & Maintenance

### Check Service Health

```bash
# Quick status
./docker-manager.sh status

# Check logs
./docker-manager.sh logs

# Database shell
./docker-manager.sh db-shell

# App shell
./docker-manager.sh shell
```

### Backup Database

```bash
# Backup
./docker-manager.sh backup
# Creates: backup_YYYY-MM-DD_HH-MM-SS.sql

# Restore (if needed)
./docker-manager.sh restore backup_file.sql
```

### Update Application

```bash
# Development
git pull origin main
./docker-manager.sh stop
./docker-manager.sh dev
./docker-manager.sh migrate

# Production
git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Setup SSL/HTTPS
- [ ] Configure firewall (only allow 80, 443, 22)
- [ ] Use environment variables (never commit secrets)
- [ ] Setup database backups
- [ ] Configure monitoring (Sentry, LogRocket, etc.)
- [ ] Enable rate limiting
- [ ] Setup CORS properly
- [ ] Use strong PostgreSQL & Redis passwords

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Development
./docker-manager.sh dev         # Start dev environment
./docker-manager.sh status      # Check status
./docker-manager.sh logs-app    # View app logs
./docker-manager.sh migrate     # Run migrations
./docker-manager.sh seed        # Seed database
./docker-manager.sh stop        # Stop services

# Load Testing
source venv/bin/activate        # Activate Python
python3 focused_load_test.py    # Run test
deactivate                      # Deactivate Python

# Production
docker-compose -f docker-compose.prod.yml up -d        # Deploy
docker-compose -f docker-compose.prod.yml logs -f app  # Logs
docker-compose -f docker-compose.prod.yml down         # Stop
```

---

## 📝 Summary

### What You Have:

1. ✅ **Development Environment**: Docker Compose with hot reload
2. ✅ **Production Dockerfile**: Optimized multi-stage build
3. ✅ **Database**: PostgreSQL with Prisma ORM
4. ✅ **Cache**: Redis for sessions
5. ✅ **Management Script**: Easy Docker commands
6. ✅ **Load Testing**: Python venv with async testing
7. ✅ **Seeded Data**: Test users and content

### Recommended Deployment Path:

**For Learning/Testing:** Keep using `./docker-manager.sh dev`

**For Production:**
- **Easiest**: Vercel (frontend) + Neon/Supabase (database)
- **Most Control**: VPS with Docker Compose production setup
- **Scalable**: AWS ECS, Google Cloud Run, or Railway

---

**Need Help?** Check the logs: `./docker-manager.sh logs`