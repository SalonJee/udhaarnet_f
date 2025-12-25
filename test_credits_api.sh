#!/bin/bash

echo "🧪 Testing Buyer Credits API"
echo "========================================="
echo ""

# Login as buyer
echo "1️⃣  Logging in as buyer1..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "buyer1@example.com", "password": "buyer123"}')

BUYER_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: ${BUYER_TOKEN:0:20}..."
echo ""

# Get buyer credits
echo "2️⃣  Fetching buyer's credits..."
curl -s -X GET http://localhost:3000/api/credits/buyer-credits \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.'
echo ""

# Get buyer summary
echo "3️⃣  Fetching buyer's credit summary..."
curl -s -X GET http://localhost:3000/api/credits/buyer-summary \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.'
echo ""

echo "✅ API test complete!"
