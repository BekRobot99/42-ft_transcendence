#!/bin/bash

# Build script for frontend static deployment
echo "Building frontend for production..."

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Copy static assets to dist
cp index.html dist/
cp styles.css dist/
cp -r assets/ dist/

echo "Frontend build complete!"
echo "Static files are in frontend/dist/"
