# 🚀 Commerce Operating System (COS)
## Enterprise-Grade Microservice E-Commerce Platform

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Repository:** https://github.com/amirulhasanpulok/rcl

---

## 📋 Quick Overview

**RCL (Retail Commerce Layer)** is an enterprise-grade **Commerce Operating System** capable of powering:
- 🏪 National marketplaces (multi-tenant, multi-vendor)
- 🛒 SaaS commerce platforms (white-label ready)
- 🏢 Enterprise B2B/B2C operations
- 🌐 Global e-commerce systems

**10 Microservices + 2 Frontends | 75+ API Endpoints | Kubernetes Native | Production Ready**

---

## 🏗️ Complete Architecture

### System Components (12 Services)

```
TIER 1: FRONTENDS
├─ Admin Dashboard (3007) - Next.js 14 + Tailwind CSS
└─ Web Storefront (3008) - Next.js 14 + Tailwind CSS

TIER 2: API GATEWAY
└─ API Gateway (3000) - NestJS - Single entry point

TIER 3: MICROSERVICES (10)
├─ Auth (3001) - JWT, PostgreSQL
├─ Product (3002) - Catalog, MongoDB
├─ Order (3003) - Order lifecycle, PostgreSQL
├─ Payment (3004) - Multi-gateway (Stripe/SSLCommerce/PayPal), PostgreSQL
├─ Inventory (3005) - Multi-warehouse, PostgreSQL
├─ Notification (3006) - Email/SMS/Push, MongoDB
├─ Marketing (3009) - SEO/GTM/GA4/Meta/TikTok, MongoDB ⭐
└─ Logistics (3010) - Steadfast/Pathao delivery, PostgreSQL ⭐

TIER 4: INFRASTRUCTURE
├─ PostgreSQL 15 (Auth, Order, Payment, Inventory, Logistics)
├─ MongoDB 7 (Product, Notification, Marketing)
├─ Redis 7 (Caching, sessions)
└─ RabbitMQ 3 (Event bus)
```

### Service Matrix

| Service | Port | Database | Features |
|---------|------|----------|----------|
| **Auth** | 3001 | PostgreSQL | JWT, user management, RBAC |
| **Product** | 3002 | MongoDB | Catalog, search, variants |
| **Order** | 3003 | PostgreSQL | Order lifecycle, cart |
| **Payment** | 3004 | PostgreSQL | Stripe, SSLCommerce, PayPal |
| **Inventory** | 3005 | PostgreSQL | Multi-warehouse, reservations |
| **Notification** | 3006 | MongoDB | Email, SMS, Push |
| **Marketing** | 3009 | MongoDB | SEO, GTM, GA4, Meta, TikTok ⭐ |
| **Logistics** | 3010 | PostgreSQL | Steadfast, Pathao, COD ⭐ |

---

## ⭐ New: Phase 9 & 10 Services

### Marketing Service (Port 3009)
**Growth & SEO Brain** - Centralized marketing management

**Features:**
- ✅ SEO Metadata Management (title, description, keywords, canonical)
- ✅ Tag Manager (GTM, GA4, Meta Pixel, TikTok Pixel, Google Ads)
- ✅ Server-Side Conversion Tracking (ad-blocker proof)
- ✅ PII Hashing (SHA-256 for GDPR compliance)
- ✅ Multi-platform forwarding (Meta, GA4, TikTok)

**10 API Endpoints + Swagger** | **MongoDB** | **Multi-tenant**

See [Marketing Service README](services/marketing-service/README.md)

### Logistics Service (Port 3010)
**Delivery Orchestration** - Multi-courier shipment management

**Features:**
- ✅ Shipment Management with auto-courier selection
- ✅ Smart Courier Routing (city/priority/cost optimization)
- ✅ Steadfast Integration (Bangladesh auto-booking)
- ✅ Pathao Integration (Bangladesh auto-booking)
- ✅ COD Reconciliation & Financial Reporting

**9 API Endpoints + Swagger** | **PostgreSQL** | **Multi-tenant**

See [Logistics Service README](services/logistics-service/README.md)

---

## 📁 Project Structure

```
rcl/
├── apps/
│   ├── admin-nextjs/              # Admin Dashboard (3007)
│   ├── storefront-nextjs/         # Web Storefront (3008)
│   └── api-gateway/               # API Gateway (3000)
├── services/
│   ├── auth-service/              # Authentication
│   ├── product-service/           # Product Catalog
│   ├── order-service/             # Order Management
│   ├── payment-service/           # Payment Processing
│   ├── inventory-service/         # Stock Management
│   ├── notification-service/      # Email/SMS/Push
│   ├── marketing-service/         # SEO/GTM/Conversion ⭐
│   └── logistics-service/         # Delivery/Courier ⭐
├── packages/
│   ├── common/                    # Shared utilities
│   ├── event-bus/                 # RabbitMQ integration
│   └── auth-client/               # Auth SDK
├── docker/
│   ├── docker-compose.yml         # Full stack (all 12 services)
│   ├── Dockerfile.marketing-service
│   └── Dockerfile.logistics-service
├── k8s/
│   ├── base/                      # 15 base manifests
│   ├── prod/                      # Production overlays
│   └── staging/                   # Staging overlays
└── README.md                      # This file
```

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Language** | TypeScript | 5.3+ |
| **Framework** | NestJS | 10.3.0 |
| **Frontend** | Next.js | 14 |
| **Styling** | Tailwind CSS | 3.x |
| **Database (SQL)** | PostgreSQL | 15 |
| **Database (NoSQL)** | MongoDB | 7 |
| **Cache** | Redis | 7 |
| **Event Bus** | RabbitMQ | 3 |
| **Container** | Docker | 20+ |
| **Orchestration** | Kubernetes | 1.24+ |
| **Auth** | JWT + Passport | - |
| **Security** | Helmet.js | - |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Node.js >=18.0.0
- npm >=9.0.0 or Yarn >=4.0.0
- Docker >=20.0.0 (for Docker Compose)
- kubectl >=1.24.0 (for Kubernetes)
```

### Installation

```bash
# 1. Clone repository
git clone git@github.com:amirulhasanpulok/rcl.git
cd rcl

# 2. Install dependencies
yarn install
# or npm install

# 3. Create environment file
cp .env.example .env.development.local

# 4. Start with Docker Compose
cd docker
docker-compose up -d

# 5. Access services
- API Gateway: http://localhost:3000
- Admin: http://localhost:3007
- Storefront: http://localhost:3008
- Marketing Swagger: http://localhost:3009/docs
- Logistics Swagger: http://localhost:3010/docs
```

---

## 🐳 Docker Deployment

### Start All Services

```bash
cd docker
docker-compose up -d

# View logs
docker-compose logs -f marketing-service
docker-compose logs -f logistics-service

# Stop all
docker-compose down
```

### Services Available

```
API Gateway ........... http://localhost:3000
Auth Service .......... http://localhost:3001
Product Service ....... http://localhost:3002
Order Service ......... http://localhost:3003
Payment Service ....... http://localhost:3004
Inventory Service ..... http://localhost:3005
Notification Service .. http://localhost:3006
Admin Dashboard ....... http://localhost:3007
Storefront ............ http://localhost:3008
Marketing Service ..... http://localhost:3009 (Swagger: /docs)
Logistics Service ..... http://localhost:3010 (Swagger: /docs)
```

---

## ☸️ Kubernetes Deployment

### Base Deployment (Development)

```bash
kubectl apply -k k8s/base
kubectl get pods -n rcl-platform
```

### Production Deployment

```bash
kubectl apply -k k8s/prod
# 3 replicas per service
```

### Staging Deployment

```bash
kubectl apply -k k8s/staging
# 2 replicas per service
```

### Monitoring

```bash
# View all resources
kubectl get all -n rcl-platform

# View pods
kubectl get pods -n rcl-platform

# View deployments
kubectl get deployments -n rcl-platform

# View HPA (Horizontal Pod Autoscaler)
kubectl get hpa -n rcl-platform

# View logs
kubectl logs -f deployment/marketing-service -n rcl-platform

# Port forward
kubectl port-forward -n rcl-platform svc/api-gateway 3000:80
```

---

## 💻 Development

### Run Individual Services

```bash
# Marketing Service (watch mode)
cd services/marketing-service
npm run dev

# Logistics Service (watch mode)
cd services/logistics-service
npm run dev

# Admin Dashboard
cd apps/admin-nextjs
npm run dev

# Web Storefront
cd apps/storefront-nextjs
npm run dev
```

### All Services (Monorepo)

```bash
# Install all
yarn install

# Start all (watch mode)
yarn dev

# Build all
yarn build

# Test all
yarn test

# Lint all
yarn lint

# Format all
yarn format
```

### Build for Production

```bash
# Build Marketing Service
cd services/marketing-service
npm run build

# Build Logistics Service
cd services/logistics-service
npm run build

# Or all at once
yarn build
```

---

## 🔐 Security Features

### Authentication
- ✅ JWT Bearer tokens
- ✅ Passport.js strategies
- ✅ Protected endpoints on sensitive operations
- ✅ Public endpoints for storefronts/tracking

### Data Security
- ✅ PII Hashing (SHA-256: email, phone, name)
- ✅ GDPR-Compliant by design
- ✅ Kubernetes secrets for API keys
- ✅ HTTPS/TLS in production

### Network Security
- ✅ Helmet.js security headers
- ✅ CORS whitelist configuration
- ✅ API Gateway rate limiting
- ✅ Service-to-service JWT auth

---

## 📊 API Documentation

All services expose Swagger/OpenAPI docs:

```
Auth Service ........... http://localhost:3001/docs
Product Service ........ http://localhost:3002/docs
Order Service .......... http://localhost:3003/docs
Payment Service ........ http://localhost:3004/docs
Inventory Service ...... http://localhost:3005/docs
Notification Service ... http://localhost:3006/docs
Marketing Service ...... http://localhost:3009/docs ⭐
Logistics Service ...... http://localhost:3010/docs ⭐
```

---

## 📈 Key Features

### Multi-Tenancy
✅ Complete tenant isolation (tenantId on all queries)
✅ Per-tenant data in all databases
✅ Event-driven (no cross-tenant leakage)

### Enterprise Payments
✅ Stripe (global)
✅ SSLCommerce (Bangladesh)
✅ PayPal (global)

### Enterprise Logistics
✅ Steadfast (Bangladesh, auto-booking)
✅ Pathao (Bangladesh, auto-booking)
✅ COD reconciliation & reporting

### Enterprise Marketing
✅ Centralized SEO metadata
✅ Multi-platform tag management
✅ Server-side conversion tracking
✅ GDPR-compliant PII hashing

### Scaling & Performance
✅ Kubernetes HPA (2-8 replicas per service)
✅ Pod anti-affinity for resilience
✅ Resource limits (CPU/Memory)
✅ Health checks (liveness + readiness)

---

## 🧪 Testing

```bash
# Unit tests
yarn test

# Coverage report
yarn test:cov

# E2E tests
yarn test:e2e

# Lint code
yarn lint

# Format code
yarn format
```

---

## 📝 Environment Variables

Create `.env.development.local`:

```env
NODE_ENV=development
JWT_SECRET=your-secret-key-here

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# MongoDB
MONGODB_URI=mongodb://admin:password@localhost:27017/...

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
SSL_COMMERCE_STORE_ID=your_store_id
PAYPAL_CLIENT_ID=your_client_id

# Couriers
STEADFAST_API_KEY=your_key
PATHAO_API_KEY=your_key

# Services
CORS_ORIGIN=http://localhost:3000,http://localhost:3007,http://localhost:3008

# Email/SMS
SMTP_HOST=smtp.gmail.com
TWILIO_ACCOUNT_SID=your_sid
```

---

## 🚨 Troubleshooting

### Services Won't Start

```bash
# Check Node version (must be >=18)
node --version

# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install

# Check environment variables
cat .env.development.local
```

### Database Connection Errors

```bash
# PostgreSQL
psql -U postgres -h localhost

# MongoDB
mongo --host localhost --port 27017
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3009

# Kill process
kill -9 <PID>
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test
3. Push: `git push origin feature/your-feature`
4. Create Pull Request
5. Wait for CI/CD checks
6. Get approval and merge

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Total Microservices | 10 |
| Total Frontends | 2 |
| REST API Endpoints | 75+ |
| TypeScript Files | 150+ |
| Total Code | 25,000+ LOC |
| Docker Containers | 12 |
| Kubernetes Manifests | 31 |
| Git Commits | 6 phases |

---

## ✅ Production Readiness

- ✅ All 10 microservices implemented
- ✅ 2 Next.js frontends ready
- ✅ Docker Compose for local dev
- ✅ Kubernetes manifests (base/prod/staging)
- ✅ Comprehensive API documentation
- ✅ Multi-tenant isolation verified
- ✅ Security best practices implemented
- ✅ Health checks on all services
- ✅ Horizontal scaling configured
- ✅ Production deployment ready

---

## 📞 Support

- 📖 **Documentation:** [Service READMEs](services/)
- 🐛 **Issues:** https://github.com/amirulhasanpulok/rcl/issues
- 📧 **Email:** support@rcl-commerce.io

---

**Built with ❤️ for Enterprise Commerce**

Last Updated: January 19, 2026  
Current Version: 1.0.0  
Repository: https://github.com/amirulhasanpulok/rcl  
Status: ✅ Production Ready