# RCL E-Commerce Platform - Cloud-Native Microservice Architecture

Enterprise-grade, production-ready microservice e-commerce platform using Next.js, NestJS, PostgreSQL, MongoDB, Redis, RabbitMQ, and Kubernetes.

## 🏗️ Architecture Overview

This is a real production system blueprint comparable to Amazon/Shopify architecture, with:
- **Microservice-based** - Independent services with database-per-service pattern
- **Event-driven** - Asynchronous communication via RabbitMQ
- **API-first** - Clean REST/GraphQL APIs
- **Cloud-native** - Kubernetes-ready, horizontally scalable
- **Zero-trust security** - JWT authentication, RBAC, encrypted secrets

## 📦 Project Structure

```
rcl/
├── apps/                          # Frontend & API Gateway
│   ├── admin-nextjs/             # Admin dashboard (Next.js)
│   ├── storefront-nextjs/        # Web store (Next.js)
│   └── api-gateway/              # NestJS API Gateway
├── services/                      # Microservices
│   ├── auth-service/             # Authentication (NestJS + PostgreSQL)
│   ├── product-service/          # Products (NestJS + MongoDB)
│   ├── order-service/            # Orders (NestJS + PostgreSQL)
│   ├── payment-service/          # Payments (NestJS + PostgreSQL)
│   ├── inventory-service/        # Inventory (NestJS + PostgreSQL)
│   └── notification-service/     # Notifications (NestJS + MongoDB)
├── packages/                      # Shared libraries
│   ├── common/                   # Common utilities & types
│   ├── auth-client/              # Auth client library
│   └── event-bus/                # Event bus abstraction
├── docker/                        # Docker configuration
│   ├── Dockerfile.api-gateway
│   ├── Dockerfile.auth-service
│   └── docker-compose.yml
└── k8s/                          # Kubernetes manifests
    ├── base/                     # Base configuration
    ├── prod/                     # Production overlays
    └── staging/                  # Staging overlays
```

## 🚀 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 |
| API Gateway | NestJS |
| Services | NestJS |
| REST APIs | Express (via NestJS) |
| GraphQL | Apollo Server |
| Databases | PostgreSQL, MongoDB |
| Caching | Redis |
| Message Bus | RabbitMQ |
| Real-time | WebSocket (NestJS) |
| Container | Docker |
| Orchestration | Kubernetes |
| Language | TypeScript (everywhere) |

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Kubernetes 1.24+ (for K8s deployment)

### Local Development

1. **Clone and install:**
```bash
cd rcl
yarn install
```

2. **Start local environment (Docker):**
```bash
yarn docker:up
```

3. **Development mode:**
```bash
yarn dev
```

This will start:
- API Gateway: `http://localhost:3000`
- Auth Service: `http://localhost:3001`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- RabbitMQ: `http://localhost:15672`

### API Documentation

- **API Gateway Docs:** `http://localhost:3000/api/docs`
- **Auth Service Docs:** `http://localhost:3001/api/docs`
- **RabbitMQ Management:** `http://localhost:15672` (guest/guest)

## 📋 Phase 1 Implementation (Complete)

✅ Monorepo setup with yarn workspaces
✅ API Gateway (NestJS) - Authentication, validation, routing
✅ Auth Service (NestJS + PostgreSQL) - User management, JWT
✅ Shared packages (@rcl/common)
✅ Docker Compose for local development
✅ Kubernetes manifests (base, staging, prod)

### Available Endpoints

**Auth Service:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get tokens
- `GET /auth/me` - Get current user (protected)
- `GET /auth/verify` - Verify token (protected)
- `GET /health` - Health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

## 🔐 Security Features

- ✅ JWT + Refresh Tokens
- ✅ Password hashing (bcryptjs)
- ✅ Role-Based Access Control (RBAC)
- ✅ Input validation & DTOs
- ✅ Helmet.js middleware
- ✅ CORS configuration
- ✅ Environment-based secrets
- ✅ Audit logging
- ⏳ OAuth2 (Google, Apple) - Coming soon
- ⏳ Request signing - Coming soon

## 📊 Database Architecture

| Service | Database | Pattern |
|---------|----------|---------|
| auth-service | PostgreSQL | Database-per-service |
| product-service | MongoDB | Database-per-service |
| order-service | PostgreSQL | Database-per-service |
| payment-service | PostgreSQL | Database-per-service |
| inventory-service | PostgreSQL | Database-per-service |
| notification-service | MongoDB | Database-per-service |
| Caching | Redis | Shared infrastructure |
| Events | RabbitMQ | Shared infrastructure |

## 🐳 Docker Deployment

Build and run all services:
```bash
yarn docker:build
yarn docker:up
```

View logs:
```bash
docker-compose -f docker/docker-compose.yml logs -f
```

## ☸️ Kubernetes Deployment

**Base deployment (development):**
```bash
kubectl apply -k k8s/base
```

**Production deployment:**
```bash
kubectl apply -k k8s/prod
```

**Staging deployment:**
```bash
kubectl apply -k k8s/staging
```

**Check status:**
```bash
kubectl get all -n rcl-platform
```

**View logs:**
```bash
kubectl logs -n rcl-platform -f deployment/auth-service
```

## 🧪 Testing

Run all tests:
```bash
yarn test
```

Coverage report:
```bash
yarn test:cov
```

E2E tests:
```bash
yarn test:e2e
```

## 🏗️ Microservice Communication

### Synchronous (REST)
```
Client → API Gateway → Auth Service / Product Service
```

### Asynchronous (Events)
```
Service A → RabbitMQ → Service B
  order.created → payment-service
  payment.completed → notification-service
  stock.reserved → inventory-service
```

## 📈 Scaling & Performance

- Kubernetes HPA (Horizontal Pod Autoscaler) configured
- API Gateway: scales 2-10 replicas based on CPU/memory
- Auth Service: scales 2-8 replicas
- Redis for caching and sessions
- Database connection pooling
- Request rate limiting configured

## 🔄 CI/CD Pipeline

Ready for integration with:
- GitHub Actions
- GitLab CI
- AWS CodePipeline
- GCP Cloud Build

## 📚 Service Documentation

- [API Gateway](apps/api-gateway/README.md)
- [Auth Service](services/auth-service/README.md)

## 🚦 Health Checks & Probes

All services expose:
- `GET /health` - Liveness probe
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Kubernetes liveness

## 🛠️ Development Commands

```bash
# Install dependencies
yarn install

# Build all services
yarn build

# Start development
yarn dev

# Lint code
yarn lint

# Format code
yarn format

# Run tests
yarn test

# Docker operations
yarn docker:build
yarn docker:up
yarn docker:down

# Kubernetes operations
yarn k8s:apply
yarn k8s:prod
yarn k8s:staging
```

## 📝 Environment Variables

Each service has `.env.example`. Copy and configure:
```bash
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp services/auth-service/.env.example services/auth-service/.env
```

**Key variables:**
- `NODE_ENV` - development/production
- `JWT_SECRET` - Secret key for JWT signing
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` - Database config
- `CORS_ORIGIN` - Allowed CORS origins

## 🗺️ Next Phases (Coming Soon)

- **Phase 2:** Product Service (Product catalog, search, variants)
- **Phase 3:** Order Service (Cart, checkout, order management)
- **Phase 4:** Payment Service (Payment processing, refunds)
- **Phase 5:** Inventory Service (Stock management, multi-warehouse)
- **Phase 6:** Notification Service (Email, SMS, push)
- **Phase 7:** Admin Dashboard (Next.js)
- **Phase 8:** Web Store (Next.js)

## 📖 Architecture Principles

- **Domain-Driven Design** - Services organized by business domain
- **SOLID Principles** - Clean code architecture
- **12-Factor App** - Cloud-native best practices
- **Event Sourcing** - Event-driven workflows
- **CQRS** - Command Query Responsibility Segregation (optional)
- **Circuit Breaker** - Fault tolerance patterns
- **Graceful Degradation** - Service resilience

## 🤝 Contributing

1. Feature branches from main
2. Clean commit history
3. Tests required for new features
4. Pull request reviews
5. Semantic versioning for releases

## 📞 Support

For issues or questions, refer to:
- Service-specific READMEs
- Architecture documentation
- API Swagger docs
- Kubernetes monitoring

## 📄 License

Enterprise proprietary - All rights reserved

---

**Version:** 1.0.0 (Phase 1 Complete)  
**Last Updated:** January 2026  
**Status:** Production-Ready ✅