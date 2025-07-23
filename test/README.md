# ICMS Backend Test Suite

This directory contains comprehensive integration and unit tests for the ICMS Backend authentication system.

## 📁 Test Structure

```
test/
├── integration/
│   └── auth/
│       ├── auth.e2e-spec.ts          # End-to-end integration tests
│       └── auth.service.spec.ts      # Unit tests for auth service
├── jest-e2e.json                     # Jest E2E configuration
├── jest-e2e.setup.ts                 # Jest E2E setup
├── test-utils.ts                     # Test utility functions
├── run-tests.sh                      # Test runner script
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (or Docker for containerized setup)
- pnpm, yarn, or npm

### Running Tests

#### Option 1: Using the Test Runner Script (Recommended)

```bash
# Run all tests (setup + unit + integration)
./test/run-tests.sh

# Setup test environment only
./test/run-tests.sh setup

# Run only integration tests
./test/run-tests.sh e2e

# Run only unit tests
./test/run-tests.sh unit

# Clean up test resources
./test/run-tests.sh cleanup
```

#### Option 2: Manual Setup

1. **Setup Test Environment**
   ```bash
   # Create test environment file
   cp .env.example .env.test
   
   # Update .env.test with test configuration
   DATABASE_URL="postgresql://test:test@localhost:5433/icms_test"
   JWT_SECRET="test-jwt-secret-key-for-testing-only"
   ```

2. **Setup Test Database**
   ```bash
   # Using Docker (recommended)
   docker run -d \
     --name icms-test-db \
     -e POSTGRES_DB=icms_test \
     -e POSTGRES_USER=test \
     -e POSTGRES_PASSWORD=test \
     -p 5433:5432 \
     postgres:15
   ```

3. **Run Database Migrations**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

4. **Run Tests**
   ```bash
   # Unit tests
   pnpm test
   
   # Integration tests
   pnpm test:e2e
   
   # All tests with coverage
   pnpm test:cov
   ```

## 🧪 Test Coverage

### Integration Tests (`auth.e2e-spec.ts`)

Tests the complete authentication flow through HTTP endpoints:

#### Registration Tests
- ✅ Successful user registration
- ✅ Password confirmation validation
- ✅ Email uniqueness validation
- ✅ Email format validation
- ✅ Password strength validation

#### Login Tests
- ✅ Successful login with valid credentials
- ✅ Failed login with invalid email
- ✅ Failed login with invalid password
- ✅ Remember me functionality
- ✅ Rate limiting for failed attempts
- ✅ Account lockout after multiple failures

#### Authentication Tests
- ✅ JWT token validation
- ✅ Token refresh functionality
- ✅ Logout functionality
- ✅ Session management

#### Password Management Tests
- ✅ Password change with current password
- ✅ Password reset request
- ✅ Password reset with token
- ✅ Current password validation

#### Session Management Tests
- ✅ Get user sessions
- ✅ Revoke specific session
- ✅ Revoke all sessions
- ✅ Session security validation

#### Security Tests
- ✅ Rate limiting
- ✅ Input validation
- ✅ Authentication guards
- ✅ Authorization checks

### Unit Tests (`auth.service.spec.ts`)

Tests individual service methods in isolation:

#### AuthService Methods
- ✅ `register()` - User registration
- ✅ `login()` - User authentication
- ✅ `logout()` - User logout
- ✅ `refreshToken()` - Token refresh
- ✅ `changePassword()` - Password change
- ✅ `validateLoginAttempt()` - Login attempt validation
- ✅ `getUserSessions()` - Session retrieval
- ✅ `revokeSession()` - Session revocation
- ✅ `revokeAllSessions()` - Bulk session revocation

#### Security Features
- ✅ Password hashing with bcrypt
- ✅ Password validation
- ✅ JWT token generation
- ✅ Session creation and management
- ✅ Audit logging
- ✅ Login attempt tracking

## 🔧 Test Configuration

### Environment Variables

The tests use a separate `.env.test` file with the following configuration:

```env
NODE_ENV=test
DATABASE_URL="postgresql://test:test@localhost:5433/icms_test"
JWT_SECRET=test-jwt-secret-key-for-testing-only
JWT_REFRESH_SECRET=test-jwt-refresh-secret-key-for-testing-only
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
LOGIN_ATTEMPT_WINDOW=15
SESSION_EXPIRY_DAYS=7
REMEMBER_ME_EXPIRY_DAYS=30
```

### Database Setup

Tests use a separate test database to avoid affecting development data:

- **Database**: `icms_test`
- **User**: `test`
- **Password**: `test`
- **Port**: `5433` (to avoid conflicts with development database)

### Test Data Management

- Each test runs in isolation
- Database is cleaned before and after each test
- Test users are created with unique emails
- Sessions and audit logs are properly cleaned up

## 🛠️ Test Utilities

### TestUtils Class

Provides helper functions for common test operations:

```typescript
// Create a test user
const user = await TestUtils.createTestUser(app, {
  email: 'test@example.com',
  password: 'Password123!',
  firstName: 'John',
  lastName: 'Doe',
  role: 'VIEWER'
});

// Login a user
const tokens = await TestUtils.loginUser(app, 'test@example.com', 'Password123!');

// Clean up database
await TestUtils.cleanupDatabase(prisma);
```

### Test Constants

Predefined test data for consistency:

```typescript
import { testConstants } from './test-utils';

const validPassword = testConstants.validPassword;
const validEmail = testConstants.validEmail;
```

## 📊 Test Results

### Expected Test Output

When running tests successfully, you should see output similar to:

```
🚀 Starting ICMS Backend Integration Tests...
[INFO] Checking dependencies...
[SUCCESS] Dependencies check completed
[INFO] Setting up test database...
[SUCCESS] Test database setup completed
[INFO] Installing dependencies...
[SUCCESS] Dependencies installed
[INFO] Setting up test environment...
[SUCCESS] Environment setup completed
[INFO] Running database migrations...
[SUCCESS] Database migrations completed
[INFO] Running unit tests...
 PASS  test/integration/auth/auth.service.spec.ts
[SUCCESS] Unit tests completed
[INFO] Running integration tests...
 PASS  test/integration/auth/auth.e2e-spec.ts
[SUCCESS] Integration tests completed
```

### Test Coverage

The test suite aims for comprehensive coverage:

- **Line Coverage**: >90%
- **Branch Coverage**: >85%
- **Function Coverage**: >95%

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL is running
   docker ps | grep postgres
   
   # Restart test database
   ./test/run-tests.sh cleanup
   ./test/run-tests.sh setup
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using port 5433
   lsof -i :5433
   
   # Kill the process or change port in .env.test
   ```

3. **JWT Secret Issues**
   ```bash
   # Ensure JWT secrets are set in .env.test
   cat .env.test | grep JWT_SECRET
   ```

4. **Test Timeouts**
   ```bash
   # Increase timeout in jest configuration
   # Add to jest-e2e.json:
   "testTimeout": 30000
   ```

### Debug Mode

Run tests in debug mode for more detailed output:

```bash
# Debug unit tests
pnpm test:debug

# Debug integration tests
NODE_ENV=test DEBUG=* pnpm test:e2e
```

## 🔄 Continuous Integration

The test suite is designed to work with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: icms_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5433:5432
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run db:generate
      - run: npm run db:push
      - run: npm test
      - run: npm run test:e2e
```

## 📝 Adding New Tests

### Adding Integration Tests

1. Create a new test file in `test/integration/`
2. Follow the existing pattern in `auth.e2e-spec.ts`
3. Use `TestUtils` for common operations
4. Ensure proper cleanup in `beforeEach` and `afterEach`

### Adding Unit Tests

1. Create a new test file in `test/unit/`
2. Test individual service methods
3. Mock external dependencies
4. Focus on business logic testing

### Test Naming Convention

- **Integration tests**: `*.e2e-spec.ts`
- **Unit tests**: `*.spec.ts`
- **Test files**: Use descriptive names (e.g., `auth.e2e-spec.ts`)

## 🤝 Contributing

When adding new features to the auth system:

1. **Write tests first** (TDD approach)
2. **Ensure all tests pass** before submitting PR
3. **Add test coverage** for new functionality
4. **Update this README** if adding new test categories

## 📚 Additional Resources

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Supertest HTTP Testing](https://github.com/visionmedia/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing) 