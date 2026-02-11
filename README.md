# Location Tracking Server

> A lightweight, privacy-first backend for real-time location and health data synchronization from iOS devices.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![GitHub](https://img.shields.io/badge/GitHub-Node__Server-blue)](https://github.com/jonathanrmarsh4/Node_Server)

## Overview

This server accepts location and health data from iOS devices and stores it for real-time retrieval. Built to work seamlessly with the [HealthKit Location Tracker iOS App](https://github.com/jonathanrmarsh4/HealthKit-LocationTracker-iOS).

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

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Setting up development environment
- Code style and standards
- Testing your changes
- Submitting pull requests
- Roadmap and areas for help

## Roadmap

Check out [ROADMAP.md](ROADMAP.md) for planned features:
- **Phase 1**: Foundation (Current) ✅
- **Phase 2**: Data Management (April 2026) 🔄
- **Phase 3**: Intelligence (May 2026) ⏳
- **Phase 4**: Enterprise (June 2026+) ⏳

## Getting Help

- **Issues**: Check [existing issues](https://github.com/jonathanrmarsh4/Node_Server/issues)
- **Bugs**: Report with [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
- **Features**: Request with [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)
- **Questions**: [Open a Discussion](https://github.com/jonathanrmarsh4/Node_Server/discussions)

## License

[MIT License](LICENSE) - Feel free to use in your own projects!

## Support

For troubleshooting:
1. Check server status: `GET /health`
2. Verify location data: `GET /location`
3. Check server logs: `npm run dev`
4. Open an issue with debug info
