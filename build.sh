#!/bin/bash
set -e

echo "Starting SafeChat deployment..."
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

echo "Installing dependencies in server directory..."
cd server
npm install --omit=dev --no-audit --no-fund
echo "Dependencies installed successfully"

echo "Deployment complete!"
