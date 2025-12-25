import bcryptjs from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';

const router = express.Router();

// Sign up
router.post('/signup', (req, res) => {
  const { phoneNumber, password, role, buyerData, sellerData } = req.body;

  if (!phoneNumber || !password || !role) {
    return res.status(400).json({ error: 'Phone number, password, and role are required' });
  }

  if (role !== 'buyer' && role !== 'seller') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // Validate role-specific data
  if (role === 'buyer') {
    if (!buyerData || !buyerData.name || !buyerData.municipality || buyerData.wardNumber === undefined) {
      return res.status(400).json({ error: 'Buyer must provide name, municipality, and ward number' });
    }
  } else if (role === 'seller') {
    if (!sellerData || !sellerData.name || !sellerData.shopName || sellerData.wardNumber === undefined) {
      return res.status(400).json({ error: 'Seller must provide name, shop name, and ward number' });
    }
  }

  const db = getDatabase();
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const userId = uuidv4();

  db.run(
    'INSERT INTO users (id, phoneNumber, password, role) VALUES (?, ?, ?, ?)',
    [userId, phoneNumber, hashedPassword, role],
    (err) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Phone number already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      // Insert role-specific data
      if (role === 'buyer') {
        const buyerId = uuidv4();
        db.run(
          'INSERT INTO buyers (id, userId, name, municipality, wardNumber) VALUES (?, ?, ?, ?, ?)',
          [buyerId, userId, buyerData.name, buyerData.municipality, buyerData.wardNumber],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to create buyer profile' });
            }
            createTokenAndRespond(res, userId, phoneNumber, role, buyerData.name);
          }
        );
      } else if (role === 'seller') {
        const sellerId = uuidv4();
        db.run(
          'INSERT INTO sellers (id, userId, name, shopName, wardNumber) VALUES (?, ?, ?, ?, ?)',
          [sellerId, userId, sellerData.name, sellerData.shopName, sellerData.wardNumber],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to create seller profile' });
            }
            createTokenAndRespond(res, userId, phoneNumber, role, sellerData.name);
          }
        );
      }
    }
  );
});

// Helper function to create token and respond
const createTokenAndRespond = (res, userId, phoneNumber, role, name) => {
  const token = jwt.sign(
    { id: userId, phoneNumber, role, name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    message: 'User created successfully',
    token,
    user: { id: userId, phoneNumber, name, role },
  });
};

// Login
router.post('/login', (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'Phone number and password required' });
  }

  const db = getDatabase();

  db.get('SELECT * FROM users WHERE phoneNumber = ?', [phoneNumber], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const passwordMatch = bcryptjs.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Fetch role-specific data
    const tableName = user.role === 'buyer' ? 'buyers' : 'sellers';
    db.get(`SELECT * FROM ${tableName} WHERE userId = ?`, [user.id], (err, profile) => {
      if (err || !profile) {
        return res.status(500).json({ error: 'Failed to fetch user profile' });
      }

      const token = jwt.sign(
        { id: user.id, phoneNumber: user.phoneNumber, role: user.role, name: profile.name },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: profile.name,
          role: user.role,
          profile,
        },
      });
    });
  });
});

// Get current user
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDatabase();

    // Fetch role-specific data
    const tableName = decoded.role === 'buyer' ? 'buyers' : 'sellers';
    db.get(`SELECT * FROM ${tableName} WHERE userId = ?`, [decoded.id], (err, profile) => {
      if (err || !profile) {
        return res.status(500).json({ error: 'Failed to fetch user profile' });
      }

      res.json({
        user: {
          id: decoded.id,
          email: decoded.email,
          name: profile.name,
          role: decoded.role,
          profile,
        },
      });
    });
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

export default router;
