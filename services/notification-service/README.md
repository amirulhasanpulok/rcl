# Notification Service

## Overview

The Notification Service is responsible for managing and delivering multi-channel notifications across the e-commerce platform. It provides a flexible template system with Handlebars support, delivery tracking, and automatic retry capabilities.

**Key Features:**
- Multi-channel notifications (Email, SMS, Push)
- Template management with Handlebars variable substitution
- Delivery status tracking and history
- Automatic retry mechanism for failed notifications
- Event-driven architecture with RabbitMQ integration
- Comprehensive audit logging

**Port:** 3006

## Technology Stack

- **Runtime:** Node.js with NestJS 10.3.0
- **Language:** TypeScript (strict mode)
- **Database:** MongoDB 7
- **Email:** Nodemailer (SMTP)
- **SMS:** Twilio
- **Push:** Push gateway infrastructure ready
- **Message Bus:** RabbitMQ
- **Cache:** Redis

## Installation

```bash
cd services/notification-service
npm install
```

## Configuration

### Environment Variables

```bash
# Service
NODE_ENV=development
SERVICE_PORT=3006
SERVICE_NAME=notification-service

# Database
MONGODB_URI=mongodb://notification-user:notification-password@localhost:27017/notification_service?authSource=admin

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=E-Commerce Platform
SMTP_FROM_EMAIL=noreply@ecommerce.local

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase Push (optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=24h

# API Gateway
API_GATEWAY_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

## Project Structure

```
src/
├── config/                 # Configuration files
├── schemas/               # Mongoose schemas
│   ├── notification-template.schema.ts
│   └── notification-log.schema.ts
├── dto/                   # DTOs for requests/responses
├── gateways/              # Communication gateways
│   ├── email.gateway.ts
│   ├── sms.gateway.ts
│   └── push.gateway.ts
├── modules/
│   └── notification/
│       ├── notification.service.ts
│       ├── notification.controller.ts
│       └── notification.module.ts
├── strategies/            # JWT strategy
├── app.controller.ts      # Root controller
├── app.module.ts          # Root module
└── main.ts               # Application entry point
```

## Database Schemas

### NotificationTemplate

Defines reusable notification templates with Handlebars syntax.

```typescript
{
  _id: ObjectId;
  name: string;                  // Unique template name (e.g., "order_confirmation")
  subject: string;               // Email subject or SMS title
  template: string;              // Handlebars template content
  category: string;              // order|payment|shipment|user|inventory|system
  type: string;                  // email|sms|push
  variables: string[];           // Template variable names (e.g., ["customerName", "orderId"])
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example Order Confirmation Email Template:**
```handlebars
<h1>Hello {{customerName}},</h1>
<p>Your order #{{orderId}} has been confirmed!</p>
<p>Total: {{currency}}{{amount}}</p>
<p>Estimated Delivery: {{deliveryDate}}</p>
```

### NotificationLog

Tracks all notification sending attempts and delivery status.

```typescript
{
  _id: ObjectId;
  templateId: ObjectId;         // Reference to NotificationTemplate
  templateName: string;
  type: string;                 // email|sms|push
  recipient: string;            // Email address, phone number, or device token
  variables: Record<string, any>; // Rendered template variables
  subject: string;              // Rendered subject
  message: string;              // Rendered message content
  status: string;               // pending|sent|failed|bounced
  externalId?: string;          // messageId (email) or SID (SMS)
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  sentAt?: Date;
  reference: {
    orderId?: string;
    paymentId?: string;
    userId: string;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Template Management

**Create Template**
```http
POST /notifications/templates
Content-Type: application/json

{
  "name": "order_confirmation",
  "subject": "Order Confirmation",
  "template": "Hello {{customerName}}, your order #{{orderId}} confirmed",
  "category": "order",
  "type": "email",
  "variables": ["customerName", "orderId"]
}
```

**Get Template by ID**
```http
GET /notifications/templates/:id
```

**Get All Templates**
```http
GET /notifications/templates?category=order&type=email
```

**Update Template**
```http
PUT /notifications/templates/:id
Content-Type: application/json

{
  "subject": "Updated Subject",
  "template": "Updated template content"
}
```

**Delete Template**
```http
DELETE /notifications/templates/:id
```

### Send Notifications

**Send Email**
```http
POST /notifications/email/send
Content-Type: application/json

{
  "templateName": "order_confirmation",
  "recipient": "customer@example.com",
  "variables": {
    "customerName": "John Doe",
    "orderId": "ORD-12345"
  },
  "reference": {
    "orderId": "ORD-12345",
    "userId": "user-123"
  }
}
```

**Send SMS**
```http
POST /notifications/sms/send
Content-Type: application/json

{
  "templateName": "order_status_update",
  "recipient": "+1234567890",
  "variables": {
    "orderId": "ORD-12345",
    "status": "shipped"
  },
  "reference": {
    "orderId": "ORD-12345",
    "userId": "user-123"
  }
}
```

**Bulk Send**
```http
POST /notifications/email/bulk
Content-Type: application/json

{
  "templateName": "promotion_announcement",
  "recipients": [
    {
      "recipient": "user1@example.com",
      "variables": { "discount": "20%" }
    },
    {
      "recipient": "user2@example.com",
      "variables": { "discount": "15%" }
    }
  ]
}
```

### Notification History

**Get Notification Logs**
```http
GET /notifications/logs?userId=user-123&status=sent&limit=10&skip=0
```

**Get Failed Notifications**
```http
GET /notifications/logs/failed?limit=20
```

**Retry Failed Notification**
```http
POST /notifications/logs/:id/retry
```

## Usage Examples

### Creating a Template

```typescript
// Create an order confirmation email template
const template = await notificationService.createTemplate({
  name: 'order_confirmation',
  subject: 'Your Order {{orderId}} is Confirmed!',
  template: `
    <h1>Hi {{customerName}},</h1>
    <p>Thank you for your order. Your order #{{orderId}} has been confirmed.</p>
    <p><strong>Total:</strong> {{currency}}{{amount}}</p>
    <p><strong>Estimated Delivery:</strong> {{deliveryDate}}</p>
    <p>Track your order: <a href="{{trackingUrl}}">Click here</a></p>
  `,
  category: 'order',
  type: 'email',
  variables: ['customerName', 'orderId', 'amount', 'currency', 'deliveryDate', 'trackingUrl']
});
```

### Sending a Notification

```typescript
// Send order confirmation email
const log = await notificationService.sendEmail({
  templateName: 'order_confirmation',
  recipient: 'john@example.com',
  variables: {
    customerName: 'John Doe',
    orderId: 'ORD-12345',
    amount: '99.99',
    currency: '$',
    deliveryDate: '2024-01-15',
    trackingUrl: 'https://track.example.com/ORD-12345'
  },
  reference: {
    orderId: 'ORD-12345',
    userId: 'user-123'
  }
});
```

### Event-Driven Notifications

The service listens to events from RabbitMQ and automatically sends notifications:

```typescript
// When order.created event is received
@EventPattern('order.created')
async handleOrderCreatedEvent(data: OrderCreatedEvent) {
  await this.notificationService.sendEmail({
    templateName: 'order_confirmation',
    recipient: data.customerEmail,
    variables: {
      customerName: data.customerName,
      orderId: data.orderId,
      amount: data.totalAmount,
      currency: data.currency,
      deliveryDate: data.estimatedDelivery,
      trackingUrl: `${process.env.APP_URL}/track/${data.orderId}`
    },
    reference: {
      orderId: data.orderId,
      userId: data.userId
    }
  });
}
```

## Email Gateway (Nodemailer)

The email gateway uses Nodemailer with SMTP configuration from environment variables.

```typescript
// Sending an email
const messageId = await emailGateway.send({
  to: 'recipient@example.com',
  subject: 'Order Confirmation',
  html: '<p>Your order has been confirmed</p>',
  text: 'Your order has been confirmed'
});
```

## SMS Gateway (Twilio)

The SMS gateway uses Twilio for SMS delivery.

```typescript
// Sending an SMS
const messageSid = await smsGateway.send({
  to: '+1234567890',
  body: 'Your order #ORD-12345 has been shipped'
});
```

## Retry Mechanism

Failed notifications are automatically retried with exponential backoff:

1. Initial attempt: Immediate
2. First retry: 5 minutes later
3. Second retry: 15 minutes later
4. Third retry: 1 hour later
5. Final retry: 24 hours later (if configured)

Manual retry is also available via the API:

```http
POST /notifications/logs/:id/retry
```

## Docker Deployment

### Build Image

```bash
docker build -f docker/Dockerfile.notification-service -t notification-service:1.0.0 .
```

### Run Container

```bash
docker run -p 3006:3006 \
  -e MONGODB_URI=mongodb://mongo:27017/notification_service \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=your-email@gmail.com \
  -e SMTP_PASSWORD=your-password \
  -e TWILIO_ACCOUNT_SID=your-sid \
  -e TWILIO_AUTH_TOKEN=your-token \
  -e TWILIO_PHONE_NUMBER=+1234567890 \
  notification-service:1.0.0
```

## Kubernetes Deployment

The service is deployed to Kubernetes with the following configuration:

- **Replicas:** 2-6 (dev), 3 (prod), 2 (staging)
- **Resource Limits:** 512Mi memory, 500m CPU
- **Health Checks:** Liveness and readiness probes
- **Horizontal Pod Autoscaler:** CPU 70%, memory 80%

Apply manifests:

```bash
kubectl apply -k k8s/base/
kubectl apply -k k8s/prod/
```

## Health Checks

**Service Health**
```http
GET /health
```

**Ready Status**
```http
GET /health/ready
```

**Live Status**
```http
GET /health/live
```

## Security

- JWT authentication required for all endpoints
- Email addresses and phone numbers validated
- Sensitive data (API keys, tokens) stored as Kubernetes secrets
- All notifications logged for audit purposes
- Rate limiting on bulk send operations
- Encryption for sensitive fields in database

## Monitoring

The service provides Prometheus metrics for monitoring:

- `notification_sent_total` - Total notifications sent by type
- `notification_failed_total` - Total notification failures
- `notification_retry_total` - Total retries
- `notification_latency_ms` - Delivery latency
- `template_render_duration_ms` - Template rendering time

## Troubleshooting

### Email Not Sending

1. Verify SMTP credentials in environment variables
2. Check firewall rules for SMTP port (usually 587 or 465)
3. Enable "Less secure app access" for Gmail or use app-specific passwords
4. Review notification logs: `GET /notifications/logs/failed`

### SMS Not Sending

1. Verify Twilio Account SID and Auth Token
2. Ensure Twilio phone number is in correct format (+1234567890)
3. Check Twilio account balance
4. Verify recipient phone number format
5. Review notification logs for Twilio error codes

### High Latency

1. Check MongoDB connection and performance
2. Verify Handlebars template complexity
3. Review SMTP server response times
4. Check HPA metrics for resource constraints

## Development

### Running Locally

```bash
npm install
npm run start:dev
```

Access Swagger docs at: http://localhost:3006/api/docs

### Testing

```bash
npm run test
npm run test:e2e
```

## Contributing

Follow the same patterns as other services in the monorepo:

1. Use strict TypeScript
2. Implement proper error handling and logging
3. Add Swagger documentation for new endpoints
4. Include unit tests for new features
5. Update this README with new functionality

## License

Part of the RCL E-Commerce Platform
