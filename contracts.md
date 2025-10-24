# Rubber Track Wholesale - API Contracts & Integration Plan

## Overview
This document outlines the API contracts, database schema, and integration plan for the Rubber Track Wholesale e-commerce platform.

---

## API Endpoints

### Public APIs (Frontend)

#### Products
- `GET /api/products` - Get all products with filters
  - Query params: brand, category, search, sort, limit, skip
- `GET /api/products/{id}` - Get single product with SEO data
- `GET /api/products/search` - Advanced search by size, part number

#### Brands
- `GET /api/brands` - Get all brands
- `GET /api/brands/{slug}` - Get brand by slug with SEO data

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{slug}` - Get category by slug with SEO data

#### Contact
- `POST /api/contact` - Submit contact form

#### Orders (Future)
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order details

---

### Admin APIs (Protected)

#### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout

#### Products Management
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `PUT /api/admin/products/{id}/seo` - Update product SEO

#### Brands Management
- `GET /api/admin/brands` - Get all brands
- `POST /api/admin/brands` - Create brand
- `PUT /api/admin/brands/{id}` - Update brand
- `DELETE /api/admin/brands/{id}` - Delete brand

#### Categories Management
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/{id}` - Update category
- `DELETE /api/admin/categories/{id}` - Delete category

#### Orders Management
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/{id}/status` - Update order status

#### Customers Management
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/customers/{id}` - Get customer details

#### Messages
- `GET /api/admin/messages` - Get contact messages
- `PUT /api/admin/messages/{id}/status` - Update message status

---

## Database Schema

### Products Collection
```javascript
{
  _id: ObjectId,
  sku: String (unique),
  title: String,
  description: String,
  price: Number,
  brand: String,
  category: String,
  size: String,
  part_number: String,
  images: [String],
  in_stock: Boolean,
  stock_quantity: Number,
  specifications: Object,
  
  // SEO Fields
  seo_title: String,
  seo_description: String,
  seo_keywords: [String],
  meta_tags: Object,
  schema_markup: Object,
  alt_tags: [String],
  
  created_at: DateTime,
  updated_at: DateTime
}
```

### Brands Collection
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String (unique),
  logo: String,
  description: String,
  seo_title: String,
  seo_description: String,
  seo_keywords: [String],
  created_at: DateTime,
  updated_at: DateTime
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String (unique),
  description: String,
  seo_title: String,
  seo_description: String,
  seo_keywords: [String],
  created_at: DateTime,
  updated_at: DateTime
}
```

---

## SEO Implementation

### Schema Markup (JSON-LD)
Each product page will include:
```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Product Title",
  "image": ["image1.jpg", "image2.jpg"],
  "description": "Product description",
  "sku": "RT-450-86-56",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://rubbertrackwholesale.com/product/1",
    "priceCurrency": "USD",
    "price": "1299.99",
    "availability": "https://schema.org/InStock"
  }
}
```

### Dynamic Meta Tags
- Title: Product/Category specific
- Description: SEO optimized
- Keywords: Relevant search terms
- OG tags for social sharing
- Canonical URLs

### Semantic HTML
- Proper heading hierarchy (H1, H2, H3)
- Alt tags on all images
- Aria labels for accessibility
- Structured data markup

---

## Mock Data in mockData.js

Currently mocked:
- 6 sample products
- 9 brands
- 5 categories
- 3 testimonials

Will be replaced with:
- Live data from MongoDB
- Real-time inventory
- Dynamic pricing

---

## Integration Steps

1. **Backend Setup**
   - Create all models and database schemas
   - Implement authentication system
   - Build all API endpoints
   - Add SEO generation logic

2. **Admin Panel**
   - Create admin login page
   - Build dashboard
   - Implement CRUD interfaces
   - Add SEO management UI

3. **Frontend Integration**
   - Replace mockData.js with API calls
   - Add SEO meta tags dynamically
   - Implement schema markup injection
   - Add loading states and error handling

4. **Testing**
   - Test all CRUD operations
   - Verify SEO tags rendering
   - Check schema markup validation
   - Test search functionality

---

## Security Considerations

- JWT-based authentication for admin
- Password hashing with bcrypt
- CORS configuration
- Input validation on all endpoints
- Rate limiting (production)
- HTTPS only (production)

---

## Performance Optimizations

- Database indexes on frequently queried fields
- Image optimization and CDN (production)
- API response caching
- Lazy loading for images
- Pagination for large datasets
