# Database Schema

## Overview
SQLite database with 4 main tables: Users, Products, Orders, and Cart Items

## Tables

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL (hashed),
  name TEXT NOT NULL,
  role TEXT NOT NULL (buyer or seller),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Sample Data:**
```
| id (UUID) | email | password (hashed) | name | role | createdAt | updatedAt |
|-----------|-------|-------------------|------|------|-----------|-----------|
| uuid1 | buyer1@example.com | $2a$10$... | John Buyer | buyer | 2024-01-01 | 2024-01-01 |
| uuid2 | seller1@example.com | $2a$10$... | Tech Store | seller | 2024-01-01 | 2024-01-01 |
```

---

### Products Table
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category TEXT,
  sellerId TEXT NOT NULL (Foreign Key → users.id),
  stock INTEGER DEFAULT 0,
  image TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sellerId) REFERENCES users(id)
);

CREATE INDEX idx_products_seller ON products(sellerId);
```

**Sample Data:**
```
| id | name | description | price | category | sellerId | stock | createdAt |
|----|------|-------------|-------|----------|----------|-------|-----------|
| uuid1 | Wireless Headphones | High-quality headphones | 79.99 | Electronics | seller-uuid | 50 | 2024-01-01 |
| uuid2 | Summer Dress | Casual summer dress | 45.99 | Fashion | seller-uuid2 | 40 | 2024-01-01 |
```

---

### Orders Table
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  buyerId TEXT NOT NULL (Foreign Key → users.id),
  productId TEXT NOT NULL (Foreign Key → products.id),
  quantity INTEGER NOT NULL,
  totalPrice REAL NOT NULL,
  status TEXT DEFAULT 'pending' (pending, completed, cancelled),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyerId) REFERENCES users(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);

CREATE INDEX idx_orders_buyer ON orders(buyerId);
CREATE INDEX idx_orders_product ON orders(productId);
```

**Sample Data:**
```
| id | buyerId | productId | quantity | totalPrice | status | createdAt |
|----|---------|-----------|----------|-----------|--------|-----------|
| uuid1 | buyer-uuid | product-uuid | 2 | 159.98 | completed | 2024-01-01 |
| uuid2 | buyer-uuid | product-uuid2 | 1 | 45.99 | pending | 2024-01-02 |
```

---

### Cart Items Table
```sql
CREATE TABLE cart_items (
  id TEXT PRIMARY KEY,
  buyerId TEXT NOT NULL (Foreign Key → users.id),
  productId TEXT NOT NULL (Foreign Key → products.id),
  quantity INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyerId) REFERENCES users(id),
  FOREIGN KEY (productId) REFERENCES products(id),
  UNIQUE(buyerId, productId)
);

CREATE INDEX idx_cart_buyer ON cart_items(buyerId);
```

**Sample Data:**
```
| id | buyerId | productId | quantity | createdAt |
|----|---------|-----------|----------|-----------|
| uuid1 | buyer-uuid | product-uuid | 1 | 2024-01-03 |
| uuid2 | buyer-uuid | product-uuid2 | 2 | 2024-01-03 |
```

---

## Relationships

```
Users (1) ──→ (*) Products
  ↑                    ↓
  │                    │
  └────── Orders ──────┘

Users (1) ──→ (*) Cart Items ←─ (*) Products
```

### Constraints & Indices

| Table | Index | Purpose |
|-------|-------|---------|
| users | PRIMARY KEY (id) | Unique user identification |
| users | UNIQUE (email) | Prevent duplicate emails |
| products | idx_products_seller | Query products by seller |
| orders | idx_orders_buyer | Query orders by buyer |
| orders | idx_orders_product | Query orders by product |
| cart_items | idx_cart_buyer | Query cart by buyer |
| cart_items | UNIQUE (buyerId, productId) | Prevent duplicate cart items |

---

## Data Types

| Type | Description | Example |
|------|-------------|---------|
| TEXT PRIMARY KEY | Unique identifier (UUID) | "550e8400-e29b-41d4-a716-446655440000" |
| TEXT UNIQUE NOT NULL | Email address | "user@example.com" |
| TEXT NOT NULL | Stored as hash | "$2a$10$..." (bcrypt hash) |
| TEXT NOT NULL | User/Product name | "John Buyer" |
| REAL NOT NULL | Price/Amount | 79.99 |
| INTEGER | Stock/Quantity | 50 |
| DATETIME | Timestamp | "2024-01-01 12:30:45" |

---

## Seed Data Summary

| Table | Count | Purpose |
|-------|-------|---------|
| users | 4 | 2 buyers + 2 sellers |
| products | 6 | Test product listing |
| orders | 1 | Sample order for testing |
| cart_items | 0 | Empty initially |

---

## Foreign Key Relationships

### User → Products
- One user can have many products (one-to-many)
- Product must belong to exactly one user (seller)
- Deleting a user should cascade delete their products (enforced by application logic)

### User → Orders (as buyer)
- One user can have many orders (one-to-many)
- Order must belong to exactly one user (buyer)

### Product → Orders
- One product can be in many orders (one-to-many)
- Order must reference exactly one product

### User → Cart Items (as buyer)
- One user can have many cart items (one-to-many)
- Cart item must belong to exactly one user

### Product → Cart Items
- One product can be in many cart items (one-to-many)
- Cart item must reference exactly one product

---

## Query Examples

```sql
-- Get all products by a seller
SELECT * FROM products WHERE sellerId = 'user-uuid';

-- Get all orders placed by a buyer
SELECT * FROM orders WHERE buyerId = 'buyer-uuid';

-- Get all orders for a seller's products
SELECT o.* FROM orders o
JOIN products p ON o.productId = p.id
WHERE p.sellerId = 'seller-uuid';

-- Get cart items with product details
SELECT ci.*, p.name, p.price 
FROM cart_items ci
JOIN products p ON ci.productId = p.id
WHERE ci.buyerId = 'buyer-uuid';

-- Get total sales for a seller
SELECT SUM(totalPrice) FROM orders o
JOIN products p ON o.productId = p.id
WHERE p.sellerId = 'seller-uuid';

-- Get products with low stock
SELECT * FROM products WHERE stock < 10;
```

---

## Performance Considerations

### Indices
- `idx_products_seller`: Fast lookup of products by seller
- `idx_orders_buyer`: Fast lookup of orders by buyer
- `idx_orders_product`: Fast lookup of orders by product
- `idx_cart_buyer`: Fast lookup of cart items by buyer

### PRAGMA Settings
- `PRAGMA foreign_keys = ON`: Enforces referential integrity

### Scalability Notes
- For production, consider:
  - Partitioning large tables by date
  - Adding query optimization hints
  - Implementing pagination in API responses
  - Caching frequently accessed data
  - Migrating to PostgreSQL for higher concurrency

---

## Database File Location
```
backend/marketplace.db
```

---

## Reset Database
To reset the database:
1. Delete `backend/marketplace.db`
2. Run `npm run seed` from backend directory

All tables will be recreated with fresh seed data.
