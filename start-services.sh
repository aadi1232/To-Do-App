#!/bin/bash

# Start Typesense via Docker Compose
echo "Starting Typesense service..."
docker-compose up -d typesense

# Wait a moment for Typesense to initialize
echo "Waiting for Typesense to initialize..."
sleep 5

# Test connection to Typesense
echo "Testing Typesense connection..."
node test-typesense.js

echo "Starting the application..."
npm run dev 