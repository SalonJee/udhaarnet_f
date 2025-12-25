#!/bin/bash

# Quick Start Script for Marketplace App

echo "🚀 Starting Marketplace App Setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"
echo ""

# Seed the database
echo "🌱 Seeding database with test data..."
npm run seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo "✅ Database seeded successfully"
echo ""

# Start backend in background
echo "🔧 Starting backend server..."
npm start &
BACKEND_PID=$!

echo "✅ Backend server started (PID: $BACKEND_PID)"
echo ""

# Go back to root
cd ..

echo "📱 To start the frontend, run:"
echo "   npm start"
echo ""
echo "📝 Test Credentials:"
echo ""
echo "   Buyers:"
echo "     Email: buyer1@example.com"
echo "     Password: buyer123"
echo ""
echo "   Sellers:"
echo "     Email: seller1@example.com"
echo "     Password: seller123"
echo ""
echo "🌐 Backend API: http://localhost:3000"
echo "📚 API Documentation: BACKEND_SETUP.md"
