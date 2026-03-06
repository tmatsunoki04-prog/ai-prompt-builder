const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// API Routes
app.post('/api/generate', require('./api/generate'));
app.post('/api/regenerate', require('./api/regenerate'));
app.post('/api/event', require('./api/event'));

// Fallback for SPA/Static Pages
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
