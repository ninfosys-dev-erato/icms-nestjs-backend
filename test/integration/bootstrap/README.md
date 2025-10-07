# Bootstrap Module Tests

This directory contains comprehensive tests for the Bootstrap module, specifically focusing on the admin user creation functionality during application startup.

## Overview

The Bootstrap service is responsible for automatically creating an initial admin user when the application starts up. This ensures that there's always at least one admin user available to manage the system, even on fresh installations.

## Test File

### `bootstrap.e2e-spec.ts`
Comprehensive end-to-end tests for the Bootstrap service admin user creation functionality.

## Test Coverage

### 1. Admin User Creation with Environment Variables
Tests the primary scenario where admin credentials are provided via environment variables.

**Test Cases:**
- ✅ **Create admin user with provided USEREMAIL and USERPASSWORD**
  - Verifies user creation with custom credentials
  - Validates password hashing with bcrypt
  - Confirms audit log creation with correct metadata
  - Ensures `isDefaultCredentials: false` in audit log

- ✅ **Handle partial environment variables (only USEREMAIL)**
  - Verifies fallback to default credentials when only email is provided
  - Ensures no user is created with incomplete credentials

- ✅ **Handle partial environment variables (only USERPASSWORD)**
  - Verifies fallback to default credentials when only password is provided
  - Ensures consistent behavior with partial configuration

### 2. Admin User Creation with Default Credentials
Tests scenarios where no environment variables are provided and default credentials are used.

**Test Cases:**
- ✅ **Create admin user with default credentials**
  - Verifies creation with `admin@example.com` / `Admin@123`
  - Confirms audit log indicates `isDefaultCredentials: true`
  - Validates proper password hashing

**File System Operations:**
- ✅ **Add default credentials to new .env file**
  - Creates new .env file when none exists
  - Includes proper structure and comments
  - Adds BOOTSTRAP CONFIGURATION section

- ✅ **Add default credentials to existing .env file**
  - Appends to existing .env without losing content
  - Maintains existing configuration
  - Adds missing USEREMAIL/USERPASSWORD entries

- ✅ **Don't modify .env when credentials already exist**
  - Preserves existing USEREMAIL/USERPASSWORD values
  - Prevents overwriting user configuration

- ✅ **Handle commented credentials properly**
  - Adds active credentials when only commented ones exist
  - Preserves commented lines for reference

### 3. Admin User Already Exists Scenarios
Tests behavior when admin users already exist in the database.

**Test Cases:**
- ✅ **Don't create duplicate with custom credentials**
  - Skips creation when user with specified email exists
  - Preserves existing user data
  - No audit log created for duplicate attempt

- ✅ **Don't create duplicate with default credentials**
  - Skips creation when default admin already exists
  - Maintains data integrity

### 4. Error Handling and Edge Cases
Comprehensive error handling tests to ensure robustness.

**Test Cases:**
- ✅ **Database connection errors**
  - Graceful handling of database failures
  - Application continues startup despite errors
  - No partial user creation

- ✅ **User creation errors**
  - Handles repository-level creation failures
  - Prevents inconsistent state

- ✅ **Audit log creation errors**
  - User creation succeeds even if audit logging fails
  - Maintains core functionality over logging

- ✅ **File system permission errors**
  - Handles .env file write failures gracefully
  - User creation continues despite file system issues

- ✅ **Invalid email format handling**
  - Processes invalid email addresses without crashing
  - Demonstrates service resilience

### 5. Password Hashing and Security
Tests security-related functionality and password handling.

**Test Cases:**
- ✅ **Configured bcrypt rounds usage**
  - Verifies bcrypt hash pattern
  - Tests password verification
  - Ensures failed verification for wrong passwords

- ✅ **Unique salt for each password**
  - Different hashes for same password
  - Proper salt generation
  - Security best practices

### 6. Integration with Application Startup
Tests the OnModuleInit integration.

**Test Cases:**
- ✅ **Initialize during application bootstrap**
  - Verifies automatic execution on app startup
  - Tests NestJS lifecycle integration
  - Confirms proper service injection

### 7. Configuration Integration
Tests configuration service integration.

**Test Cases:**
- ✅ **Read configuration values correctly**
  - Validates configuration structure
  - Tests default value access
  - Ensures proper type conversion

### 8. Logging and Monitoring
Tests logging functionality (expandable for future enhancements).

**Test Cases:**
- ✅ **Log appropriate messages**
  - Verifies process completion without errors
  - Foundation for logger mocking tests

### 9. Multi-Environment Support
Tests behavior across different environments.

**Test Cases:**
- ✅ **Work correctly in different NODE_ENV settings**
  - Production environment compatibility
  - Environment-specific behavior validation

## Technical Details

### User Creation Schema
The bootstrap service creates admin users with the following structure:
```typescript
{
  email: string,           // From env vars or default
  password: string,        // Bcrypt hashed
  firstName: 'System',     // Fixed value
  lastName: 'Administrator', // Fixed value
  role: 'ADMIN',          // Always ADMIN
  isActive: true          // Always active
}
```

### Audit Log Schema
Bootstrap actions are logged with:
```typescript
{
  action: 'BOOTSTRAP_USER_CREATED',
  resource: 'USER',
  resourceId: string,      // User ID
  details: {
    email: string,
    role: 'ADMIN',
    isDefaultCredentials: boolean
  },
  ipAddress: 'system',     // Fixed for bootstrap
  userAgent: 'bootstrap'   // Fixed for bootstrap
}
```

### Environment Variables
- `USEREMAIL`: Admin user email (optional)
- `USERPASSWORD`: Admin user password (optional)
- Both must be provided together; partial config falls back to defaults

### Default Credentials
- Email: `admin@example.com`
- Password: `Admin@123`
- Used when environment variables are not provided

### .env File Management
The service automatically manages .env files:
1. Creates new .env if none exists
2. Appends to existing .env when credentials are missing
3. Preserves existing credentials when present
4. Handles commented credentials appropriately

## Test Environment Setup

### Prerequisites
- PostgreSQL test database
- Jest testing framework
- NestJS testing utilities

### Environment Variables (Test)
The tests use isolated environment variables and restore original state after completion.

### Database Cleanup
- Comprehensive cleanup before/after each test
- Ensures test isolation
- Prevents data pollution between tests

### File System Safety
- Backs up original .env content
- Restores original state after tests
- Uses temporary files when needed

## Security Considerations

### Password Security
- Uses configurable bcrypt rounds
- Generates unique salts for each password
- Follows security best practices

### Audit Trail
- Logs all bootstrap user creation events
- Tracks credential source (env vars vs defaults)
- Maintains security audit requirements

### Error Handling
- Fails gracefully without exposing sensitive information
- Continues application startup despite bootstrap failures
- Maintains system availability

## Usage Examples

### Running the Tests
```bash
# Run all bootstrap tests
npm run test:e2e -- bootstrap

# Run specific test file
npm run test:e2e -- bootstrap/bootstrap.e2e-spec.ts

# Run with coverage
npm run test:e2e:cov -- bootstrap
```

### Test Data
The tests use predefined test constants:
- Test Email: `test.admin@example.com`
- Test Password: `TestAdmin@123`
- Default Email: `admin@example.com`
- Default Password: `Admin@123`

## Future Enhancements

### Potential Test Additions
1. **Logger Mocking**: Verify specific log messages
2. **Configuration Validation**: Test invalid configuration values
3. **Concurrent Access**: Test multiple simultaneous bootstrap attempts
4. **Performance Testing**: Measure bootstrap timing
5. **Integration with Auth Module**: Test subsequent authentication

### Security Enhancements
1. **Password Complexity Validation**: Test password strength requirements
2. **Email Validation**: Test email format validation
3. **Role-Based Testing**: Test different admin role configurations

## Dependencies

### Core Dependencies
- `@nestjs/testing`: NestJS testing utilities
- `@nestjs/config`: Configuration management
- `bcrypt`: Password hashing
- `prisma`: Database operations

### Test Dependencies
- `jest`: Testing framework
- `supertest`: HTTP assertions (for future API tests)
- Node.js `fs` and `path`: File system operations

## Notes

### Test Isolation
- Each test runs in isolation with clean database
- Environment variables are managed per test
- File system state is preserved and restored

### Error Resilience
- Tests verify the service doesn't crash on errors
- Application startup continues despite bootstrap failures
- Graceful degradation is tested and verified

### Production Readiness
- Tests cover production environment scenarios
- Security best practices are validated
- Real-world error conditions are simulated 