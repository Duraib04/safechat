#!/bin/bash
# SafeChat Server Startup Script for Railway

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  npm install
fi

# Start the server
npm start
