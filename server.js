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
  receivedAt: null,
  health: null,
  settings: null,
  deviceModel: null,
  userId: null
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Location server is running' });
});

// Receive location from iPhone (POST with body or query params)
app.post('/location', (req, res) => {
  try {
    // Accept data from either JSON body OR query parameters
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

    // Extract all health metrics
    const health = {
      steps: req.body.steps || req.query.steps,
      heartRate: req.body.heartRate || req.query.heartRate,
      restingHeartRate: req.body.restingHeartRate || req.query.restingHeartRate,
      heartRateVariability: req.body.heartRateVariability || req.query.heartRateVariability,
      bloodPressureSystolic: req.body.bloodPressureSystolic || req.query.bloodPressureSystolic,
      bloodPressureDiastolic: req.body.bloodPressureDiastolic || req.query.bloodPressureDiastolic,
      bloodOxygen: req.body.bloodOxygen || req.query.bloodOxygen,
      activeEnergy: req.body.activeEnergy || req.query.activeEnergy,
      basalEnergy: req.body.basalEnergy || req.query.basalEnergy,
      distance: req.body.distance || req.query.distance,
      flightsClimbed: req.body.flightsClimbed || req.query.flightsClimbed,
      sleepDuration: req.body.sleepDuration || req.query.sleepDuration,
      workouts: req.body.workouts || req.query.workouts
    };

    // Extract settings if provided
    const settings = {
      location_poll_interval_minutes: req.body.location_poll_interval_minutes || req.query.location_poll_interval_minutes || 5,
      healthkit_sync_interval_hours: req.body.healthkit_sync_interval_hours || req.query.healthkit_sync_interval_hours || 3,
      sync_on_app_open: req.body.sync_on_app_open !== undefined ? req.body.sync_on_app_open : (req.query.sync_on_app_open !== undefined ? req.query.sync_on_app_open : true),
      notifications_enabled: req.body.notifications_enabled !== undefined ? req.body.notifications_enabled : (req.query.notifications_enabled !== undefined ? req.query.notifications_enabled : true)
    };

    // Store location with all associated data
    currentLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: timestamp || new Date().toISOString(),
      device: device || 'iPhone',
      deviceModel: req.body.deviceModel || req.query.deviceModel || null,
      userId: req.body.userId || req.query.userId || null,
      altitude: req.body.altitude || req.query.altitude,
      speed: req.body.speed || req.query.speed,
      health: health,
      settings: settings,
      receivedAt: new Date().toISOString()
    };

    console.log(`[${new Date().toISOString()}] Full sync received:`, {
      location: { lat: currentLocation.latitude, lon: currentLocation.longitude },
      health: health,
      settings: settings
    });

    res.json({ 
      status: 'ok', 
      message: 'Location and health data received',
      data: currentLocation 
    });
  } catch (error) {
    console.error('Error processing location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve current location OR store if query params provided (GET accepts both)
app.get('/location', (req, res) => {
  // If query parameters are provided, store them as current location
  if (req.query.latitude !== undefined && req.query.longitude !== undefined) {
    try {
      currentLocation = {
        latitude: parseFloat(req.query.latitude),
        longitude: parseFloat(req.query.longitude),
        timestamp: req.query.timestamp || new Date().toISOString(),
        device: req.query.device || 'iPhone',
        receivedAt: new Date().toISOString(),
        health: req.query.health ? JSON.parse(req.query.health) : null,
        settings: req.query.settings ? JSON.parse(req.query.settings) : null,
        deviceModel: req.query.deviceModel || null,
        userId: req.query.userId || null
      };

      console.log(`[${new Date().toISOString()}] Location updated via GET:`, currentLocation);

      return res.json({
        status: 'ok',
        message: 'Location received',
        data: currentLocation
      });
    } catch (error) {
      console.error('Error processing location:', error);
      return res.status(400).json({ error: 'Invalid parameters' });
    }
  }

  // Otherwise, just retrieve current location
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
