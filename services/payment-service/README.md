# Payment Service

Enterprise-grade payment processing service with **Stripe**, **SSLCommerce**, and **PayPal** integration, webhook handling, and refund management for the RCL E-Commerce platform.

## Features

- **Multi-Gateway Support**: Stripe, SSLCommerce (Bangladesh), PayPal
- **Payment Intent Management**: Create and manage payment intents across gateways
- **Webhook Processing**: Handle webhooks from Stripe, SSLCommerce, PayPal
- **Refund Management**: Process full and partial refunds
- **Transaction Tracking**: Comprehensive transaction logs with status tracking
- **Event-Driven**: Emits events for downstream services (Notification Service, Order Service)
- **JWT Authentication**: Secure endpoints with JWT bearer tokens
- **PostgreSQL**: Persistent transaction storage with TypeORM
- **Idempotency**: Prevents duplicate charges

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

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# SSLCommerce Configuration (Bangladesh Payment Gateway)
SSL_COMMERCE_STORE_ID=your_ssl_commerce_store_id
SSL_COMMERCE_STORE_PASSWORD=your_ssl_commerce_store_password

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Common
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Payment Intents

- `POST /payment/intents?gateway=stripe|ssl_commerce|paypal` - Create payment intent with gateway selection
- `GET /payment/intents/:id` - Get payment intent

### Transactions

- `GET /payment/transactions/order/:orderId` - Get transactions by order

### Refunds

- `POST /payment/refund` - Refund a transaction
- `GET /payment/refunds/order/:orderId` - Get refunds by order

### Webhooks

- `POST /payment/webhooks/stripe` - Stripe webhook endpoint (public, no auth)
- `POST /payment/webhooks/ssl-commerce` - SSLCommerce webhook endpoint
- `POST /payment/webhooks/paypal` - PayPal webhook endpoint

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
