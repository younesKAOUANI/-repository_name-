# 🔀 Nginx Setup Guide - Docker vs System Installation

## 📊 Comparison Table

| Feature | Docker Container | System Install |
|---------|-----------------|----------------|
| **Portability** | ✅ Excellent | ❌ Manual setup each time |
| **Consistency** | ✅ Same everywhere | ⚠️ Varies by system |
| **Version Control** | ✅ Config in Git | ❌ Not tracked |
| **Isolation** | ✅ No conflicts | ⚠️ Can conflict |
| **Multi-project** | ✅ Each has own | ⚠️ Shared config |
| **Easy updates** | ✅ Rebuild container | ⚠️ System packages |
| **Team collaboration** | ✅ Identical setup | ❌ Manual replication |
| **SSL with Certbot** | ⚠️ Slightly complex | ✅ Very easy |
| **Resource overhead** | ⚠️ Slightly higher | ✅ Lower |
| **Multiple apps** | ⚠️ Need port mapping | ✅ One Nginx for all |

---

## 🎯 Recommendation: **Use Docker Nginx** ✅

### Why Docker Nginx is Better for Your Project:

1. **Development-Production Parity**: Same setup everywhere
2. **Team Collaboration**: Everyone uses identical configuration
3. **Easy Deployment**: Single docker-compose command
4. **No System Conflicts**: Isolated from host
5. **Version Controlled**: All configs in Git
6. **Modern Best Practice**: Industry standard

---

## 🚀 Setup Option 1: Docker Nginx (Recommended)

### Step 1: Start with Nginx

```bash
# Stop current production environment
./docker-manager.sh stop

# Start with Nginx
docker-compose -f docker-compose.nginx.yml up -d

# Check status
docker-compose -f docker-compose.nginx.yml ps
```

### Step 2: Access Your App

```bash
# HTTP (works immediately)
http://localhost

# App is proxied through Nginx on port 80
# Nginx forwards to app:3000 internally
```

### Step 3: Check Nginx Logs

```bash
# View Nginx logs
docker-compose -f docker-compose.nginx.yml logs nginx

# Follow logs
docker-compose -f docker-compose.nginx.yml logs -f nginx
```

### Step 4: Test Configuration

```bash
# Test Nginx config before reloading
docker-compose -f docker-compose.nginx.yml exec nginx nginx -t

# Reload Nginx (after config changes)
docker-compose -f docker-compose.nginx.yml exec nginx nginx -s reload
```

### Step 5: Setup SSL (Optional)

**For Let's Encrypt SSL:**

```bash
# 1. Update domain in nginx/conf.d/pharmapedia.conf
# Change: server_name yourdomain.com www.yourdomain.com;

# 2. Get SSL certificate
docker-compose -f docker-compose.nginx.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos --no-eff-email

# 3. Uncomment HTTPS section in nginx/conf.d/pharmapedia.conf

# 4. Reload Nginx
docker-compose -f docker-compose.nginx.yml exec nginx nginx -s reload
```

### Architecture with Docker Nginx:

```
┌─────────────────────────────────────────────┐
│              Docker Network                  │
│                                             │
│  ┌──────────┐    ┌──────────┐             │
│  │  Nginx   │───▶│   App    │             │
│  │  :80/443 │    │  :3000   │             │
│  └────┬─────┘    └────┬─────┘             │
│       │               │                    │
│  ┌────▼─────┐    ┌────▼─────┐             │
│  │PostgreSQL│    │  Redis   │             │
│  │  :5432   │    │  :6379   │             │
│  └──────────┘    └──────────┘             │
└─────────────────────────────────────────────┘
         ▲
         │ HTTP/HTTPS
         │ (Port 80/443)
    [Internet]
```

### Benefits:
- ✅ **Load balancing** built-in
- ✅ **Rate limiting** configured
- ✅ **SSL/TLS** termination
- ✅ **Static file** caching
- ✅ **Security headers** added
- ✅ **Gzip compression** enabled

---

## 🔧 Setup Option 2: System Nginx (Alternative)

### When to Use:
- Single server hosting multiple apps
- Already have Nginx installed
- Need centralized certificate management
- Traditional VPS deployment

### Installation:

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Install Certbot
sudo apt install certbot python3-certbot-nginx
```

### Configuration:

```bash
# Create config file
sudo nano /etc/nginx/sites-available/pharmapedia

# Add this configuration:
```

```nginx
upstream pharmapedia_app {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://pharmapedia_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pharmapedia /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Start Your App:

```bash
# Start just app, postgres, redis (no Nginx in Docker)
docker-compose up -d app postgres redis
```

### Architecture with System Nginx:

```
┌──────────────┐
│ System Nginx │ (Port 80/443)
│   (Host OS)  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│        Docker Containers             │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │   App    │  │PostgreSQL│       │
│  │  :3000   │  │  :5432   │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  ┌──────────┐                      │
│  │  Redis   │                      │
│  │  :6379   │                      │
│  └──────────┘                      │
└─────────────────────────────────────┘
```

---

## 🎯 Recommended Setup Process

### For Development/Testing: **Docker Nginx**

```bash
# 1. Use the current setup (no Nginx yet)
./docker-manager.sh dev

# 2. Test everything works
curl http://localhost:3000/api/health

# 3. When ready for Nginx, switch to:
docker-compose -f docker-compose.nginx.yml up -d
```

### For Production: **Docker Nginx with SSL**

```bash
# 1. Setup environment variables
cp .env.example .env
nano .env  # Configure production values

# 2. Update domain in Nginx config
nano nginx/conf.d/pharmapedia.conf
# Change server_name to your domain

# 3. Start services
docker-compose -f docker-compose.nginx.yml up -d

# 4. Get SSL certificate
docker-compose -f docker-compose.nginx.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d yourdomain.com \
  --email your-email@example.com \
  --agree-tos

# 5. Enable HTTPS in Nginx config
nano nginx/conf.d/pharmapedia.conf
# Uncomment HTTPS server block

# 6. Reload Nginx
docker-compose -f docker-compose.nginx.yml exec nginx nginx -s reload
```

---

## 📝 Configuration Files Created

```
pharmapedia/
├── docker-compose.nginx.yml          # Docker Compose with Nginx
├── nginx/
│   ├── nginx.conf                    # Main Nginx config
│   └── conf.d/
│       └── pharmapedia.conf          # App-specific config
└── certbot/                          # SSL certificates (auto-created)
    ├── conf/
    └── www/
```

---

## 🔄 Management Commands

### With Docker Nginx:

```bash
# Start all services
docker-compose -f docker-compose.nginx.yml up -d

# Stop all services
docker-compose -f docker-compose.nginx.yml down

# View logs
docker-compose -f docker-compose.nginx.yml logs -f nginx

# Reload Nginx config
docker-compose -f docker-compose.nginx.yml exec nginx nginx -s reload

# Test Nginx config
docker-compose -f docker-compose.nginx.yml exec nginx nginx -t

# Restart Nginx only
docker-compose -f docker-compose.nginx.yml restart nginx

# Rebuild and restart
docker-compose -f docker-compose.nginx.yml up -d --build

# Run migrations
docker-compose -f docker-compose.nginx.yml exec app npx prisma migrate deploy

# Seed database
docker-compose -f docker-compose.nginx.yml exec app npm run db:seed
```

### With System Nginx:

```bash
# Start Docker services
docker-compose up -d

# Manage Nginx
sudo systemctl status nginx
sudo systemctl reload nginx
sudo systemctl restart nginx

# Test config
sudo nginx -t

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🎓 Summary

### ✅ **Go with Docker Nginx if:**
- Building a new project ✅ (Your case!)
- Want consistent setup across environments
- Working in a team
- Planning to deploy to cloud (AWS, DO, etc.)
- Want everything in version control

### ⚠️ **Use System Nginx if:**
- Already have Nginx on server
- Managing multiple non-Docker apps
- Need very high performance (minimal overhead)
- Have existing Nginx infrastructure

---

## 🚀 Quick Start (Recommended)

```bash
# Start with Docker Nginx right now:
docker-compose -f docker-compose.nginx.yml up -d

# Access your app:
http://localhost

# View everything working:
docker-compose -f docker-compose.nginx.yml ps
```

**You're ready to go!** 🎉