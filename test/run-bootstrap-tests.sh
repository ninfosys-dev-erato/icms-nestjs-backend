#!/bin/bash

# Bootstrap Test Runner Script for ICMS Backend
# This script provides comprehensive testing options for the Bootstrap module

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════${NC}\n"
}

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

print_command() {
    echo -e "${CYAN}[EXEC]${NC} $1"
}

# Function to show usage
show_usage() {
    echo -e "${GREEN}Bootstrap Test Runner - ICMS Backend${NC}"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  all                 Run all bootstrap tests"
    echo "  env                 Test environment variable scenarios"
    echo "  default             Test default credential scenarios"
    echo "  duplicates          Test duplicate prevention scenarios"
    echo "  errors              Test error handling scenarios"
    echo "  security            Test security and password scenarios"
    echo "  integration         Test integration scenarios"
    echo "  config              Test configuration scenarios"
    echo "  logging             Test logging scenarios"
    echo "  multienv            Test multi-environment scenarios"
    echo "  coverage            Run all tests with coverage report"
    echo "  watch               Run tests in watch mode"
    echo "  debug               Run tests in debug mode"
    echo "  setup               Setup test environment"
    echo "  cleanup             Cleanup test environment"
    echo "  help                Show this help message"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --verbose           Show detailed output"
    echo "  --silent            Minimal output"
    echo "  --no-cache          Clear Jest cache before running"
    echo "  --bail              Stop on first test failure"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 all              # Run all bootstrap tests"
    echo "  $0 coverage         # Run with coverage report"
    echo "  $0 env --verbose    # Run env tests with detailed output"
    echo "  $0 security --bail  # Run security tests, stop on first failure"
    echo ""
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null && ! command -v pnpm &> /dev/null; then
        print_error "No package manager found (npm or pnpm)"
        exit 1
    fi
    
    # Detect package manager
    if command -v pnpm &> /dev/null; then
        PKG_MANAGER="pnpm"
    else
        PKG_MANAGER="npm"
    fi
    
    print_success "Dependencies check passed (using $PKG_MANAGER)"
}

# Function to setup test environment
setup_test_env() {
    print_header "Setting up Bootstrap Test Environment"
    
    # Check if .env.test exists, if not create a basic one
    if [ ! -f ".env.test" ]; then
        print_status "Creating .env.test file..."
        cat > .env.test << EOF
# Bootstrap Test Environment Configuration
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5433/icms_test
JWT_SECRET=test-jwt-secret-key-for-bootstrap-testing
JWT_REFRESH_SECRET=test-jwt-refresh-secret-key-for-bootstrap-testing
BCRYPT_ROUNDS=10
LOG_LEVEL=error

# Test-specific bootstrap configuration
# These will be overridden by individual tests
# USEREMAIL=test.admin@example.com
# USERPASSWORD=TestAdmin@123
EOF
        print_success "Created .env.test file"
    else
        print_status ".env.test already exists"
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        $PKG_MANAGER install
        print_success "Dependencies installed"
    fi
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    $PKG_MANAGER run db:generate
    print_success "Prisma client generated"
    
    print_success "Test environment setup complete"
}

# Function to cleanup test environment
cleanup_test_env() {
    print_header "Cleaning up Bootstrap Test Environment"
    
    # Remove test .env files if they exist
    if [ -f ".env.test" ]; then
        print_status "Removing .env.test file..."
        rm .env.test
        print_success "Removed .env.test file"
    fi
    
    # Clear Jest cache
    print_status "Clearing Jest cache..."
    npx jest --clearCache
    print_success "Jest cache cleared"
    
    print_success "Cleanup complete"
}

# Function to build Jest command with options
build_jest_command() {
    local test_pattern="$1"
    local cmd="npx jest --config ./test/jest-e2e.json"
    
    # Add test pattern
    if [ -n "$test_pattern" ]; then
        cmd="$cmd --testPathPatterns=test/integration/bootstrap.*$test_pattern"
    else
        cmd="$cmd --testPathPatterns=test/integration/bootstrap"
    fi
    
    # Add options based on flags
    if [ "$VERBOSE" = true ]; then
        cmd="$cmd --verbose"
    fi
    
    if [ "$SILENT" = true ]; then
        cmd="$cmd --silent"
    fi
    
    if [ "$NO_CACHE" = true ]; then
        cmd="$cmd --no-cache"
    fi
    
    if [ "$BAIL" = true ]; then
        cmd="$cmd --bail"
    fi
    
    if [ "$WATCH" = true ]; then
        cmd="$cmd --watch"
    fi
    
    if [ "$DEBUG" = true ]; then
        cmd="node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/$cmd --runInBand"
    fi
    
    if [ "$COVERAGE" = true ]; then
        cmd="$cmd --coverage --coverageDirectory=coverage/bootstrap"
        cmd="$cmd --collectCoverageFrom=src/modules/bootstrap/**/*.ts"
        cmd="$cmd --collectCoverageFrom=src/config/configuration.ts"
    fi
    
    echo "$cmd"
}

# Function to run specific test category
run_test_category() {
    local category="$1"
    local description="$2"
    local pattern="$3"
    
    print_header "Running Bootstrap Tests: $description"
    
    local cmd=$(build_jest_command "$pattern")
    print_command "$cmd"
    
    if eval "$cmd"; then
        print_success "$description tests passed"
        return 0
    else
        print_error "$description tests failed"
        return 1
    fi
}

# Function to run all tests
run_all_tests() {
    print_header "Running All Bootstrap Tests"
    
    local cmd=$(build_jest_command "")
    print_command "$cmd"
    
    if eval "$cmd"; then
        print_success "All bootstrap tests passed"
        return 0
    else
        print_error "Some bootstrap tests failed"
        return 1
    fi
}

# Function to show test summary
show_test_summary() {
    print_header "Bootstrap Test Categories Available"
    
    echo -e "${CYAN}Environment Variable Tests:${NC}"
    echo "  - Custom credentials with USEREMAIL and USERPASSWORD"
    echo "  - Partial credentials handling"
    echo "  - Fallback to default credentials"
    echo ""
    
    echo -e "${CYAN}Default Credential Tests:${NC}"
    echo "  - Default user creation"
    echo "  - .env file creation and management"
    echo "  - Preservation of existing configurations"
    echo ""
    
    echo -e "${CYAN}Duplicate Prevention Tests:${NC}"
    echo "  - Skip creation when user exists"
    echo "  - Data integrity preservation"
    echo ""
    
    echo -e "${CYAN}Error Handling Tests:${NC}"
    echo "  - Database connection failures"
    echo "  - User creation errors"
    echo "  - File system permission errors"
    echo "  - Invalid data handling"
    echo ""
    
    echo -e "${CYAN}Security Tests:${NC}"
    echo "  - Password hashing with bcrypt"
    echo "  - Salt uniqueness"
    echo "  - Security best practices"
    echo ""
    
    echo -e "${CYAN}Integration Tests:${NC}"
    echo "  - NestJS lifecycle integration"
    echo "  - Application startup simulation"
    echo ""
    
    echo -e "${CYAN}Configuration Tests:${NC}"
    echo "  - Configuration service integration"
    echo "  - Environment variable reading"
    echo ""
    
    echo -e "${CYAN}Additional Tests:${NC}"
    echo "  - Logging and monitoring"
    echo "  - Multi-environment support"
    echo "  - Audit trail verification"
    echo ""
}

# Parse command line arguments
COMMAND=""
VERBOSE=false
SILENT=false
NO_CACHE=false
BAIL=false
WATCH=false
DEBUG=false
COVERAGE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --silent)
            SILENT=true
            shift
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        --bail)
            BAIL=true
            shift
            ;;
        help|--help|-h)
            show_usage
            exit 0
            ;;
        *)
            if [ -z "$COMMAND" ]; then
                COMMAND="$1"
            else
                print_error "Unknown option: $1"
                show_usage
                exit 1
            fi
            shift
            ;;
    esac
done

# Set default command if none provided
if [ -z "$COMMAND" ]; then
    COMMAND="help"
fi

# Check dependencies before running any tests
if [ "$COMMAND" != "help" ] && [ "$COMMAND" != "cleanup" ]; then
    check_dependencies
fi

# Execute command
case $COMMAND in
    all)
        setup_test_env
        run_all_tests
        exit_code=$?
        ;;
    
    env)
        setup_test_env
        run_test_category "env" "Environment Variable Scenarios" "Admin User Creation with Environment Variables"
        exit_code=$?
        ;;
    
    default)
        setup_test_env
        run_test_category "default" "Default Credential Scenarios" "Admin User Creation with Default Credentials"
        exit_code=$?
        ;;
    
    duplicates)
        setup_test_env
        run_test_category "duplicates" "Duplicate Prevention Scenarios" "Admin User Already Exists Scenarios"
        exit_code=$?
        ;;
    
    errors)
        setup_test_env
        run_test_category "errors" "Error Handling Scenarios" "Error Handling and Edge Cases"
        exit_code=$?
        ;;
    
    security)
        setup_test_env
        run_test_category "security" "Security and Password Scenarios" "Password Hashing and Security"
        exit_code=$?
        ;;
    
    integration)
        setup_test_env
        run_test_category "integration" "Integration Scenarios" "Integration with Application Startup"
        exit_code=$?
        ;;
    
    config)
        setup_test_env
        run_test_category "config" "Configuration Scenarios" "Configuration Integration"
        exit_code=$?
        ;;
    
    logging)
        setup_test_env
        run_test_category "logging" "Logging Scenarios" "Logging and Monitoring"
        exit_code=$?
        ;;
    
    multienv)
        setup_test_env
        run_test_category "multienv" "Multi-Environment Scenarios" "Multi-Environment Support"
        exit_code=$?
        ;;
    
    coverage)
        COVERAGE=true
        setup_test_env
        print_header "Running Bootstrap Tests with Coverage Report"
        run_all_tests
        exit_code=$?
        if [ $exit_code -eq 0 ]; then
            print_success "Coverage report generated in coverage/bootstrap/"
            if command -v open &> /dev/null; then
                print_status "Opening coverage report..."
                open coverage/bootstrap/lcov-report/index.html
            elif command -v xdg-open &> /dev/null; then
                print_status "Opening coverage report..."
                xdg-open coverage/bootstrap/lcov-report/index.html
            else
                print_status "Open coverage/bootstrap/lcov-report/index.html to view the report"
            fi
        fi
        ;;
    
    watch)
        WATCH=true
        setup_test_env
        print_header "Running Bootstrap Tests in Watch Mode"
        print_status "Tests will re-run when files change. Press 'q' to quit."
        run_all_tests
        exit_code=$?
        ;;
    
    debug)
        DEBUG=true
        setup_test_env
        print_header "Running Bootstrap Tests in Debug Mode"
        print_status "Debugger will be available on port 9229"
        print_status "Open chrome://inspect in Chrome to connect"
        run_all_tests
        exit_code=$?
        ;;
    
    setup)
        setup_test_env
        exit_code=0
        ;;
    
    cleanup)
        cleanup_test_env
        exit_code=0
        ;;
    
    summary)
        show_test_summary
        exit_code=0
        ;;
    
    help)
        show_usage
        exit_code=0
        ;;
    
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        exit_code=1
        ;;
esac

if [ $exit_code -eq 0 ] && [ "$COMMAND" != "help" ] && [ "$COMMAND" != "setup" ] && [ "$COMMAND" != "cleanup" ]; then
    print_header "Bootstrap Test Execution Complete"
    print_success "All requested tests completed successfully!"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "  - Review test output above"
    echo "  - Check coverage report (if generated)"
    echo "  - Run './test/run-bootstrap-tests.sh help' for more options"
    echo ""
elif [ $exit_code -ne 0 ] && [ "$COMMAND" != "help" ]; then
    print_header "Bootstrap Test Execution Failed"
    print_error "Some tests failed. Please review the output above."
    echo ""
    echo -e "${CYAN}Troubleshooting:${NC}"
    echo "  - Check database connection"
    echo "  - Verify environment configuration"
    echo "  - Run './test/run-bootstrap-tests.sh setup' to reset environment"
    echo "  - Use '--verbose' flag for detailed output"
    echo ""
fi

exit $exit_code 