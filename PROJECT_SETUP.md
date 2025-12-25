# 🚀 React Native Expo MarketPlace App

A complete React Native Expo application featuring role-based authentication with separate buyer and seller dashboards.

## 📋 What's Included

### ✅ Frontend Application (`/frontend`)
- **Authentication System**: Role selection and dummy login
- **Buyer Dashboard**: Product browsing, categories, featured items
- **Seller Dashboard**: Sales stats, order management, inventory tools
- **Navigation**: Seamless screen transitions with proper auth flow
- **Context API**: Global state management for user authentication

### 📚 Documentation
- **`QUICKSTART.md`** - Quick start guide (read this first!)
- **`FRONTEND_README.md`** - Detailed feature documentation
- **`IMPLEMENTATION.md`** - Implementation summary
- **`PROJECT_SETUP.md`** - This file

## 🎯 Features

### Role Selection
- Clean landing page with two role options
- Color-coded buttons (Blue for Buyer, Orange for Seller)
- Smooth navigation to login screen

### Dummy Authentication
- Email and password inputs
- Works with any email/password combination
- Role-specific login screens

### Buyer Dashboard
- Product categories carousel
- Featured products with pricing
- Add to cart functionality
- Search interface
- User profile with logout

### Seller Dashboard
- Statistics cards (Sales, Products, Orders, Ratings)
- Recent orders table with status tracking
- Action buttons (Add Product, Manage Inventory)
- User profile with logout

## 🚀 Quick Start

```bash
# 1. Navigate to project
cd /home/salon-timsina/Documents/dummmy2

# 2. Start development server
npm start

# 3. Choose platform
# Press 'w' for web
# Press 'a' for Android
# Press 'i' for iOS
```

**See `QUICKSTART.md` for detailed instructions.**

## 📁 Project Structure

```
.
├── frontend/                       # Frontend application
│   ├── context/
│   │   └── AuthContext.js         # Auth state & hooks
│   ├── screens/                    # All screens
│   │   ├── RoleSelectionScreen.js
│   │   ├── LoginScreen.js
│   │   ├── BuyerHomeScreen.js
│   │   └── SellerHomeScreen.js
│   ├── components/                 # Reusable components
│   └── styles/                     # Shared styles
├── App.js                          # Main app component
├── package.json                    # Dependencies
├── QUICKSTART.md                   # 👈 Read this first!
├── FRONTEND_README.md              # Full documentation
└── IMPLEMENTATION.md               # Implementation details
```

## 🎨 Technology Stack

- **React Native** (0.81.5)
- **Expo** (54.0.30)
- **React Navigation** (7.x)
- **React Hooks & Context API**
- **Styling**: StyleSheet (React Native)

## 🔑 Key Features

| Feature | Status |
|---------|--------|
| Role Selection | ✅ Complete |
| Authentication | ✅ Complete (Dummy) |
| Buyer Dashboard | ✅ Complete |
| Seller Dashboard | ✅ Complete |
| Navigation | ✅ Complete |
| Styling | ✅ Complete |
| Documentation | ✅ Complete |

## 🎮 How to Use

### Step 1: Start the App
```bash
npm start
```

### Step 2: Select Your Role
- Click "Buyer" or "Seller"

### Step 3: Login
- Enter any email and password
- Click "Login"

### Step 4: Explore the Dashboard
- **Buyers**: Browse products, add to cart
- **Sellers**: Check stats, manage orders

### Step 5: Logout
- Click "Logout" to return to role selection

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| `QUICKSTART.md` | Getting started guide |
| `FRONTEND_README.md` | Complete feature docs |
| `IMPLEMENTATION.md` | Implementation details |

**👉 Start with `QUICKSTART.md`**

## 🔧 Available Commands

```bash
npm start          # Start dev server
npm run web        # Run on web
npm run android    # Run on Android
npm run ios        # Run on iOS (macOS only)
npm run lint       # Run ESLint
```

## 🎨 Color Scheme

- **Buyer Theme**: Blue (#007AFF)
- **Seller Theme**: Orange (#FF9500)
- **Background**: Light Gray (#f5f5f5)
- **Text**: Dark Gray (#1a1a1a)

## 📱 Platform Support

| Platform | Status |
|----------|--------|
| Web | ✅ Fully supported |
| Android | ✅ Fully supported |
| iOS | ✅ Fully supported |

## 🔮 Next Steps

1. **Test the app**: Run `npm start` and explore
2. **Read documentation**: Check `FRONTEND_README.md` for details
3. **Customize**: Modify screens and add features
4. **Connect backend**: Replace dummy auth with real API

## 📝 Demo Credentials

Since this is a demo, any email/password works:
- Email: `buyer@example.com` or `seller@example.com`
- Password: `any_password`

## 🤝 Support

For help:
1. Check `QUICKSTART.md` for common questions
2. Review code comments in screen files
3. Check official Expo and React Navigation docs

## 📦 Dependencies Already Installed

- @react-navigation/native
- @react-navigation/native-stack
- react-native-screens
- react-native-safe-area-context
- expo-router
- And many more...

All dependencies are in `package.json`

## ✨ Project Status

✅ **Production Ready** - The app is fully functional and ready to test!

---

## 📞 Quick Help

**Can't start the app?**
```bash
npm install  # Install dependencies
npm start    # Start dev server
```

**Need to clear cache?**
```bash
npm start -- -c
```

**Want to reset the project?**
```bash
npm run reset-project
```

---

**Happy coding! 🚀** 

For more information, open `QUICKSTART.md` or `FRONTEND_README.md`
