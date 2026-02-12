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

// ============================================================================
// HELPER FUNCTIONS - Data Validation & Extraction
// ============================================================================

/**
 * Extract health data from request, filtering out undefined values
 * FIX #1: Only stores values that actually exist (not undefined)
 */
function extractHealthData(body, query) {
  const health = {};
  
  const healthFields = [
    'steps', 'heartRate', 'restingHeartRate', 'heartRateVariability',
    'bloodPressureSystolic', 'bloodPressureDiastolic', 'bloodOxygen',
    'activeEnergy', 'basalEnergy', 'distance', 'flightsClimbed',
    'sleepDuration', 'workouts'
  ];
  
  // Only add fields that have actual values
  for (const field of healthFields) {
    const value = body[field] !== undefined ? body[field] : query[field];
    if (value !== undefined && value !== null && value !== '') {
      health[field] = value;
    }
  }
  
  // Return null if no health data, otherwise return object with only populated fields
  return Object.keys(health).length > 0 ? health : null;
}

/**
 * Validate health data has correct types
 * FIX #3: Ensures numeric fields are actually numbers
 */
function validateHealthData(health) {
  if (!health || typeof health !== 'object') return true;
  
  const numberFields = [
    'steps', 'heartRate', 'restingHeartRate', 'heartRateVariability',
    'bloodPressureSystolic', 'bloodPressureDiastolic', 'bloodOxygen',
    'activeEnergy', 'basalEnergy', 'distance', 'flightsClimbed',
    'sleepDuration'
  ];
  
  for (const field of numberFields) {
    if (health[field] !== undefined) {
      if (typeof health[field] !== 'number') {
        throw new Error(
          `Health data validation failed: '${field}' must be a number, ` +
          `got ${typeof health[field]} (value: ${JSON.stringify(health[field])})`
        );
      }
      
      // Validate reasonable ranges for health metrics
      if (typeof health[field] === 'number' && health[field] < 0) {
        throw new Error(
          `Health data validation failed: '${field}' cannot be negative (got ${health[field]})`
        );
      }
    }
  }
  
  return true;
}

/**
 * Safely parse JSON with detailed error reporting
 * FIX #2: Handles JSON parse errors gracefully with detailed logging
 */
function parseJSONSafely(jsonString, fieldName) {
  if (!jsonString) return null;
  if (typeof jsonString === 'object') return jsonString; // Already parsed
  
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    const errorMsg = `Invalid ${fieldName} JSON: ${error.message}`;
    console.error(`❌ ${errorMsg}`);
    console.error(`   Raw input: ${jsonString.substring(0, 100)}${jsonString.length > 100 ? '...' : ''}`);
    throw new Error(errorMsg);
  }
}

/**
 * Extract settings from request with defaults
 */
function extractSettings(body, query) {
  return {
    location_poll_interval_minutes: 
      body.location_poll_interval_minutes || query.location_poll_interval_minutes || 5,
    healthkit_sync_interval_hours: 
      body.healthkit_sync_interval_hours || query.healthkit_sync_interval_hours || 3,
    sync_on_app_open: 
      body.sync_on_app_open !== undefined ? body.sync_on_app_open : 
      (query.sync_on_app_open !== undefined ? query.sync_on_app_open : true),
    notifications_enabled: 
      body.notifications_enabled !== undefined ? body.notifications_enabled : 
      (query.notifications_enabled !== undefined ? query.notifications_enabled : true)
  };
}

// ============================================================================
// HTTP ENDPOINTS
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Location server is running' });
});

/**
 * POST /location - Receive location and health data from iPhone
 * Accepts: JSON body or query parameters
 * Returns: Stored location with health data
 */
app.post('/location', (req, res) => {
  try {
    // Extract required location fields
    let latitude = req.body.latitude !== undefined ? req.body.latitude : req.query.latitude;
    let longitude = req.body.longitude !== undefined ? req.body.longitude : req.query.longitude;
    let timestamp = req.body.timestamp || req.query.timestamp;
    let device = req.body.device || req.query.device;

    // Validate required fields
    if (latitude === null || latitude === undefined || 
        longitude === null || longitude === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: latitude and longitude' 
      });
    }

    // FIX #1: Extract health data (only populated fields)
    const health = extractHealthData(req.body, req.query);
    
    // FIX #3: Validate health data types
    if (health) {
      validateHealthData(health);
    }

    // Extract settings
    const settings = extractSettings(req.body, req.query);

    // Store location with all associated data
    currentLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: timestamp || new Date().toISOString(),
      device: device || 'iPhone',
      deviceModel: req.body.deviceModel || req.query.deviceModel || null,
      userId: req.body.userId || req.query.userId || null,
      altitude: req.body.altitude !== undefined ? req.body.altitude : req.query.altitude || null,
      speed: req.body.speed !== undefined ? req.body.speed : req.query.speed || null,
      health: health,
      settings: settings,
      receivedAt: new Date().toISOString()
    };

    // FIX #4: Detailed logging
    console.log(`[${new Date().toISOString()}] ✅ Location sync received:`, {
      location: { 
        latitude: currentLocation.latitude, 
        longitude: currentLocation.longitude 
      },
      health: health ? Object.keys(health) : 'none',  // Log which fields we got
      settings: settings,
      userId: currentLocation.userId
    });

    res.json({ 
      status: 'ok', 
      message: 'Location and health data received successfully',
      data: currentLocation 
    });
  } catch (error) {
    // FIX #4: Detailed error logging
    console.error(`❌ Error processing POST /location:`, {
      error: error.message,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString(),
      bodyKeys: Object.keys(req.body || {}),
      queryKeys: Object.keys(req.query || {})
    });
    
    res.status(400).json({ 
      error: error.message || 'Error processing location data',
      hint: 'Check server logs for details'
    });
  }
});

/**
 * GET /location - Retrieve current location OR store via query params
 * Query params: latitude, longitude, timestamp, device, health (JSON), settings (JSON)
 * Returns: Current location with all data
 */
app.get('/location', (req, res) => {
  // If query parameters are provided, store them as current location
  if (req.query.latitude !== undefined && req.query.longitude !== undefined) {
    try {
      // FIX #2: Safe JSON parsing with error handling
      let health = null;
      let settings = null;
      
      if (req.query.health) {
        health = parseJSONSafely(req.query.health, 'health');
      }
      
      if (req.query.settings) {
        settings = parseJSONSafely(req.query.settings, 'settings');
      }
      
      // FIX #3: Validate health data
      if (health) {
        validateHealthData(health);
      }

      currentLocation = {
        latitude: parseFloat(req.query.latitude),
        longitude: parseFloat(req.query.longitude),
        timestamp: req.query.timestamp || new Date().toISOString(),
        device: req.query.device || 'iPhone',
        deviceModel: req.query.deviceModel || null,
        userId: req.query.userId || null,
        receivedAt: new Date().toISOString(),
        health: health,
        settings: settings || extractSettings({}, {})
      };

      // FIX #4: Detailed logging
      console.log(`[${new Date().toISOString()}] ✅ Location updated via GET:`, {
        location: { 
          latitude: currentLocation.latitude, 
          longitude: currentLocation.longitude 
        },
        health: health ? Object.keys(health) : 'none',
        userId: currentLocation.userId
      });

      return res.json({
        status: 'ok',
        message: 'Location received',
        data: currentLocation
      });
    } catch (error) {
      // FIX #4: Detailed error logging for parse/validation errors
      console.error(`❌ Error processing GET /location:`, {
        error: error.message,
        errorType: error.constructor.name,
        timestamp: new Date().toISOString(),
        queryString: req.originalUrl
      });
      
      return res.status(400).json({ 
        error: error.message || 'Invalid parameters',
        hint: 'Check server logs for details'
      });
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

/**
 * GET /location/text - Get location as plain text (useful for debugging)
 */
app.get('/location/text', (req, res) => {
  if (!currentLocation.latitude) {
    return res.send('No location data available yet');
  }

  let text = `
Location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}
Device: ${currentLocation.device}
Timestamp: ${currentLocation.timestamp}
Received: ${currentLocation.receivedAt}`;

  if (currentLocation.health) {
    text += `\n\nHealth Data:`;
    for (const [key, value] of Object.entries(currentLocation.health)) {
      text += `\n  ${key}: ${value}`;
    }
  }

  if (currentLocation.userId) {
    text += `\n\nUser ID: ${currentLocation.userId}`;
  }

  res.type('text/plain').send(text.trim());
});

/**
 * GET /status - Server status and current location
 */
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    currentLocation: currentLocation,
    uptime: process.uptime(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage()
  });
});

/**
 * GET / - Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Location Tracking Server with HealthKit Data Support',
    version: '2.0.0',
    fixedIssues: [
      'FIX #1: Undefined values no longer stored (filters empty fields)',
      'FIX #2: JSON parse errors handled gracefully with details',
      'FIX #3: Health data type validation (numbers must be numbers)',
      'FIX #4: Detailed error logging for debugging'
    ],
    endpoints: {
      'POST /location': 'Submit location and health data from iPhone',
      'GET /location': 'Get current location (JSON)',
      'GET /location/text': 'Get current location (plain text)',
      'GET /status': 'Server status and current location',
      'GET /health': 'Health check'
    },
    documentation: {
      'healthData': {
        'description': 'Health metrics from HealthKit',
        'type': 'object',
        'fields': {
          'steps': { 'type': 'number', 'unit': 'steps' },
          'heartRate': { 'type': 'number', 'unit': 'bpm' },
          'restingHeartRate': { 'type': 'number', 'unit': 'bpm' },
          'heartRateVariability': { 'type': 'number', 'unit': 'ms' },
          'bloodPressureSystolic': { 'type': 'number', 'unit': 'mmHg' },
          'bloodPressureDiastolic': { 'type': 'number', 'unit': 'mmHg' },
          'bloodOxygen': { 'type': 'number', 'unit': '%' },
          'activeEnergy': { 'type': 'number', 'unit': 'kcal' },
          'basalEnergy': { 'type': 'number', 'unit': 'kcal' },
          'distance': { 'type': 'number', 'unit': 'meters' },
          'flightsClimbed': { 'type': 'number', 'unit': 'flights' },
          'sleepDuration': { 'type': 'number', 'unit': 'minutes' },
          'workouts': { 'type': 'array', 'description': 'Array of workout objects' }
        }
      }
    }
  });
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', {
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    hint: 'Check server logs for details'
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
═══════════════════════════════════════════════════════════════
  ✅ Location Server v2.0 (Fixed)
  📍 Listening on port ${PORT}
═══════════════════════════════════════════════════════════════

  Endpoints:
  - Health check:    http://localhost:${PORT}/health
  - Get location:    http://localhost:${PORT}/location
  - Server status:   http://localhost:${PORT}/status
  - Documentation:   http://localhost:${PORT}/

  Fixes Applied:
  ✅ FIX #1: Undefined values filtered (no more undefined in health object)
  ✅ FIX #2: JSON parse errors handled with detailed logging
  ✅ FIX #3: Health data type validation (numeric fields checked)
  ✅ FIX #4: Detailed error logging for debugging

═══════════════════════════════════════════════════════════════
  `);
});
