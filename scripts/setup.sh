#!/bin/bash

# Setup script for ICMS Backend with proper test isolation

set -e

echo "🚀 Setting up ICMS Backend with test environment..."

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
    
    if ! command -v yarn &> /dev/null; then
        print_error "yarn is not installed. Please install it first: npm install -g yarn"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    print_success "Dependencies check completed"
}

# Setup test database
setup_test_db() {
    print_status "Setting up test database..."
    
    # Stop and remove existing test database container
    if docker ps -a | grep -q icms-test-db; then
        print_status "Removing existing test database container..."
        docker stop icms-test-db 2>/dev/null || true
        docker rm icms-test-db 2>/dev/null || true
    fi
    
    # Create and start PostgreSQL container for testing
    print_status "Creating and starting PostgreSQL container for testing..."
    docker run -d \
        --name icms-test-db \
        -e POSTGRES_DB=icms_test \
        -e POSTGRES_USER=test \
        -e POSTGRES_PASSWORD=test \
        -p 5433:5432 \
        postgres:15
    
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
    
    print_success "Test database setup completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    yarn install
    print_success "Dependencies installed"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Created .env file from env.example"
    fi
    
    # Create test environment file
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

# Logging
LOG_LEVEL=error
EOF
    print_success "Created .env.test file"
    
    print_success "Environment setup completed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Generate Prisma client
    pnpm db:generate
    
    # Push schema to test database
    export NODE_ENV=test
    export DATABASE_URL="postgresql://test:test@localhost:5433/icms_test"
    pnpm db:push
    
    print_success "Database setup completed"
}

# Run tests to verify setup
run_verification_tests() {
    print_status "Running verification tests..."
    
    export NODE_ENV=test
    export DATABASE_URL="postgresql://test:test@localhost:5433/icms_test"
    
    # Run a simple test to verify everything works
    pnpm test:e2e -- --testNamePattern="HR Management" --runInBand --detectOpenHandles --forceExit || {
        print_warning "Some tests failed, but setup is complete. You can run tests manually with: pnpm test:e2e"
    }
    
    print_success "Verification completed"
}

# Main execution
main() {
    check_dependencies
    setup_test_db
    install_dependencies
    setup_environment
    setup_database
    run_verification_tests
    
    print_success "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run tests: pnpm test:e2e"
    echo "2. Start development server: pnpm start:dev"
    echo "3. View API documentation: http://localhost:3000/api/v1/docs"
    echo ""
    echo "Test database is running on port 5433"
    echo "Main application should use the database configured in .env"
}

# Handle script interruption
trap 'print_error "Setup interrupted"; exit 1' SIGINT SIGTERM

# Run main function
main "$@" 