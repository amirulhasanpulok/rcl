# Inventory Service

Multi-warehouse inventory management microservice for the RCL E-Commerce platform. Manages stock levels, reservations, multi-warehouse distribution, and stock movements.

## Features

- **Multi-Warehouse Support**: Manage inventory across multiple warehouses
- **Stock Management**: Track available, reserved, and damaged stock
- **Reservation System**: Reserve stock for orders with expiration
- **Stock Movements**: Complete audit trail of all inventory movements
- **Low Stock Alerts**: Monitor products below minimum thresholds
- **Automatic Cleanup**: Expire reservations automatically
- **Event-Driven**: Emits events for stock updates and changes
- **JWT Authentication**: Secure endpoints with bearer tokens
- **PostgreSQL**: Persistent storage with TypeORM

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

## Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env

# Run database migrations
yarn workspace @rcl/inventory-service migration:run

# Start the service
yarn workspace @rcl/inventory-service start
```

## Environment Variables

```env
PORT=3005
NODE_ENV=development
JWT_SECRET=your-jwt-secret
INVENTORY_DB_HOST=localhost
INVENTORY_DB_PORT=5432
INVENTORY_DB_USER=inventory_user
INVENTORY_DB_PASSWORD=inventory_password
INVENTORY_DB_NAME=inventory_service
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Warehouse Management

- `POST /inventory/warehouses` - Create warehouse
- `GET /inventory/warehouses` - Get all active warehouses
- `GET /inventory/warehouses/:id` - Get warehouse by ID

### Inventory Levels

- `GET /inventory/levels/:productId/:warehouseId` - Get inventory level
- `GET /inventory/levels/product/:productId` - Get all inventory for product
- `POST /inventory/levels/initialize` - Initialize product-warehouse inventory
- `PUT /inventory/levels/:productId/:warehouseId` - Update inventory level

### Reservations

- `POST /inventory/reservations/reserve` - Reserve stock for order (expires after duration)
- `POST /inventory/reservations/confirm` - Confirm reservation (convert to actual deduction)
- `POST /inventory/reservations/cancel` - Cancel reservation and release stock
- `GET /inventory/reservations/order/:orderId` - Get all reservations for order

### Stock Adjustments

- `POST /inventory/adjustments` - Adjust stock (add/remove/return/damage)
- `GET /inventory/movements/:productId` - Get stock movement history
- `GET /inventory/low-stock` - Get products below minimum threshold

### Health

- `GET /health` - Database health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

## Database Schema

### Warehouses

Physical warehouse locations where inventory is stored.

```sql
- id: UUID (primary key)
- name: String
- city: String
- country: String
- address: String (optional)
- latitude/longitude: Decimal (optional)
- manager: String (optional)
- contactPhone: String (optional)
- isActive: Boolean
```

### Inventory Levels

Stock levels for each product in each warehouse.

```sql
- id: UUID (primary key)
- productId: UUID
- warehouseId: UUID (foreign key)
- quantity: Integer (total stock)
- reserved: Integer (reserved for orders)
- available: Integer (quantity - reserved)
- minimumThreshold: Integer (reorder point)
- maximumCapacity: Integer (storage limit)
- sku: String (optional)
- isActive: Boolean
```

### Reservations

Stock reservations for orders, with automatic expiration.

```sql
- id: UUID (primary key)
- orderId: UUID
- productId: UUID
- warehouseId: UUID
- quantity: Integer
- status: Enum (active, confirmed, cancelled, expired)
- expiresAt: Timestamp
- confirmedAt: Timestamp (optional)
- cancelledAt: Timestamp (optional)
```

### Stock Movements

Audit trail of all inventory changes.

```sql
- id: UUID (primary key)
- productId: UUID
- warehouseId: UUID
- type: Enum (inbound, outbound, return, adjustment, damage, reservation, release)
- quantity: Integer (change amount)
- balanceBefore: Integer
- balanceAfter: Integer
- reference: String (optional - order/return ID)
- reason: String (optional)
- userId: UUID (optional)
```

## Docker

```bash
# Build image
docker build -f docker/Dockerfile.inventory-service -t rcl/inventory-service .

# Run with docker-compose
docker-compose up inventory-service
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

## Workflow Examples

### Reserve Stock for Order

```typescript
// 1. Reserve stock when order is created
const reservation = await inventoryService.reserveStock(userId, {
  productId,
  warehouseId,
  quantity: 5,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
});

// 2. Confirm reservation when payment completes
await inventoryService.confirmReservation({
  reservationId: reservation.id,
});
```

### Handle Returns

```typescript
// Adjust stock when customer returns item
await inventoryService.adjustStock(userId, {
  productId,
  warehouseId,
  type: StockMovementType.RETURN,
  quantity: 5,
  reason: 'Customer return',
  reference: 'ORD-123456',
});
```

### Monitor Low Stock

```typescript
// Get products needing reorder
const lowStockProducts = await inventoryService.getLowStockProducts();

// Trigger reorder workflow for each
```

## Events Emitted

- `stock.reserved` - Stock reserved for order
- `stock.confirmed` - Reservation converted to actual deduction
- `stock.released` - Stock released from cancelled reservation
- `stock.updated` - Inventory level updated
- `stock.adjusted` - Stock adjusted (damage, return, etc.)

## Architecture

The Inventory Service integrates with:
- **Order Service**: Receives order.created events, reserves stock
- **Notification Service**: Emits low-stock alerts
- **API Gateway**: Routes requests with JWT authentication

## Security

- ✅ JWT authentication on all endpoints (except health)
- ✅ Database encryption for sensitive data
- ✅ Secrets management via environment variables
- ✅ Non-root container execution
- ✅ Read-only root filesystem
- ✅ Audit trail for all stock movements

## License

MIT
