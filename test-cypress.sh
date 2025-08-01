#!/bin/bash

# Build the application first
echo "Building application..."
npm run build

# Start the server in background
echo "Starting server..."
npm start &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to be ready..."
npx wait-on http://localhost:3000 -t 30000

# Run the test
echo "Running Cypress test..."
npm run cypress:headless -- --spec cypress/e2e/settings-navigation.cy.ts

# Capture exit code
EXIT_CODE=$?

# Kill the server
kill $SERVER_PID

# Exit with the test exit code
exit $EXIT_CODE