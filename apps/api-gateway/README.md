# API Gateway

The API Gateway is the single public entry point for all client requests. It handles authentication, authorization, rate limiting, request validation, and routing to backend microservices.

## Features

- **JWT Authentication** - Token-based authentication with access and refresh tokens
- **Role-Based Access Control (RBAC)** - Permission-based authorization
- **Rate Limiting** - Request throttling to prevent abuse
- **API Aggregation** - Single endpoint for multiple services
- **Request Validation** - Input validation using DTOs and class-validator
- **Swagger/OpenAPI** - Auto-generated API documentation
- **Logging & Tracing** - Structured logging with Winston
- **Circuit Breaking** - Fault tolerance for downstream service calls
- **CORS** - Cross-Origin Resource Sharing configuration

## Development

### Setup

```bash
cd apps/api-gateway
yarn install
```

### Running

```bash
# Development with hot reload
yarn start:dev

# Production build
yarn build
yarn start:prod
```

### Testing

```bash
yarn test
yarn test:cov
yarn test:e2e
```

## Environment Variables

See `.env.example` for required environment variables.

## API Documentation

Once running, visit `http://localhost:3000/api/docs` for interactive API documentation.

## Architecture

The API Gateway follows NestJS best practices:
- Modular architecture with feature-based organization
- Dependency injection for loose coupling
- Guards and decorators for cross-cutting concerns
- Comprehensive error handling
- TypeScript strict mode
