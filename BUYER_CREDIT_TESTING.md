# Testing the Buyer Credit Management Feature

## Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:3000
```

### 2. Start the Frontend
In a new terminal:
```bash
npm start
# Expo Metro bundler runs on http://localhost:8081
```

### 3. Test as a Buyer

#### Login as Buyer 1:
- **Email:** `buyer1@example.com`
- **Password:** `buyer123`

Once logged in:
1. You'll see the **Products Tab** by default
2. Click the **💳 My Credits Tab** to view your credit information

**What you'll see:**
- **Summary Cards:**
  - Total Outstanding: $205.97 (verified $159.98 + pending $0)
  - Overdue: $0.00 (green - no late payments)
  - Paid: $45.99 (green - one completed payment)

- **Payment History:**
  - Tech Store: $159.98 (Verified - Wireless Headphones) - due in 30 days
  - Fashion Hub: $45.99 (Paid - Summer Dress) - paid on time

#### Login as Buyer 2:
- **Email:** `buyer2@example.com`
- **Password:** `buyer123`

**What you'll see:**
- **Summary Cards:**
  - Total Outstanding: $105.98
  - Overdue: $89.99 (red - late payment!)
  - Paid: $0.00

- **Payment History:**
  - Tech Store: $89.99 (Late/Overdue - Running Shoes) - 10 days overdue!
  - Fashion Hub: $105.98 (Pending - Denim Jeans) - awaiting verification

### 4. Test as a Seller

#### Login as Seller 1 (Tech Store):
- **Email:** `seller1@example.com`
- **Password:** `seller123`

Once logged in:
1. You'll see the **Seller Dashboard** with credit management features
2. View buyer credit scores and outstanding payments
3. Record payments using the payment modal

**What you'll see:**
- Transactions from Buyer 1 and Buyer 2
- Credit scores with risk levels (Green/Yellow/Red)
- Payment recording interface with multiple payment methods:
  - Cash
  - eSewa
  - Khalti
  - FonePay
  - Bank Transfer

## API Endpoints for Testing

### Get Buyer's Credits (requires buyer login)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/credits/buyer-credits
```

### Get Buyer's Credit Summary
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/credits/buyer-summary
```

### Get Seller's Credits (requires seller login)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/credits/seller-credits
```

### Get Seller's Credit Summary
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/credits/seller-summary
```

## File Structure

```
project/
├── backend/
│   ├── config/
│   │   └── database.js          (Updated with credits table)
│   ├── routes/
│   │   └── credits.js           (NEW - Credit API endpoints)
│   ├── seed.js                  (Updated with credit records)
│   └── server.js                (Updated with credits route)
├── frontend/
│   ├── screens/
│   │   └── BuyerHomeScreen.js   (Updated with tabs and credit display)
│   └── utils/
│       └── creditScore.js       (Existing credit scoring utility)
└── BUYER_CREDIT_IMPLEMENTATION.md  (This implementation guide)
```

## Key Features Implemented

✅ **Buyer Credit View**
- Tab-based navigation (Products / My Credits)
- Payment history with seller details
- Credit summary statistics
- Status color coding

✅ **Backend API**
- Full CRUD operations for credits
- Buyer and seller credit views
- Payment recording
- Summary statistics

✅ **Database**
- Credits table with proper schema
- Indexes for performance
- Foreign key relationships
- Sample data for testing

✅ **Data Integrity**
- JWT authentication on all credit endpoints
- Role-based access control
- Status validation
- Error handling

## Troubleshooting

### "No credits found" when viewing My Credits
- Make sure you've logged in as the correct buyer
- Check that the backend server is running
- Verify the database has credit records (check seed output)

### API errors
- Ensure the token is valid (should be in AuthContext after login)
- Check backend console for database errors
- Verify all API routes are registered in server.js

### Database issues
- Delete marketplace.db and reseed: `node seed.js`
- Check that all tables exist: backend created table 'credits' successfully

## Next Steps (Optional Enhancements)

1. **Payment Processing**
   - Implement actual payment gateway integration
   - Add payment verification

2. **Notifications**
   - Notify buyers of due dates
   - Notify sellers of late payments

3. **Reports**
   - Export credit history to CSV/PDF
   - Generate credit score reports

4. **Advanced Features**
   - Credit limit management
   - Dispute resolution
   - Credit scoring adjustments

5. **Mobile Optimization**
   - Better touch interactions
   - Offline support
   - Push notifications
