#!/bin/bash
set -e

echo "=== 1. Installing API dependencies ==="
cd api
npm install --production=false

echo "=== 2. Generating Prisma client ==="
npx prisma generate

echo "=== 3. Compiling API TypeScript ==="
npx tsc
echo "API built: $(ls -la dist/index.js)"

echo "=== API build complete ==="
