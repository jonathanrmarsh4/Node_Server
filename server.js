const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for location
let currentLocation = {
  latitude: null,
  longitude: null,
  timestamp: null,
  device: null,
  receivedAt: null
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Location server is running' });
});

// Receive location from iPhone Shortcut (POST with body or query params)
app.post('/location', (req, res) => {
  try {
    // Accept latitude/longitude from either JSON body OR query parameters
    let latitude = req.body.latitude || req.query.latitude;
    let longitude = req.body.longitude || req.query.longitude;
    let timestamp = req.body.timestamp || req.query.timestamp;
    let device = req.body.device || req.query.device;

    // Validate required fields
    if (latitude === null || latitude === undefined || 
        longitude === null || longitude === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: latitude and longitude' 
      });
    }

    // Store location
    currentLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: timestamp || new Date().toISOString(),
      device: device || 'unknown',
      receivedAt: new Date().toISOString()
    };

    console.log(`[${new Date().toISOString()}] Location updated:`, currentLocation);

    res.json({ 
      status: 'ok', 
      message: 'Location received',
      data: currentLocation 
    });
  } catch (error) {
    console.error('Error processing location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve current location
app.get('/location', (req, res) => {
  if (!currentLocation.latitude) {
    return res.status(404).json({ error: 'No location data available yet' });
  }

  res.json({
    status: 'ok',
    data: currentLocation
  });
});

// Get location as simple text (useful for debugging)
app.get('/location/text', (req, res) => {
  if (!currentLocation.latitude) {
    return res.send('No location data available yet');
  }

  const text = `
Location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}
Device: ${currentLocation.device}
Timestamp: ${currentLocation.timestamp}
Received: ${currentLocation.receivedAt}
  `.trim();

  res.type('text/plain').send(text);
});

// Status endpoint (show current location)
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    currentLocation: currentLocation,
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Location Tracking Server',
    endpoints: {
      'POST /location': 'Submit location from iPhone Shortcut',
      'GET /location': 'Get current location (JSON)',
      'GET /location/text': 'Get current location (plain text)',
      'GET /status': 'Server status and current location',
      'GET /health': 'Health check'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Location server listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Get location: http://localhost:${PORT}/location`);
});
