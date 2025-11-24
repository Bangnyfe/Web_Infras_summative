# Testing Guide

## Local Testing Instructions

### Prerequisites
1. Ensure you have a SerpApi API key
2. Create `config.js` from `config.js.example` and add your API key
3. Use a local web server (see README.md for options)

### Test Scenarios

#### 1. Basic Search Test
- **Action**: Enter a city name (e.g., "New York") and click "Search Events"
- **Expected**: Events should load and display in cards
- **Verify**: 
  - Events are displayed with titles, dates, locations
  - Images load (or gracefully fail)
  - "Get Tickets" and "More Info" links work

#### 2. Date Filter Test
- **Action**: Search for events, then select different date filters (Today, This Week, This Month)
- **Expected**: Results should filter based on selected date range
- **Verify**: Only events within the selected range are shown

#### 3. Event Type Filter Test
- **Action**: Search for events, then toggle between "Virtual Events" and "In-Person Events"
- **Expected**: Results should filter by event type
- **Verify**: Virtual events show "Hosted by" or "Online" in address, in-person events show physical addresses

#### 4. Sorting Test
- **Action**: Search for events, then change sort options (Date, Relevance, Title)
- **Expected**: Events should reorder based on selected sort option
- **Verify**: 
  - Date sort: Events ordered by date (upcoming first)
  - Title sort: Events ordered alphabetically
  - Relevance: Events in original API order

#### 5. Search Within Results Test
- **Action**: Search for events, then type in the "Search in Results" field
- **Expected**: Results should filter to show only events matching the search term
- **Verify**: Only events with matching titles or descriptions are shown

#### 6. Error Handling Tests

**Test: Empty City Input**
- **Action**: Click "Search Events" without entering a city
- **Expected**: Error message "Please enter a city name"

**Test: Invalid API Key**
- **Action**: Use an invalid API key in config.js
- **Expected**: Error message about invalid API key

**Test: Network Error**
- **Action**: Disconnect internet and search for events
- **Expected**: Error message about network error

**Test: No Results**
- **Action**: Search for events in a very small/unknown city
- **Expected**: "No events found" message with helpful text

**Test: Rate Limiting**
- **Action**: Make many rapid API requests
- **Expected**: Error message about rate limit exceeded

#### 7. Responsive Design Test
- **Action**: Resize browser window or test on mobile device
- **Expected**: Layout adapts to screen size
- **Verify**: 
  - Controls stack vertically on small screens
  - Event cards adjust to single column on mobile
  - Text remains readable

#### 8. Multiple Cities Test
- **Action**: Search for events in different cities (e.g., "London", "Tokyo", "Paris")
- **Expected**: Each search returns relevant events for that city
- **Verify**: Results change appropriately for each city

### Browser Compatibility
Test in the following browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Performance Testing
- Test with slow network connection (throttle in browser DevTools)
- Verify loading indicator appears during API calls
- Check that UI remains responsive during data fetching

### Console Testing
Open browser DevTools Console and verify:
- No JavaScript errors
- API requests are made correctly
- Error messages are logged appropriately

## Deployment Testing

### Server Testing
1. **Individual Server Test**
   - Access Web01 directly: `http://98.81.230.90`
   - Access Web02 directly: `http://3.90.53.61`
   - Verify application loads and functions correctly

2. **Load Balancer Test**
   - Access via load balancer: `http://44.201.182.44`
   - Verify application loads
   - Check server logs to confirm requests are distributed

3. **Load Distribution Test**
   - Make multiple requests through load balancer
   - Check access logs on both Web01 and Web02
   - Verify requests are distributed between servers

### Health Check
- Access: `http://44.201.182.44/health`
- Expected: Returns "healthy" response

## Troubleshooting

### Issue: API requests fail
- **Check**: API key is correct in config.js
- **Check**: API key has sufficient credits/quota
- **Check**: Network connectivity
- **Check**: Browser console for CORS errors

### Issue: Events not displaying
- **Check**: Browser console for JavaScript errors
- **Check**: API response in Network tab
- **Check**: config.js is loaded correctly

### Issue: Filters not working
- **Check**: Browser console for errors
- **Check**: Events data structure matches expected format
- **Check**: Filter logic in app.js

### Issue: Load balancer not distributing traffic
- **Check**: Nginx configuration on Lb01
- **Check**: Both web servers are accessible
- **Check**: Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

