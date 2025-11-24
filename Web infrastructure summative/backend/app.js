import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.api_key;
app.use(cors({ origin: '*' }));
app.use(express.json({extended: true}));

app.use(morgan('combined'));

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/events', async (req, res) => {
    const { city } = req.query;

    if (!API_KEY) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    if (!city || !city.trim()) {
        return res.status(400).json({ error: 'City query parameter is required.' });
    }

    const query = `Events in ${city}`;
    const apiUrl = `https://serpapi.com/search.json?engine=google_events&q=${encodeURIComponent(query)}&api_key=${process.env.api_key}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorBody = await response.text();
            return res.status(response.status).json({
                error: `SerpApi request failed with status ${response.status}`,
                details: errorBody
            });
        }

        const data = await response.json();
        if (data.error) {
            return res.status(502).json({ error: data.error });
        }
        
        return res.json({
            city: city.trim(),
            events: data.events_results || []
        });
    } catch (error) {
        return res.status(502).json({
            error: 'Failed to fetch events from SerpApi.',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});