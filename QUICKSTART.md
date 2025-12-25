# Quick Start Guide - React Native Expo App

## Project Overview

This is a React Native Expo application built with role-based authentication. Users can select between "Buyer" and "Seller" roles, login, and access role-specific dashboards.

## Directory Structure

```
/frontend                          # Frontend application folder
├── context/
│   └── AuthContext.js            # Global auth state management
├── screens/                       # All app screens
│   ├── RoleSelectionScreen.js    # Role selection (Buyer/Seller)
│   ├── LoginScreen.js            # Login page
│   ├── BuyerHomeScreen.js        # Buyer dashboard
│   └── SellerHomeScreen.js       # Seller dashboard
├── components/                    # Reusable components (ready for future use)
└── styles/                        # Shared styles (ready for future use)

App.js                            # Main app component with navigation
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Navigate to project directory**
   ```bash
   cd /home/salon-timsina/Documents/dummmy2
   ```

2. **Install dependencies** (already done, but if needed)
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Choose a platform**
   - Press `w` for web
   - Press `a` for Android
   - Press `i` for iOS

### Using the App

#### Step 1: Select Your Role
- **Buyer**: Browse products, add to cart, search
- **Seller**: View sales stats, manage orders, manage inventory

#### Step 2: Login
- Enter any email and password (this is a demo app, so any credentials work)
- Click "Login"

#### Step 3: Explore the Dashboard
- **Buyer Dashboard**: 
  - View product categories
  - Browse featured products
  - Add items to cart
  - Logout and return to role selection

- **Seller Dashboard**:
  - View sales statistics
  - Check recent orders
  - Monitor order status
  - Add products or manage inventory
  - Logout and return to role selection

## Key Features

✅ **Role-Based Navigation** - Different screens for buyers and sellers
✅ **Context API Auth** - Global authentication state management
✅ **Responsive UI** - Works on web, iOS, and Android
✅ **Dummy Login** - Demo credentials (any email/password works)
✅ **Role-Specific Colors** - Blue for Buyers, Orange for Sellers
✅ **Navigation Stack** - Smooth transitions between screens

## Development Commands

```bash
npm start          # Start Expo development server
npm run web        # Run on web browser
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator (macOS only)
npm run lint       # Run ESLint
```

## File Descriptions

### AuthContext.js
- Manages global authentication state
- Stores user role, authentication status, and user data
- Provides `useAuth()` hook for easy access

### RoleSelectionScreen.js
- First screen users see
- Options to select Buyer or Seller
- Navigates to LoginScreen after selection

### LoginScreen.js
- Displays selected role
- Email and password inputs
- Dummy login accepts any credentials
- Back button to return to role selection

### BuyerHomeScreen.js
- Welcome message with user email
- Product categories carousel
- Featured products list with "Add to Cart" buttons
- Search bar (UI only)
- Logout button

### SellerHomeScreen.js
- Welcome message with seller email
- 4 statistics cards (Sales, Products, Orders, Ratings)
- Recent orders table with status badges
- Action buttons (Add Product, Manage Inventory)
- Logout button

## Customization Tips

### Change Colors
Edit the style objects in each screen file:
- Buyer: Change `#007AFF` (blue)
- Seller: Change `#FF9500` (orange)

### Add More Data
Modify the `categories`, `featuredProducts`, `stats`, and `recentOrders` arrays in the home screen files

### Connect to Backend
Replace dummy login in `AuthContext.js` with real API calls:
```javascript
const login = async (email, password) => {
  // const response = await fetch('your-api-endpoint', ...)
  // Handle real authentication
}
```

## Next Steps

1. Connect to a real backend API
2. Add more screens (Product Detail, Order Detail, etc.)
3. Implement real authentication
4. Add local storage for persistent login
5. Create a bottom tab navigator for more features
6. Add animations and transitions

## Troubleshooting

**White screen on startup?**
- Clear cache: `expo start -c`
- Restart development server

**Navigation not working?**
- Ensure all screen components are exported correctly
- Check that component names in Stack.Screen match imports

**Styling issues?**
- Reload the app (press `r` in terminal)
- Clear cache if needed

## Support

For issues or questions:
1. Check the `FRONTEND_README.md` for detailed documentation
2. Review the comments in the code files
3. Check official Expo and React Navigation documentation

---

**Happy coding!** 🚀
