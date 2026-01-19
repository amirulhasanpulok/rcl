# Order Service

Enterprise order management microservice. Handles shopping cart, checkout, order lifecycle, and order tracking.

## Features

- **Shopping Cart** - Add, update, remove items from cart
- **Checkout** - Create orders from cart
- **Order Management** - CRUD operations for orders
- **Order Tracking** - Track order status from pending to delivered
- **Cart Persistence** - Save cart state across sessions
- **Shipping Management** - Shipping address and method selection
- **Coupon Support** - Apply discount codes
- **Event-Driven** - Emits events:
  - order.created
  - order.status.changed
  - order.payment.updated
  - order.cancelled
  - cart.item.added
  - cart.item.removed
  - cart.abandoned
- **PostgreSQL** - Persistent order and cart storage
- **Swagger/OpenAPI** - Complete API documentation

## Development

### Setup

```bash
cd services/order-service
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

Once running, visit `http://localhost:3003/api/docs` for interactive API documentation.

## Database

Uses PostgreSQL with TypeORM. Tables:
- `carts` - Shopping carts
- `orders` - Customer orders

## API Endpoints

### Cart Management (Protected - JWT Required)

```
GET    /cart                       # Get current cart
POST   /cart/items                 # Add item to cart
PUT    /cart/items/:productId      # Update item quantity
DELETE /cart/items/:productId      # Remove item from cart
DELETE /cart                        # Clear entire cart
PUT    /cart/shipping              # Set shipping address
POST   /cart/coupon                # Apply coupon code
POST   /cart/abandon               # Mark cart as abandoned
```

### Order Management (Protected - JWT Required)

```
POST   /orders                     # Create order (checkout)
GET    /orders                     # Get user orders (paginated)
GET    /orders/:id                 # Get order by ID
GET    /orders/number/:orderNumber # Get order by order number
PUT    /orders/:id/status          # Update order status
POST   /orders/:id/cancel          # Cancel order
```

### Health

```
GET    /health                     # Health check
GET    /health/ready               # Readiness probe
GET    /health/live                # Liveness probe
```

## Order Lifecycle

1. **PENDING** - Order created, awaiting payment
2. **CONFIRMED** - Payment received
3. **PROCESSING** - Order being picked and packed
4. **SHIPPED** - Order dispatched with tracking
5. **DELIVERED** - Order received by customer
6. **CANCELLED** - Order cancelled (if not shipped)
7. **REFUNDED** - Order refunded

## Payment States

- **PENDING** - Awaiting payment
- **PAID** - Payment received
- **FAILED** - Payment failed
- **REFUNDED** - Payment refunded

## Architecture

- Database-per-service pattern (PostgreSQL)
- Event-driven communication
- JWT-based authentication
- Modular design with separate controllers and services
- Clean API design with DTOs
- Comprehensive error handling
