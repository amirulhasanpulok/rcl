# Payment Service

Enterprise-grade payment processing service with Stripe integration, webhook handling, and refund management for the RCL E-Commerce platform.

## Features

- **Payment Intent Management**: Create and manage Stripe payment intents
- **Webhook Processing**: Handle Stripe webhook events (payment succeeded, failed, refunded)
- **Refund Management**: Process full and partial refunds with idempotency
- **Transaction Tracking**: Comprehensive transaction logs with status tracking
- **Event-Driven**: Emits events for downstream services (Notification Service, Order Service)
- **JWT Authentication**: Secure endpoints with JWT bearer tokens
- **PostgreSQL**: Persistent transaction storage with TypeORM
- **Stripe Integration**: Full Stripe SDK integration with webhook signature verification

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Stripe Account with API keys
- Docker & Docker Compose (optional)

## Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env

# Run database migrations
yarn workspace @rcl/payment-service migration:run

# Start the service
yarn workspace @rcl/payment-service start
```

## Environment Variables

```env
PORT=3004
NODE_ENV=development
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://user:password@localhost:5432/payment_service
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Payment Intents

- `POST /payment/intents` - Create payment intent
- `GET /payment/intents/:id` - Get payment intent

### Transactions

- `GET /payment/transactions/order/:orderId` - Get transactions by order

### Refunds

- `POST /payment/refund` - Refund a transaction
- `GET /payment/refunds/order/:orderId` - Get refunds by order

### Webhooks

- `POST /payment/webhooks/stripe` - Stripe webhook endpoint (public, no auth)

### Health

- `GET /health` - Database health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

## Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/payment/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy signing secret and set `STRIPE_WEBHOOK_SECRET` environment variable

## Events Emitted

- `payment.initiated` - When payment intent is created
- `payment.completed` - When payment succeeds
- `payment.failed` - When payment fails
- `refund.processed` - When refund is completed

## Database Schema

### PaymentIntent

Stores created payment intents with Stripe metadata.

### Transaction

Records all payment transactions (charges and refunds).

### Refund

Tracks refund operations with status and amounts.

### WebhookEvent

Stores processed webhook events for audit and replay capability.

## Docker

```bash
# Build image
docker build -f docker/Dockerfile.payment-service -t rcl/payment-service .

# Run with docker-compose
docker-compose up payment-service
```

## Kubernetes

```bash
# Deploy to K8s
kubectl apply -k k8s/base/

# Deploy to production
kubectl apply -k k8s/prod/

# Deploy to staging
kubectl apply -k k8s/staging/
```

## Architecture

The Payment Service integrates with:
- **Order Service**: Receives order.created events, updates order payment status
- **Notification Service**: Emits events for payment notifications
- **API Gateway**: Routes requests with JWT authentication
- **Stripe**: External payment processor

## Security

- ✅ JWT authentication on all endpoints (except webhooks)
- ✅ Webhook signature verification with Stripe
- ✅ Idempotency keys for payment requests
- ✅ Secrets management via environment variables
- ✅ Database encryption for sensitive data
- ✅ Non-root container execution
- ✅ Read-only root filesystem

## License

MIT
