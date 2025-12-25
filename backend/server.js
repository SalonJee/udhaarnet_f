import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import initializeDatabase from './config/database.js';
import authRoutes from './routes/auth.js';
import creditsRoutes from './routes/credits.js';
import orderRoutes from './routes/orders.js';
import productRoutes from './routes/products.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/credits', creditsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servers are running on http://192.168.8.121:${PORT}`);
      console.log(`Database initialized at marketplace.db`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
