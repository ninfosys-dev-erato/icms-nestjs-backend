# Test Setup and Troubleshooting Guide

This guide helps you set up and run tests for the ICMS Backend with proper isolation and deadlock prevention.

## Quick Start

### 1. Setup Test Database

```bash
# Run the test database setup script
./test/setup-test-db.sh
```

### 2. Run Tests

```bash
# Run all tests with proper isolation
./test/run-tests.sh

# Or run tests directly
npm run test:e2e
```

## Test Environment

The test environment uses:
- **Database**: PostgreSQL on port 5433 (separate from development)
- **Isolation**: Each test runs in isolation with proper cleanup
- **Authentication**: JWT tokens generated for each test
- **Deadlock Prevention**: Sequential data creation and proper cleanup

## Test Structure

```
test/
├── integration/           # Integration tests
│   ├── auth/             # Authentication tests
│   ├── hr/               # HR management tests
│   ├── header/           # Header configuration tests
│   └── ...               # Other module tests
├── test-utils.ts         # Shared test utilities
├── jest-e2e.setup.ts     # Jest configuration
├── jest-e2e.json         # Jest settings
├── setup-test-db.sh      # Database setup script
└── run-tests.sh          # Test runner script
```

## Key Features

### 1. Database Isolation
- Each test suite gets a clean database
- Proper cleanup between tests
- Foreign key constraints disabled during cleanup

### 2. Authentication
- Automatic JWT token generation
- Admin user creation for each test
- Proper token validation

### 3. Deadlock Prevention
- Sequential data creation
- Proper transaction handling
- Connection cleanup

### 4. Error Handling
- Graceful failure handling
- Detailed error messages
- Automatic cleanup on failure

## Common Issues and Solutions

### 1. Database Deadlocks

**Symptoms**: Tests fail with "deadlock detected" errors

**Solution**:
```bash
# Clean up existing connections
psql postgresql://test:test@localhost:5433/icms_test -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'icms_test' AND pid <> pg_backend_pid();"

# Restart test database
./test/setup-test-db.sh
```

### 2. Authentication Failures

**Symptoms**: Tests get 401 Unauthorized errors

**Solution**:
- Ensure JWT secrets are properly set in environment
- Check that test users are being created correctly
- Verify token generation is working

### 3. Database Connection Issues

**Symptoms**: "Connection refused" or "ECONNREFUSED"

**Solution**:
```bash
# Check if test database is running
docker ps | grep icms-test-db

# If not running, start it
./test/setup-test-db.sh
```

### 4. Test Timeouts

**Symptoms**: Tests hang or timeout

**Solution**:
- Increase Jest timeout in `jest-e2e.json`
- Check for hanging database connections
- Ensure proper cleanup in test teardown

## Test Utilities

### TestUtils Class

The `TestUtils` class provides helper methods for:

```typescript
// Clean up database
await TestUtils.cleanupDatabase(prisma);

// Create test user with JWT token
const user = await TestUtils.createTestUser(prisma, {
  email: 'admin',
  password: 'password123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
});

// Create authentication token
const token = await TestUtils.createAuthToken(prisma);

// Create data sequentially to prevent deadlocks
const results = await TestUtils.createSequentialData(
  prisma,
  dataArray,
  (data) => prisma.model.create({ data })
);
```

## Best Practices

### 1. Test Structure
```typescript
describe('Module Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Setup application
  });

  afterAll(async () => {
    await TestUtils.cleanupDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await TestUtils.cleanupDatabase(prisma);
    await createTestData();
  });

  // Tests...
});
```

### 2. Data Creation
```typescript
// ✅ Good: Sequential creation
const departments = await TestUtils.createSequentialData(
  prisma,
  departmentData,
  (data) => prisma.department.create({ data })
);

// ❌ Bad: Parallel creation (can cause deadlocks)
const departments = await Promise.all(
  departmentData.map(data => prisma.department.create({ data }))
);
```

### 3. Authentication
```typescript
// ✅ Good: Use TestUtils for authentication
const token = await TestUtils.createAuthToken(prisma);

// ❌ Bad: Manual token creation
const token = jwt.sign(payload, secret);
```

## Environment Variables

Test environment variables are set in `jest-e2e.setup.ts`:

```typescript
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/icms_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
// ... more variables
```

## Running Specific Tests

```bash
# Run specific test file
npm run test:e2e -- test/integration/hr/hr.e2e-spec.ts

# Run tests matching pattern
npm run test:e2e -- --testNamePattern="HR Management"

# Run tests with verbose output
npm run test:e2e -- --verbose

# Run tests in watch mode
npm run test:e2e -- --watch
```

## Debugging

### 1. Enable Debug Logging
```bash
# Set debug environment variable
DEBUG=* npm run test:e2e
```

### 2. Database Inspection
```bash
# Connect to test database
psql postgresql://test:test@localhost:5433/icms_test

# Check tables
\dt

# Check data
SELECT * FROM users LIMIT 5;
```

### 3. Test Isolation
```bash
# Run single test in isolation
npm run test:e2e -- --testNamePattern="should create department" --runInBand
```

## Continuous Integration

For CI/CD, ensure:
1. Test database is properly set up
2. Environment variables are configured
3. Tests run with proper isolation
4. Cleanup happens after tests

Example CI configuration:
```yaml
- name: Setup test database
  run: ./test/setup-test-db.sh

- name: Run tests
  run: npm run test:e2e
  env:
    NODE_ENV: test
    DATABASE_URL: postgresql://test:test@localhost:5433/icms_test
```

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review test logs for specific error messages
3. Ensure test database is running and accessible
4. Verify environment variables are set correctly
5. Try running tests in isolation to identify specific failures 