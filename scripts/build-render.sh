#!/bin/bash
set -e

echo "=== 1. Installing root dependencies ==="
npm install

echo "=== 2. Building frontend (Vite) ==="
npm run build
echo "Frontend built: $(ls -la dist/index.html)"

echo "=== 3. Installing API dependencies ==="
cd api
npm install --production=false

echo "=== 4. Generating Prisma client ==="
npx prisma generate

echo "=== 5. Compiling API TypeScript ==="
npx tsc
echo "API built: $(ls -la dist/index.js)"

echo "=== Build complete ==="
