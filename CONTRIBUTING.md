# Contributing to Location Server

Thank you for your interest in contributing! This document explains how to get involved.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Development Setup

```bash
# Clone the repo
git clone https://github.com/jonathanrmarsh4/Node_Server.git
cd Node_Server

# Install dependencies
npm install

# Start development server
npm run dev
```

## Making Changes

### Code Style
- Use ES6+ syntax
- Consistent indentation (2 spaces)
- Meaningful variable names
- Comment complex logic
- Use `const` by default, `let` when reassignment needed

### Testing Your Changes

```bash
# Test endpoints locally
curl -X POST http://localhost:3000/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": -31.95, "longitude": 115.86, "timestamp": "2026-02-11T21:52:00Z", "device": "iPhone"}'

# Verify response
curl http://localhost:3000/location
```

### Commit Messages

Use clear, descriptive commit messages:
```
✅ Add health data storage to /location endpoint
🐛 Fix timezone handling in timestamp
📝 Update API documentation
🔧 Configure CORS for client apps
```

## Pull Request Process

1. **Fork** the repository
2. **Create a branch** for your feature
   ```bash
   git checkout -b feature/add-xyz
   ```
3. **Make your changes** with clear commits
4. **Test thoroughly** on localhost
5. **Push to your fork**
   ```bash
   git push origin feature/add-xyz
   ```
6. **Open a Pull Request** with:
   - Clear title describing the change
   - Description of what it does
   - Why it's needed
   - Testing notes

### PR Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] No console.log statements left
- [ ] Error handling is robust
- [ ] Documentation is updated
- [ ] No breaking changes (or clearly noted)

## Issues

### Reporting Bugs
Include:
- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (Node version, OS, etc.)

### Feature Requests
Include:
- Use case / motivation
- How it would work
- Alternatives considered

## Project Structure

```
Node_Server/
├── server.js          # Main application
├── package.json       # Dependencies
├── README.md          # User guide
├── CONTRIBUTING.md    # This file
├── LICENSE            # MIT License
└── .gitignore         # Git ignore rules
```

## API Endpoints (For Contributors)

### POST /location
Receives location + health data from iOS app.

**Request:**
```json
{
  "latitude": number,
  "longitude": number,
  "timestamp": string (ISO8601),
  "device": string,
  "health": object (optional),
  "settings": object (optional)
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "Location received",
  "data": { ... }
}
```

### GET /location
Retrieves latest location + health data.

### GET /health
Retrieve health metrics only.

### GET /location/history
Retrieve location history.

## Areas for Contribution

- [ ] Add authentication/JWT support
- [ ] Add data persistence (MongoDB, PostgreSQL)
- [ ] Add user management endpoints
- [ ] Add data export endpoints
- [ ] Add WebSocket support for real-time updates
- [ ] Add rate limiting
- [ ] Add request logging
- [ ] Add health check monitoring
- [ ] Add Docker support
- [ ] Add comprehensive test suite

## Questions?

Feel free to open an issue or discussion!

## Code of Conduct

- Be respectful and inclusive
- No harassment or discrimination
- Constructive feedback only
- Report issues privately if needed

---

**Thank you for contributing!** 🚀
