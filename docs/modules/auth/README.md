# Authentication Module

## Overview

The Authentication module handles user authentication and authorization with JWT tokens, role-based access control (RBAC), password management, and session management. This module provides secure authentication mechanisms for both public and admin users.

## Module Purpose

- **User Authentication:** Secure login and logout functionality
- **JWT Token Management:** Token generation, validation, and refresh
- **Role-Based Access Control:** Permission-based authorization
- **Password Management:** Secure password handling and reset
- **Session Management:** User session tracking and management
- **Security Features:** Rate limiting, brute force protection, and audit logging

## Database Schema

### User Entity
```typescript
interface User {
  id: string;
  email: string;
  password: string; // Hashed
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  sessions: UserSession[];
  loginAttempts: LoginAttempt[];
  auditLogs: AuditLog[];
}

enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}
```

### UserSession Entity
```typescript
interface UserSession {
  id: string;
  userId: string;
  token: string; // JWT token
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  
  // Relations
  user: User;
}
```

### LoginAttempt Entity
```typescript
interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  attemptedAt: Date;
}
```

### AuditLog Entity
```typescript
interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  
  // Relations
  user?: User;
}
```

## DTOs (Data Transfer Objects)

### Authentication DTOs

#### LoginDto
```typescript
interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

#### RegisterDto
```typescript
interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}
```

#### RefreshTokenDto
```typescript
interface RefreshTokenDto {
  refreshToken: string;
}
```

#### ForgotPasswordDto
```typescript
interface ForgotPasswordDto {
  email: string;
}
```

#### ResetPasswordDto
```typescript
interface ResetPasswordDto {
  token: string;
  password: string;
  confirmPassword: string;
}
```

#### ChangePasswordDto
```typescript
interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

### Response DTOs

#### AuthResponseDto
```typescript
interface AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}
```

#### UserResponseDto
```typescript
interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### SessionResponseDto
```typescript
interface SessionResponseDto {
  id: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}
```

## Repository Interfaces

### UserRepository
```typescript
interface UserRepository {
  // Find user by ID
  findById(id: string): Promise<User | null>;
  
  // Find user by email
  findByEmail(email: string): Promise<User | null>;
  
  // Find all users with pagination
  findAll(query: UserQueryDto): Promise<PaginatedUserResult>;
  
  // Find active users
  findActive(query: UserQueryDto): Promise<PaginatedUserResult>;
  
  // Find users by role
  findByRole(role: UserRole, query: UserQueryDto): Promise<PaginatedUserResult>;
  
  // Search users
  search(searchTerm: string, query: UserQueryDto): Promise<PaginatedUserResult>;
  
  // Create user
  create(data: CreateUserDto): Promise<User>;
  
  // Update user
  update(id: string, data: UpdateUserDto): Promise<User>;
  
  // Delete user
  delete(id: string): Promise<void>;
  
  // Update password
  updatePassword(id: string, hashedPassword: string): Promise<User>;
  
  // Update last login
  updateLastLogin(id: string): Promise<User>;
  
  // Verify email
  verifyEmail(token: string): Promise<User>;
  
  // Set password reset token
  setPasswordResetToken(email: string, token: string, expiresAt: Date): Promise<User>;
  
  // Reset password
  resetPassword(token: string, hashedPassword: string): Promise<User>;
  
  // Get user statistics
  getStatistics(): Promise<UserStatistics>;
  
  // Find user by verification token
  findByVerificationToken(token: string): Promise<User | null>;
  
  // Find user by reset token
  findByResetToken(token: string): Promise<User | null>;
}

interface UserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface PaginatedUserResult {
  data: User[];
  pagination: PaginationInfo;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UserStatistics {
  total: number;
  active: number;
  byRole: Record<UserRole, number>;
  verified: number;
  unverified: number;
}
```

### UserSessionRepository
```typescript
interface UserSessionRepository {
  // Find session by ID
  findById(id: string): Promise<UserSession | null>;
  
  // Find session by token
  findByToken(token: string): Promise<UserSession | null>;
  
  // Find session by refresh token
  findByRefreshToken(refreshToken: string): Promise<UserSession | null>;
  
  // Find active sessions by user
  findActiveByUser(userId: string): Promise<UserSession[]>;
  
  // Create session
  create(data: CreateSessionDto): Promise<UserSession>;
  
  // Update session
  update(id: string, data: UpdateSessionDto): Promise<UserSession>;
  
  // Delete session
  delete(id: string): Promise<void>;
  
  // Deactivate session
  deactivate(id: string): Promise<void>;
  
  // Deactivate all user sessions
  deactivateAllUserSessions(userId: string): Promise<void>;
  
  // Clean expired sessions
  cleanExpiredSessions(): Promise<void>;
  
  // Get session statistics
  getStatistics(): Promise<SessionStatistics>;
}

interface CreateSessionDto {
  userId: string;
  token: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
}

interface UpdateSessionDto {
  isActive?: boolean;
  expiresAt?: Date;
}

interface SessionStatistics {
  total: number;
  active: number;
  expired: number;
  byUser: Record<string, number>;
}
```

### LoginAttemptRepository
```typescript
interface LoginAttemptRepository {
  // Create login attempt
  create(data: CreateLoginAttemptDto): Promise<LoginAttempt>;
  
  // Find attempts by email
  findByEmail(email: string, limit?: number): Promise<LoginAttempt[]>;
  
  // Find attempts by IP
  findByIP(ipAddress: string, limit?: number): Promise<LoginAttempt[]>;
  
  // Get failed attempts count
  getFailedAttemptsCount(email: string, timeWindow: number): Promise<number>;
  
  // Get IP failed attempts count
  getIPFailedAttemptsCount(ipAddress: string, timeWindow: number): Promise<number>;
  
  // Clean old attempts
  cleanOldAttempts(daysOld: number): Promise<void>;
  
  // Get attempt statistics
  getStatistics(): Promise<LoginAttemptStatistics>;
}

interface CreateLoginAttemptDto {
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
}

interface LoginAttemptStatistics {
  total: number;
  successful: number;
  failed: number;
  byEmail: Record<string, number>;
  byIP: Record<string, number>;
}
```

### AuditLogRepository
```typescript
interface AuditLogRepository {
  // Create audit log
  create(data: CreateAuditLogDto): Promise<AuditLog>;
  
  // Find logs by user
  findByUser(userId: string, query: AuditLogQueryDto): Promise<PaginatedAuditLogResult>;
  
  // Find logs by action
  findByAction(action: string, query: AuditLogQueryDto): Promise<PaginatedAuditLogResult>;
  
  // Find logs by resource
  findByResource(resource: string, query: AuditLogQueryDto): Promise<PaginatedAuditLogResult>;
  
  // Search logs
  search(searchTerm: string, query: AuditLogQueryDto): Promise<PaginatedAuditLogResult>;
  
  // Get audit statistics
  getStatistics(): Promise<AuditLogStatistics>;
  
  // Clean old logs
  cleanOldLogs(daysOld: number): Promise<void>;
}

interface CreateAuditLogDto {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

interface AuditLogQueryDto {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resource?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface PaginatedAuditLogResult {
  data: AuditLog[];
  pagination: PaginationInfo;
}

interface AuditLogStatistics {
  total: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byUser: Record<string, number>;
  byDate: Record<string, number>;
}
```

## Service Interfaces

### AuthService
```typescript
interface AuthService {
  // Login user
  login(data: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponseDto>;
  
  // Register user
  register(data: RegisterDto): Promise<AuthResponseDto>;
  
  // Logout user
  logout(userId: string, sessionId?: string): Promise<void>;
  
  // Refresh token
  refreshToken(refreshToken: string): Promise<AuthResponseDto>;
  
  // Validate token
  validateToken(token: string): Promise<UserResponseDto>;
  
  // Forgot password
  forgotPassword(data: ForgotPasswordDto): Promise<void>;
  
  // Reset password
  resetPassword(data: ResetPasswordDto): Promise<void>;
  
  // Change password
  changePassword(userId: string, data: ChangePasswordDto): Promise<void>;
  
  // Verify email
  verifyEmail(token: string): Promise<void>;
  
  // Resend verification email
  resendVerificationEmail(email: string): Promise<void>;
  
  // Validate login attempt
  validateLoginAttempt(email: string, ipAddress: string): Promise<ValidationResult>;
  
  // Get user sessions
  getUserSessions(userId: string): Promise<SessionResponseDto[]>;
  
  // Revoke session
  revokeSession(userId: string, sessionId: string): Promise<void>;
  
  // Revoke all sessions
  revokeAllSessions(userId: string): Promise<void>;
  
  // Get audit logs
  getAuditLogs(query: AuditLogQueryDto): Promise<PaginatedAuditLogResponse>;
  
  // Log audit event
  logAuditEvent(data: CreateAuditLogDto): Promise<void>;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface PaginatedAuditLogResponse {
  data: AuditLogResponseDto[];
  pagination: PaginationInfo;
}

interface AuditLogResponseDto {
  id: string;
  user?: UserResponseDto;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

### UserService
```typescript
interface UserService {
  // Get user by ID
  getUserById(id: string): Promise<UserResponseDto>;
  
  // Get all users with pagination
  getAllUsers(query: UserQueryDto): Promise<PaginatedUserResponse>;
  
  // Get active users
  getActiveUsers(query: UserQueryDto): Promise<PaginatedUserResponse>;
  
  // Get users by role
  getUsersByRole(role: UserRole, query: UserQueryDto): Promise<PaginatedUserResponse>;
  
  // Search users
  searchUsers(searchTerm: string, query: UserQueryDto): Promise<PaginatedUserResponse>;
  
  // Create user
  createUser(data: CreateUserDto): Promise<UserResponseDto>;
  
  // Update user
  updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto>;
  
  // Delete user
  deleteUser(id: string): Promise<void>;
  
  // Activate user
  activateUser(id: string): Promise<UserResponseDto>;
  
  // Deactivate user
  deactivateUser(id: string): Promise<UserResponseDto>;
  
  // Update user role
  updateUserRole(id: string, role: UserRole): Promise<UserResponseDto>;
  
  // Validate user data
  validateUser(data: CreateUserDto | UpdateUserDto): Promise<ValidationResult>;
  
  // Get user statistics
  getUserStatistics(): Promise<UserStatistics>;
  
  // Export users
  exportUsers(query: UserQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Import users
  importUsers(file: Express.Multer.File): Promise<ImportResult>;
  
  // Bulk operations
  bulkActivate(ids: string[]): Promise<BulkOperationResult>;
  bulkDeactivate(ids: string[]): Promise<BulkOperationResult>;
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;
}

interface PaginatedUserResponse {
  data: UserResponseDto[];
  pagination: PaginationInfo;
}

interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
}

interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}
```

## Controller Interfaces

### AuthController
```typescript
interface AuthController {
  // Login
  login(
    @Body() data: LoginDto,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
  
  // Register
  register(
    @Body() data: RegisterDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Logout
  logout(
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
  
  // Refresh token
  refreshToken(
    @Body() data: RefreshTokenDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Forgot password
  forgotPassword(
    @Body() data: ForgotPasswordDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Reset password
  resetPassword(
    @Body() data: ResetPasswordDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Change password
  changePassword(
    @Body() data: ChangePasswordDto,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
  
  // Verify email
  verifyEmail(
    @Param('token') token: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Resend verification email
  resendVerificationEmail(
    @Body() data: { email: string },
    @Res() response: Response
  ): Promise<void>;
  
  // Get current user
  getCurrentUser(
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
  
  // Get user sessions
  getUserSessions(
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
  
  // Revoke session
  revokeSession(
    @Param('sessionId') sessionId: string,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
  
  // Revoke all sessions
  revokeAllSessions(
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminUserController
```typescript
interface AdminUserController {
  // Get user by ID (admin)
  getUserById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create user
  createUser(
    @Body() data: CreateUserDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update user
  updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete user
  deleteUser(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Activate user
  activateUser(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Deactivate user
  deactivateUser(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Update user role
  updateUserRole(
    @Param('id') id: string,
    @Body() data: { role: UserRole },
    @Res() response: Response
  ): Promise<void>;
  
  // Get user statistics
  getUserStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Get audit logs
  getAuditLogs(
    @Query() query: AuditLogQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Export users
  exportUsers(
    @Query() query: UserQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
    @Res() response: Response
  ): Promise<void>;
  
  // Import users
  importUsers(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
  
  // Bulk operations
  bulkActivate(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
  
  bulkDeactivate(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
  
  bulkDelete(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
}
```

## API Endpoints

### Authentication Endpoints

#### POST /api/v1/auth/login
**Description:** Login user
**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": true,
      "lastLoginAt": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

#### POST /api/v1/auth/register
**Description:** Register user
**Access:** Public

#### POST /api/v1/auth/logout
**Description:** Logout user
**Access:** Authenticated

#### POST /api/v1/auth/refresh
**Description:** Refresh token
**Access:** Public

#### POST /api/v1/auth/forgot-password
**Description:** Forgot password
**Access:** Public

#### POST /api/v1/auth/reset-password
**Description:** Reset password
**Access:** Public

#### POST /api/v1/auth/change-password
**Description:** Change password
**Access:** Authenticated

#### GET /api/v1/auth/verify-email/{token}
**Description:** Verify email
**Access:** Public

#### POST /api/v1/auth/resend-verification
**Description:** Resend verification email
**Access:** Public

#### GET /api/v1/auth/me
**Description:** Get current user
**Access:** Authenticated

#### GET /api/v1/auth/sessions
**Description:** Get user sessions
**Access:** Authenticated

#### DELETE /api/v1/auth/sessions/{sessionId}
**Description:** Revoke session
**Access:** Authenticated

#### DELETE /api/v1/auth/sessions
**Description:** Revoke all sessions
**Access:** Authenticated

### Admin User Endpoints

#### GET /api/v1/admin/users/{id}
**Description:** Get user by ID (admin)
**Access:** Admin

#### POST /api/v1/admin/users
**Description:** Create user
**Access:** Admin

#### PUT /api/v1/admin/users/{id}
**Description:** Update user
**Access:** Admin

#### DELETE /api/v1/admin/users/{id}
**Description:** Delete user
**Access:** Admin

#### POST /api/v1/admin/users/{id}/activate
**Description:** Activate user
**Access:** Admin

#### POST /api/v1/admin/users/{id}/deactivate
**Description:** Deactivate user
**Access:** Admin

#### PUT /api/v1/admin/users/{id}/role
**Description:** Update user role
**Access:** Admin

#### GET /api/v1/admin/users/statistics
**Description:** Get user statistics
**Access:** Admin

#### GET /api/v1/admin/audit-logs
**Description:** Get audit logs
**Access:** Admin

#### GET /api/v1/admin/users/export
**Description:** Export users
**Access:** Admin

#### POST /api/v1/admin/users/import
**Description:** Import users
**Access:** Admin

## Business Logic

### 1. Authentication Flow
- **Secure password hashing** with bcrypt
- **JWT token generation** with configurable expiration
- **Refresh token mechanism** for extended sessions
- **Rate limiting** to prevent brute force attacks

### 2. Authorization System
- **Role-based access control** (RBAC)
- **Permission-based authorization** for fine-grained control
- **Session management** for active user tracking
- **Token validation** and refresh mechanisms

### 3. Security Features
- **Password strength validation** and requirements
- **Account lockout** after failed attempts
- **Email verification** for account security
- **Audit logging** for security monitoring

### 4. Session Management
- **Multiple session support** per user
- **Session revocation** capabilities
- **Automatic session cleanup** for expired tokens
- **Device tracking** for security monitoring

## Error Handling

### Authentication Errors
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid credentials",
    "details": [
      {
        "field": "email",
        "message": "Invalid email or password",
        "code": "INVALID_CREDENTIALS"
      }
    ]
  }
}
```

### Authorization Errors
```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Insufficient permissions",
    "details": [
      {
        "field": "role",
        "message": "Admin role required",
        "code": "INSUFFICIENT_PERMISSIONS"
      }
    ]
  }
}
```

## Performance Considerations

### 1. Token Management
- **Redis caching** for token storage
- **Token blacklisting** for logout
- **Efficient token validation** with caching
- **Automatic token cleanup** for expired tokens

### 2. Password Security
- **Asynchronous password hashing** for performance
- **Password strength checking** with efficient algorithms
- **Rate limiting** for password attempts
- **Secure password reset** mechanisms

### 3. Session Optimization
- **Database indexing** for session queries
- **Session cleanup** scheduling for performance
- **Connection pooling** for high concurrency
- **Caching** for frequently accessed user data

## Security Considerations

### 1. Password Security
- **Strong password requirements** and validation
- **Secure password hashing** with bcrypt
- **Password history** to prevent reuse
- **Account lockout** after failed attempts

### 2. Token Security
- **Secure JWT signing** with strong algorithms
- **Token expiration** and refresh mechanisms
- **Token blacklisting** for logout
- **HTTPS enforcement** for token transmission

### 3. Access Control
- **Role-based permissions** for authorization
- **Resource-level access control** for fine-grained security
- **Audit logging** for all authentication events
- **Session monitoring** for suspicious activity 