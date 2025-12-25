import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  const db = getDatabase();

  db.all('SELECT * FROM products', (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(products);
  });
});

// Get products by seller
router.get('/seller/:sellerId', (req, res) => {
  const { sellerId } = req.params;
  const db = getDatabase();

  db.all('SELECT * FROM products WHERE sellerId = ?', [sellerId], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(products);
  });
});

// Get single product
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

// Create product (seller only)
router.post('/', authenticateToken, (req, res) => {
  const { name, description, price, category, stock } = req.body;

  if (req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can create products' });
  }

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const db = getDatabase();
  const productId = uuidv4();

  db.run(
    'INSERT INTO products (id, name, description, price, category, sellerId, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [productId, name, description || '', price, category || 'General', req.user.id, stock || 0],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({
        message: 'Product created',
        product: { id: productId, name, description, price, category, sellerId: req.user.id, stock },
      });
    }
  );
});

// Update product
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category } = req.body;
  const db = getDatabase();

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own products' });
    }

    db.run(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ? WHERE id = ?',
      [name || product.name, description || product.description, price || product.price, stock !== undefined ? stock : product.stock, category || product.category, id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Product updated' });
      }
    );
  });
});

// Delete product
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own products' });
    }

    db.run('DELETE FROM products WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Product deleted' });
    });
  });
});

export default router;
