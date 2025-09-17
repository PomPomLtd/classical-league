#!/bin/bash

# Classical League Local Development Setup Script
# This script automates the setup of your local development environment

set -e  # Exit on error

echo "🚀 Classical League Local Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_info "Creating .env file from .env.example..."
    cp .env.example .env
    print_success ".env file created"
    print_warning "Please update .env with your Prisma dev server connection string after running 'npx prisma dev'"
else
    print_info ".env file already exists"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_info "Dependencies already installed"
fi

# Check if Prisma dev server is configured
if grep -q "prisma+postgres://localhost" .env; then
    print_success "Prisma dev server is configured in .env"

    # Generate Prisma client
    print_info "Generating Prisma client..."
    npx prisma generate

    # Reset database and apply migrations
    print_info "Resetting database and applying migrations..."
    print_warning "This will delete all existing data in your local database"

    # Force reset the database
    PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="automated-local-setup" npx prisma db push --force-reset --accept-data-loss

    # Mark all migrations as applied
    print_info "Marking migrations as applied..."
    npx prisma migrate resolve --applied "0_init" 2>/dev/null || true
    npx prisma migrate resolve --applied "20250911_add_broadcast_columns" 2>/dev/null || true
    npx prisma migrate resolve --applied "20250912125029_add_forfeit_reason" 2>/dev/null || true
    npx prisma migrate resolve --applied "20250912162944_add_draw_ff_result_type" 2>/dev/null || true

    # Seed the database
    print_info "Seeding database with test data..."
    npm run db:seed

    print_success "Database setup complete!"

else
    print_warning "Prisma dev server not configured in .env"
    print_info "Please follow these steps:"
    echo ""
    echo "  1. Open a new terminal window"
    echo "  2. Run: npx prisma dev"
    echo "  3. Copy the DATABASE_URL from the output"
    echo "  4. Update your .env file with the DATABASE_URL"
    echo "  5. Run this script again: npm run setup:local"
    echo ""
    print_info "Example DATABASE_URL format:"
    echo '  DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."'
    exit 0
fi

echo ""
print_success "Local setup complete! 🎉"
echo ""
echo "Next steps:"
echo "  1. Keep 'npx prisma dev' running in a separate terminal"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Visit http://localhost:3000"
echo ""
echo "Admin credentials:"
echo "  Username: admin"
echo "  Password: SchachKreis4Admin2025!"
echo ""