# MarketPlace - React Native Expo App

A React Native Expo application with role-based authentication (Buyer/Seller) and respective landing pages.

## Project Structure

```
frontend/
├── context/
│   └── AuthContext.js          # Authentication context and hooks
├── screens/
│   ├── RoleSelectionScreen.js  # Initial role selection page (Buyer/Seller)
│   ├── LoginScreen.js          # Login screen for selected role
│   ├── BuyerHomeScreen.js      # Buyer dashboard with products and categories
│   └── SellerHomeScreen.js     # Seller dashboard with stats and orders
└── styles/
    └── (Future: Common style constants)
```

## Features

### 1. **Role Selection Screen**
   - Initial landing page where users choose between Buyer or Seller role
   - Clean, intuitive UI with role descriptions

### 2. **Login Screen**
   - Role-specific login interface
   - Displays the selected role with matching color scheme
   - Dummy login (accepts any email/password for demo purposes)
   - Option to return to role selection

### 3. **Buyer Home Screen**
   - Welcome message with user email
   - Product categories (Electronics, Clothing, Books, Home & Garden)
   - Featured products with "Add to Cart" functionality
   - Search functionality
   - Logout option

### 4. **Seller Home Screen**
   - Welcome message with seller email
   - Statistics dashboard (Total Sales, Active Products, Orders Today, Ratings)
   - Recent orders with status tracking
   - Action buttons: Add Product & Manage Inventory
   - Logout option

## Tech Stack

- **React Native 0.81.5**
- **Expo 54.0.30**
- **React Navigation 7.x** (Native Stack)
- **React 19.1.0**

## Installation

1. Install dependencies:
```bash
npm install
```

2. Additional navigation dependencies (already included):
```bash
npm install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

## Running the App

### Web
```bash
npm run web
```

### Android
```bash
npm run android
```

### iOS (macOS only)
```bash
npm run ios
```

### Start Expo Development Server
```bash
npm start
```

## Authentication Flow

1. **Start** → Role Selection Screen
2. **Select Role** (Buyer/Seller) → Login Screen
3. **Login** (any email/password) → Role-specific Home Screen
4. **Logout** → Back to Role Selection

## Color Scheme

- **Buyer Theme**: Blue (#007AFF)
- **Seller Theme**: Orange (#FF9500)
- **Background**: Light Gray (#f5f5f5)
- **Text**: Dark Gray (#1a1a1a)

## Demo Credentials

Since this is a dummy login, you can use any email and password to login.

Example:
- Email: `buyer@example.com` or `seller@example.com`
- Password: `any password`

## Future Enhancements

- [ ] Connect to real authentication backend
- [ ] Implement actual product API integration
- [ ] Add database for user profiles and orders
- [ ] Implement payment gateway
- [ ] Add product search and filtering
- [ ] Real-time notifications for sellers
- [ ] Order tracking for buyers
- [ ] User profile management
- [ ] Product reviews and ratings

## Notes

- This is a frontend-only application with dummy data
- All login functionality is for demonstration purposes
- Replace dummy data with API calls when connecting to a backend
