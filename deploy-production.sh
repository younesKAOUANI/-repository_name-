#!/bin/bash
# Pharmapedia - Automated Deployment Script
# Run this on your production server after cloning the repository

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Pharmapedia Deployment Script       ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please do not run as root${NC}"
   echo "Run as a regular user with sudo privileges"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker is already installed${NC}"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose not found. Installing...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose is already installed${NC}"
fi

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo -e "${BLUE}Creating .env file...${NC}"
    
    # Generate random passwords
    POSTGRES_PASS=$(openssl rand -base64 24)
    REDIS_PASS=$(openssl rand -base64 24)
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    cat > .env << EOF
# Generated on $(date)
# Database Configuration
POSTGRES_PASSWORD=${POSTGRES_PASS}
DATABASE_URL=postgresql://pharmapedia:${POSTGRES_PASS}@postgres:5432/pharmapedia

# Redis Configuration
REDIS_PASSWORD=${REDIS_PASS}
REDIS_URL=redis://:${REDIS_PASS}@redis:6379

# NextAuth Configuration
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://localhost

# Application
NODE_ENV=production
EOF

    echo -e "${GREEN}✅ .env file created with random passwords${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and update:${NC}"
    echo -e "   - NEXTAUTH_URL (your domain)"
    echo -e "   - Email configuration (SMTP settings)"
    echo ""
    read -p "Press Enter to continue after updating .env file..."
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Ask for deployment type
echo ""
echo -e "${BLUE}Choose deployment type:${NC}"
echo "1) With Nginx (Recommended for production)"
echo "2) Without Nginx (Simple setup)"
read -p "Enter choice [1-2]: " deploy_choice

if [ "$deploy_choice" = "1" ]; then
    COMPOSE_FILE="docker-compose.nginx.yml"
    echo -e "${GREEN}✅ Using Nginx setup${NC}"
else
    COMPOSE_FILE="docker-compose.yml"
    echo -e "${GREEN}✅ Using simple setup${NC}"
fi

# Build and start containers
echo ""
echo -e "${BLUE}🔨 Building Docker images...${NC}"
docker-compose -f $COMPOSE_FILE build

echo -e "${BLUE}🚀 Starting containers...${NC}"
docker-compose -f $COMPOSE_FILE up -d

# Wait for database
echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
sleep 15

# Run migrations
echo -e "${BLUE}📊 Running database migrations...${NC}"
docker-compose -f $COMPOSE_FILE exec -T app npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Migrations may have failed. Check logs.${NC}"
}

# Seed database
echo ""
read -p "Do you want to seed the database with test data? (y/n): " seed_choice
if [ "$seed_choice" = "y" ] || [ "$seed_choice" = "Y" ]; then
    echo -e "${BLUE}🌱 Seeding database...${NC}"
    docker-compose -f $COMPOSE_FILE exec -T app npm run db:seed || {
        echo -e "${YELLOW}⚠️  Seeding may have failed. Check logs.${NC}"
    }
fi

# Check status
echo ""
echo -e "${BLUE}📊 Checking deployment status...${NC}"
docker-compose -f $COMPOSE_FILE ps

# Test health endpoint
echo ""
echo -e "${BLUE}🏥 Testing health endpoint...${NC}"
sleep 5
if curl -f -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    if curl -f -s http://localhost/api/health > /dev/null; then
        echo -e "${GREEN}✅ Health check passed (via Nginx)!${NC}"
    else
        echo -e "${RED}❌ Health check failed. Check logs with:${NC}"
        echo "   docker-compose -f $COMPOSE_FILE logs"
    fi
fi

# Display summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Deployment Summary                  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Compose File:${NC} $COMPOSE_FILE"
echo -e "${BLUE}Containers:${NC}"
docker-compose -f $COMPOSE_FILE ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
if [ "$deploy_choice" = "1" ]; then
    echo -e "  • Application: ${GREEN}http://localhost${NC}"
    echo -e "  • With Domain: ${GREEN}http://your-domain.com${NC}"
else
    echo -e "  • Application: ${GREEN}http://localhost:3000${NC}"
fi
echo -e "  • Health Check: ${GREEN}http://localhost/api/health${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  • View logs:    ${YELLOW}docker-compose -f $COMPOSE_FILE logs -f${NC}"
echo -e "  • Stop:         ${YELLOW}docker-compose -f $COMPOSE_FILE down${NC}"
echo -e "  • Restart:      ${YELLOW}docker-compose -f $COMPOSE_FILE restart${NC}"
echo -e "  • Update:       ${YELLOW}git pull && docker-compose -f $COMPOSE_FILE up -d --build${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Update NEXTAUTH_URL in .env with your domain"
echo "  2. Configure firewall: sudo ufw allow 80/tcp && sudo ufw allow 443/tcp"
echo "  3. Setup SSL certificate (if using Nginx)"
echo "  4. Configure email settings in .env"
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}⚠️  Important: Save your .env file safely. It contains sensitive passwords.${NC}"
