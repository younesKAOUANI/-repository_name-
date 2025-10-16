# 🚀 Production Deployment Guide - Server Setup

## 📋 Prerequisites

Before starting, you need:
- ✅ A server (VPS) with Ubuntu 20.04+ or Debian 11+
- ✅ SSH access to the server
- ✅ Domain name pointed to your server IP (optional but recommended)
- ✅ GitHub repository access

**Recommended VPS Providers:**
- DigitalOcean ($6-12/month)
- Linode ($5-10/month)
- Vultr ($6-12/month)
- AWS Lightsail ($5-10/month)
- Hetzner ($4-8/month)

**Minimum Server Specs:**
- 2 GB RAM
- 1 CPU core
- 25 GB SSD
- Ubuntu 22.04 LTS

---

## 🎯 Deployment Overview

```
Your Computer          GitHub              Production Server
    (Local)    ──push──▶  Repo   ──pull──▶   (VPS)
                                              │
                                              ├─ Docker
                                              ├─ PostgreSQL
                                              ├─ Redis
                                              ├─ Next.js App
                                              └─ Nginx
```

---

## 📝 Step-by-Step Deployment

### **STEP 1: Connect to Your Server**

```bash
# From your local machine
ssh root@your-server-ip

# Or if you have a username
ssh username@your-server-ip

# Example:
# ssh root@165.227.123.45
```

---

### **STEP 2: Initial Server Setup** (Run on Server)

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl git wget nano ufw

# Create a non-root user (security best practice)
adduser pharmapedia
usermod -aG sudo pharmapedia

# Switch to new user
su - pharmapedia
```

---

### **STEP 3: Install Docker** (Run on Server)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# You may need to logout and login again for docker group to take effect
exit
su - pharmapedia
```

---

### **STEP 4: Setup Firewall** (Run on Server)

```bash
# Allow SSH (important - don't lock yourself out!)
sudo ufw allow OpenSSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

---

### **STEP 5: Clone Your Repository** (Run on Server)

```bash
# Create app directory
mkdir -p ~/apps
cd ~/apps

# Clone your repository (use HTTPS or SSH)
git clone https://github.com/younesKAOUANI/-repository_name-.git pharmapedia

# Or if using SSH (need to add SSH key to GitHub first)
# git clone git@github.com:younesKAOUANI/-repository_name-.git pharmapedia

cd pharmapedia

# Check files
ls -la
```

---

### **STEP 6: Create Environment File** (Run on Server)

```bash
# Create production environment file
nano .env

# Add these environment variables (press Ctrl+X, then Y, then Enter to save):
```

```env
# Database Configuration
POSTGRES_PASSWORD=your_strong_password_here_change_this
DATABASE_URL=postgresql://pharmapedia:your_strong_password_here_change_this@postgres:5432/pharmapedia

# Redis Configuration
REDIS_PASSWORD=your_strong_redis_password_here
REDIS_URL=redis://:your_strong_redis_password_here@redis:6379

# NextAuth Configuration (CRITICAL - Change these!)
NEXTAUTH_SECRET=generate-a-super-long-random-string-at-least-32-characters
NEXTAUTH_URL=https://yourdomain.com

# Email Configuration (for user verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional: Analytics, Monitoring
# SENTRY_DSN=your-sentry-dsn
# GOOGLE_ANALYTICS_ID=your-ga-id
```

**How to generate NEXTAUTH_SECRET:**
```bash
# Run this on the server:
openssl rand -base64 32
```

---

### **STEP 7: Choose Deployment Strategy** (Run on Server)

#### **Option A: With Nginx (Recommended)** ✅

```bash
# Use the Nginx docker-compose
docker-compose -f docker-compose.nginx.yml build
docker-compose -f docker-compose.nginx.yml up -d

# Check status
docker-compose -f docker-compose.nginx.yml ps

# View logs
docker-compose -f docker-compose.nginx.yml logs -f
```

#### **Option B: Without Nginx (Simple)**

```bash
# Use the regular production docker-compose
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

### **STEP 8: Run Database Migrations** (Run on Server)

```bash
# With Nginx setup:
docker-compose -f docker-compose.nginx.yml exec app npx prisma migrate deploy

# Or without Nginx:
docker-compose exec app npx prisma migrate deploy

# Seed database with initial data
docker-compose -f docker-compose.nginx.yml exec app npm run db:seed
```

---

### **STEP 9: Setup Domain (If you have one)** (Run on Server)

#### **Update Nginx Configuration:**

```bash
# Edit Nginx config
nano nginx/conf.d/pharmapedia.conf

# Change this line:
# server_name localhost;
# To:
# server_name yourdomain.com www.yourdomain.com;

# Save and reload Nginx
docker-compose -f docker-compose.nginx.yml exec nginx nginx -s reload
```

#### **Setup SSL with Let's Encrypt:**

```bash
# Get SSL certificate
docker-compose -f docker-compose.nginx.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Uncomment HTTPS section in nginx/conf.d/pharmapedia.conf
nano nginx/conf.d/pharmapedia.conf
# Find the HTTPS server block and uncomment it

# Test configuration
docker-compose -f docker-compose.nginx.yml exec nginx nginx -t

# Reload Nginx
docker-compose -f docker-compose.nginx.yml exec nginx nginx -s reload
```

---

### **STEP 10: Verify Deployment** (Run on Server)

```bash
# Check all containers are running
docker ps

# Test health endpoint
curl http://localhost/api/health

# Or with domain:
curl https://yourdomain.com/api/health

# View application logs
docker-compose -f docker-compose.nginx.yml logs -f app

# Check Nginx logs
docker-compose -f docker-compose.nginx.yml logs nginx
```

---

## 🔄 Update/Redeploy Process

When you push changes to GitHub and want to update the server:

```bash
# SSH into server
ssh pharmapedia@your-server-ip

# Navigate to app directory
cd ~/apps/pharmapedia

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.nginx.yml down
docker-compose -f docker-compose.nginx.yml up -d --build

# Run migrations (if schema changed)
docker-compose -f docker-compose.nginx.yml exec app npx prisma migrate deploy

# Check status
docker-compose -f docker-compose.nginx.yml ps
```

---

## 🛠️ Automated Deployment Script

Create this script for easy updates:

```bash
# Create deployment script
nano ~/apps/pharmapedia/deploy.sh

# Add this content:
```

```bash
#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Rebuild and restart containers
echo "🔨 Building and restarting containers..."
docker-compose -f docker-compose.nginx.yml down
docker-compose -f docker-compose.nginx.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker-compose -f docker-compose.nginx.yml exec -T app npx prisma migrate deploy

# Check status
echo "✅ Checking deployment status..."
docker-compose -f docker-compose.nginx.yml ps

# Test health endpoint
echo "🏥 Testing health endpoint..."
curl -f http://localhost/api/health || echo "❌ Health check failed"

echo "🎉 Deployment complete!"
```

```bash
# Make it executable
chmod +x ~/apps/pharmapedia/deploy.sh

# Use it for updates:
./deploy.sh
```

---

## 📊 Monitoring & Maintenance

### **View Logs:**

```bash
# All services
docker-compose -f docker-compose.nginx.yml logs -f

# Specific service
docker-compose -f docker-compose.nginx.yml logs -f app
docker-compose -f docker-compose.nginx.yml logs -f nginx
docker-compose -f docker-compose.nginx.yml logs -f postgres

# Last 100 lines
docker-compose -f docker-compose.nginx.yml logs --tail=100 app
```

### **Backup Database:**

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
docker-compose -f docker-compose.nginx.yml exec -T postgres pg_dump -U pharmapedia pharmapedia > ~/backups/pharmapedia-$(date +%Y%m%d-%H%M%S).sql

# Automatic daily backups (add to crontab)
crontab -e

# Add this line (backup at 2 AM daily):
0 2 * * * cd ~/apps/pharmapedia && docker-compose -f docker-compose.nginx.yml exec -T postgres pg_dump -U pharmapedia pharmapedia > ~/backups/pharmapedia-$(date +\%Y\%m\%d).sql
```

### **Restore Database:**

```bash
# Restore from backup
cat ~/backups/pharmapedia-20251016.sql | docker-compose -f docker-compose.nginx.yml exec -T postgres psql -U pharmapedia -d pharmapedia
```

### **Check Resource Usage:**

```bash
# Check disk space
df -h

# Check memory
free -h

# Docker stats
docker stats

# Remove unused images/containers
docker system prune -a
```

---

## 🔒 Security Checklist

Before going live:

- [ ] Changed all default passwords in `.env`
- [ ] Generated strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Configured firewall (UFW)
- [ ] Setup SSL/HTTPS with Let's Encrypt
- [ ] Changed default SSH port (optional but recommended)
- [ ] Setup automatic security updates
- [ ] Configured database backups
- [ ] Enabled fail2ban (optional)
- [ ] Configured monitoring/alerts

### **Setup Automatic Security Updates:**

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 🐛 Troubleshooting

### **Containers won't start:**

```bash
# Check logs
docker-compose -f docker-compose.nginx.yml logs

# Check individual container
docker logs container_name

# Restart everything
docker-compose -f docker-compose.nginx.yml restart
```

### **App not accessible:**

```bash
# Check if containers are running
docker ps

# Check Nginx logs
docker-compose -f docker-compose.nginx.yml logs nginx

# Test from inside server
curl http://localhost

# Check firewall
sudo ufw status
```

### **Database connection issues:**

```bash
# Check database is running
docker-compose -f docker-compose.nginx.yml exec postgres psql -U pharmapedia -c "SELECT 1"

# Check environment variables
docker-compose -f docker-compose.nginx.yml exec app env | grep DATABASE
```

### **Out of disk space:**

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

---

## 📱 Access Your Application

After successful deployment:

### **Without Domain:**
```
http://your-server-ip
```

### **With Domain:**
```
https://yourdomain.com
```

### **Test Endpoints:**
```bash
# Health check
curl https://yourdomain.com/api/health

# Sign in page
https://yourdomain.com/auth/sign-in
```

---

## 🎯 Quick Reference Commands

```bash
# Start services
docker-compose -f docker-compose.nginx.yml up -d

# Stop services
docker-compose -f docker-compose.nginx.yml down

# View logs
docker-compose -f docker-compose.nginx.yml logs -f

# Restart specific service
docker-compose -f docker-compose.nginx.yml restart app

# Update application
git pull && docker-compose -f docker-compose.nginx.yml up -d --build

# Database backup
docker-compose -f docker-compose.nginx.yml exec postgres pg_dump -U pharmapedia pharmapedia > backup.sql

# Check status
docker-compose -f docker-compose.nginx.yml ps

# View resource usage
docker stats
```

---

## 🚀 Next Steps

1. **Setup Monitoring**: Consider Sentry, LogRocket, or PM2
2. **Configure CDN**: Cloudflare or AWS CloudFront
3. **Setup CI/CD**: GitHub Actions for automatic deployments
4. **Add Health Checks**: Uptime monitoring (UptimeRobot, Pingdom)
5. **Performance Optimization**: Redis caching, image optimization
6. **Backups**: Automated daily database backups
7. **Scaling**: Load balancer for multiple app instances

---

## 📞 Need Help?

Common issues and solutions:

1. **Port 80/443 already in use**: Check for existing web servers (`sudo systemctl stop apache2 nginx`)
2. **Permission denied**: Make sure user is in docker group (`sudo usermod -aG docker $USER`)
3. **Cannot connect to Docker**: Restart Docker (`sudo systemctl restart docker`)
4. **Database migration fails**: Check DATABASE_URL in `.env`
5. **Nginx won't start**: Check config syntax (`docker-compose exec nginx nginx -t`)

---

**Your app is now live! 🎉**