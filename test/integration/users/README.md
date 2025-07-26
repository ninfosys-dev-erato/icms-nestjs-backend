# Users Module Tests

This directory contains comprehensive test suites for the Users module, which manages user accounts, authentication, authorization, profile management, and administrative operations with role-based access control (ADMIN, EDITOR, VIEWER).

## Test Structure

The users module tests are organized into the following files:

### Setup Tests
- **`setup-users.spec.ts`** - Database initialization and test data creation for the users module

### Repository Tests
- **`users.repository.spec.ts`** - Tests for the UsersRepository class

### Service Tests
- **`users.service.spec.ts`** - Tests for the UsersService class

### Integration Tests
- **`users.e2e-spec.ts`** - End-to-end tests for the users module with API response format validation

## Test Coverage

### Users Repository Tests (`users.repository.spec.ts`)

Tests the following methods:
- `findById()` - Find user by ID
- `findByEmail()` - Find user by email address
- `findAll()` - Find all users with pagination and filters
- `findActive()` - Find active users
- `findByRole()` - Find users by role (ADMIN, EDITOR, VIEWER)
- `search()` - Search users by email, first name, or last name
- `create()` - Create new user
- `update()` - Update existing user
- `delete()` - Delete user
- `activate()` - Activate user (set isActive to true)
- `deactivate()` - Deactivate user (set isActive to false)
- `updateRole()` - Update user role
- `getStatistics()` - Get user statistics and metrics
- `getRecentActivity()` - Get recent user activity from audit logs
- `bulkActivate()` - Bulk activate multiple users
- `bulkDeactivate()` - Bulk deactivate multiple users
- `bulkDelete()` - Bulk delete multiple users
- `validateUser()` - Validate user data before operations

### Users Service Tests (`users.service.spec.ts`)

Tests the following methods:
- `getUserById()` - Get user by ID with response mapping
- `getAllUsers()` - Get all users with pagination
- `getActiveUsers()` - Get active users
- `getUsersByRole()` - Get users by role
- `searchUsers()` - Search users
- `createUser()` - Create new user with validation and password hashing
- `updateUser()` - Update existing user with validation
- `deleteUser()` - Delete user and cleanup sessions
- `activateUser()` - Activate user with audit logging
- `deactivateUser()` - Deactivate user and cleanup sessions
- `updateUserRole()` - Update user role with audit logging
- `validateUser()` - Validate user data
- `getUserStatistics()` - Get user statistics
- `getRecentActivity()` - Get recent user activity
- `exportUsers()` - Export users (JSON/CSV/PDF)
- `importUsers()` - Import users from CSV file
- `bulkActivate()` - Bulk activate users
- `bulkDeactivate()` - Bulk deactivate users
- `bulkDelete()` - Bulk delete users
- `getUserProfile()` - Get user profile with extended information
- `updateUserProfile()` - Update user profile
- `hashPassword()` - Password hashing utility (tested indirectly)
- `generateRandomPassword()` - Random password generation for imports
- `mapUserToResponse()` - Response DTO transformation

### End-to-End Tests (`users.e2e-spec.ts`)

Tests the following API endpoints:

#### User Profile Endpoints
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update current user profile
- `GET /api/v1/users/active` - Get active users (ADMIN/EDITOR only)
- `GET /api/v1/users/role/:role` - Get users by role (ADMIN/EDITOR only)
- `GET /api/v1/users/activity` - Get recent user activity (ADMIN/EDITOR only)

#### Admin User Endpoints
- `POST /api/v1/admin/users` - Create user (ADMIN only)
- `GET /api/v1/admin/users/:id` - Get user by ID (ADMIN only)
- `PUT /api/v1/admin/users/:id` - Update user (ADMIN only)
- `DELETE /api/v1/admin/users/:id` - Delete user (ADMIN only)
- `POST /api/v1/admin/users/:id/activate` - Activate user (ADMIN only)
- `POST /api/v1/admin/users/:id/deactivate` - Deactivate user (ADMIN only)
- `PUT /api/v1/admin/users/:id/role` - Update user role (ADMIN only)
- `GET /api/v1/admin/users/statistics` - Get user statistics (ADMIN only)
- `GET /api/v1/admin/users/activity` - Get recent user activity (ADMIN only)
- `GET /api/v1/admin/users/export` - Export users (ADMIN only)
- `POST /api/v1/admin/users/import` - Import users (ADMIN only)
- `POST /api/v1/admin/users/bulk-activate` - Bulk activate users (ADMIN only)
- `POST /api/v1/admin/users/bulk-deactivate` - Bulk deactivate users (ADMIN only)
- `POST /api/v1/admin/users/bulk-delete` - Bulk delete users (ADMIN only)

#### Authentication & Authorization
- Tests require authentication for all protected endpoints
- Tests verify role-based access control (ADMIN, EDITOR, VIEWER roles)
- Tests include both authenticated and unauthenticated scenarios
- Tests verify proper error responses for unauthorized access
- ADMIN role required for user management operations
- EDITOR role can view users and activity
- VIEWER role can only access own profile

### Setup Tests (`setup-users.spec.ts`)

Tests the following setup and teardown operations:
- Database cleanup
- Test user creation with different roles
- User session creation
- Login attempt creation
- Audit log creation
- Users with all optional fields
- Data structure validation
- Database constraints validation
- Query operations validation
- Update operations validation
- Delete operations validation
- Statistics and aggregations validation
- Foreign key constraint validation

## Test Data

The tests use the following test data:

### Test Users
- **Admin User**: `admin@users.com` (ADMIN role)
- **Editor User**: `editor@users.com` (EDITOR role)
- **Viewer User**: `viewer@users.com` (VIEWER role)
- **Test User**: `test@example.com` (VIEWER role, created per test)

### User Fields
- `id` - Unique identifier (UUID)
- `email` - Required unique email address
- `password` - Required hashed password (excluded from responses)
- `firstName` - Required first name
- `lastName` - Required last name
- `role` - Required role (ADMIN, EDITOR, VIEWER)
- `isActive` - Required boolean (account status)
- `isEmailVerified` - Required boolean (email verification status)
- `phoneNumber` - Optional phone number
- `avatarUrl` - Optional avatar image URL
- `lastLoginAt` - Optional last login timestamp
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### User Session Fields
- `id` - Unique identifier
- `userId` - Foreign key to user
- `token` - Access token
- `refreshToken` - Refresh token
- `isActive` - Session status
- `ipAddress` - Client IP address
- `userAgent` - Client user agent
- `expiresAt` - Token expiration
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Login Attempt Fields
- `id` - Unique identifier
- `email` - Email used in attempt
- `userId` - Optional foreign key to user (if successful)
- `success` - Boolean success status
- `ipAddress` - Client IP address
- `userAgent` - Client user agent
- `reason` - Optional failure reason
- `createdAt` - Timestamp

### Audit Log Fields
- `id` - Unique identifier
- `userId` - Optional foreign key to user
- `action` - Action performed (LOGIN, USER_CREATED, etc.)
- `resource` - Resource type (USER)
- `resourceId` - Optional resource identifier
- `details` - Optional JSON details
- `ipAddress` - Client IP address
- `userAgent` - Client user agent
- `createdAt` - Timestamp

## Running the Tests

### Run All Users Tests
```bash
npm run test:e2e -- --testPathPattern=users
```

### Run Specific Test Files
```bash
# Setup tests
npm run test:e2e -- --testPathPattern=setup-users.spec.ts

# Repository tests
npm run test:e2e -- --testPathPattern=users.repository.spec.ts

# Service tests
npm run test:e2e -- --testPathPattern=users.service.spec.ts

# E2E tests
npm run test:e2e -- --testPathPattern=users.e2e-spec.ts
```

### Run Tests with Coverage
```bash
npm run test:e2e -- --testPathPattern=users --coverage
```

## Test Features

### Authentication & Authorization
- Tests require authentication for all protected endpoints
- Tests verify role-based access control (ADMIN, EDITOR, VIEWER roles)
- Tests include both authenticated and unauthenticated scenarios
- Tests verify proper error responses for unauthorized access
- ADMIN role required for user management operations
- EDITOR role can view users and activity but cannot modify
- VIEWER role can only access their own profile

### Data Validation
- Tests validate required fields (email, password, firstName, lastName, role)
- Tests check for proper error responses
- Tests verify data structure integrity
- Tests validate email format constraints
- Tests validate password strength requirements
- Tests validate role enum constraints
- Tests validate unique email constraint
- Tests verify proper handling of optional fields

### Password Security
- Tests verify password hashing functionality
- Tests ensure passwords are never returned in responses
- Tests validate password strength requirements
- Tests verify secure password storage
- Tests handle password updates correctly
- Tests generate secure random passwords for imports

### Role-Based Access Control
- Tests verify ADMIN role can perform all operations
- Tests verify EDITOR role can view but not modify users
- Tests verify VIEWER role can only access own profile
- Tests verify proper 403 responses for insufficient permissions
- Tests verify role validation in requests

### User Profile Management
- Tests verify profile retrieval functionality
- Tests verify profile update functionality
- Tests validate profile data transformation
- Tests handle optional profile fields (phone, avatar)
- Tests verify username generation from email
- Tests verify full name composition

### Bulk Operations
- Tests verify bulk activate functionality
- Tests verify bulk deactivate functionality
- Tests verify bulk delete functionality
- Tests validate error handling in bulk operations
- Tests verify partial success scenarios
- Tests ensure proper session cleanup for bulk operations

### Import/Export Functionality
- Tests verify export functionality (JSON and CSV formats implemented)
- Tests validate import functionality from CSV files
- Tests verify file format validation
- Tests validate error handling for invalid imports
- Tests handle missing passwords in imports (auto-generation)
- Tests verify data transformation during import/export

### Session Management
- Tests verify session creation and management
- Tests verify session cleanup on user deactivation
- Tests verify session cleanup on user deletion
- Tests validate session data structure
- Tests handle multiple active sessions per user

### Audit Logging
- Tests verify audit log creation for all user operations
- Tests validate audit log data structure
- Tests verify activity tracking functionality
- Tests handle audit log retrieval and filtering
- Tests ensure proper audit trail for compliance

### API Response Format
- Tests verify consistent API response format across all endpoints
- Tests validate success response structure
- Tests validate error response structure
- Tests verify metadata inclusion (processing time, request ID)
- Tests verify pagination response format
- Tests ensure proper HTTP status codes

### Statistics & Analytics
- Tests verify user statistics calculation
- Tests validate role distribution metrics
- Tests verify activity metrics
- Tests validate recent registration tracking
- Tests verify recent login tracking
- Tests handle statistical aggregations

## Test Dependencies

The tests depend on the following modules:
- **PrismaService** - Database operations
- **UsersRepository** - User data access
- **UserSessionRepository** - Session management
- **AuditLogRepository** - Audit logging
- **UsersService** - User business logic
- **AuthModule** - Authentication and authorization
- **ApiResponseInterceptor** - Global API response formatting
- **HttpExceptionFilter** - Global error handling
- **RequestIdMiddleware** - Request tracking

## Database Schema

The tests work with the following Prisma models:
- **User** - Main user entity with profile information
- **UserSession** - Active user sessions
- **LoginAttempt** - Login attempt tracking
- **AuditLog** - Audit trail for user operations

## API Response Format

All tests follow the global API response format enforced via `api-response.interceptor.ts`:
```typescript
{
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  pagination?: PaginationInfo;
}
```

## Security Considerations

The tests include comprehensive security validations:
- **Authentication**: All protected endpoints require valid tokens
- **Authorization**: Role-based access control enforcement
- **Input Validation**: All inputs are validated and sanitized
- **Password Security**: Secure password hashing and storage
- **Session Security**: Proper session management and cleanup
- **SQL Injection Protection**: Using Prisma ORM for safe operations
- **Audit Trail**: Complete activity logging for compliance

## User Lifecycle Management

The tests verify proper user lifecycle management:
- **Registration**: User creation with validation
- **Activation/Deactivation**: Account status management
- **Role Management**: Role assignment and updates
- **Profile Management**: Profile information updates
- **Session Management**: Login/logout and session cleanup
- **Deletion**: Safe user deletion with cleanup
- **Audit Trail**: Complete operation logging

## Validation Testing

The tests validate various input constraints:
- **Email Validation**: Proper email format and uniqueness
- **Password Validation**: Strength requirements and security
- **Role Validation**: Valid role enum values
- **Required Fields**: All mandatory fields validated
- **Optional Fields**: Proper handling of optional data
- **Foreign Key Constraints**: Valid references enforced
- **Data Types**: Proper type validation and conversion

## Error Handling

The tests verify comprehensive error handling:
- **Validation Errors**: Field-level validation with detailed messages
- **Not Found Errors**: When users don't exist
- **Permission Errors**: When user lacks required permissions
- **Conflict Errors**: When unique constraints are violated
- **Database Errors**: When database operations fail
- **Authentication Errors**: When tokens are invalid or missing
- **Authorization Errors**: When user lacks required role

## Performance Considerations

The tests include performance-related validations:
- **Response Time**: API response time validation
- **Database Queries**: Efficient query execution
- **Bulk Operations**: Efficient batch processing
- **Pagination**: Proper pagination implementation
- **Caching Ready**: Service methods designed for caching

## Compliance Features

The tests verify compliance-related functionality:
- **Audit Logging**: Complete activity tracking
- **Data Privacy**: Secure password handling
- **Access Control**: Role-based permissions
- **Session Management**: Secure session handling
- **Data Retention**: Proper deletion and cleanup

## Notes

- All tests follow the global API response format enforced via `api-response.interceptor.ts`
- Tests include comprehensive role-based access control validation
- Tests verify proper error handling and validation
- Tests ensure data integrity and type consistency
- Tests cover both success and failure scenarios
- Tests validate authentication and authorization requirements
- Tests verify audit logging and activity tracking
- Tests include comprehensive validation coverage
- Tests ensure proper cleanup and teardown
- Tests verify password security and hashing
- Tests validate user lifecycle management
- Tests include performance and security validations
- Tests verify session management and cleanup
- Tests validate bulk operations and error handling
- Tests ensure compliance with security best practices 