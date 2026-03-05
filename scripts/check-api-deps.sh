#!/bin/bash

# Script to ensure API dependencies are installed

if [ ! -d "api/node_modules" ]; then
    echo "📦 Installing API dependencies..."
    cd api && npm install && cd ..
else
    echo "✅ API dependencies already installed"
fi
