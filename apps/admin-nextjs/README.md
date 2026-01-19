# Admin Dashboard

Enterprise-grade admin dashboard for e-commerce management. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview** - Real-time KPIs (orders, revenue, customers, low stock)
- **Product Management** - View, create, edit, and delete products
- **Order Management** - Track and manage customer orders with status updates
- **Payment Tracking** - Monitor transactions across multiple payment gateways (Stripe, SSLCommerce, PayPal)
- **Inventory Management** - Multi-warehouse stock management with low-stock alerts
- **Notification Management** - View email, SMS, and push notification logs
- **Analytics** - Revenue and order trends with interactive charts

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS with custom components
- **Charts:** Recharts for data visualization
- **HTTP Client:** Axios for API communication
- **State Management:** Zustand (ready to integrate)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

## Installation

```bash
yarn install
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

## Development

```bash
yarn dev
```

Opens at `http://localhost:3007`

## Build

```bash
yarn build
yarn start
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard layout and pages
│   │   ├── page.tsx       # Dashboard overview
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order management
│   │   ├── payments/      # Payment tracking
│   │   ├── inventory/     # Inventory management
│   │   └── notifications/ # Notification logs
│   ├── page.tsx           # Login page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   └── ui/                # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── table.tsx
```

## API Integration

Admin dashboard connects to API Gateway (http://localhost:3000) for all data:

### Endpoints Used

- `GET /products` - Fetch all products
- `GET /orders` - Fetch all orders
- `GET /payments` - Fetch all payments
- `GET /inventory/low-stock` - Fetch low-stock products
- `GET /notifications/logs` - Fetch notification history

All requests include JWT authentication via `Authorization` header.

## Dashboard Pages

### Dashboard Overview
- KPI cards (total orders, revenue, customers, low stock)
- Revenue trend chart (monthly)
- Orders trend chart (monthly)
- Recent orders table

### Products
- Product list with search/filter
- Quick actions (edit, delete)
- Stock status indicators

### Orders
- Complete order list
- Order details modal
- Status tracking
- Customer information

### Payments
- Payment transaction history
- Gateway information (Stripe, SSLCommerce, PayPal)
- Payment status tracking
- Amount and date information

### Inventory
- Multi-warehouse stock overview
- Low-stock alerts
- Reserved stock tracking
- Stock threshold management

### Notifications
- Email, SMS, and push notification logs
- Delivery status tracking
- Failed notification retry mechanism
- Success rate metrics

## Authentication

JWT tokens are stored in localStorage and included in all API requests. Login page provides demo authentication for development.

## Deployment

### Docker

```bash
docker build -f docker/Dockerfile.admin-nextjs -t admin-nextjs:latest .
docker run -p 3007:3007 admin-nextjs:latest
```

### Kubernetes

Deploy via kustomize overlays. See `k8s/base/admin-nextjs.yaml` and overlays.

## Roadmap

- [ ] Advanced filtering and search
- [ ] Bulk operations (export, bulk edit)
- [ ] Custom report generation
- [ ] User role-based access control (RBAC)
- [ ] Audit logs
- [ ] Advanced analytics and predictive insights
- [ ] Dark mode support
- [ ] Mobile responsive optimization
