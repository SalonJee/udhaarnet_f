import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get buyer's credit records (their debts and payment history)
router.get('/buyer-credits', authenticateToken, (req, res) => {
  const db = getDatabase();
  const userId = req.userId;

  db.all(
    `SELECT 
       c.*,
       s.name as sellerName,
       s.shopName,
       b.name as buyerName
     FROM credits c
     JOIN users seller ON c.sellerId = seller.id
     LEFT JOIN sellers s ON seller.id = s.userId
     LEFT JOIN buyers b ON c.buyerId = b.userId
     WHERE c.buyerId = ?
     ORDER BY c.createdAt DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('buyer-credits query error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.json(rows || []);
    }
  );
});

// Get seller's credit records (buyers' debts to them)
router.get('/seller-credits', authenticateToken, (req, res) => {
  const db = getDatabase();
  const userId = req.userId;

  db.all(
    `SELECT 
       c.*,
       b.name as buyerName,
       b.municipality,
       b.wardNumber
     FROM credits c
     JOIN users buyer ON c.buyerId = buyer.id
     LEFT JOIN buyers b ON buyer.id = b.userId
     WHERE c.sellerId = ?
     ORDER BY c.createdAt DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('seller-credits query error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.json(rows || []);
    }
  );
});

// Get list of available buyers (for dropdown/selection)
router.get('/buyers/list', authenticateToken, (req, res) => {
  const db = getDatabase();

  db.all(
    `SELECT u.id, b.name, u.phoneNumber, b.municipality, b.wardNumber
     FROM users u
     LEFT JOIN buyers b ON u.id = b.userId
     WHERE u.role = 'buyer'
     ORDER BY b.name ASC`,
    (err, rows) => {
      if (err) {
        console.error('buyers list error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.json(rows || []);
    }
  );
});

// Get credit summary for buyer (total outstanding, paid, etc.)
router.get('/buyer-summary', authenticateToken, (req, res) => {
  const db = getDatabase();
  const userId = req.userId;

  db.get(
    `SELECT 
       COUNT(*) as totalCredits,
       SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pendingAmount,
       SUM(CASE WHEN status = 'verified' THEN amount ELSE 0 END) as verifiedAmount,
       SUM(CASE WHEN status = 'late' THEN amount ELSE 0 END) as overdueAmount,
       SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paidAmount,
       COUNT(CASE WHEN status = 'late' THEN 1 END) as overdueCount
     FROM credits
     WHERE buyerId = ?`,
    [userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(row || { totalCredits: 0, pendingAmount: 0, verifiedAmount: 0, overdueAmount: 0, paidAmount: 0, overdueCount: 0 });
    }
  );
});

// Get credit summary for seller (total outstanding from all buyers, etc.)
router.get('/seller-summary', authenticateToken, (req, res) => {
  const db = getDatabase();
  const userId = req.userId;

  db.get(
    `SELECT 
       COUNT(*) as totalCredits,
       SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pendingAmount,
       SUM(CASE WHEN status = 'verified' THEN amount ELSE 0 END) as verifiedAmount,
       SUM(CASE WHEN status = 'late' THEN amount ELSE 0 END) as overdueAmount,
       SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paidAmount,
       COUNT(CASE WHEN status = 'late' THEN 1 END) as overdueCount,
       COUNT(DISTINCT buyerId) as uniqueBuyers
     FROM credits
     WHERE sellerId = ?`,
    [userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(row || { totalCredits: 0, pendingAmount: 0, verifiedAmount: 0, overdueAmount: 0, paidAmount: 0, overdueCount: 0, uniqueBuyers: 0 });
    }
  );
});

// Create a new credit record (seller creates credit for buyer)
router.post('/create', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { buyerName, buyerId, amount, description, dueDate } = req.body;
  const sellerId = req.userId;

  console.log('Create credit request:', { buyerName, buyerId, amount, description, dueDate, sellerId });

  // Validation
  if (!buyerId && !buyerName) {
    return res.status(400).json({ error: 'buyerId or buyerName is required' });
  }

  if (!amount || !description) {
    return res.status(400).json({ error: 'amount and description are required' });
  }

  const handleCreateCredit = (finalBuyerId, finalBuyerName) => {
    const creditId = uuidv4();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO credits (id, buyerId, sellerId, amount, description, status, dueDate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [creditId, finalBuyerId, sellerId, amount, description, 'pending', dueDate, now, now],
      (err) => {
        if (err) {
          console.error('create credit error:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }

        // Return the created credit with buyer name
        res.status(201).json({
          id: creditId,
          message: 'Credit record created',
          credit: {
            id: creditId,
            buyerId: finalBuyerId,
            buyerName: finalBuyerName,
            sellerId,
            amount,
            description,
            status: 'pending',
            dueDate,
            createdAt: now,
            updatedAt: now
          }
        });
      }
    );
  };

  if (buyerId) {
    // If buyerId is provided, use it directly and fetch buyer name
    db.get(
      `SELECT b.name as buyerName FROM users u 
       LEFT JOIN buyers b ON u.id = b.userId 
       WHERE u.id = ?`,
      [buyerId],
      (err, row) => {
        if (err || !row) {
          return res.status(400).json({ error: 'Buyer not found with provided ID' });
        }
        handleCreateCredit(buyerId, row.buyerName);
      }
    );
  } else {
    // Look up buyer by name (case-insensitive)
    db.get(
      `SELECT u.id, b.name as buyerName FROM users u 
       LEFT JOIN buyers b ON u.id = b.userId 
       WHERE u.role = 'buyer' AND LOWER(b.name) = LOWER(?)`,
      [buyerName],
      (err, row) => {
        if (err) {
          console.error('Buyer lookup error:', err);
          return res.status(500).json({ error: 'Database error during buyer lookup', details: err.message });
        }
        if (!row) {
          console.log('Buyer not found with name:', buyerName);
          return res.status(400).json({ error: 'Buyer not found. Please check the buyer name' });
        }
        handleCreateCredit(row.id, row.buyerName);
      }
    );
  }
});

// Update credit status (mark as verified, paid, late, etc.)
router.put('/:creditId/status', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { creditId } = req.params;
  const { status, paymentMethod, paymentReference, notes } = req.body;

  const validStatuses = ['pending', 'verified', 'paid', 'overdue', 'late'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const now = new Date().toISOString();
  const paidDate = status === 'paid' ? now : null;

  db.run(
    `UPDATE credits 
     SET status = ?, paymentMethod = ?, paymentReference = ?, notes = ?, paidDate = ?, updatedAt = ?
     WHERE id = ?`,
    [status, paymentMethod, paymentReference, notes, paidDate, now, creditId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Credit not found' });
      }
      res.json({ message: 'Credit updated successfully' });
    }
  );
});

// Record payment for a credit
router.post('/:creditId/payment', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { creditId } = req.params;
  const { paymentMethod, paymentReference, notes } = req.body;

  if (!paymentMethod || !paymentReference) {
    return res.status(400).json({ error: 'paymentMethod and paymentReference are required' });
  }

  const now = new Date().toISOString();

  db.run(
    `UPDATE credits 
     SET status = 'paid', paymentMethod = ?, paymentReference = ?, notes = ?, paidDate = ?, updatedAt = ?
     WHERE id = ?`,
    [paymentMethod, paymentReference, notes, now, now, creditId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Credit not found' });
      }
      res.json({ message: 'Payment recorded successfully' });
    }
  );
});

// Mark credit as paid (alternative endpoint name for frontend)
router.post('/:creditId/mark-paid', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { creditId } = req.params;
  const { paymentMethod, paymentReference, notes } = req.body;

  const now = new Date().toISOString();

  db.run(
    `UPDATE credits 
     SET status = 'paid', paymentMethod = ?, paymentReference = ?, notes = ?, paidDate = ?, updatedAt = ?
     WHERE id = ?`,
    [paymentMethod || '', paymentReference || '', notes || '', now, now, creditId],
    function (err) {
      if (err) {
        console.error('mark-paid error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Credit not found' });
      }
      res.json({ message: 'Payment recorded successfully' });
    }
  );
});

// Delete a credit record
router.delete('/:creditId', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { creditId } = req.params;

  db.run('DELETE FROM credits WHERE id = ?', [creditId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Credit not found' });
    }
    res.json({ message: 'Credit deleted successfully' });
  });
});

export default router;