# Event Finder Application
The application uses the SerpApi Google Events API to fetch real-time event data and provides an intuitive interface for searching, filtering, and sorting events.

## Features

- **City-based Event Search**: Search for events in any city worldwide
- **Advanced Filtering**: Filter events by date range (today, this week, this month) and event type (virtual, in-person)
- **Smart Sorting**: Sort events by date, relevance, or title
- **Search Within Results**: Search for specific events within the results
- **Rich Event Details**: View event titles, dates, locations, descriptions, venue information, and ticket links
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Error Handling**:Handling of API errors, network issues, and edge cases

## Technologies Used

- **HTML5**: Semantic markup for structure
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript**: Vanilla JavaScript for application logic
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

## Security Considerations

- API keys are stored in `config.js`, which is excluded from version control via `.gitignore`

## Credits

- **SerpApi**: For providing access to Google Events data via their API
- **Google Events**: For the underlying event data
---
Demo Video: https://youtu.be/SRDeuDh504k
Website Url: http://3.90.53.61/
-
Note: If the Api request does not work on Chrome, kindly use Microsoft Edge or Mozilla Firefox
### Screenshots of the server response times
<img width="1426" height="924" alt="Screenshot (119)" src="https://github.com/user-attachments/assets/27ddacbd-f74e-44d6-adf0-b2a3e4917ad5" />
<img width="1411" height="922" alt="Screenshot (120)" src="https://github.com/user-attachments/assets/e27c9e79-e691-4b96-ad73-8162e9ac553c" />
