# Product Service

Enterprise product catalog microservice. Manages product catalog, categories, variants, pricing, and search indexing.

## Features

- **Product Management** - Create, read, update, delete products
- **Categories** - Hierarchical product categorization
- **Variants** - Product variants with different SKUs, prices, and attributes
- **Search** - Full-text search with filtering (price, categories, tags)
- **Featured Products** - Highlight featured/promoted products
- **Stock Management** - Track inventory levels
- **Event-Driven** - Emits events for product changes (product.created, product.updated, product.deleted)
- **MongoDB** - NoSQL database with indexing for performance
- **Pagination** - Efficient product listing with pagination
- **Swagger/OpenAPI** - Complete API documentation

## Development

### Setup

```bash
cd services/product-service
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

Once running, visit `http://localhost:3002/api/docs` for interactive API documentation.

## Database

Uses MongoDB with Mongoose ODM. Collections:
- `products` - Product catalog
- `categories` - Product categories

## API Endpoints

### Products

```
POST   /products                    # Create product
GET    /products                    # Search products (with filters)
GET    /products/featured           # Get featured products
GET    /products/category/:id       # Get products by category
GET    /products/:id                # Get product by ID
GET    /products/sku/:sku           # Get product by SKU
PUT    /products/:id                # Update product
DELETE /products/:id                # Delete product
PUT    /products/:id/stock          # Update stock
```

### Categories

```
POST   /categories                  # Create category
GET    /categories                  # Get all categories
GET    /categories/tree             # Get category tree
GET    /categories/:id              # Get category by ID
GET    /categories/slug/:slug       # Get category by slug
PUT    /categories/:id              # Update category
DELETE /categories/:id              # Delete category
```

### Health

```
GET    /health                      # Health check
GET    /health/ready                # Readiness probe
GET    /health/live                 # Liveness probe
```

## Search Features

Search endpoint supports:
- Text search on product name, slug, description
- Category filtering
- Price range filtering (minPrice, maxPrice)
- Tag filtering
- Pagination (page, limit)
- Sorting (sortBy, sortOrder)

Example:
```
GET /products?query=laptop&categoryIds=1,2&minPrice=500&maxPrice=1500&sortBy=price&sortOrder=asc
```

## Events Emitted

- `product.created` - New product created
- `product.updated` - Product updated
- `product.deleted` - Product deleted
- `product.stock.updated` - Stock level changed

## Architecture

- Database-per-service pattern (MongoDB)
- Event-driven communication
- Full-text search capabilities
- Modular design with separate controllers and services
- Clean API design with DTOs
