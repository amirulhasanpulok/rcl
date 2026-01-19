# Logistics Service - Delivery Orchestration Platform

## Overview

The Logistics Service is the **Delivery Brain** of the Commerce Operating System, providing enterprise-grade multi-courier shipment management, intelligent routing, auto-booking, and COD (Cash-on-Delivery) reconciliation.

### Key Capabilities

- **🚚 Multi-Courier Integration**: Seamlessly integrate with Steadfast and Pathao (Bangladesh) with extensible adapter pattern
- **🤖 Smart Routing**: Automatic courier selection based on delivery city, priority, and cost optimization
- **⚡ Auto-Booking**: Automatic shipment booking with courier APIs on order confirmation
- **📍 Real-time Tracking**: Bi-directional status synchronization with courier systems
- **💰 COD Reconciliation**: Cash-on-Delivery tracking, reporting, and financial reconciliation
- **📊 Multi-Tenant**: Complete tenant isolation with per-tenant courier accounts
- **🏆 Enterprise-Grade**: Designed for national marketplaces and SaaS commerce platforms

---

## Architecture

### Database Schema (PostgreSQL)

#### Shipments Table
```sql
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  order_id VARCHAR(255) NOT NULL,
  courier VARCHAR(50) NOT NULL,  -- 'STEADFAST', 'PATHAO'
  tracking_number VARCHAR(255),
  status VARCHAR(50) NOT NULL,   -- 'PENDING', 'BOOKED', 'IN_TRANSIT', 'DELIVERED', etc.
  recipient_info JSONB NOT NULL, -- {name, phone, address, city, state, zipCode}
  cost DECIMAL(12,2),
  courier_response JSONB,        -- Raw API response from courier
  status_history JSONB NOT NULL, -- [{status, timestamp, message}]
  estimated_delivery_date TIMESTAMP,
  actual_delivery_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, order_id),
  UNIQUE(tenant_id, tracking_number)
);

CREATE INDEX idx_shipments_tenant_status ON shipments(tenant_id, status);
```

#### Courier Accounts Table
```sql
CREATE TABLE courier_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  courier_name VARCHAR(50) NOT NULL,  -- 'STEADFAST', 'PATHAO'
  api_key VARCHAR(500) NOT NULL,
  api_secret VARCHAR(500),
  config JSONB,                       -- Courier-specific settings
  is_enabled BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,             -- Lower = higher priority
  servicable_cities TEXT[],           -- Delivery cities supported
  base_cost DECIMAL(12,2),
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, courier_name)
);
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Logistics Service (3010)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           REST API (10 Endpoints)                   │  │
│  │  POST /logistics/shipments/create                   │  │
│  │  GET /logistics/shipments/:id                       │  │
│  │  GET /logistics/shipments/order/:orderId            │  │
│  │  PUT /logistics/shipments/:id/status                │  │
│  │  POST /logistics/shipments/:id/sync                 │  │
│  │  POST /logistics/couriers/setup                     │  │
│  │  GET /logistics/couriers                            │  │
│  │  PUT /logistics/couriers/:courierName/toggle        │  │
│  │  GET /logistics/reconciliation/cod                  │  │
│  └──────────────────────────────────────────────────────┘  │
│              ↓              ↓              ↓                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Shipment    │  │  Courier     │  │  Routing &   │     │
│  │  Manager     │  │  Adapter     │  │  Reconcil.   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ↓                   ↓                   ↓             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            PostgreSQL Database                       │  │
│  │    (Shipments, Courier Accounts, Status History)    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│         ↓ (Shipment Events via RabbitMQ)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Courier API Integration                            │  │
│  │  - Steadfast API (Bangladesh)                        │  │
│  │  - Pathao Courier API (Bangladesh)                  │  │
│  │  - Extensible adapter pattern for more couriers     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js 18+ | JavaScript runtime |
| Framework | NestJS 10.3.0 | Enterprise microservice framework |
| Language | TypeScript 5 | Type-safe development |
| Database | PostgreSQL 15 | Transactional data store |
| ORM | TypeORM 0.3+ | Database abstraction |
| HTTP Client | Axios | Courier API communication |
| Authentication | JWT + Passport | Secure API access |
| API Docs | Swagger/OpenAPI | Interactive API documentation |
| Security | Helmet | HTTP headers security |
| Compression | Compression | Response compression |

---

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 15+ (local or connection string)
- Environment variables configured

### Step 1: Install Dependencies

```bash
cd services/logistics-service
npm install
```

### Step 2: Configure Environment

Create `.env.logistics` file in the root of the project:

```env
# Service
NODE_ENV=development
PORT=3010

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=logistics_db

# Authentication
JWT_SECRET=logistics-service-secret-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3007,http://localhost:3008

# Courier APIs
STEADFAST_API_KEY=your_steadfast_api_key
STEADFAST_API_URL=https://steadfast.com.bd/api/v1

PATHAO_API_KEY=your_pathao_api_key
PATHAO_API_SECRET=your_pathao_api_secret
PATHAO_API_URL=https://api.pathao.com/v1

# RabbitMQ (for event integration)
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### Step 3: Run Migrations

```bash
npm run typeorm migration:run
```

### Step 4: Start Development Server

```bash
npm run start:dev
```

Server starts on `http://localhost:3010`
Swagger Docs: `http://localhost:3010/docs`

---

## API Endpoints

### 1. Create Shipment (Auto-Book Courier)

```http
POST /logistics/shipments/create
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "orderId": "order-12345",
  "tenantId": "tenant-abc",
  "recipientInfo": {
    "name": "Ahmed Hassan",
    "phone": "01712345678",
    "address": "123 Main St, Apartment 4B",
    "city": "Dhaka",
    "state": "Dhaka",
    "zipCode": "1100"
  },
  "itemCount": 3,
  "weight": 2.5,
  "codAmount": 5000
}

Response:
{
  "id": "shipment-uuid",
  "trackingNumber": "SF123456789",
  "courier": "STEADFAST",
  "status": "BOOKED",
  "cost": 150,
  "estimatedDeliveryDate": "2024-12-20T18:00:00Z"
}
```

### 2. Get Shipment Details

```http
GET /logistics/shipments/:id
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "id": "shipment-uuid",
  "orderId": "order-12345",
  "trackingNumber": "SF123456789",
  "courier": "STEADFAST",
  "status": "IN_TRANSIT",
  "recipientInfo": {...},
  "cost": 150,
  "statusHistory": [
    {"status": "BOOKED", "timestamp": "2024-12-19", "message": "Picked up"},
    {"status": "IN_TRANSIT", "timestamp": "2024-12-20", "message": "Out for delivery"}
  ],
  "estimatedDeliveryDate": "2024-12-20T18:00:00Z"
}
```

### 3. Get Shipment by Order (Public Tracking)

```http
GET /logistics/shipments/order/order-12345

Response:
{
  "id": "shipment-uuid",
  "trackingNumber": "SF123456789",
  "status": "IN_TRANSIT",
  "estimatedDeliveryDate": "2024-12-20T18:00:00Z",
  "statusHistory": [...]
}
```

### 4. Update Shipment Status

```http
PUT /logistics/shipments/:id/status
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "status": "DELIVERED",
  "message": "Delivered successfully"
}

Response:
{
  "id": "shipment-uuid",
  "status": "DELIVERED",
  "actualDeliveryDate": "2024-12-20T16:30:00Z"
}
```

### 5. Sync with Courier

```http
POST /logistics/shipments/:id/sync
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "id": "shipment-uuid",
  "status": "IN_TRANSIT",
  "courierStatus": "2",
  "lastSynced": "2024-12-20T10:30:00Z"
}
```

### 6. Setup Courier Account

```http
POST /logistics/couriers/setup
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "tenantId": "tenant-abc",
  "courierName": "STEADFAST",
  "apiKey": "your_api_key",
  "apiSecret": "optional_secret",
  "config": {
    "servicableCities": ["Dhaka", "Chittagong", "Sylhet"],
    "baseCost": 150
  },
  "priority": 1,
  "isEnabled": true
}

Response:
{
  "id": "courier-account-uuid",
  "courierName": "STEADFAST",
  "isEnabled": true,
  "priority": 1
}
```

### 7. List Courier Accounts

```http
GET /logistics/couriers
Authorization: Bearer <JWT_TOKEN>

Response:
[
  {
    "id": "courier-account-uuid-1",
    "courierName": "STEADFAST",
    "priority": 1,
    "isEnabled": true,
    "servicableCities": ["Dhaka", "Chittagong"]
  },
  {
    "id": "courier-account-uuid-2",
    "courierName": "PATHAO",
    "priority": 2,
    "isEnabled": true,
    "servicableCities": ["Dhaka"]
  }
]
```

### 8. Toggle Courier Account

```http
PUT /logistics/couriers/STEADFAST/toggle
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "isEnabled": false
}

Response:
{
  "id": "courier-account-uuid",
  "courierName": "STEADFAST",
  "isEnabled": false
}
```

### 9. Get COD Reconciliation Report

```http
GET /logistics/reconciliation/cod?from=2024-01-01&to=2024-12-31
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "period": {"from": "2024-01-01", "to": "2024-12-31"},
  "totalCOD": 500000,
  "byStatus": {
    "DELIVERED": 450000,
    "FAILED": 25000,
    "PENDING": 25000
  },
  "byCourier": {
    "STEADFAST": 300000,
    "PATHAO": 200000
  },
  "shipmentCount": 1250
}
```

### 10. Health Check

```http
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2024-12-20T10:30:00Z"
}
```

---

## Courier Integration Details

### Steadfast (Bangladesh)

**API Documentation**: https://steadfast.com.bd/api/v1

**Create Shipment Request**:
```json
{
  "api_key": "your_api_key",
  "secret_key": "your_secret_key",
  "invoice": "order-12345",
  "recipient_name": "Ahmed Hassan",
  "recipient_phone": "01712345678",
  "recipient_address": "123 Main St",
  "recipient_city": "Dhaka",
  "recipient_area": "Dhaka",
  "recipient_thana": "Gulshan",
  "cod_amount": 5000,
  "weight": 0.5
}
```

**Response**:
```json
{
  "status": 200,
  "message": "Shipment created",
  "consignment": {
    "consignment_id": "123456",
    "tracking_code": "SF123456789",
    "status": "1",
    "statusDescription": "In Review"
  }
}
```

**Status Codes**:
- `0`: Pending
- `1`: In Review
- `2`: In Transit
- `3`: Cancelled
- `4`: Delivered
- `5`: Failed Attempt

### Pathao Courier (Bangladesh)

**API Documentation**: https://api.pathao.com/v1/docs

**Create Shipment Request**:
```json
{
  "recipient_name": "Ahmed Hassan",
  "recipient_phone": "01712345678",
  "recipient_address": "123 Main St",
  "recipient_city": 1,  // City ID
  "recipient_area": 1,  // Area ID
  "recipient_thana": 1, // Thana ID
  "merchant_order_id": "order-12345",
  "item_weight": 0.5,
  "cash_on_delivery": 5000,
  "special_instruction": "Leave at door"
}
```

**Response**:
```json
{
  "data": {
    "consignment_id": "987654",
    "tracking_number": "PT987654321",
    "merchant_order_id": "order-12345",
    "charge": 150,
    "delivery_type": "regular"
  }
}
```

---

## Smart Routing Algorithm

The service automatically selects the best courier based on:

1. **City Coverage**: Is the delivery city serviceable?
2. **Priority**: Lower priority value = higher preference
3. **Cost Optimization**: Among serviceable couriers, select lowest cost
4. **Fallback**: If primary courier unavailable, try secondary

```typescript
// Routing Decision Tree
if (courier1.servicableCities.includes(city)) {
  if (courier2.servicableCities.includes(city)) {
    select(courier1.priority < courier2.priority ? courier1 : courier2);
  } else {
    select(courier1);
  }
} else if (courier2.servicableCities.includes(city)) {
  select(courier2);
} else {
  throw new Error('No serviceable courier');
}
```

---

## COD Reconciliation

### How It Works

1. **Shipment Created**: Order marked as pending COD
2. **Delivery Confirmation**: Courier confirms delivery, funds collected
3. **Reconciliation Report**: Generated daily/weekly/monthly with totals by courier and status

### Reconciliation Fields

```json
{
  "period": {"from": "2024-01-01", "to": "2024-12-31"},
  "totalCOD": 500000,
  "byStatus": {
    "DELIVERED": 450000,
    "FAILED": 25000,
    "PENDING": 25000
  },
  "byCourier": {
    "STEADFAST": 300000,
    "PATHAO": 200000
  },
  "shipmentCount": 1250,
  "breakdown": [
    {
      "courier": "STEADFAST",
      "delivered": 800,
      "failed": 50,
      "pending": 50,
      "codCollected": 300000
    }
  ]
}
```

---

## Event Integration (RabbitMQ)

### Subscribed Events

| Event | Source | Action |
|-------|--------|--------|
| `order.created` | Order Service | Create shipment automatically |
| `order.cancelled` | Order Service | Cancel shipment |
| `payment.completed` | Payment Service | Update shipment status |

### Published Events

| Event | Subscribers | Data |
|-------|-----------|------|
| `shipment.created` | Notification Service | Shipment details, tracking number |
| `shipment.delivered` | Order Service, Notification Service | Delivery confirmation |
| `shipment.failed` | Order Service, Notification Service | Failure reason |

---

## Multi-Tenant Isolation

Every request requires tenant context:

```typescript
// HTTP Request
Authorization: Bearer <JWT_TOKEN>  // Payload includes tenantId
X-Tenant-ID: tenant-abc            // Optional header override

// All queries automatically filtered by tenantId
const shipments = await shipmentRepo.find({
  where: { tenantId: request.user.tenantId }
});
```

**Tenant Data Isolation**:
- ✅ Shipments only visible to same tenant
- ✅ Courier accounts per tenant
- ✅ COD reconciliation per tenant
- ✅ Status history per tenant

---

## Production Deployment

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3010
POSTGRES_HOST=prod-db-host
POSTGRES_DB=logistics_prod
JWT_SECRET=<generate-strong-random-key>
CORS_ORIGIN=https://storefront.example.com,https://admin.example.com
```

### Docker Build

```bash
docker build -f docker/Dockerfile.logistics-service -t logistics-service:1.0.0 .
docker run -d \
  -e POSTGRES_HOST=db-host \
  -e JWT_SECRET=your-secret \
  -p 3010:3010 \
  logistics-service:1.0.0
```

### Kubernetes Deployment

```bash
kubectl apply -k k8s/base
kubectl apply -k k8s/prod
```

### Monitoring & Logging

```bash
# View logs
kubectl logs -f deployment/logistics-service -n commerce

# Health checks
curl http://localhost:3010/health
curl http://localhost:3010/health/ready
curl http://localhost:3010/health/live
```

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Configure PostgreSQL with SSL
- [ ] Set up database backups
- [ ] Configure CORS with specific origins only
- [ ] Use Kubernetes for orchestration
- [ ] Set resource limits (CPU/Memory)
- [ ] Configure HPA (2-8 replicas)
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Enable audit logging
- [ ] Test courier API keys in staging first
- [ ] Set up alerts for failed shipments
- [ ] Document courier support contacts
- [ ] Implement retry strategy for failed bookings
- [ ] Set up dead-letter queues for failed events

---

## Troubleshooting

### Shipment Creation Fails

```
Error: "No serviceable courier for city"
→ Solution: Add courier account, verify city is in servicableCities array
```

### Courier API Rate Limits

```
Error: "429 Too Many Requests"
→ Solution: Implement exponential backoff in logistics.service.ts
```

### Status Sync Issues

```
Error: "Tracking number not found with courier"
→ Solution: Verify tracking_number format matches courier API requirements
```

---

## Roadmap

- [ ] **Q1**: DHL, FedEx, UPS integration
- [ ] **Q2**: AI-based delivery time prediction
- [ ] **Q3**: Driver app integration
- [ ] **Q4**: Blockchain shipment verification

---

## Support

For issues, contact: logistics-team@commerce-os.com

---

**Version**: 1.0.0
**Last Updated**: December 2024
**Maintained By**: Commerce OS Team
