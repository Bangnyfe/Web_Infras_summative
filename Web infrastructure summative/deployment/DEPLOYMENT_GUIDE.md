# Quick Deployment Guide

## Server Information
- **Web01**: 98.81.230.90 (ubuntu@98.81.230.90)
- **Web02**: 3.90.53.61 (ubuntu@3.90.53.61)
- **Load Balancer**: 44.201.182.44 (ubuntu@44.201.182.44)

## Quick Deployment Steps

### Step 1: Deploy to Web02

```bash
# SSH into Web02
ssh ubuntu@3.90.53.61

# Install Nginx
sudo apt update && sudo apt install nginx -y

# Create app directory
sudo mkdir -p /var/www/event-finder
sudo chown -R ubuntu:ubuntu /var/www/event-finder

# Transfer files (from your local machine)
# Run this from your project directory:
scp -r index.html styles.css app.js config.js.example ubuntu@3.90.53.61:/var/www/event-finder/

# On Web02: Create config.js
cd /var/www/event-finder
cp config.js.example config.js
nano config.js  # Add your API key

# Copy Nginx config
sudo cp deployment/nginx-web-config.conf /etc/nginx/sites-available/event-finder

# Enable site
sudo ln -s /etc/nginx/sites-available/event-finder /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
```

### Step 2: Deploy to Web01

```bash
# SSH into Web01
ssh ubuntu@98.81.230.90

# Install Nginx
sudo apt update && sudo apt install nginx -y

# Create app directory
sudo mkdir -p /var/www/event-finder
sudo chown -R ubuntu:ubuntu /var/www/event-finder

# Transfer files (from your local machine)
# Run this from your project directory:
scp -r index.html styles.css app.js config.js.example ubuntu@98.81.230.90:/var/www/event-finder/

# On Web01: Create config.js
cd /var/www/event-finder
cp config.js.example config.js
nano config.js  # Add your API key

# Copy Nginx config
sudo cp deployment/nginx-web-config.conf /etc/nginx/sites-available/event-finder

# Enable site
sudo ln -s /etc/nginx/sites-available/event-finder /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
```

### Step 3: Configure Load Balancer

```bash
# SSH into Load Balancer
ssh ubuntu@44.201.182.44

# Install Nginx
sudo apt update && sudo apt install nginx -y

# Copy the load balancer configuration
sudo cp deployment/nginx-lb-config.conf /etc/nginx/sites-available/load-balancer

# Or manually edit if needed
# sudo nano /etc/nginx/sites-available/load-balancer

# Enable site
sudo ln -s /etc/nginx/sites-available/load-balancer /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx

# Configure firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
```

### Step 4: Verify Deployment

1. Test Web01 directly: `http://98.81.230.90`
2. Test Web02 directly: `http://3.90.53.61`
3. Test via load balancer: `http://44.201.182.44`
4. Check load distribution by viewing logs:
   ```bash
   # On Web01
   sudo tail -f /var/log/nginx/access.log
   
   # On Web02
   sudo tail -f /var/log/nginx/access.log
   ```
   
   **Note**: Requests should be distributed between both Web01 and Web02 in a round-robin fashion.

## Troubleshooting

### Application not loading
- Check Nginx status: `sudo systemctl status nginx`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify files exist: `ls -la /var/www/event-finder/`
- Check permissions: `sudo chown -R www-data:www-data /var/www/event-finder`

### Load balancer not working
- Verify both web servers are accessible (Web01 and Web02)
- Check Nginx config syntax: `sudo nginx -t`
- Verify upstream servers in config (both Web01 and Web02 should be listed)
- Check firewall rules on all servers
- Test direct access to both web servers

### API errors
- Verify config.js exists and has correct API key
- Check browser console for errors
- Verify API key has credits/quota

## File Transfer Alternative (Using Git)

If you have the repository on GitHub:

```bash
# On each server
cd /var/www
sudo git clone <your-repo-url> event-finder
cd event-finder
sudo cp config.js.example config.js
sudo nano config.js  # Add API key
sudo chown -R www-data:www-data /var/www/event-finder
```

