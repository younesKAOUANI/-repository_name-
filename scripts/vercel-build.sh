#!/bin/bash

# Vercel build script for Pharmapedia
echo "🚀 Starting Vercel build process..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema (creates tables if they don't exist)
echo "📊 Setting up database schema..."
npx prisma db push --force-reset

# Run database seeding
echo "🌱 Seeding database..."
npm run db:seed

# Build Next.js application
echo "🏗️ Building Next.js application..."
npx next build

echo "✅ Vercel build completed successfully!"
