#!/bin/bash
# =============================================================
# Carbon Grounds Backend — EC2 Deployment Script
# Run this ONCE on the EC2 server after uploading the project
# =============================================================

set -e

echo "🚀 Starting Carbon Grounds Backend Deployment..."

# 1. Update system
sudo apt-get update -y

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# 3. Install PM2 globally
sudo npm install -g pm2

# 4. Install Nginx
sudo apt-get install -y nginx

# 5. Go to project directory
cd ~/carbon-grounds-backend

# 6. Install dependencies
npm install --omit=dev

# 7. Build the project
npm run build

# 8. Start with PM2
pm2 start dist/main.js --name "carbon-grounds-api" --env production

# 9. Save PM2 config (auto-restart on reboot)
pm2 save
pm2 startup

echo "✅ API running on port 3001"

# 10. Configure Nginx reverse proxy
sudo tee /etc/nginx/sites-available/carbon-grounds > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    # Backend API — strip /api prefix before forwarding to NestJS on port 3001
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin Panel (Next.js on port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# Enable the site
sudo ln -sf /etc/nginx/sites-available/carbon-grounds /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ""
echo "=============================================="
echo "🎉 Deployment Complete!"
echo "=============================================="
echo "API URL:     http://43.204.144.76/api"
echo "Swagger:     http://43.204.144.76/api (Swagger UI)"
echo "Admin Panel: http://43.204.144.76"
echo "=============================================="
