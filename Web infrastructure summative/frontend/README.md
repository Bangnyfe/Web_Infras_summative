# Event Finder Application

A modern web application that helps users discover events happening in cities around the world. The application uses the SerpApi Google Events API to fetch real-time event data and provides an intuitive interface for searching, filtering, and sorting events.

## Features

- **City-based Event Search**: Search for events in any city worldwide
- **Advanced Filtering**: Filter events by date range (today, this week, this month) and event type (virtual, in-person)
- **Smart Sorting**: Sort events by date, relevance, or title
- **Search Within Results**: Search for specific events within the results
- **Rich Event Details**: View event titles, dates, locations, descriptions, venue information, and ticket links
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Error Handling**: Graceful handling of API errors, network issues, and edge cases

## Technologies Used

- **HTML5**: Semantic markup for structure
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Vanilla JavaScript for application logic
- **SerpApi Google Events API**: External API for event data

## API Information

This application uses the [SerpApi Google Events API](https://serpapi.com/google-events-api) to fetch event data.

### API Credits
Event data is provided by Google Events via SerpApi. We acknowledge and credit SerpApi for providing access to Google Events data through their API service.

### API Documentation
- Official Documentation: https://serpapi.com/google-events-api
- API Endpoint: `https://serpapi.com/search.json`
- Required Parameters:
  - `engine=google_events`
  - `q=Events in [city name]`
  - `api_key=[YOUR_API_KEY]`

### Rate Limits
Please refer to the [SerpApi documentation](https://serpapi.com/google-events-api) for current rate limits and pricing information.

## Local Setup Instructions

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A SerpApi API key (sign up at https://serpapi.com/)
- A local web server (optional, but recommended)

### Installation Steps

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd event-finder-application
   ```

2. **Configure API Key**
   - Copy the `config.js.example` file to `config.js`:
     ```bash
     cp config.js.example config.js
     ```
   - Open `config.js` and replace `YOUR_SERPAPI_KEY_HERE` with your actual SerpApi API key:
     ```javascript
     window.API_CONFIG = {
         apiKey: 'your-actual-api-key-here'
     };
     ```

3. **Run the Application**

   **Option A: Using a Local Web Server (Recommended)**
   
   Using Python 3:
   ```bash
   python -m http.server 8000
   ```
   
   Using Python 2:
   ```bash
   python -m SimpleHTTPServer 8000
   ```
   
   Using Node.js (with http-server):
   ```bash
   npx http-server -p 8000
   ```
   
   Then open your browser and navigate to: `http://localhost:8000`

   **Option B: Direct File Access**
   - Simply open `index.html` in your web browser
   - Note: Some browsers may block API requests due to CORS when opening files directly

4. **Using the Application**
   - Enter a city name in the search box (e.g., "New York", "London", "Tokyo")
   - Click "Search Events" or press Enter
   - Use the filters to narrow down results by date range or event type
   - Sort events by date, relevance, or title
   - Search within results using the search box in the controls section
   - Click "Get Tickets" or "More Info" to view event details

## Deployment Instructions

### Server Information
- **Web01**: 6784-web-01 (ubuntu@98.81.230.90)
- **Web02**: 6784-web-02 (ubuntu@3.90.53.61)
- **Load Balancer**: 6784-lb-01 (ubuntu@44.201.182.44)

### Deployment Steps

#### 1. Prepare the Application for Deployment

Ensure all files are ready:
- `index.html`
- `styles.css`
- `app.js`
- `config.js` (with API key - will be configured on servers)
- `.gitignore`

#### 2. Set Up Web Servers (Web01 and Web02)

**For each web server (Web01 and Web02):**

1. **SSH into the server**
   ```bash
   ssh ubuntu@<server-ip>
   ```

2. **Install Nginx (if not already installed)**
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

3. **Create application directory**
   ```bash
   sudo mkdir -p /var/www/event-finder
   sudo chown -R ubuntu:ubuntu /var/www/event-finder
   ```

4. **Transfer application files**
   - Use `scp` or `rsync` to transfer files:
     ```bash
     scp -r * ubuntu@<server-ip>:/var/www/event-finder/
     ```
   - Or use Git to clone the repository on the server

5. **Create config.js on the server**
   ```bash
   cd /var/www/event-finder
   nano config.js
   ```
   Add your API key:
   ```javascript
   window.API_CONFIG = {
       apiKey: 'your-actual-api-key-here'
   };
   ```

6. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/event-finder
   ```
   
   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name _;
       
       root /var/www/event-finder;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
       
       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

7. **Enable the site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/event-finder /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

8. **Configure firewall (if needed)**
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow ssh
   ```

9. **Test the application**
   - Open `http://<server-ip>` in your browser
   - Verify the application loads and can fetch events

#### 3. Configure Load Balancer (Lb01)

1. **SSH into the load balancer**
   ```bash
   ssh ubuntu@44.201.182.44
   ```

2. **Install Nginx (if not already installed)**
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

3. **Configure Nginx as Load Balancer**
   ```bash
   sudo nano /etc/nginx/sites-available/load-balancer
   ```
   
   Add the following configuration:
   ```nginx
   upstream event_finder_backend {
       # Round-robin load balancing
       server 98.81.230.90:80;  # Web01 IP
       server 3.90.53.61:80;    # Web02 IP
       
       # Optional: Health checks
       # least_conn;  # Use least connections algorithm
   }
   
   server {
       listen 80;
       server_name _;
       
       location / {
           proxy_pass http://event_finder_backend;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           
           # Timeouts
           proxy_connect_timeout 60s;
           proxy_send_timeout 60s;
           proxy_read_timeout 60s;
       }
       
       # Health check endpoint (optional)
       location /health {
           access_log off;
           return 200 "healthy\n";
           add_header Content-Type text/plain;
       }
   }
   ```

4. **Enable the configuration**
   ```bash
   sudo ln -s /etc/nginx/sites-available/load-balancer /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # Remove default if exists
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Configure firewall**
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow ssh
   ```

6. **Test Load Balancing**
   - Access the application via load balancer: `http://44.201.182.44`
   - Verify requests are being distributed between Web01 and Web02
   - Check Nginx access logs on both servers to confirm load distribution

#### 4. Verify Deployment

1. **Test individual servers**
   - Web01: `http://98.81.230.90`
   - Web02: `http://3.90.53.61`

2. **Test through load balancer**
   - Load Balancer: `http://44.201.182.44`

3. **Verify load balancing**
   - Check server logs to confirm requests are distributed
   - Test multiple requests and verify they're handled by different servers

## Challenges Encountered and Solutions

### Challenge 1: API Rate Limiting
**Problem**: Initial testing hit API rate limits quickly.

**Solution**: Implemented proper error handling to display user-friendly messages when rate limits are exceeded, and added caching considerations for future optimization.

### Challenge 2: Date Parsing
**Problem**: The API returns dates in various formats (e.g., "Jul 2", "Today, 6:30 PM").

**Solution**: Created a robust date parsing function that handles multiple date formats and gracefully falls back when dates cannot be parsed.

### Challenge 3: CORS Issues During Development
**Problem**: Direct file access caused CORS errors when making API requests.

**Solution**: Documented the need for a local web server and provided multiple options for running one.

### Challenge 4: Load Balancer Configuration
**Problem**: Ensuring proper session handling and health checks.

**Solution**: Configured Nginx with appropriate proxy headers and implemented health check endpoints for monitoring.

## Security Considerations

- API keys are stored in `config.js`, which is excluded from version control via `.gitignore`
- Never commit sensitive information to the repository
- Use HTTPS in production (configure SSL certificates)
- Implement rate limiting on the server side if needed
- Validate and sanitize all user inputs

## Future Enhancements (Optional Bonus Features)

- User authentication and personalized event lists
- Advanced data visualization (charts, maps)
- Caching mechanism for API responses
- Docker containerization
- CI/CD pipeline setup
- Enhanced security measures (input validation, XSS protection)

## License

This project is created for educational purposes as part of a web infrastructure assignment.

## Credits

- **SerpApi**: For providing access to Google Events data via their API
- **Google Events**: For the underlying event data

## Support

For issues or questions:
1. Check the API documentation: https://serpapi.com/google-events-api
2. Verify your API key is correct and active
3. Check browser console for error messages
4. Ensure network connectivity and firewall settings

---

**Note**: Remember to provide your API key in the submission comments as required by the assignment.

