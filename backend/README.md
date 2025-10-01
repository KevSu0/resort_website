# Resort Admin Panel Backend

A scalable Express.js API with TypeScript and Prisma for the Resort Management System.

## Features

- **Express.js Server** with TypeScript support
- **Prisma ORM** for database operations
- **Comprehensive Middleware**: CORS, security, rate limiting, logging
- **Health Check Endpoints** for monitoring
- **Structured Logging** with Winston
- **Error Handling** with proper HTTP status codes
- **Environment Configuration** with validation
- **Graceful Shutdown** handling
- **Testing Setup** with Jest

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Generate Prisma client:
```bash
npm run db:generate
```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset database
- `npm run db:studio` - Open Prisma Studio

### Testing & Quality
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint

## API Endpoints

### Health Checks
- `GET /health` - Comprehensive health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### API Documentation
- `GET /api` - Basic API information

## Project Structure

```
backend/
├── src/
│   ├── config/         # Environment configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic and external services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── app.ts          # Express app setup
│   └── index.ts        # Server entry point
├── tests/              # Test files
├── dist/               # Compiled output
├── logs/               # Application logs
└── prisma/             # Database schema (shared with frontend)
```

## Environment Variables

Key environment variables:

- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `CORS_ORIGIN` - Allowed CORS origins

See `.env.example` for all available variables.

## Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "database": {
      "status": "connected",
      "responseTime": 15
    },
    "memory": {
      "used": 45,
      "total": 128,
      "percentage": 35
    }
  }
}
```

## Logging

The application uses structured logging with Winston. Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## Error Handling

All errors are handled by the global error handler middleware:
- Validation errors: 400
- Authentication errors: 401
- Authorization errors: 403
- Not found errors: 404
- Server errors: 500

## Security Features

- Helmet.js security headers
- CORS configuration
- Rate limiting
- Request ID tracking
- Content type validation

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Run `npm run lint` before committing
4. Update documentation as needed

## License

MIT