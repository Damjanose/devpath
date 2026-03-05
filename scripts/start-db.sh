#!/bin/bash

# Script to ensure PostgreSQL is running before starting the app

echo "🗄️  Checking PostgreSQL status..."

# Check if PostgreSQL is installed via Homebrew
if command -v psql &> /dev/null; then
    # Check if PostgreSQL is already running
    if pg_isready -q 2>/dev/null; then
        echo "✅ PostgreSQL is already running"
    else
        echo "🚀 Starting PostgreSQL..."
        # Try to start with brew services
        if command -v brew &> /dev/null; then
            brew services start postgresql@16 2>/dev/null || brew services start postgresql 2>/dev/null
            echo "⏳ Waiting for PostgreSQL to be ready..."
            sleep 2
            if pg_isready -q; then
                echo "✅ PostgreSQL started successfully"
            else
                echo "⚠️  PostgreSQL may not be ready yet, but continuing..."
            fi
        else
            echo "⚠️  Homebrew not found. Please start PostgreSQL manually."
        fi
    fi
else
    echo ""
    echo "⚠️  PostgreSQL not found!"
    echo ""
    echo "📦 To install PostgreSQL:"
    echo "   brew install postgresql@16"
    echo "   brew services start postgresql@16"
    echo ""
    echo "Then run these commands to set up the database:"
    echo "   createdb devpath"
    echo "   psql postgres -c \"CREATE USER devpath WITH PASSWORD 'devpath_secret';\""
    echo "   psql postgres -c \"GRANT ALL PRIVILEGES ON DATABASE devpath TO devpath;\""
    echo "   cd api && npm run db:push && npm run db:seed"
    echo ""
    echo "🚀 Starting app anyway (API will show connection errors)..."
    echo ""
fi

# Always exit successfully so the app can start
exit 0
