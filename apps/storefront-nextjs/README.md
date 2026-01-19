# E-Commerce Storefront

Customer-facing web storefront for the e-commerce platform. Built with Next.js 14, TypeScript, and Tailwind CSS with server-side rendering (SSR) and SEO optimization.

## Features

- **Product Browsing** - Browse products with filtering by category
- **Product Details** - Full product information with variants and stock status
- **Shopping Cart** - Add/remove items, manage quantities (localStorage-based)
- **Checkout** - Multi-step checkout with multiple payment methods
- **Order Tracking** - View order history and status
- **Responsive Design** - Mobile-first design optimized for all devices
- **SEO Optimized** - Meta tags, Open Graph, structured data
- **Fast Performance** - SSR with Next.js 14 optimizations

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios for API communication
- **State Management:** Zustand (ready to integrate)
- **Icons:** Lucide React
- **Storage:** localStorage for cart persistence

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

Opens at `http://localhost:3008`

## Build

```bash
yarn build
yarn start
```

## Project Structure

```
src/
├── app/                              # Next.js app directory
│   ├── page.tsx                     # Home page with product listing
│   ├── products/[id]/page.tsx       # Product detail page
│   ├── cart/page.tsx                # Shopping cart
│   ├── checkout/page.tsx            # Checkout form
│   ├── order-confirmation/[id]/     # Order confirmation
│   ├── layout.tsx                   # Root layout with metadata
│   └── globals.css                  # Global styles
├── components/
│   ├── header.tsx                   # Navigation header
│   ├── footer.tsx                   # Site footer
│   └── ui/
│       └── button.tsx               # Reusable button component
```

## Pages

### Home Page (`/`)
- Product grid with filtering by category
- Featured products section
- Customer benefits section
- Search functionality

### Product Page (`/products/[id]`)
- Product details with images
- Pricing and stock status
- Product variants selection
- Quantity selector
- Add to cart and wishlist buttons
- Customer reviews

### Shopping Cart (`/cart`)
- Cart items list
- Quantity adjustment
- Remove items
- Order summary with shipping calculation
- Checkout button

### Checkout (`/checkout`)
- Shipping information form
- Billing address
- Payment method selection (Stripe, SSLCommerce, PayPal)
- Order review
- Place order button

### Order Confirmation (`/order-confirmation/[id]`)
- Order confirmation message
- Order details
- Next steps information
- Links to order tracking and shopping

## API Integration

Storefront connects to API Gateway (http://localhost:3000) for:

- `GET /products` - Fetch products with optional category filter
- `GET /products/:id` - Fetch product details
- `POST /orders` - Create new order
- `POST /payments/intents` - Create payment intent
- `GET /orders/:userId` - Fetch user orders

## Cart Management

- Cart stored in localStorage with product IDs
- Persists across sessions
- Quantity tracking
- Automatic cleanup on checkout

## Payment Gateways

Supports three payment methods:
- **Stripe** - Primary payment processor
- **SSLCommerce** - Bangladesh-specific payments
- **PayPal** - Alternative payment option

## SEO Features

- Meta tags and descriptions
- Open Graph tags for social sharing
- Structured data support
- Sitemap generation ready
- Mobile-first responsive design
- Fast page load times

## Deployment

### Docker

```bash
docker build -f docker/Dockerfile.storefront-nextjs -t storefront-nextjs:latest .
docker run -p 3008:3008 storefront-nextjs:latest
```

### Kubernetes

Deploy via kustomize overlays. See `k8s/base/storefront-nextjs.yaml` and overlays.

## Performance Optimizations

- Next.js 14 with automatic code splitting
- Image optimization
- CSS optimization via Tailwind
- Server-side rendering for initial load
- Static generation for product catalog
- Client-side navigation for fast transitions

## Roadmap

- [ ] User account management
- [ ] Order history and tracking
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Advanced search and filtering
- [ ] Promotional codes and coupons
- [ ] Product recommendations
- [ ] Live chat support
- [ ] Analytics integration
- [ ] PWA support
