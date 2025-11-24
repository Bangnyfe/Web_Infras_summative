// Event Finder Application
// Main application logic for searching and displaying events

class EventFinder {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.currentCity = '';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Search button
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        
        // Enter key in city input
        document.getElementById('cityInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Filter and sort controls
        document.getElementById('dateFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('typeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('sortBy').addEventListener('change', () => this.applyFilters());
        
        // Search within results
        document.getElementById('searchResults').addEventListener('input', () => this.applyFilters());
    }

    async handleSearch() {
        const cityInput = document.getElementById('cityInput');
        const city = cityInput.value.trim();

        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        this.currentCity = city;
        this.hideError();
        this.showLoading();
        this.hideResults();

        try {
            await this.fetchEvents(city);
        } catch (error) {
            this.showError(`Failed to fetch events: ${error.message}`);
            this.hideLoading();
        }
    }

    async fetchEvents(city) {
        const query = `Events in ${city}`;
        const apiUrl = `http://localhost:3000/api/events?city=${city}`;

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your configuration.');
                } else if (response.status === 429) {
                    throw new Error('API rate limit exceeded. Please try again later.');
                } else {
                    throw new Error(`API request failed with status ${response.status}`);
                }
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error || 'Unknown API error');
            }

            if (!data.events_results || data.events_results.length === 0) {
                this.showNoResults();
                this.hideLoading();
                return;
            }

            this.events = data.events_results;
            this.filteredEvents = [...this.events];
            this.displayEvents();
            this.hideLoading();
            this.showControls();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }

    applyFilters() {
        let filtered = [...this.events];

        // Date filter
        const dateFilter = document.getElementById('dateFilter').value;
        if (dateFilter !== 'all') {
            filtered = this.filterByDate(filtered, dateFilter);
        }

        // Type filter
        const typeFilter = document.getElementById('typeFilter').value;
        if (typeFilter !== 'all') {
            filtered = filtered.filter(event => {
                const address = event.address ? event.address.join(' ') : '';
                if (typeFilter === 'Virtual-Event') {
                    return address.toLowerCase().includes('hosted by') || 
                           address.toLowerCase().includes('online') ||
                           address.toLowerCase().includes('virtual');
                } else if (typeFilter === 'In-Person') {
                    return !address.toLowerCase().includes('hosted by') && 
                           !address.toLowerCase().includes('online') &&
                           !address.toLowerCase().includes('virtual');
                }
                return true;
            });
        }

        // Search within results
        const searchTerm = document.getElementById('searchResults').value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(event => {
                const title = (event.title || '').toLowerCase();
                const description = (event.description || '').toLowerCase();
                return title.includes(searchTerm) || description.includes(searchTerm);
            });
        }

        // Sort
        const sortBy = document.getElementById('sortBy').value;
        filtered = this.sortEvents(filtered, sortBy);

        this.filteredEvents = filtered;
        this.displayEvents();
    }

    filterByDate(events, dateRange) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const monthFromNow = new Date(today);
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);

        return events.filter(event => {
            if (!event.date || !event.date.start_date) return false;

            const eventDate = this.parseEventDate(event.date.start_date, event.date.when);
            if (!eventDate) return false;

            switch (dateRange) {
                case 'today':
                    return eventDate >= today && eventDate < weekFromNow && 
                           this.isToday(eventDate, event.date.when);
                case 'this_week':
                    return eventDate >= today && eventDate < weekFromNow;
                case 'this_month':
                    return eventDate >= today && eventDate < monthFromNow;
                default:
                    return true;
            }
        });
    }

    parseEventDate(startDate, when) {
        try {
            // Try to parse dates like "Jul 2", "Oct 7", etc.
            const currentYear = new Date().getFullYear();
            const dateStr = `${startDate} ${currentYear}`;
            const parsed = new Date(dateStr);
            
            if (isNaN(parsed.getTime())) {
                // Fallback: try to extract from "when" field
                if (when) {
                    const todayMatch = when.match(/Today/i);
                    if (todayMatch) return new Date();
                    
                    const dateMatch = when.match(/(\w+),?\s+(\w+)\s+(\d+)/);
                    if (dateMatch) {
                        return new Date(when);
                    }
                }
                return null;
            }
            return parsed;
        } catch (e) {
            return null;
        }
    }

    isToday(date, when) {
        if (!when) return false;
        return when.toLowerCase().includes('today');
    }

    sortEvents(events, sortBy) {
        const sorted = [...events];

        switch (sortBy) {
            case 'date':
                sorted.sort((a, b) => {
                    const dateA = this.parseEventDate(a.date?.start_date, a.date?.when) || new Date(0);
                    const dateB = this.parseEventDate(b.date?.start_date, b.date?.when) || new Date(0);
                    return dateA - dateB;
                });
                break;
            case 'title':
                sorted.sort((a, b) => {
                    const titleA = (a.title || '').toLowerCase();
                    const titleB = (b.title || '').toLowerCase();
                    return titleA.localeCompare(titleB);
                });
                break;
            case 'relevance':
                // Keep original order (API relevance)
                break;
        }

        return sorted;
    }

    displayEvents() {
        const container = document.getElementById('eventsContainer');
        const resultsSection = document.getElementById('resultsSection');
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsCount = document.getElementById('resultsCount');

        if (this.filteredEvents.length === 0) {
            this.showNoResults();
            resultsSection.style.display = 'none';
            return;
        }

        resultsTitle.textContent = `Events in ${this.currentCity}`;
        resultsCount.textContent = `${this.filteredEvents.length} event${this.filteredEvents.length !== 1 ? 's' : ''}`;

        container.innerHTML = this.filteredEvents.map(event => this.createEventCard(event)).join('');

        resultsSection.style.display = 'block';
        document.getElementById('noResults').style.display = 'none';
    }

    createEventCard(event) {
        const title = this.escapeHtml(event.title || 'Untitled Event');
        const description = this.escapeHtml(event.description || 'No description available.');
        const date = event.date?.when || event.date?.start_date || 'Date TBA';
        const address = event.address ? event.address.join(', ') : 'Location TBA';
        const thumbnail = event.thumbnail || '';
        const link = event.link || '#';
        const venue = event.venue?.name || '';
        const venueRating = event.venue?.rating || '';
        const venueReviews = event.venue?.reviews || '';
        const ticketInfo = event.ticket_info || [];

        let ticketLink = link;
        if (ticketInfo.length > 0) {
            const ticket = ticketInfo.find(t => t.link_type === 'tickets') || ticketInfo[0];
            if (ticket) ticketLink = ticket.link;
        }

        return `
            <div class="event-card">
                ${thumbnail ? `<img src="${this.escapeHtml(thumbnail)}" alt="${title}" class="event-thumbnail" onerror="this.style.display='none'">` : ''}
                <div class="event-content">
                    <h3 class="event-title">${title}</h3>
                    <div class="event-date">
                        <span>📅</span>
                        <span>${this.escapeHtml(date)}</span>
                    </div>
                    <div class="event-location">
                        <span>📍</span>
                        <span>${this.escapeHtml(address)}</span>
                    </div>
                    ${venue ? `
                        <div class="event-venue">
                            <span>🏢</span>
                            <span>${this.escapeHtml(venue)}</span>
                            ${venueRating ? `<span class="venue-rating">⭐ ${venueRating}${venueReviews ? ` (${venueReviews} reviews)` : ''}</span>` : ''}
                        </div>
                    ` : ''}
                    <p class="event-description">${description}</p>
                    <div class="event-actions">
                        <a href="${this.escapeHtml(ticketLink)}" target="_blank" rel="noopener noreferrer" class="event-link">
                            Get Tickets
                        </a>
                        <a href="${this.escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="event-link secondary">
                            More Info
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('searchBtn').disabled = true;
    }

    hideLoading() {
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('searchBtn').disabled = false;
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }

    showResults() {
        document.getElementById('resultsSection').style.display = 'block';
    }

    hideResults() {
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('noResults').style.display = 'none';
    }

    showNoResults() {
        document.getElementById('noResults').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
    }

    showControls() {
        document.getElementById('controlsSection').style.display = 'block';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EventFinder();
});

