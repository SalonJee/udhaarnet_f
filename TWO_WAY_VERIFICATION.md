# Two-Way Credit Verification System

## Overview
Implemented a two-way verification system where buyers must approve credit requests from sellers before they become active. This prevents fraudulent credits and ensures mutual consent.

## Backend Changes

### Database Schema Updates (`backend/config/database.js`)
- **New field**: `buyerApproved BOOLEAN DEFAULT 0` in credits table
- **Updated statuses**: 
  - `'pending'` - Seller created, waiting for buyer approval
  - `'approved'` - Buyer approved (synonym for active)
  - `'rejected'` - Buyer rejected the request
  - `'active'` - Credit is active and buyer owes money
  - `'paid'` - Credit has been paid
  - `'overdue'` - Credit is past due date
  - `'late'` - Credit payment is late

### New API Endpoints (`backend/routes/credits.js`)

#### 1. Get Pending Requests (Buyer)
- **Endpoint**: `GET /api/credits/pending-requests`
- **Auth**: Required (JWT token)
- **Description**: Returns all pending credit requests for the logged-in buyer
- **Response**:
```json
[
  {
    "id": "uuid",
    "buyerId": "uuid",
    "sellerId": "uuid",
    "amount": 105.98,
    "description": "Product description",
    "status": "pending",
    "buyerApproved": 0,
    "dueDate": "2026-01-01",
    "sellerName": "Shop Owner Name",
    "shopName": "Shop Name",
    "buyerName": "Buyer Name",
    "createdAt": "2025-12-25 10:00:00"
  }
]
```

#### 2. Approve Credit Request
- **Endpoint**: `POST /api/credits/:creditId/approve`
- **Auth**: Required (JWT token)
- **Description**: Buyer approves a pending credit request
- **Response**:
```json
{
  "message": "Credit request approved",
  "creditId": "uuid",
  "status": "active"
}
```

#### 3. Reject Credit Request
- **Endpoint**: `POST /api/credits/:creditId/reject`
- **Auth**: Required (JWT token)
- **Body**: `{ "reason": "Reason for rejection" }` (optional)
- **Description**: Buyer rejects a pending credit request
- **Response**:
```json
{
  "message": "Credit request rejected",
  "creditId": "uuid",
  "status": "rejected"
}
```

### Updated Endpoints
- Changed all references from `'verified'` to `'active'` status
- Updated buyer/seller summaries to use `activeAmount` instead of `verifiedAmount`

## Frontend Changes

### BuyerHomeScreen (`frontend/screens/BuyerHomeScreen.js`)

#### New Features

1. **Notification Bell Icon**
   - Located in header next to logout button
   - Shows red badge with count of pending requests
   - Toggles notification panel on click

2. **Notification Panel**
   - Dropdown panel showing all pending credit requests
   - For each request shows:
     - Shop name
     - Seller name
     - Product description
     - Amount (Rs.)
     - Due date
     - Creation date
   - Two action buttons:
     - ✓ **Approve** - Green button to accept credit
     - ✕ **Reject** - Red button to deny credit

3. **Auto-refresh**
   - Polls for new pending requests every 30 seconds
   - Keeps notification count updated in real-time

4. **New State Variables**
```javascript
const [pendingRequests, setPendingRequests] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);
```

5. **New Functions**
- `fetchPendingRequests()` - Fetches pending credit requests
- `handleApproveCredit(creditId)` - Approves a credit request
- `handleRejectCredit(creditId)` - Rejects a credit request with confirmation dialog

#### New Styles
- `headerButtons` - Container for notification bell and logout
- `notificationButton` - Bell icon button
- `notificationIcon` - 🔔 emoji
- `notificationBadge` - Red circular badge with count
- `notificationsPanel` - Dropdown panel container
- `notificationItem` - Individual notification card
- `approveButton` - Green approve button
- `rejectButton` - Red reject button
- And 15+ more notification-related styles

## Updated Seed Data (`backend/seed.js`)

### Sample Credits
- 3 credits with `buyerApproved: 1` (active/paid/late)
- 1 credit with `buyerApproved: 0` status: 'pending' (for testing notifications)

### Test Scenario
- Login as Buyer 2: **9841234568** / **buyer123**
- You should see 1 pending credit request notification
- Can approve or reject from notification panel

## User Workflow

### Seller Creates Credit
1. Seller searches for buyer by phone
2. Reviews buyer details and credit score
3. Clicks "Give Credit"
4. Fills amount and product description
5. Submits - **Credit created with status='pending'**

### Buyer Receives Notification
1. Buyer logs in to app
2. Sees red badge (🔔 1) on notification bell
3. Taps notification bell
4. Views credit request details:
   - Which seller is requesting
   - What product/service
   - How much amount
   - When it's due
5. Makes decision:
   - **Approve**: Credit becomes active, buyer owes money
   - **Reject**: Credit is marked rejected, seller is notified

### After Approval
- Credit status changes from 'pending' to 'active'
- Appears in buyer's credit list
- Appears in seller's outstanding credits
- Due date countdown begins

### After Rejection
- Credit status changes to 'rejected'
- Buyer's rejection reason is stored in notes
- Seller can see rejected status (future feature)

## Security Features
1. **Authorization**: Only the buyer can approve/reject their own credits
2. **Status Validation**: Can only approve/reject credits in 'pending' status
3. **Confirmation Dialog**: Rejection requires confirmation to prevent accidents

## Benefits
✅ **Fraud Prevention**: Sellers cannot create credits without buyer consent
✅ **Transparency**: Both parties must agree before credit is active
✅ **Audit Trail**: All approvals/rejections are logged with timestamps
✅ **User Control**: Buyers have final say on credit acceptance
✅ **Real-time Updates**: Notification system keeps buyers informed

## Testing Instructions

### Setup
```bash
# Reset database with new schema
cd backend
rm marketplace.db
node seed.js
node server.js
```

### Test Case 1: Pending Notification
1. Login as Buyer 2: **9841234568** / **buyer123**
2. Check notification bell - should show "1"
3. Click bell to see pending credit: "Denim Jeans + T-shirt"
4. Review details (Rs. 105.98 from Fashion Hub)

### Test Case 2: Approve Credit
1. Click "✓ Approve" button
2. Should see success alert
3. Notification disappears
4. Credit appears in "My Credits" tab with ACTIVE status

### Test Case 3: Reject Credit
1. Click "✕ Reject" button
2. Confirmation dialog appears
3. Confirm rejection
4. Success alert shows
5. Notification disappears

### Test Case 4: Real-time Polling
1. Keep buyer app open
2. In another device/browser, login as seller
3. Create new credit for this buyer
4. Within 30 seconds, buyer should see notification badge update

## Files Modified
- `backend/config/database.js` - Schema changes
- `backend/routes/credits.js` - New endpoints, status updates
- `backend/seed.js` - Sample data with buyerApproved field
- `frontend/screens/BuyerHomeScreen.js` - Notification UI and handlers

## Next Steps (Future Enhancements)
- [ ] Push notifications for instant alerts
- [ ] Seller notification when buyer rejects
- [ ] Rejection reason dropdown with common options
- [ ] Credit request expiration after X days
- [ ] Email/SMS notifications
- [ ] Credit request history view for sellers
