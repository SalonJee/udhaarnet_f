# Marketplace App - Backend & Frontend Setup

This is a complete React Native Expo marketplace application with a Node.js backend using SQLite.

## Project Structure

```
├── backend/                 # Node.js Express server
│   ├── config/
│   │   └── database.js     # SQLite database configuration
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── products.js     # Product management routes
│   │   └── orders.js       # Order management routes
│   ├── server.js           # Main server file
│   ├── seed.js             # Database seed script
│   ├── .env                # Environment variables
│   └── package.json        # Backend dependencies
│
├── frontend/               # React Native screens
│   ├── screens/
│   │   ├── RoleSelectionScreen.js
│   │   ├── LoginScreen.js
│   │   ├── BuyerHomeScreen.js
│   │   └── SellerHomeScreen.js
│   └── context/
│       └── AuthContext.js  # Auth state management
│
└── App.js                 # Main app entry point
```

## Installation & Setup

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Start the Backend Server

```bash
# In the backend directory
npm start
# or for development with auto-reload
npm run dev
```

The server will run on `http://localhost:3000`

### Step 3: Seed Database with Test Data

```bash
# In a new terminal, in the backend directory
npm run seed
```

This will create the database and populate it with:
- **2 Test Buyer Accounts**
- **2 Test Seller Accounts**
- **6 Sample Products** (Electronics & Fashion)
- **1 Sample Order**

### Step 4: Update Frontend API URL (if needed)

In `frontend/context/AuthContext.js` and the screen files, the API_URL is set to:
```javascript
const API_URL = 'http://localhost:3000/api';
```

If you're running on a different machine/port, update this URL accordingly.

### Step 5: Start the Frontend App

```bash
# In the root directory (alongside App.js)
npm start
```

Then choose your platform:
- `i` for iOS
- `a` for Android
- `w` for web

## Test Credentials

### Buyers
- Email: `buyer1@example.com`
- Password: `buyer123`

OR

- Email: `buyer2@example.com`
- Password: `buyer123`

### Sellers
- Email: `seller1@example.com`
- Password: `seller123`

OR

- Email: `seller2@example.com`
- Password: `seller123`

## Features Implemented

### Authentication
- User registration with role selection (buyer/seller)
- JWT-based login
- Secure password hashing with bcryptjs
- Token-based API authentication

### Buyer Features
- Browse all available products
- View product details (name, price, stock, category)
- Add products to cart (UI only, backend ready)
- View product listings by category
- Order history (backend ready)

### Seller Features
- View personal products inventory
- View orders received from buyers
- Product management (backend API ready)
- Sales statistics
- Order status tracking

### Database Schema
- **Users**: id, email, password (hashed), name, role, timestamps
- **Products**: id, name, description, price, category, sellerId, stock, timestamps
- **Orders**: id, buyerId, productId, quantity, totalPrice, status, timestamps
- **Cart Items**: id, buyerId, productId, quantity, timestamps

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/seller/:sellerId` - Get seller's products
- `POST /api/products` - Create product (seller only)
- `PUT /api/products/:id` - Update product (seller only)
- `DELETE /api/products/:id` - Delete product (seller only)

### Orders
- `GET /api/orders/buyer/my-orders` - Get buyer's orders
- `GET /api/orders/seller/my-orders` - Get seller's orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

## Environment Variables

Backend `.env` file:
```
PORT=3000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

## Database File

SQLite database is created automatically at:
```
backend/marketplace.db
```

To reset the database, simply delete this file and run `npm run seed` again.

## Troubleshooting

### Backend won't start
- Check if port 3000 is already in use
- Ensure Node.js is installed (v14+)

### Frontend can't connect to backend
- Make sure backend is running on `http://localhost:3000`
- Update API_URL if backend is on different machine/port
- Check Network settings if using emulator

### Database errors
- Delete `backend/marketplace.db` and run `npm run seed` again
- Ensure SQLite3 is properly installed

## Future Enhancements

- Cart functionality implementation
- Payment integration
- Image uploads for products
- User reviews and ratings
- Search and filtering
- Notifications
- Chat between buyers and sellers
- Admin dashboard
- Order tracking with geolocation

## Notes

This is a development/demo version. For production:
- Use environment-based configuration
- Implement proper error handling
- Add input validation
- Use HTTPS
- Implement rate limiting
- Add comprehensive logging
- Set up proper CORS policies
- Use environment variables for secrets
