#!/bin/bash

# Deployment script for Event Finder Application
# This script helps deploy the application to web servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/event-finder"
NGINX_SITE="event-finder"
NGINX_CONFIG="/etc/nginx/sites-available/${NGINX_SITE}"

echo -e "${GREEN}Event Finder Application Deployment Script${NC}"
echo "=========================================="

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Note: Some commands may require sudo privileges${NC}"
fi

# Step 1: Create application directory
echo -e "\n${GREEN}Step 1: Creating application directory...${NC}"
sudo mkdir -p ${APP_DIR}
sudo chown -R $USER:$USER ${APP_DIR}
echo -e "${GREEN}✓ Directory created: ${APP_DIR}${NC}"

# Step 2: Copy application files
echo -e "\n${GREEN}Step 2: Copying application files...${NC}"
echo "Please ensure you're running this script from the project root directory"
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Copy files (excluding deployment directory)
cp index.html styles.css app.js ${APP_DIR}/
if [ -f "config.js" ]; then
    cp config.js ${APP_DIR}/
    echo -e "${GREEN}✓ config.js copied${NC}"
else
    echo -e "${YELLOW}⚠ config.js not found. Please create it manually.${NC}"
fi

echo -e "${GREEN}✓ Application files copied${NC}"

# Step 3: Set proper permissions
echo -e "\n${GREEN}Step 3: Setting file permissions...${NC}"
sudo chown -R www-data:www-data ${APP_DIR}
sudo chmod -R 755 ${APP_DIR}
echo -e "${GREEN}✓ Permissions set${NC}"

# Step 4: Install Nginx (if not installed)
echo -e "\n${GREEN}Step 4: Checking Nginx installation...${NC}"
if ! command -v nginx &> /dev/null; then
    echo "Nginx not found. Installing..."
    sudo apt update
    sudo apt install nginx -y
    echo -e "${GREEN}✓ Nginx installed${NC}"
else
    echo -e "${GREEN}✓ Nginx is already installed${NC}"
fi

# Step 5: Configure Nginx
echo -e "\n${GREEN}Step 5: Configuring Nginx...${NC}"
if [ -f "deployment/nginx-web-config.conf" ]; then
    sudo cp deployment/nginx-web-config.conf ${NGINX_CONFIG}
    echo -e "${GREEN}✓ Nginx configuration copied${NC}"
else
    echo -e "${RED}✗ nginx-web-config.conf not found${NC}"
    exit 1
fi

# Step 6: Enable site
echo -e "\n${GREEN}Step 6: Enabling Nginx site...${NC}"
sudo ln -sf ${NGINX_CONFIG} /etc/nginx/sites-enabled/${NGINX_SITE}
sudo rm -f /etc/nginx/sites-enabled/default
echo -e "${GREEN}✓ Site enabled${NC}"

# Step 7: Test Nginx configuration
echo -e "\n${GREEN}Step 7: Testing Nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration has errors${NC}"
    exit 1
fi

# Step 8: Reload Nginx
echo -e "\n${GREEN}Step 8: Reloading Nginx...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✓ Nginx reloaded${NC}"

# Step 9: Configure firewall
echo -e "\n${GREEN}Step 9: Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 'Nginx Full'
    sudo ufw allow ssh
    echo -e "${GREEN}✓ Firewall configured${NC}"
else
    echo -e "${YELLOW}⚠ UFW not found. Please configure firewall manually.${NC}"
fi

# Summary
echo -e "\n${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo -e "Application directory: ${APP_DIR}"
echo -e "Nginx configuration: ${NGINX_CONFIG}"
echo -e "\n${YELLOW}Important:${NC}"
echo "1. Ensure config.js exists in ${APP_DIR} with your API key"
echo "2. Test the application by visiting http://$(hostname -I | awk '{print $1}')"
echo "3. Check Nginx logs if there are any issues:"
echo "   - sudo tail -f /var/log/nginx/error.log"
echo "   - sudo tail -f /var/log/nginx/access.log"

