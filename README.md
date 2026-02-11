# Location Tracking Server

A lightweight Node.js server for tracking real-time location via iPhone Shortcuts.

## Overview

This server accepts location data POSTed from an iPhone Shortcut and stores the current location, making it accessible via a REST API.

## Features

- ✅ Accepts location from iPhone Shortcuts
- ✅ Stores current location in memory
- ✅ RESTful API endpoints
- ✅ CORS enabled (for web access)
- ✅ Zero external dependencies beyond Express.js
- ✅ Railway.app ready (free tier compatible)

## Endpoints

### Submit Location
**POST** `/location`
```json
{
  "latitude": -31.9522,
  "longitude": 115.8614,
  "timestamp": "2026-02-11T17:30:00Z",
  "device": "iPhone"
}
```

### Get Current Location
**GET** `/location`
```json
{
  "status": "ok",
  "data": {
    "latitude": -31.9522,
    "longitude": 115.8614,
    "timestamp": "2026-02-11T17:30:00Z",
    "device": "iPhone",
    "receivedAt": "2026-02-11T17:30:15Z"
  }
}
```

### Get Location (Plain Text)
**GET** `/location/text`
```
Location: -31.9522, 115.8614
Device: iPhone
Timestamp: 2026-02-11T17:30:00Z
Received: 2026-02-11T17:30:15Z
```

### Server Status
**GET** `/status`
```json
{
  "status": "running",
  "currentLocation": { ... },
  "uptime": 1234.56
}
```

### Health Check
**GET** `/health`
```json
{
  "status": "ok",
  "message": "Location server is running"
}
```

## Local Development

```bash
# Install dependencies
npm install

# Run server
npm start

# Server runs on http://localhost:3000
```

## Deploy to Railway

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/Node_Server.git
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to railway.app
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose `Node_Server` repo
   - Railway auto-detects Node.js
   - Click "Deploy"

3. **Get your public URL:**
   - Railway provides a public domain (e.g., `https://node-server-production.up.railway.app`)
   - Use this URL in your iPhone Shortcut

## iPhone Shortcut Setup

In iOS Shortcuts, use:

**POST** to: `https://your-railway-domain.up.railway.app/location`

**Headers:**
- Content-Type: application/json

**Body (JSON):**
```
{
  "latitude": [Current Location latitude],
  "longitude": [Current Location longitude],
  "timestamp": [Current Date and Time],
  "device": "iPhone"
}
```

## Configuration

The server respects environment variables:
- `PORT` - Server port (default: 3000, Railway sets this automatically)

## License

MIT

## Support

For issues, check:
1. Server is running: `GET /health`
2. Location data exists: `GET /location`
3. Recent requests in logs
