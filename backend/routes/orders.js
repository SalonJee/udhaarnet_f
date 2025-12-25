import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get orders for buyer
router.get('/buyer/my-orders', authenticateToken, (req, res) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Only buyers can view orders' });
  }

  const db = getDatabase();

  db.all(
    `SELECT o.*, p.name as productName, p.price as productPrice, u.name as sellerName
     FROM orders o
     JOIN products p ON o.productId = p.id
     JOIN users u ON p.sellerId = u.id
     WHERE o.buyerId = ?
     ORDER BY o.createdAt DESC`,
    [req.user.id],
    (err, orders) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(orders);
    }
  );
});

// Get orders for seller
router.get('/seller/my-orders', authenticateToken, (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can view orders' });
  }

  const db = getDatabase();

  db.all(
    `SELECT o.*, p.name as productName, u.name as buyerName
     FROM orders o
     JOIN products p ON o.productId = p.id
     JOIN users u ON o.buyerId = u.id
     WHERE p.sellerId = ?
     ORDER BY o.createdAt DESC`,
    [req.user.id],
    (err, orders) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(orders);
    }
  );
});

// Create order
router.post('/', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body;

  if (req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Only buyers can create orders' });
  }

  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity required' });
  }

  const db = getDatabase();

  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const orderId = uuidv4();
    const totalPrice = product.price * quantity;

    db.run(
      'INSERT INTO orders (id, buyerId, productId, quantity, totalPrice) VALUES (?, ?, ?, ?, ?)',
      [orderId, req.user.id, productId, quantity, totalPrice],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Update product stock
        db.run(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [quantity, productId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({
              message: 'Order created',
              order: { id: orderId, productId, quantity, totalPrice, status: 'pending' },
            });
          }
        );
      }
    );
  });
});

// Update order status
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const db = getDatabase();

  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.get('SELECT * FROM products WHERE id = ?', [order.productId], (err, product) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (product.sellerId !== req.user.id && order.buyerId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      db.run(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ message: 'Order updated', order: { ...order, status } });
        }
      );
    });
  });
});

export default router;
