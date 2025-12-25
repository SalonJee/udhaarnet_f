import bcryptjs from 'bcryptjs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'marketplace.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Sample buyer and seller data
const buyerUsers = [
  { id: uuidv4(), phoneNumber: '9841234567', password: 'buyer123', role: 'buyer' },
  { id: uuidv4(), phoneNumber: '9841234568', password: 'buyer123', role: 'buyer' },
];

const buyerProfiles = [
  { id: uuidv4(), userId: buyerUsers[0].id, name: 'John Buyer', municipality: 'Kathmandu', wardNumber: 1 },
  { id: uuidv4(), userId: buyerUsers[1].id, name: 'Jane Smith', municipality: 'Lalitpur', wardNumber: 5 },
];

const sellerUsers = [
  { id: uuidv4(), phoneNumber: '9851234567', password: 'seller123', role: 'seller' },
  { id: uuidv4(), phoneNumber: '9851234568', password: 'seller123', role: 'seller' },
];

const sellerProfiles = [
  { id: uuidv4(), userId: sellerUsers[0].id, name: 'Tech Store Owner', shopName: 'Tech Store', wardNumber: 2 },
  { id: uuidv4(), userId: sellerUsers[1].id, name: 'Fashion Hub Owner', shopName: 'Fashion Hub', wardNumber: 3 },
];

const products = [
  {
    id: uuidv4(),
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 79.99,
    category: 'Electronics',
    stock: 50,
    sellerId: sellerUsers[0].id,
  },
  {
    id: uuidv4(),
    name: 'USB-C Cable',
    description: 'Durable USB-C charging cable, 6ft length',
    price: 12.99,
    category: 'Electronics',
    stock: 200,
    sellerId: sellerUsers[0].id,
  },
  {
    id: uuidv4(),
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand',
    price: 34.99,
    category: 'Electronics',
    stock: 30,
    sellerId: sellerUsers[0].id,
  },
  {
    id: uuidv4(),
    name: 'Summer Dress',
    description: 'Casual summer dress, available in multiple sizes',
    price: 45.99,
    category: 'Fashion',
    stock: 40,
    sellerId: sellerUsers[1].id,
  },
  {
    id: uuidv4(),
    name: 'Denim Jeans',
    description: 'Classic blue denim jeans',
    price: 59.99,
    category: 'Fashion',
    stock: 60,
    sellerId: sellerUsers[1].id,
  },
  {
    id: uuidv4(),
    name: 'Running Shoes',
    description: 'Comfortable running shoes with excellent cushioning',
    price: 89.99,
    category: 'Fashion',
    stock: 35,
    sellerId: sellerUsers[1].id,
  },
];

const seedData = () => {
  return new Promise((resolve, reject) => {
    // First, initialize the database schema
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
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
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'paid', 'overdue', 'late')),
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
    `;

    // Split SQL statements and execute them one by one
    const statements = createTablesSQL.split(';').filter(s => s.trim());
    let executed = 0;

    const executeStatements = () => {
      if (executed < statements.length) {
        const stmt = statements[executed].trim() + ';';
        if (stmt.trim() !== ';') {
          db.run(stmt, (err) => {
            if (err && !err.message.includes('already exists')) {
              console.error('Table creation error:', err);
            }
            executed++;
            executeStatements();
          });
        } else {
          executed++;
          executeStatements();
        }
      } else {
        // All tables created, now seed data
        seedDataIntoTables();
      }
    };

    executeStatements();

    function seedDataIntoTables() {
      db.serialize(() => {
        // Clear existing data
        db.run('DELETE FROM credits');
        db.run('DELETE FROM orders');
        db.run('DELETE FROM cart_items');
        db.run('DELETE FROM products');
        db.run('DELETE FROM buyers');
        db.run('DELETE FROM sellers');
        db.run('DELETE FROM users');

      // Insert buyer users
      buyerUsers.forEach((user) => {
        const hashedPassword = bcryptjs.hashSync(user.password, 10);
        db.run(
          'INSERT INTO users (id, phoneNumber, password, role) VALUES (?, ?, ?, ?)',
          [user.id, user.phoneNumber, hashedPassword, user.role],
          (err) => {
            if (err) {
              console.error('Error inserting buyer user:', err);
            } else {
              console.log(`✓ Buyer user created: ${user.phoneNumber}`);
            }
          }
        );
      });

      // Insert buyer profiles
      buyerProfiles.forEach((profile) => {
        db.run(
          'INSERT INTO buyers (id, userId, name, municipality, wardNumber) VALUES (?, ?, ?, ?, ?)',
          [profile.id, profile.userId, profile.name, profile.municipality, profile.wardNumber],
          (err) => {
            if (err) {
              console.error('Error inserting buyer profile:', err);
            } else {
              console.log(`✓ Buyer profile created: ${profile.name}`);
            }
          }
        );
      });

      // Insert seller users
      sellerUsers.forEach((user) => {
        const hashedPassword = bcryptjs.hashSync(user.password, 10);
        db.run(
          'INSERT INTO users (id, phoneNumber, password, role) VALUES (?, ?, ?, ?)',
          [user.id, user.phoneNumber, hashedPassword, user.role],
          (err) => {
            if (err) {
              console.error('Error inserting seller user:', err);
            } else {
              console.log(`✓ Seller user created: ${user.phoneNumber}`);
            }
          }
        );
      });

      // Insert seller profiles
      sellerProfiles.forEach((profile) => {
        db.run(
          'INSERT INTO sellers (id, userId, name, shopName, wardNumber) VALUES (?, ?, ?, ?, ?)',
          [profile.id, profile.userId, profile.name, profile.shopName, profile.wardNumber],
          (err) => {
            if (err) {
              console.error('Error inserting seller profile:', err);
            } else {
              console.log(`✓ Seller profile created: ${profile.name}`);
            }
          }
        );
      });

      // Insert products
      products.forEach((product) => {
        db.run(
          'INSERT INTO products (id, name, description, price, category, sellerId, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [product.id, product.name, product.description, product.price, product.category, product.sellerId, product.stock],
          (err) => {
            if (err) {
              console.error('Error inserting product:', err);
            } else {
              console.log(`✓ Product created: ${product.name}`);
            }
          }
        );
      });

      // Insert sample orders
      const sampleOrder = {
        id: uuidv4(),
        buyerId: buyerUsers[0].id,
        productId: products[0].id,
        quantity: 2,
        totalPrice: products[0].price * 2,
        status: 'completed',
      };

      db.run(
        'INSERT INTO orders (id, buyerId, productId, quantity, totalPrice, status) VALUES (?, ?, ?, ?, ?, ?)',
        [sampleOrder.id, sampleOrder.buyerId, sampleOrder.productId, sampleOrder.quantity, sampleOrder.totalPrice, sampleOrder.status],
        (err) => {
          if (err) {
            console.error('Error inserting order:', err);
          } else {
            console.log(`✓ Sample order created`);
          }
        }
      );

      // Insert sample credits for buyers
      const sampleCredits = [
        {
          id: uuidv4(),
          buyerId: buyerUsers[0].id,
          sellerId: sellerUsers[0].id,
          amount: 159.98,
          description: 'Wireless Headphones - 2 units',
          status: 'active',
          buyerApproved: 1,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: null,
          paymentReference: null,
          notes: 'Payment due in 30 days',
        },
        {
          id: uuidv4(),
          buyerId: buyerUsers[0].id,
          sellerId: sellerUsers[1].id,
          amount: 45.99,
          description: 'Summer Dress',
          status: 'paid',
          buyerApproved: 1,
          dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'eSewa',
          paymentReference: 'eSEWA-20240115-001',
          notes: 'Paid on time',
        },
        {
          id: uuidv4(),
          buyerId: buyerUsers[1].id,
          sellerId: sellerUsers[0].id,
          amount: 89.99,
          description: 'Running Shoes',
          status: 'late',
          buyerApproved: 1,
          dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: null,
          paymentReference: null,
          notes: 'Payment overdue by 10 days',
        },
        {
          id: uuidv4(),
          buyerId: buyerUsers[1].id,
          sellerId: sellerUsers[1].id,
          amount: 105.98,
          description: 'Denim Jeans + T-shirt',
          status: 'pending',
          buyerApproved: 0,
          dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: null,
          paymentReference: null,
          notes: 'Awaiting buyer approval',
        },
      ];

      sampleCredits.forEach((credit) => {
        db.run(
          'INSERT INTO credits (id, buyerId, sellerId, amount, description, status, buyerApproved, dueDate, paidDate, paymentMethod, paymentReference, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            credit.id,
            credit.buyerId,
            credit.sellerId,
            credit.amount,
            credit.description,
            credit.status,
            credit.buyerApproved || 0,
            credit.dueDate,
            credit.paidDate,
            credit.paymentMethod,
            credit.paymentReference,
            credit.notes,
          ],
          (err) => {
            if (err) {
              console.error('Error inserting credit:', err);
            } else {
              console.log(`✓ Credit record created: ${credit.description}`);
            }
          }
        );
      });

      setTimeout(() => {
        console.log('\n✅ Database seeding completed!');
        console.log('\nTest Credentials:');
        console.log('\nBuyers:');
        buyerProfiles.forEach((profile, idx) => {
          console.log(`  Phone: ${buyerUsers[idx].phoneNumber}, Password: ${buyerUsers[idx].password}`);
          console.log(`    Name: ${profile.name}, Municipality: ${profile.municipality}, Ward: ${profile.wardNumber}`);
        });
        console.log('\nSellers:');
        sellerProfiles.forEach((profile, idx) => {
          console.log(`  Phone: ${sellerUsers[idx].phoneNumber}, Password: ${sellerUsers[idx].password}`);
          console.log(`    Name: ${profile.name}, Shop: ${profile.shopName}, Ward: ${profile.wardNumber}`);
        });
        db.close(() => {
          resolve();
        });
      }, 1000);
      }); // Close db.serialize()
    } // Close seedDataIntoTables()
  });
};

seedData().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
