# AI Rate Limiter

A distributed rate limiting middleware for Express applications using Redis as the cache layer. This project provides a robust solution to control API request rates and prevent abuse.

## Features

- Redis-based distributed rate limiting
- Sliding window algorithm for accurate rate control
- Configurable request limits and time windows
- CORS support for cross-origin requests
- Standard rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After)
- Interactive demo interface for testing
- Docker Compose setup for easy development

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Cache**: Redis (ioredis)
- **Database**: PostgreSQL

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Redis
- PostgreSQL

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-rate-limiter
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
```

## Running the Project

### Using Docker Compose (Recommended)

1. Start the services:
```bash
docker-compose up -d
```

2. Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Manual Setup

1. Start Redis:
```bash
redis-server
```

2. Start PostgreSQL:
```bash
# Using Docker
docker run -d -p 5432:5432 -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dbname postgres:alpine
```

3. Run the development server:
```bash
npm run dev
```

## Usage

### API Endpoint

The server provides a single endpoint:

```
GET /
```

Returns:
```json
{
  "success": true,
  "message": "OK"
}
```

### Rate Limit Headers

All responses include rate limit headers:

- `X-RateLimit-Limit`: Maximum requests allowed in the time window
- `X-RateLimit-Remaining`: Number of requests remaining
- `Retry-After`: Seconds until the next request is allowed (when rate limited)

### Rate Limit Configuration

Default settings:
- Limit: 10 requests
- Window: 60 seconds

When the limit is exceeded, the API returns:
```json
{
  "error": "Too Many Requests",
  "retry_after": <seconds>
}
```

## Demo Interface

Open `demo.html` in your browser to interactively test the rate limiter:

1. Open `demo.html` in a web browser
2. Click "Request" to send a single request
3. Click "Spam" to send 12 rapid requests (triggers rate limiting)
4. View real-time statistics and countdown timers

## Project Structure

```
ai-rate-limiter/
├── src/
│   ├── config/
│   │   └── redis.ts          # Redis configuration
│   ├── controllers/          # Route controllers
│   ├── middleware/
│   │   └── rateLimiter.ts    # Rate limiting middleware
│   ├── services/             # Business logic
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── server.ts             # Express server setup
├── demo.html                 # Interactive demo interface
├── docker-compose.yml        # Docker services configuration
├── package.json              # Project dependencies
├── tsconfig.json             # TypeScript configuration
└── .env                      # Environment variables
```

## How It Works

The rate limiter uses a sliding window algorithm implemented with Redis sorted sets:

1. Each request is logged with its timestamp in a Redis sorted set
2. Old requests outside the time window are automatically removed
3. The current request count is checked against the limit
4. If the limit is exceeded, the request is rejected with a 429 status
5. The client receives headers indicating remaining quota and retry time

## Development

### Available Scripts

- `npm run dev` - Start the development server with hot reload

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| DB_USER | PostgreSQL username | - |
| DB_PASS | PostgreSQL password | - |
| DB_NAME | PostgreSQL database name | - |

## License

ISC
