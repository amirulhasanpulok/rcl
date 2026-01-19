# Auth Service

Enterprise-grade authentication microservice. Handles user registration, login, token issuing, roles & permissions management.

## Features

- **User Registration** - Secure user account creation with email and username validation
- **User Login** - Email/password authentication with bcrypt hashing
- **JWT Tokens** - Access tokens (24h) and refresh tokens (7d)
- **Role-Based Access Control** - Admin, Vendor, Customer roles
- **User Management** - Retrieve user profile information
- **PostgreSQL** - Persistent user data storage
- **Swagger/OpenAPI** - Auto-generated API documentation
- **Security** - Helmet middleware, input validation, password hashing

## Development

### Setup

```bash
cd services/auth-service
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

Once running, visit `http://localhost:3001/api/docs` for interactive API documentation.

## Database

Uses PostgreSQL with TypeORM. Run migrations:

```bash
yarn migration:run
```

## Architecture

- Database-per-service pattern (PostgreSQL)
- Clean service architecture
- Modular design with TypeORM integration
- Comprehensive error handling
- JWT-based authentication strategy
