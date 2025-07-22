#!/bin/bash

# ICMS Backend Setup Script
# This script automates the initial setup of the ICMS backend project

set -e

echo "🚀 ICMS Backend Setup Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm/yarn/pnpm is available
check_package_manager() {
    print_status "Checking package manager..."
    
    if command -v yarn &> /dev/null; then
        PACKAGE_MANAGER="yarn"
        print_success "Using Yarn as package manager"
    elif command -v pnpm &> /dev/null; then
        PACKAGE_MANAGER="pnpm"
        print_success "Using pnpm as package manager"
    elif command -v npm &> /dev/null; then
        PACKAGE_MANAGER="npm"
        print_success "Using npm as package manager"
    else
        print_error "No package manager found. Please install npm, yarn, or pnpm."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    $PACKAGE_MANAGER install
    print_success "Dependencies installed successfully"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Environment file created from template"
            print_warning "Please edit .env file with your configuration"
        else
            print_error "env.example file not found"
            exit 1
        fi
    else
        print_warning "Environment file already exists"
    fi
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    $PACKAGE_MANAGER run db:generate
    print_success "Prisma client generated"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Check if database is accessible
    if ! $PACKAGE_MANAGER run db:migrate:status &> /dev/null; then
        print_warning "Database not accessible. Please ensure PostgreSQL is running and configured."
        print_warning "You can run migrations later with: $PACKAGE_MANAGER run db:migrate"
        return 1
    fi
    
    $PACKAGE_MANAGER run db:migrate
    print_success "Database migrations completed"
}

# Seed database
seed_database() {
    print_status "Seeding database with initial data..."
    
    if $PACKAGE_MANAGER run db:seed &> /dev/null; then
        print_success "Database seeded successfully"
        print_success "Default admin user: admin@icms.gov.np / admin@123"
    else
        print_warning "Database seeding failed. You can run it later with: $PACKAGE_MANAGER run db:seed"
    fi
}

# Setup Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    if [ -d .git ]; then
        $PACKAGE_MANAGER run prepare
        print_success "Git hooks configured"
    else
        print_warning "Not a Git repository. Git hooks not configured."
    fi
}

# Run linting
run_linting() {
    print_status "Running code linting..."
    
    if $PACKAGE_MANAGER run lint &> /dev/null; then
        print_success "Code linting passed"
    else
        print_warning "Code linting found issues. Run '$PACKAGE_MANAGER run lint' to see details."
    fi
}

# Type checking
run_typecheck() {
    print_status "Running TypeScript type checking..."
    
    if $PACKAGE_MANAGER run typecheck &> /dev/null; then
        print_success "TypeScript type checking passed"
    else
        print_warning "TypeScript type checking found issues. Run '$PACKAGE_MANAGER run typecheck' to see details."
    fi
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "=============================="
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Ensure PostgreSQL, Redis, and MinIO are running"
    echo "3. Run database migrations: $PACKAGE_MANAGER run db:migrate"
    echo "4. Seed database: $PACKAGE_MANAGER run db:seed"
    echo "5. Start development server: $PACKAGE_MANAGER run start:dev"
    echo ""
    echo "Useful commands:"
    echo "- Start development: $PACKAGE_MANAGER run start:dev"
    echo "- Run tests: $PACKAGE_MANAGER run test"
    echo "- Open Prisma Studio: $PACKAGE_MANAGER run db:studio"
    echo "- API Documentation: http://localhost:3000/api/docs"
    echo ""
    echo "For more information, see the README.md file"
}

# Main setup function
main() {
    check_node
    check_package_manager
    install_dependencies
    setup_environment
    generate_prisma
    setup_git_hooks
    run_linting
    run_typecheck
    
    # Database operations (may fail if DB not configured)
    run_migrations || true
    seed_database || true
    
    show_next_steps
}

# Run main function
main "$@" 