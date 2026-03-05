# DevPath Setup Guide

## Quick Start

To start both frontend and backend together:

```bash
npm start
```

This will:
- ✅ Check and install API dependencies
- ✅ Check PostgreSQL status (and start it if installed) 
- ✅ Start Backend API on http://localhost:3001
- ✅ Start Frontend on http://localhost:8080

To stop all services:

```bash
npm stop
```

---

## First Time Setup

### 1. Install PostgreSQL

```bash
# Install PostgreSQL with Homebrew
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16
```

### 2. Create Database and User

```bash
# Create database
createdb devpath

# Create user with password
psql postgres -c "CREATE USER devpath WITH PASSWORD 'devpath_secret';"

# Grant privileges
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE devpath TO devpath;"
```

### 3. Setup Database Schema and Seed Data

```bash
cd api

# Install API dependencies
npm install

# Generate Prisma client and push schema
npm run db:push

# Seed the database with courses and data
npm run db:seed

cd ..
```

### 4. Install Frontend Dependencies

```bash
npm install
```

### 5. Start the Application

```bash
npm start
```

---

## Available Scripts

### Main Commands
- `npm start` - Start everything (DB check + API + Frontend)
- `npm stop` - Stop all running services
- `npm run dev` - Start only frontend (for development)

### Database Commands (run from `api/` folder)
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:clear` - Clear enrollment data

### API Commands (run from `api/` folder)
- `npm run dev` - Start API in watch mode
- `npm run build` - Build API for production
- `npm start` - Start API in production mode

---

## Troubleshooting

### PostgreSQL Connection Errors

If you see database connection errors:

1. Check if PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Start PostgreSQL if needed:
   ```bash
   brew services start postgresql@16
   ```

3. Verify database exists:
   ```bash
   psql -l | grep devpath
   ```

### API Not Starting

1. Check if dependencies are installed:
   ```bash
   cd api && npm install
   ```

2. Check if port 3001 is already in use:
   ```bash
   lsof -i :3001
   ```

### Frontend Not Starting

1. Check if port 8080 is already in use:
   ```bash
   lsof -i :8080
   ```

2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## Development Workflow

### Working on Frontend Only
```bash
npm run dev
```

### Working on Backend Only
```bash
cd api
npm run dev
```

### Working on Both
```bash
npm start
```

### Adding New Database Fields

1. Edit `api/prisma/schema.prisma`
2. Push changes: `cd api && npm run db:push`
3. Restart API if running

### Resetting Database

```bash
cd api
npm run db:push -- --force-reset
npm run db:seed
```

---

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt
- **Styling**: Tailwind CSS with custom theming

---

## Project Structure

```
devpath-ascend/
├── api/                    # Backend API
│   ├── prisma/            # Database schema & seeds
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   └── middleware/    # Auth, validation, etc.
│   └── package.json
├── src/                   # Frontend
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utilities
├── scripts/              # Build & start scripts
└── package.json
```
