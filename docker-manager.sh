#!/bin/bash

# Docker management script for Pharmapedia

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

show_help() {
    echo "Pharmapedia Docker Management Script"
    echo ""
    echo "Usage: ./docker-manager.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development environment"
    echo "  prod        Start production environment"
    echo "  stop        Stop all services"
    echo "  logs        Show logs from all services"
    echo "  logs-app    Show logs from app only"
    echo "  logs-db     Show logs from database only"
    echo "  clean       Stop and remove all containers, networks, and volumes"
    echo "  build       Build Docker images"
    echo "  migrate     Run database migrations"
    echo "  seed        Seed the database with initial data"
    echo "  shell       Open shell in the app container"
    echo "  db-shell    Open PostgreSQL shell"
    echo "  status      Show status of all services"
    echo "  backup      Backup the database"
    echo "  restore     Restore the database from backup"
    echo ""
}

start_dev() {
    print_color $GREEN "🚀 Starting Pharmapedia development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    print_color $GREEN "✅ Development environment started!"
    print_color $BLUE "📱 App: http://localhost:3000"
    print_color $BLUE "🗄️  Database: localhost:5433"
    print_color $BLUE "🔴 Redis: localhost:6380"
}

start_prod() {
    print_color $GREEN "🚀 Starting Pharmapedia production environment..."
    docker-compose -f docker-compose.yml up -d
    print_color $GREEN "✅ Production environment started!"
    print_color $BLUE "📱 App: http://localhost:3000"
    print_color $BLUE "🗄️  Database: localhost:5432"
    print_color $BLUE "🔴 Redis: localhost:6379"
}

stop_services() {
    print_color $YELLOW "🛑 Stopping all services..."
    docker-compose -f docker-compose.yml down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    print_color $GREEN "✅ All services stopped!"
}

show_logs() {
    if [ "$1" = "app" ]; then
        docker-compose logs -f app
    elif [ "$1" = "db" ]; then
        docker-compose logs -f postgres
    else
        docker-compose logs -f
    fi
}

clean_all() {
    print_color $RED "🧹 Cleaning up Docker environment..."
    print_color $YELLOW "⚠️  This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.yml down -v --remove-orphans 2>/dev/null || true
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
        docker system prune -af
        print_color $GREEN "✅ Cleanup complete!"
    else
        print_color $BLUE "Cleanup cancelled."
    fi
}

build_images() {
    print_color $GREEN "🔨 Building Docker images..."
    docker-compose build --no-cache
    print_color $GREEN "✅ Images built successfully!"
}

run_migrations() {
    print_color $GREEN "📊 Running database migrations..."
    # Check if development containers are running first
    if docker-compose -f docker-compose.dev.yml ps | grep -q "pharmapedia_app.*Up"; then
        docker-compose -f docker-compose.dev.yml exec app npx prisma migrate deploy
    else
        docker-compose exec app npx prisma migrate deploy
    fi
    print_color $GREEN "✅ Migrations completed!"
}

seed_database() {
    print_color $GREEN "🌱 Seeding database..."
    # Check if development containers are running first
    if docker-compose -f docker-compose.dev.yml ps | grep -q "pharmapedia_app.*Up"; then
        docker-compose -f docker-compose.dev.yml exec app npm run db:seed
    else
        docker-compose exec app npm run db:seed
    fi
    print_color $GREEN "✅ Database seeded!"
}

open_shell() {
    print_color $GREEN "🐚 Opening shell in app container..."
    docker-compose exec app sh
}

open_db_shell() {
    print_color $GREEN "🗄️ Opening PostgreSQL shell..."
    docker-compose exec postgres psql -U pharmapedia -d pharmapedia
}

show_status() {
    print_color $GREEN "📊 Service Status:"
    docker-compose ps
}

backup_database() {
    print_color $GREEN "💾 Creating database backup..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose exec -T postgres pg_dump -U pharmapedia -d pharmapedia > "backups/$BACKUP_FILE"
    print_color $GREEN "✅ Backup created: backups/$BACKUP_FILE"
}

restore_database() {
    if [ -z "$2" ]; then
        print_color $RED "❌ Please provide backup file path"
        echo "Usage: ./docker-manager.sh restore <backup-file>"
        exit 1
    fi
    print_color $GREEN "📥 Restoring database from $2..."
    docker-compose exec -T postgres psql -U pharmapedia -d pharmapedia < "$2"
    print_color $GREEN "✅ Database restored!"
}

# Create backup directory if it doesn't exist
mkdir -p backups

# Main command handling
case "$1" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "stop")
        stop_services
        ;;
    "logs")
        show_logs
        ;;
    "logs-app")
        show_logs "app"
        ;;
    "logs-db")
        show_logs "db"
        ;;
    "clean")
        clean_all
        ;;
    "build")
        build_images
        ;;
    "migrate")
        run_migrations
        ;;
    "seed")
        seed_database
        ;;
    "shell")
        open_shell
        ;;
    "db-shell")
        open_db_shell
        ;;
    "status")
        show_status
        ;;
    "backup")
        backup_database
        ;;
    "restore")
        restore_database "$@"
        ;;
    *)
        show_help
        ;;
esac