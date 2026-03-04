#!/bin/bash

# Script to stop all running services

echo "🛑 Stopping services..."

# Kill any running node processes for this project
pkill -f "tsx watch src/index.ts" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo "✅ Services stopped"
echo ""
echo "💡 To stop PostgreSQL:"
echo "   brew services stop postgresql@16"
