#!/bin/bash

echo "=== Testing Phone Search Feature ==="
echo ""

# Login as seller
echo "1. Logging in as seller (9851234567)..."
LOGIN_RESPONSE=$(curl -s -X POST http://192.168.10.102:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9851234567","password":"seller123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo ""

# Search for buyer by phone
echo "2. Searching for buyer with phone 9841234567..."
BUYER_RESPONSE=$(curl -s "http://192.168.10.102:3000/api/credits/buyer-by-phone/9841234567" \
  -H "Authorization: Bearer $TOKEN")

echo "$BUYER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$BUYER_RESPONSE"
echo ""

# Get buyer history
BUYER_ID=$(echo "$BUYER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))" 2>/dev/null)

if [ ! -z "$BUYER_ID" ]; then
  echo "3. Fetching credit history for buyer ID $BUYER_ID..."
  HISTORY_RESPONSE=$(curl -s "http://192.168.10.102:3000/api/credits/buyer-history/$BUYER_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$HISTORY_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HISTORY_RESPONSE"
  echo ""
  echo "✅ Phone search feature endpoints working!"
else
  echo "❌ Could not find buyer ID"
fi
