# Bootstrap Test Script Usage Guide

## Overview

The `run-bootstrap-tests.sh` script provides a comprehensive testing framework for the Bootstrap service's admin user creation functionality. It offers various commands to run specific test categories, generate coverage reports, and manage the test environment.

## Quick Start

```bash
# Run all bootstrap tests
npm run test:bootstrap

# Or run directly
./test/run-bootstrap-tests.sh all

# Get help
./test/run-bootstrap-tests.sh help
```

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- PostgreSQL (for database tests)
- Git Bash (on Windows)

### Initial Setup
```bash
# Setup test environment
npm run test:bootstrap:setup

# Or directly
./test/run-bootstrap-tests.sh setup
```

This will:
- Create `.env.test` file with test configuration
- Install dependencies if needed
- Generate Prisma client
- Verify all prerequisites

## Available Commands

### Test Execution Commands

#### `all` - Run All Bootstrap Tests
```bash
npm run test:bootstrap
./test/run-bootstrap-tests.sh all
```
**Purpose**: Executes the complete bootstrap test suite (25+ tests)
**Duration**: ~2-3 minutes
**Coverage**: All test categories

#### `env` - Environment Variable Tests
```bash
npm run test:bootstrap:env
./test/run-bootstrap-tests.sh env
```
**Tests**: 
- Custom credentials with USEREMAIL and USERPASSWORD
- Partial credentials handling
- Fallback to default credentials

#### `default` - Default Credential Tests
```bash
npm run test:bootstrap:default
./test/run-bootstrap-tests.sh default
```
**Tests**:
- Default user creation
- .env file creation and management
- Preservation of existing configurations

#### `duplicates` - Duplicate Prevention Tests
```bash
npm run test:bootstrap:duplicates
./test/run-bootstrap-tests.sh duplicates
```
**Tests**:
- Skip creation when user exists
- Data integrity preservation

#### `errors` - Error Handling Tests
```bash
npm run test:bootstrap:errors
./test/run-bootstrap-tests.sh errors
```
**Tests**:
- Database connection failures
- User creation errors
- File system permission errors
- Invalid data handling

#### `security` - Security and Password Tests
```bash
npm run test:bootstrap:security
./test/run-bootstrap-tests.sh security
```
**Tests**:
- Password hashing with bcrypt
- Salt uniqueness
- Security best practices

#### `integration` - Integration Tests
```bash
npm run test:bootstrap:integration
./test/run-bootstrap-tests.sh integration
```
**Tests**:
- NestJS lifecycle integration
- Application startup simulation

#### `config` - Configuration Tests
```bash
npm run test:bootstrap:config
./test/run-bootstrap-tests.sh config
```
**Tests**:
- Configuration service integration
- Environment variable reading

### Development Commands

#### `coverage` - Coverage Report
```bash
npm run test:bootstrap:coverage
./test/run-bootstrap-tests.sh coverage
```
**Features**:
- Generates detailed coverage report
- Opens browser automatically (macOS/Linux)
- Focuses on bootstrap module only
- Output: `coverage/bootstrap/lcov-report/index.html`

#### `watch` - Watch Mode
```bash
npm run test:bootstrap:watch
./test/run-bootstrap-tests.sh watch
```
**Features**:
- Re-runs tests when files change
- Interactive mode
- Press 'q' to quit
- Ideal for development

#### `debug` - Debug Mode
```bash
npm run test:bootstrap:debug
./test/run-bootstrap-tests.sh debug
```
**Features**:
- Enables Node.js debugger
- Available on port 9229
- Use Chrome DevTools: `chrome://inspect`
- Breakpoint debugging support

### Environment Management

#### `setup` - Setup Test Environment
```bash
npm run test:bootstrap:setup
./test/run-bootstrap-tests.sh setup
```
**Actions**:
- Creates `.env.test` file
- Installs dependencies
- Generates Prisma client
- Verifies setup

#### `cleanup` - Cleanup Test Environment
```bash
npm run test:bootstrap:cleanup
./test/run-bootstrap-tests.sh cleanup
```
**Actions**:
- Removes `.env.test` file
- Clears Jest cache
- Cleans temporary files

## Command Options

### `--verbose`
Shows detailed test output and execution information.
```bash
./test/run-bootstrap-tests.sh all --verbose
./test/run-bootstrap-tests.sh env --verbose
```

### `--silent`
Minimizes output to essential information only.
```bash
./test/run-bootstrap-tests.sh all --silent
```

### `--no-cache`
Clears Jest cache before running tests.
```bash
./test/run-bootstrap-tests.sh all --no-cache
```

### `--bail`
Stops execution on first test failure.
```bash
./test/run-bootstrap-tests.sh security --bail
```

## Practical Examples

### Development Workflow
```bash
# Start development with clean environment
./test/run-bootstrap-tests.sh setup

# Run tests in watch mode during development
./test/run-bootstrap-tests.sh watch

# Test specific functionality
./test/run-bootstrap-tests.sh security --verbose

# Generate coverage before committing
./test/run-bootstrap-tests.sh coverage

# Cleanup when done
./test/run-bootstrap-tests.sh cleanup
```

### CI/CD Pipeline
```bash
# In GitHub Actions or similar CI
./test/run-bootstrap-tests.sh setup
./test/run-bootstrap-tests.sh all --silent --bail
./test/run-bootstrap-tests.sh cleanup
```

### Debugging Issues
```bash
# Debug specific test failures
./test/run-bootstrap-tests.sh errors --debug --verbose

# Test with fresh cache
./test/run-bootstrap-tests.sh all --no-cache --verbose
```

### Performance Testing
```bash
# Quick smoke test
./test/run-bootstrap-tests.sh integration --silent

# Full coverage analysis
./test/run-bootstrap-tests.sh coverage
```

## Output Examples

### Successful Test Run
```
═══════════════════════════════════════════════════════════════════
  Running All Bootstrap Tests
═══════════════════════════════════════════════════════════════════

[EXEC] jest --config ./test/jest-e2e.json --testPathPatterns=bootstrap

 PASS  test/integration/bootstrap/bootstrap.e2e-spec.ts (15.234 s)
  Bootstrap Service - Admin User Creation (e2e)
    Admin User Creation with Environment Variables
      ✓ should create admin user with provided USEREMAIL and USERPASSWORD (1205 ms)
      ✓ should handle partial environment variables (only USEREMAIL) (845 ms)
      ✓ should handle partial environment variables (only USERPASSWORD) (823 ms)
    Admin User Creation with Default Credentials
      ✓ should create admin user with default credentials when env vars not provided (756 ms)
      ✓ should add default credentials to new .env file when it does not exist (892 ms)
      ✓ should add default credentials to existing .env file when missing (734 ms)
      ✓ should not modify .env file when USEREMAIL and USERPASSWORD already exist (645 ms)
      ✓ should handle commented USEREMAIL and USERPASSWORD by adding new ones (698 ms)
    Admin User Already Exists Scenarios
      ✓ should not create duplicate admin user when user already exists (567 ms)
      ✓ should not create duplicate admin user when default user already exists (523 ms)
    Error Handling and Edge Cases
      ✓ should handle database connection errors gracefully (456 ms)
      ✓ should handle user creation errors gracefully (434 ms)
      ✓ should handle audit log creation errors gracefully (512 ms)
      ✓ should handle file system permission errors gracefully (389 ms)
      ✓ should handle invalid email format in environment variables (298 ms)
    Password Hashing and Security
      ✓ should use configured bcrypt rounds for password hashing (1123 ms)
      ✓ should use different salt for each password hash (1456 ms)
    Integration with Application Startup
      ✓ should initialize admin user during application bootstrap (2134 ms)
    Configuration Integration
      ✓ should read configuration values correctly (123 ms)
    Logging and Monitoring
      ✓ should log appropriate messages during bootstrap process (234 ms)
    Multi-Environment Support
      ✓ should work correctly in different NODE_ENV settings (456 ms)

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        15.234 s

[SUCCESS] All bootstrap tests passed

═══════════════════════════════════════════════════════════════════
  Bootstrap Test Execution Complete
═══════════════════════════════════════════════════════════════════

[SUCCESS] All requested tests completed successfully!

Next steps:
  - Review test output above
  - Check coverage report (if generated)
  - Run './test/run-bootstrap-tests.sh help' for more options
```

### Coverage Report Output
```
═══════════════════════════════════════════════════════════════════
  Running Bootstrap Tests with Coverage Report
═══════════════════════════════════════════════════════════════════

[EXEC] jest --config ./test/jest-e2e.json --testPathPatterns=bootstrap --coverage --coverageDirectory=coverage/bootstrap --collectCoverageFrom=src/modules/bootstrap/**/*.ts --collectCoverageFrom=src/config/configuration.ts

----------------------|---------|----------|---------|---------|-------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------|---------|----------|---------|---------|-------------------
All files             |     100 |      100 |     100 |     100 |                   
 bootstrap            |     100 |      100 |     100 |     100 |                   
  bootstrap.module.ts |     100 |      100 |     100 |     100 |                   
  bootstrap.service.ts|     100 |      100 |     100 |     100 |                   
  index.ts            |     100 |      100 |     100 |     100 |                   
 config               |     100 |      100 |     100 |     100 |                   
  configuration.ts    |     100 |      100 |     100 |     100 |                   
----------------------|---------|----------|---------|---------|-------------------

[SUCCESS] Coverage report generated in coverage/bootstrap/
[INFO] Opening coverage report...
```

### Error Output
```
═══════════════════════════════════════════════════════════════════
  Running Bootstrap Tests: Security and Password Scenarios
═══════════════════════════════════════════════════════════════════

[EXEC] jest --config ./test/jest-e2e.json --testPathPatterns=bootstrap.*Password Hashing and Security --bail

 FAIL  test/integration/bootstrap/bootstrap.e2e-spec.ts
  Bootstrap Service - Admin User Creation (e2e)
    Password Hashing and Security
      ✕ should use configured bcrypt rounds for password hashing (1123 ms)

[ERROR] Security and Password Scenarios tests failed

═══════════════════════════════════════════════════════════════════
  Bootstrap Test Execution Failed
═══════════════════════════════════════════════════════════════════

[ERROR] Some tests failed. Please review the output above.

Troubleshooting:
  - Check database connection
  - Verify environment configuration
  - Run './test/run-bootstrap-tests.sh setup' to reset environment
  - Use '--verbose' flag for detailed output
```

## Configuration Files

### `.env.test` (Auto-generated)
```bash
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
```

## Troubleshooting

### Common Issues

#### Permission Denied
```bash
chmod +x test/run-bootstrap-tests.sh
```

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Verify database URL in .env.test
./test/run-bootstrap-tests.sh setup
```

#### Jest Cache Issues
```bash
./test/run-bootstrap-tests.sh all --no-cache
```

#### Node.js Version Issues
```bash
node --version  # Should be v16 or higher
```

### Debug Mode Setup
1. Run tests in debug mode:
   ```bash
   ./test/run-bootstrap-tests.sh debug
   ```

2. Open Chrome and navigate to: `chrome://inspect`

3. Click "Open dedicated DevTools for Node"

4. Set breakpoints in test files or source code

5. Tests will pause at breakpoints for inspection

## Integration with IDE

### VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Bootstrap Tests",
  "program": "${workspaceFolder}/test/run-bootstrap-tests.sh",
  "args": ["debug"],
  "console": "integratedTerminal"
}
```

### WebStorm
1. Create new Node.js configuration
2. Set script path to: `test/run-bootstrap-tests.sh`
3. Set arguments to: `debug`

## Performance Considerations

### Test Execution Times
- **Individual category**: 30-60 seconds
- **All tests**: 2-3 minutes
- **Coverage report**: 3-4 minutes
- **Watch mode**: Instant re-runs

### Resource Usage
- **Memory**: ~200MB during execution
- **Disk**: ~50MB for coverage reports
- **CPU**: High during bcrypt operations

### Optimization Tips
- Use specific categories for development
- Use `--silent` flag in CI/CD
- Use `--bail` flag for quick failure detection
- Use coverage reports sparingly (they're slower)

## Best Practices

### Development
1. Start with `setup` command
2. Use `watch` mode during development
3. Test specific categories as you work
4. Generate coverage before commits
5. Cleanup when switching branches

### CI/CD
1. Always run `setup` first
2. Use `--silent --bail` options
3. Run all tests, not just categories
4. Archive coverage reports as artifacts
5. Cleanup in post-build steps

### Team Collaboration
1. Document any test environment changes
2. Share custom `.env.test` configurations
3. Report any new test failures immediately
4. Keep test data predictable and isolated

## Contributing

### Adding New Test Categories
1. Add tests to `bootstrap.e2e-spec.ts`
2. Update script with new category command
3. Add npm script in `package.json`
4. Update this documentation

### Modifying the Script
1. Test changes thoroughly
2. Maintain backward compatibility
3. Update help text and documentation
4. Follow existing patterns and conventions 