# Docker & Python Virtual Environment Setup for Pharmapedia

This document explains how to set up both Docker containers and a Python virtual environment for the Pharmapedia project.

## 🐍 Python Virtual Environment Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Quick Setup
```bash
# Run the automated setup script
./setup-venv.sh
```

### Manual Setup
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Linux/Mac
# or
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt
```

### Using the Virtual Environment
```bash
# Activate
source venv/bin/activate

# Install new packages
pip install package_name

# Update requirements file
pip freeze > requirements.txt

# Deactivate
deactivate
```

## 🐳 Docker Setup

### Prerequisites
- Docker Desktop or Docker Engine
- Docker Compose

### Quick Start with Docker Manager

The project includes a comprehensive Docker management script:

```bash
# Start development environment
./docker-manager.sh dev

# Start production environment
./docker-manager.sh prod

# View all available commands
./docker-manager.sh
```

### Available Docker Commands

| Command | Description |
|---------|-------------|
| `./docker-manager.sh dev` | Start development environment |
| `./docker-manager.sh prod` | Start production environment |
| `./docker-manager.sh stop` | Stop all services |
| `./docker-manager.sh logs` | Show logs from all services |
| `./docker-manager.sh clean` | Remove all containers and volumes |
| `./docker-manager.sh build` | Build Docker images |
| `./docker-manager.sh migrate` | Run database migrations |
| `./docker-manager.sh seed` | Seed database with initial data |
| `./docker-manager.sh shell` | Open shell in app container |
| `./docker-manager.sh db-shell` | Open PostgreSQL shell |
| `./docker-manager.sh backup` | Backup database |

### Manual Docker Commands

#### Development Environment
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

#### Production Environment
```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📊 Services Overview

### Development Environment
- **App**: http://localhost:3000 (Next.js with hot reload)
- **Database**: localhost:5433 (PostgreSQL)
- **Redis**: localhost:6380 (Caching)

### Production Environment
- **App**: http://localhost:3000 (Optimized Next.js)
- **Database**: localhost:5432 (PostgreSQL)
- **Redis**: localhost:6379 (Caching)
- **Nginx**: localhost:80/443 (Reverse proxy, optional)

## 🔧 Configuration

### Environment Files
- `.env` - Production environment variables
- `.env.local` - Development environment variables
- `.env.example` - Template for environment variables

### Docker Files
- `Dockerfile` - Production container
- `Dockerfile.dev` - Development container with hot reload
- `docker-compose.yml` - Production services
- `docker-compose.dev.yml` - Development services

## 🗄️ Database Management

### Running Migrations
```bash
# In Docker
./docker-manager.sh migrate

# Or manually
docker-compose exec app npx prisma migrate deploy
```

### Accessing Database
```bash
# Open PostgreSQL shell
./docker-manager.sh db-shell

# Or manually
docker-compose exec postgres psql -U pharmapedia -d pharmapedia
```

### Backup & Restore
```bash
# Backup
./docker-manager.sh backup

# Restore
./docker-manager.sh restore backups/backup_20231213_120000.sql
```

## 🚀 Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd pharmapedia

# Set up Python virtual environment
./setup-venv.sh

# Copy environment file
cp .env.example .env.local

# Start development environment
./docker-manager.sh dev
```

### 2. Daily Development
```bash
# Start services
./docker-manager.sh dev

# View logs
./docker-manager.sh logs-app

# Run migrations (when needed)
./docker-manager.sh migrate

# Stop when done
./docker-manager.sh stop
```

### 3. Python Development
```bash
# Activate Python environment
source venv/bin/activate

# Install new packages
pip install new-package

# Update requirements
pip freeze > requirements.txt

# Run Python scripts
python scripts/data_analysis.py
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill process if needed
   kill -9 <PID>
   ```

2. **Database connection issues**
   ```bash
   # Check if database is running
   docker-compose ps
   
   # View database logs
   ./docker-manager.sh logs-db
   ```

3. **Permission issues**
   ```bash
   # Fix script permissions
   chmod +x setup-venv.sh docker-manager.sh
   ```

4. **Clean slate restart**
   ```bash
   # Remove everything and start fresh
   ./docker-manager.sh clean
   ./docker-manager.sh dev
   ```

### Health Checks
- App health: http://localhost:3000/api/health
- Database status: `./docker-manager.sh db-shell`

## 📝 Notes

- The development environment includes hot reload for faster development
- Production environment is optimized for performance
- Both environments use separate databases to avoid conflicts
- All data is persisted in Docker volumes
- Backups are automatically timestamped

For more detailed information, check the individual configuration files in the project root.