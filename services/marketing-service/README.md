# Marketing Service - Commerce Operating System Growth & SEO Brain

Enterprise-grade marketing and SEO management service. Built with NestJS, MongoDB, and integrations for Google Tag Manager, GA4, Meta Pixel, TikTok Pixel, and Google Ads.

## Features

### 🎯 SEO Engine
- Centralized meta title, description, canonical URL management
- OpenGraph and Twitter Card tags
- Schema.org JSON-LD structured data
- Robots rules management
- Dynamic SSR meta tag injection for Next.js storefronts
- SEO health monitoring

### 📊 Tag & Pixel Management
- **Google Tag Manager** - Event tracking infrastructure
- **Google Analytics 4** - Server-side and client-side tracking
- **Meta Pixel** - Facebook/Instagram conversion API
- **TikTok Pixel** - TikTok event tracking API
- **Google Ads** - Conversion tracking
- No hardcoded tracking IDs in frontend
- Dynamic configuration per environment

### 🔄 Server-Side Conversion Tracking
- Ad-blocker proof tracking (server-side)
- Event consumption from:
  - `order.created`
  - `payment.completed`
  - `shipment.delivered`
- Automatic event forwarding to:
  - Meta Conversions API (hashed PII)
  - GA4 Measurement Protocol
  - TikTok Events API
- Retry mechanism for failed events

## Tech Stack

- **Framework:** NestJS 10.3.0
- **Database:** MongoDB 7
- **Authentication:** JWT with Passport
- **External APIs:** Google, Meta, TikTok APIs
- **Monitoring:** Health checks, metrics
- **Documentation:** Swagger/OpenAPI

## Installation

```bash
yarn install
```

## Environment Variables

Create `.env.local`:

```env
PORT=3009
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/marketing_service
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3007,http://localhost:3008

# Tag Configuration
GTM_CONTAINER_ID=GTM-XXXXXX
GA4_MEASUREMENT_ID=G-XXXXXX
META_PIXEL_ID=XXXXXX
TIKTOK_PIXEL_ID=XXXXXX
GOOGLE_ADS_CONVERSION_ID=XXXXXX

# API Tokens
META_API_TOKEN=your-meta-token
TIKTOK_API_TOKEN=your-tiktok-token
GA4_API_SECRET=your-ga4-secret
```

## Development

```bash
yarn dev
```

Opens at `http://localhost:3009`

## Build & Production

```bash
yarn build
yarn start
```

## Database Schema

### SEO Metadata Collection
```javascript
{
  tenantId: string,
  slug: string,
  contentType: 'product' | 'category' | 'page',
  contentId: string,
  metaTitle: string,
  metaDescription: string,
  canonicalUrl: string,
  ogTitle?: string,
  ogDescription?: string,
  ogImage?: string,
  twitterCard?: string,
  schemaMarkup?: JSON-LD,
  keywords: [string],
  lastModified: Date,
  publishedAt?: Date
}
```

### Tag Config Collection
```javascript
{
  tenantId: string,
  platform: 'google_tag_manager' | 'google_analytics_4' | 'meta_pixel' | 'tiktok_pixel' | 'google_ads',
  isEnabled: boolean,
  containerId?: string,  // GTM
  measurementId?: string, // GA4
  pixelId?: string,       // Meta, TikTok
  conversionId?: string,  // Google Ads
  apiToken?: string,
  environment: 'development' | 'staging' | 'production',
  config: Record<string, any>,
  lastSyncedAt?: Date
}
```

### Conversion Event Collection
```javascript
{
  tenantId: string,
  eventType: 'page_view' | 'add_to_cart' | 'checkout_complete' | 'purchase' | 'custom',
  source: 'order.created' | 'payment.completed' | 'shipment.delivered',
  referenceId: string,
  userId?: string,
  sessionId?: string,
  eventData: Record<string, any>,
  platforms: ['meta', 'ga4', 'tiktok', 'google_ads'],
  sentAt?: Date,
  status: 'pending' | 'sent' | 'failed',
  errorMessage?: string,
  retryCount: number
}
```

## API Endpoints

### SEO Management

```bash
# Create/Update SEO metadata
POST /marketing/seo/metadata
Authorization: Bearer <token>
Body: {
  tenantId: string,
  slug: string,
  contentType: 'product',
  metaTitle: string,
  metaDescription: string,
  canonicalUrl: string,
  ogTitle?: string,
  keywords?: [string]
}

# Get SEO metadata (for SSR)
GET /marketing/seo/metadata/:slug?tenant=tenant-id

# Get meta tags HTML
GET /marketing/seo/page/:slug?tenant=tenant-id

# Get SEO health metrics
GET /marketing/seo/health?tenant=tenant-id
Authorization: Bearer <token>
```

### Tag Manager

```bash
# Update tag configuration
PUT /marketing/tags/:platform?tenant=tenant-id&env=production
Authorization: Bearer <token>
Body: {
  containerId?: string,
  measurementId?: string,
  pixelId?: string,
  apiToken?: string,
  config?: Record<string, any>,
  isEnabled?: boolean
}

# Get tag configuration
GET /marketing/tags/:platform?tenant=tenant-id&env=production

# Get all tracking configs for storefront (public)
GET /marketing/tracking/config/storefront?tenant=tenant-id
```

### Conversion Tracking

```bash
# Track conversion event (server-side, ad-blocker proof)
POST /marketing/conversions/track?tenant=tenant-id
Body: {
  eventType: 'purchase',
  referenceId: 'order-123',
  userId?: 'user-456',
  eventData: {
    value: 150.00,
    currency: 'USD',
    email: 'user@example.com'
  },
  platforms: ['meta', 'ga4', 'tiktok']
}

# Retry failed conversion events
POST /marketing/conversions/retry-failed?tenant=tenant-id
Authorization: Bearer <token>
```

## Integration with Storefront

### Next.js SSR Meta Tags

```typescript
// pages/products/[slug].tsx
import axios from 'axios';

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const seoMetadata = await axios.get(
    `http://marketing-service:3009/marketing/seo/metadata/${slug}?tenant=${context.req.headers['x-tenant-id']}`
  );
  
  return {
    props: { seoMetadata: seoMetadata.data }
  };
}

export default function ProductPage({ seoMetadata }) {
  return (
    <>
      <Head>
        <title>{seoMetadata.metaTitle}</title>
        <meta name="description" content={seoMetadata.metaDescription} />
        <link rel="canonical" href={seoMetadata.canonicalUrl} />
      </Head>
      {/* Page content */}
    </>
  );
}
```

### Client-Side Tracking Script

```typescript
// lib/marketing.ts
export async function trackPurchase(orderId: string, value: number, email: string) {
  await fetch('/api/tracking/purchase', {
    method: 'POST',
    body: JSON.stringify({
      orderId,
      value,
      email
    })
  });
}
```

## Event-Driven Architecture

Marketing service subscribes to order and payment events:

```
order.created → Marketing Service
├─ Create conversion event
├─ Send to Meta Conversions API
├─ Send to GA4
└─ Send to TikTok

payment.completed → Marketing Service
├─ Track purchase conversion
├─ Hash PII for ad platform compliance
└─ Update conversion status
```

## Deployment

### Docker

```bash
docker build -f docker/Dockerfile.marketing-service -t marketing-service:latest .
docker run -p 3009:3009 \
  -e MONGODB_URI=mongodb://mongo:27017/marketing_service \
  -e JWT_SECRET=your-secret \
  marketing-service:latest
```

### Kubernetes

Deploy via kustomize overlays. See `k8s/base/marketing-service.yaml`.

## Production Checklist

- [ ] Configure all tag IDs in production environment
- [ ] Set up MongoDB replication
- [ ] Enable monitoring and alerting
- [ ] Configure CORS origins
- [ ] Rotate API tokens quarterly
- [ ] Test conversion tracking with test events
- [ ] Set up retry schedule for failed events
- [ ] Monitor event queue depth
- [ ] Enable audit logging for tag changes

## Roadmap

- [ ] A/B testing platform integration
- [ ] Advanced audience segmentation
- [ ] Marketing automation workflows
- [ ] Attribution modeling
- [ ] Custom event schemas
- [ ] Real-time dashboard
- [ ] Mobile app analytics
