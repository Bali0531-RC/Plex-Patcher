# Plexdev - Patcher

A dark-themed utility site for PlexDevelopment products, providing temporary patches for common issues.

## Features

### 🔧 Dashboard Database Fixer (Patch #1)
Fixes dashboard table issues in MongoDB when configuration updates don't sync properly. This tool allows you to:
- Connect to your MongoDB database
- View dashboard records
- Update guildID, url, and port values
- Maintain the same document ID (no deletion, only updates)

## Installation

### Option 1: Docker (Recommended)

#### Quick Start (Linux/Mac)
```bash
./start.sh
```

#### Manual Setup
1. Make sure Docker and Docker Compose are installed on your system

2. Clone or download this repository

3. Build and run with Docker Compose:
```bash
docker-compose up -d
```

4. The application will be available at:
```
http://localhost:3313
```

   **Note:** The service runs on `127.0.0.1:3313` and is intended to be proxied through your local nginx.

5. Stop the application:
```bash
docker-compose down
```

### Option 2: Local Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. Open the application in your browser:
   - Docker (via nginx proxy): Configure your nginx to proxy to http://127.0.0.1:3313
   - Local: http://localhost:3000

2. Follow the on-screen instructions:
   - Enter your MongoDB connection URI
   - Connect to your database
   - Review and update your dashboard configuration
   - Save changes

## MongoDB URI Examples

### Local MongoDB:
```
mongodb://localhost:27017/your-database-name
```

### MongoDB Atlas:
```
mongodb+srv://username:password@cluster.mongodb.net/database-name
```

## Security Note

⚠️ **Important**: This tool connects directly to your MongoDB database. Make sure to:
- Only use this tool in a secure environment
- Never expose your MongoDB credentials
- Use appropriate firewall rules
- Consider running this locally or on a secure network

## Docker Deployment

### Building the Image
```bash
docker build -t plexdev-patcher .
```

### Running with Docker Compose
```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Nginx Configuration Example
```nginx
location /patcher/ {
    proxy_pass http://127.0.0.1:3313/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Custom Port Configuration
Edit `docker-compose.yml` to change the exposed port:
```yaml
ports:
  - "127.0.0.1:YOUR_PORT:3000"
```

## Technology Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (user-provided)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom dark theme with responsive design (matching plexaddons theme)
- **Deployment**: Docker & Docker Compose

## Project Structure

```
plexpatch/
├── server.js              # Backend server
├── package.json           # Dependencies
├── Dockerfile             # Docker image configuration
├── docker-compose.yml     # Docker Compose setup
├── .dockerignore          # Docker ignore rules
├── .env.example           # Environment variables template
└── public/
    ├── index.html         # Main HTML page
    ├── styles.css         # Dark theme styling
    └── app.js             # Client-side JavaScript
```

## Author

Created with ❤️ for bali0531
Community Member & Moderator Tools

## License

MIT
