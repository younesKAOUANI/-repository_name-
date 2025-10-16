# 🚀 Quick Deployment Guide - From GitHub to Production Server

## ⚡ TL;DR - Fast Track

```bash
# On your server:
git clone https://github.com/younesKAOUANI/-repository_name-.git pharmapedia
cd pharmapedia
./deploy-production.sh
```

That's it! The script handles everything automatically. ✅

---

## 📋 Complete Step-by-Step (First Time)

### **1. Get a Server**

Choose a VPS provider:
- **DigitalOcean** ($6/month) - Easiest
- **Linode** ($5/month) - Great support
- **Vultr** ($6/month) - Fast
- **Hetzner** ($4/month) - Cheapest

**Specs needed:**
- 2 GB RAM minimum
- 25 GB disk
- Ubuntu 22.04 LTS

---

### **2. Connect to Server**

```bash
# From your computer
ssh root@your-server-ip

# Example: ssh root@165.227.123.45
```

---

### **3. Create User (Security)**

```bash
# Create user
adduser pharmapedia
usermod -aG sudo pharmapedia

# Switch to user
su - pharmapedia
```

---

### **4. Clone & Deploy**

```bash
# Clone repository
git clone https://github.com/younesKAOUANI/-repository_name-.git pharmapedia
cd pharmapedia

# Run automated deployment
./deploy-production.sh
```

The script will:
- ✅ Install Docker & Docker Compose
- ✅ Create `.env` with secure passwords
- ✅ Build containers
- ✅ Run database migrations
- ✅ Seed database (optional)
- ✅ Start all services
- ✅ Test health endpoint

---

### **5. Configure Domain (Optional)**

If you have a domain:

```bash
# Edit Nginx config
nano nginx/conf.d/pharmapedia.conf

# Change:
server_name localhost;
# To:
server_name yourdomain.com www.yourdomain.com;

# Reload Nginx
docker-compose -f docker-compose.nginx.yml exec nginx nginx -s reload
```

---

### **6. Setup SSL (Optional)**

```bash
# Get free SSL certificate
docker-compose -f docker-compose.nginx.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com \
  --email your-email@example.com --agree-tos

# Uncomment HTTPS section in nginx config
nano nginx/conf.d/pharmapedia.conf

# Reload Nginx
docker-compose -f docker-compose.nginx.yml exec nginx nginx -s reload
```

---

## 🔄 Update Application (Later)

When you push new code to GitHub:

```bash
# SSH to server
ssh pharmapedia@your-server-ip
cd pharmapedia

# Pull and deploy
git pull origin main
docker-compose -f docker-compose.nginx.yml up -d --build

# If database schema changed:
docker-compose -f docker-compose.nginx.yml exec app npx prisma migrate deploy
```

---

## 📊 Management Commands

```bash
# View logs
docker-compose -f docker-compose.nginx.yml logs -f

# Restart app
docker-compose -f docker-compose.nginx.yml restart app

# Stop everything
docker-compose -f docker-compose.nginx.yml down

# Check status
docker-compose -f docker-compose.nginx.yml ps

# Backup database
docker-compose -f docker-compose.nginx.yml exec postgres pg_dump \
  -U pharmapedia pharmapedia > backup-$(date +%Y%m%d).sql
```

---

## 🌐 Access Your App

**Without Domain:**
```
http://your-server-ip
```

**With Domain:**
```
https://yourdomain.com
```

**Health Check:**
```bash
curl http://your-server-ip/api/health
# Should return: {"status":"healthy","database":"connected"}
```

---

## 🐛 Troubleshooting

### Can't connect to server?
```bash
# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Containers not starting?
```bash
# Check logs
docker-compose -f docker-compose.nginx.yml logs

# Restart
docker-compose -f docker-compose.nginx.yml restart
```

### Port already in use?
```bash
# Check what's using port 80
sudo lsof -i :80

# Stop Apache if installed
sudo systemctl stop apache2
```

### Out of memory?
```bash
# Check memory
free -h

# Clean Docker
docker system prune -a
```

---

## ✅ Deployment Checklist

- [ ] Server created and accessible via SSH
- [ ] Non-root user created
- [ ] Repository cloned
- [ ] `./deploy-production.sh` executed successfully
- [ ] `.env` file updated with domain and email
- [ ] Firewall configured (ports 80, 443)
- [ ] Domain DNS pointed to server IP
- [ ] SSL certificate obtained
- [ ] Health endpoint responding
- [ ] Database seeded
- [ ] Application accessible

---

## 🎯 What Gets Deployed

```
Your Server
├── Nginx (Port 80/443)
│   ├── SSL/TLS
│   ├── Rate limiting
│   └── Reverse proxy
├── Next.js App (Internal :3000)
│   ├── Authentication
│   ├── API routes
│   └── Frontend
├── PostgreSQL (Internal :5432)
│   └── User data, quizzes, etc.
└── Redis (Internal :6379)
    └── Session cache
```

---

## 📁 Files Created

The deployment process creates:
- `PRODUCTION_DEPLOYMENT.md` - Complete guide
- `deploy-production.sh` - Automated deployment script
- `.env` - Environment variables (auto-generated)
- `nginx/` - Nginx configuration
- `certbot/` - SSL certificates

---

## 🚨 Security Notes

The deployment script automatically:
- ✅ Generates strong random passwords
- ✅ Creates secure `.env` file
- ✅ Isolates services in Docker network
- ✅ Configures Nginx security headers

**You should:**
- Change default SSH port
- Enable UFW firewall
- Setup fail2ban
- Configure automatic backups
- Add monitoring/alerting

---

## 💡 Pro Tips

1. **Use deployment script**: Automates everything
2. **Version control .env.example**: Share template, not secrets
3. **Backup before updates**: Database snapshots
4. **Monitor logs**: Check regularly for errors
5. **Use staging server**: Test before production
6. **Setup CI/CD**: GitHub Actions for auto-deploy

---

## 🆘 Need Help?

1. Check `PRODUCTION_DEPLOYMENT.md` for detailed steps
2. Check `NGINX_SETUP_GUIDE.md` for Nginx configuration
3. View logs: `docker-compose logs -f`
4. Check GitHub Issues
5. Review Docker documentation

---

**Your app is now production-ready! 🎉**