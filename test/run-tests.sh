#!/bin/bash

# Test Runner Script for ICMS Backend
# This script sets up the test environment and runs the integration tests

set -e

echo "🚀 Starting ICMS Backend Integration Tests..."

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null && ! command -v pnpm &> /dev/null && ! command -v yarn &> /dev/null; then
        print_error "No package manager found (npm, pnpm, or yarn)"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found. You may need to set up PostgreSQL manually for tests."
    fi
    
    print_success "Dependencies check completed"
}

# Check database connectivity
check_database() {
    print_status "Checking database connectivity..."
    
    if ! docker ps | grep -q icms-test-db; then
        print_error "Test database container is not running. Run 'setup' first."
        exit 1
    fi
    
    if ! docker exec icms-test-db pg_isready -U test -d icms_test >/dev/null 2>&1; then
        print_error "Database is not ready. Please wait a moment and try again."
        exit 1
    fi
    
    print_success "Database connectivity verified"
}

# Setup test database
setup_test_db() {
    print_status "Setting up test database..."
    
    # Check if PostgreSQL container is already running
    if docker ps | grep -q icms-test-db; then
        print_status "PostgreSQL test container is already running"
    else
        # Check if container exists but is stopped
        if docker ps -a | grep -q icms-test-db; then
            print_status "Starting existing PostgreSQL test container..."
            docker start icms-test-db
        else
            print_status "Creating and starting PostgreSQL container for testing..."
            docker run -d \
                --name icms-test-db \
                -e POSTGRES_DB=icms_test \
                -e POSTGRES_USER=test \
                -e POSTGRES_PASSWORD=test \
                -p 5433:5432 \
                postgres:15
        fi
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        for i in {1..30}; do
            if docker exec icms-test-db pg_isready -U test -d icms_test >/dev/null 2>&1; then
                print_success "Database is ready!"
                break
            fi
            if [ $i -eq 30 ]; then
                print_error "Database failed to start within 30 seconds"
                exit 1
            fi
            sleep 1
        done
    fi
    
    print_success "Test database setup completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if command -v pnpm &> /dev/null; then
        pnpm install
    elif command -v yarn &> /dev/null; then
        yarn install
    else
        npm install
    fi
    
    print_success "Dependencies installed"
}

# Setup environment
setup_environment() {
    print_status "Setting up test environment..."
    
    # Create test environment file if it doesn't exist
    if [ ! -f .env.test ]; then
        cat > .env.test << EOF
# Test Environment Configuration
NODE_ENV=test

# Database
DATABASE_URL="postgresql://test:test@localhost:5433/icms_test"

# JWT Configuration
JWT_SECRET=test-jwt-secret-key-for-testing-only
JWT_REFRESH_SECRET=test-jwt-refresh-secret-key-for-testing-only
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
LOGIN_ATTEMPT_WINDOW=15
SESSION_EXPIRY_DAYS=7
REMEMBER_ME_EXPIRY_DAYS=30

# Email (for testing, use a mock service)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=test
SMTP_PASS=test
SMTP_FROM=noreply@test.com

# Redis (for testing)
REDIS_URL=redis://localhost:6379/1

# AWS S3 (for testing)
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
AWS_S3_BUCKET=test-bucket

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
EOF
        print_success "Created .env.test file"
    fi
    
    print_success "Environment setup completed"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Set environment to test and load test env file
    export NODE_ENV=test
    export DATABASE_URL="postgresql://test:test@localhost:5433/icms_test"
    
    if command -v pnpm &> /dev/null; then
        pnpm db:generate
        pnpm db:push
    elif command -v yarn &> /dev/null; then
        yarn db:generate
        yarn db:push
    else
        npm run db:generate
        npm run db:push
    fi
    
    print_success "Database migrations completed"
}

# Run tests
run_tests() {
    print_status "Running integration tests..."
    
    # Set environment to test and load test env file
    export NODE_ENV=test
    export DATABASE_URL="postgresql://test:test@localhost:5433/icms_test"
    
    if command -v pnpm &> /dev/null; then
        pnpm test:e2e
    elif command -v yarn &> /dev/null; then
        yarn test:e2e
    else
        npm run test:e2e
    fi
    
    print_success "Integration tests completed"
}

# Run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    # Set environment to test and load test env file
    export NODE_ENV=test
    export DATABASE_URL="postgresql://test:test@localhost:5433/icms_test"
    
    if command -v pnpm &> /dev/null; then
        pnpm test
    elif command -v yarn &> /dev/null; then
        yarn test
    else
        npm test
    fi
    
    print_success "Unit tests completed"
}

# Cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Stop and remove test database container
    if docker ps -a | grep -q icms-test-db; then
        docker stop icms-test-db 2>/dev/null || true
        docker rm icms-test-db 2>/dev/null || true
        print_success "Test database container cleaned up"
    fi
    
    print_success "Cleanup completed"
}

# Graceful shutdown handler
shutdown_handler() {
    print_status "Received shutdown signal, cleaning up..."
    cleanup
    exit 0
}

# Main execution
main() {
    case "${1:-all}" in
        "setup")
            check_dependencies
            setup_test_db
            install_dependencies
            setup_environment
            run_migrations
            ;;
        "e2e")
            check_database
            run_tests
            ;;
        "unit")
            run_unit_tests
            ;;
        "all")
            check_dependencies
            setup_test_db
            install_dependencies
            setup_environment
            run_migrations
            run_unit_tests
            run_tests
            ;;
        "cleanup")
            cleanup
            ;;
        "status")
            print_status "Checking test environment status..."
            if docker ps | grep -q icms-test-db; then
                print_success "Test database container is running"
            else
                print_warning "Test database container is not running"
            fi
            
            if [ -f .env.test ]; then
                print_success "Test environment file exists"
            else
                print_warning "Test environment file does not exist"
            fi
            
            if [ -d node_modules ]; then
                print_success "Dependencies are installed"
            else
                print_warning "Dependencies are not installed"
            fi
            ;;
        *)
            echo "Usage: $0 {setup|e2e|unit|all|cleanup|status}"
            echo "  setup   - Setup test environment"
            echo "  e2e     - Run integration tests only"
            echo "  unit    - Run unit tests only"
            echo "  all     - Run all tests (default)"
            echo "  cleanup - Clean up test resources"
            echo "  status  - Check test environment status"
            exit 1
            ;;
    esac
}

# Handle script interruption
trap shutdown_handler SIGINT SIGTERM

# Run main function
main "$@" 