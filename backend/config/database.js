import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../marketplace.db');

let db = null;

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) reject(err);
          
          // Create tables
          const createTablesSQL = `
            CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY,
              phoneNumber TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              role TEXT NOT NULL CHECK(role IN ('buyer', 'seller')),
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS buyers (
              id TEXT PRIMARY KEY,
              userId TEXT UNIQUE NOT NULL,
              name TEXT NOT NULL,
              municipality TEXT NOT NULL,
              wardNumber INTEGER NOT NULL,
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (userId) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS sellers (
              id TEXT PRIMARY KEY,
              userId TEXT UNIQUE NOT NULL,
              name TEXT NOT NULL,
              shopName TEXT NOT NULL,
              wardNumber INTEGER NOT NULL,
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (userId) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS products (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              description TEXT,
              price REAL NOT NULL,
              category TEXT,
              sellerId TEXT NOT NULL,
              stock INTEGER DEFAULT 0,
              image TEXT,
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (sellerId) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS orders (
              id TEXT PRIMARY KEY,
              buyerId TEXT NOT NULL,
              productId TEXT NOT NULL,
              quantity INTEGER NOT NULL,
              totalPrice REAL NOT NULL,
              status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (buyerId) REFERENCES users(id),
              FOREIGN KEY (productId) REFERENCES products(id)
            );

            CREATE TABLE IF NOT EXISTS cart_items (
              id TEXT PRIMARY KEY,
              buyerId TEXT NOT NULL,
              productId TEXT NOT NULL,
              quantity INTEGER NOT NULL,
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (buyerId) REFERENCES users(id),
              FOREIGN KEY (productId) REFERENCES products(id),
              UNIQUE(buyerId, productId)
            );

            CREATE TABLE IF NOT EXISTS credits (
              id TEXT PRIMARY KEY,
              buyerId TEXT NOT NULL,
              sellerId TEXT NOT NULL,
              amount REAL NOT NULL,
              description TEXT,
              status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'active', 'paid', 'overdue', 'late')),
              buyerApproved BOOLEAN DEFAULT 0,
              dueDate DATETIME,
              paidDate DATETIME,
              paymentMethod TEXT,
              paymentReference TEXT,
              notes TEXT,
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (buyerId) REFERENCES users(id),
              FOREIGN KEY (sellerId) REFERENCES users(id)
            );

            CREATE INDEX IF NOT EXISTS idx_buyers_user ON buyers(userId);
            CREATE INDEX IF NOT EXISTS idx_sellers_user ON sellers(userId);
            CREATE INDEX IF NOT EXISTS idx_products_seller ON products(sellerId);
            CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyerId);
            CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(productId);
            CREATE INDEX IF NOT EXISTS idx_cart_buyer ON cart_items(buyerId);
            CREATE INDEX IF NOT EXISTS idx_credits_buyer ON credits(buyerId);
            CREATE INDEX IF NOT EXISTS idx_credits_seller ON credits(sellerId);
            CREATE INDEX IF NOT EXISTS idx_credits_status ON credits(status);
          `;

          db.exec(createTablesSQL, (err) => {
            if (err) reject(err);
            else resolve(db);
          });
        });
      }
    });
  });
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export default initializeDatabase;
