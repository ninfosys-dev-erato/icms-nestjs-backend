# User Management Module

## Overview

The User Management module provides comprehensive user administration capabilities including user CRUD operations, role management, profile management, and user activity tracking. This module works closely with the Authentication module to provide complete user lifecycle management.

## Module Purpose

- **User Administration:** Complete user lifecycle management
- **Role Management:** User role assignment and permissions
- **Profile Management:** User profile information and settings
- **Activity Tracking:** User activity monitoring and logging
- **User Analytics:** User behavior and usage analytics
- **Account Management:** Account status and security management

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
  profile: UserProfile;
  preferences: UserPreferences;
  lastLoginAt?: Date;
  lastActivityAt?: Date;
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
  activities: UserActivity[];
}

enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

interface UserProfile {
  avatar?: string;
  phoneNumber?: string;
  address?: TranslatableEntity;
  bio?: TranslatableEntity;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  department?: string;
  position?: string;
  employeeId?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  dashboardLayout?: Record<string, any>;
}

interface TranslatableEntity {
  en: string;
  ne: string;
}
```

### UserActivity Entity
```typescript
interface UserActivity {
  id: string;
  userId: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  
  // Relations
  user: User;
}

enum ActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  CONTENT_CREATE = 'CONTENT_CREATE',
  CONTENT_UPDATE = 'CONTENT_UPDATE',
  CONTENT_DELETE = 'CONTENT_DELETE',
  FILE_UPLOAD = 'FILE_UPLOAD',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  EXPORT_DATA = 'EXPORT_DATA',
  IMPORT_DATA = 'IMPORT_DATA'
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
  deviceInfo?: DeviceInfo;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  
  // Relations
  user: User;
}

interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceModel?: string;
}
```

## DTOs (Data Transfer Objects)

### User DTOs

#### CreateUserDto
```typescript
interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
}
```

#### UpdateUserDto
```typescript
interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
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
  profile: UserProfileResponseDto;
  preferences: UserPreferencesResponseDto;
  lastLoginAt?: Date;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfileResponseDto {
  avatar?: string;
  phoneNumber?: string;
  address?: TranslatableEntity;
  bio?: TranslatableEntity;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  department?: string;
  position?: string;
  employeeId?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface UserPreferencesResponseDto {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  dashboardLayout?: Record<string, any>;
}
```

#### UserQueryDto
```typescript
interface UserQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  department?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

### UserActivity DTOs

#### UserActivityResponseDto
```typescript
interface UserActivityResponseDto {
  id: string;
  userId: string;
  user: UserResponseDto;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

#### UserActivityQueryDto
```typescript
interface UserActivityQueryDto {
  page?: number;
  limit?: number;
  userId?: string;
  activityType?: ActivityType;
  dateFrom?: Date;
  dateTo?: Date;
  sort?: string;
  order?: 'asc' | 'desc';
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
  
  // Find all users with pagination and filters
  findAll(query: UserQueryDto): Promise<PaginatedUserResult>;
  
  // Find active users
  findActive(query: UserQueryDto): Promise<PaginatedUserResult>;
  
  // Find users by role
  findByRole(role: UserRole, query: UserQueryDto): Promise<PaginatedUserResult>;
  
  // Find users by department
  findByDepartment(department: string, query: UserQueryDto): Promise<PaginatedUserResult>;
  
  // Search users
  search(searchTerm: string, query: UserQueryDto): Promise<PaginatedUserResult>;
  
  // Create user
  create(data: CreateUserDto): Promise<User>;
  
  // Update user
  update(id: string, data: UpdateUserDto): Promise<User>;
  
  // Delete user
  delete(id: string): Promise<void>;
  
  // Update profile
  updateProfile(id: string, profile: Partial<UserProfile>): Promise<User>;
  
  // Update preferences
  updatePreferences(id: string, preferences: Partial<UserPreferences>): Promise<User>;
  
  // Update last activity
  updateLastActivity(id: string): Promise<User>;
  
  // Update last login
  updateLastLogin(id: string): Promise<User>;
  
  // Activate user
  activate(id: string): Promise<User>;
  
  // Deactivate user
  deactivate(id: string): Promise<User>;
  
  // Update role
  updateRole(id: string, role: UserRole): Promise<User>;
  
  // Get user statistics
  getStatistics(): Promise<UserStatistics>;
  
  // Find users by employee ID
  findByEmployeeId(employeeId: string): Promise<User | null>;
  
  // Get users by creation date range
  findByDateRange(dateFrom: Date, dateTo: Date): Promise<User[]>;
  
  // Bulk operations
  bulkActivate(ids: string[]): Promise<User[]>;
  bulkDeactivate(ids: string[]): Promise<User[]>;
  bulkUpdateRole(ids: string[], role: UserRole): Promise<User[]>;
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
  inactive: number;
  byRole: Record<UserRole, number>;
  byDepartment: Record<string, number>;
  verified: number;
  unverified: number;
  recentLogins: number;
  averageActivity: number;
}
```

### UserActivityRepository
```typescript
interface UserActivityRepository {
  // Find activity by ID
  findById(id: string): Promise<UserActivity | null>;
  
  // Find activities by user
  findByUser(userId: string, query: UserActivityQueryDto): Promise<PaginatedActivityResult>;
  
  // Find activities by type
  findByType(activityType: ActivityType, query: UserActivityQueryDto): Promise<PaginatedActivityResult>;
  
  // Find activities by date range
  findByDateRange(dateFrom: Date, dateTo: Date, query: UserActivityQueryDto): Promise<PaginatedActivityResult>;
  
  // Search activities
  search(searchTerm: string, query: UserActivityQueryDto): Promise<PaginatedActivityResult>;
  
  // Create activity
  create(data: CreateActivityDto): Promise<UserActivity>;
  
  // Get activity statistics
  getStatistics(): Promise<ActivityStatistics>;
  
  // Get recent activities
  getRecentActivities(limit?: number): Promise<UserActivity[]>;
  
  // Get user activity summary
  getUserActivitySummary(userId: string, days?: number): Promise<ActivitySummary>;
  
  // Clean old activities
  cleanOldActivities(daysOld: number): Promise<void>;
}

interface CreateActivityDto {
  userId: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

interface PaginatedActivityResult {
  data: UserActivity[];
  pagination: PaginationInfo;
}

interface ActivityStatistics {
  total: number;
  byType: Record<ActivityType, number>;
  byUser: Record<string, number>;
  byDate: Record<string, number>;
  averagePerUser: number;
}

interface ActivitySummary {
  userId: string;
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  lastActivity: Date;
  averagePerDay: number;
}
```

### UserSessionRepository
```typescript
interface UserSessionRepository {
  // Find session by ID
  findById(id: string): Promise<UserSession | null>;
  
  // Find session by token
  findByToken(token: string): Promise<UserSession | null>;
  
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
  
  // Get user session summary
  getUserSessionSummary(userId: string): Promise<SessionSummary>;
}

interface CreateSessionDto {
  userId: string;
  token: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: DeviceInfo;
  expiresAt: Date;
}

interface UpdateSessionDto {
  isActive?: boolean;
  expiresAt?: Date;
  deviceInfo?: DeviceInfo;
}

interface SessionStatistics {
  total: number;
  active: number;
  expired: number;
  byUser: Record<string, number>;
  byDevice: Record<string, number>;
}

interface SessionSummary {
  userId: string;
  totalSessions: number;
  activeSessions: number;
  devices: string[];
  lastLogin: Date;
}
```

## Service Interfaces

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
  
  // Get users by department
  getUsersByDepartment(department: string, query: UserQueryDto): Promise<PaginatedUserResponse>;
  
  // Search users
  searchUsers(searchTerm: string, query: UserQueryDto): Promise<PaginatedUserResponse>;
  
  // Create user
  createUser(data: CreateUserDto): Promise<UserResponseDto>;
  
  // Update user
  updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto>;
  
  // Delete user
  deleteUser(id: string): Promise<void>;
  
  // Update user profile
  updateUserProfile(id: string, profile: Partial<UserProfile>): Promise<UserResponseDto>;
  
  // Update user preferences
  updateUserPreferences(id: string, preferences: Partial<UserPreferences>): Promise<UserResponseDto>;
  
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
  
  // Get user activity
  getUserActivity(userId: string, query: UserActivityQueryDto): Promise<PaginatedActivityResponse>;
  
  // Get user sessions
  getUserSessions(userId: string): Promise<SessionResponseDto[]>;
  
  // Export users
  exportUsers(query: UserQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Import users
  importUsers(file: Express.Multer.File): Promise<ImportResult>;
  
  // Bulk operations
  bulkActivate(ids: string[]): Promise<BulkOperationResult>;
  bulkDeactivate(ids: string[]): Promise<BulkOperationResult>;
  bulkUpdateRole(ids: string[], role: UserRole): Promise<BulkOperationResult>;
  
  // User analytics
  getUserAnalytics(userId: string, days?: number): Promise<UserAnalytics>;
  getSystemAnalytics(days?: number): Promise<SystemAnalytics>;
}

interface PaginatedUserResponse {
  data: UserResponseDto[];
  pagination: PaginationInfo;
}

interface PaginatedActivityResponse {
  data: UserActivityResponseDto[];
  pagination: PaginationInfo;
}

interface SessionResponseDto {
  id: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: DeviceInfo;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
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

interface UserAnalytics {
  userId: string;
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  sessions: SessionSummary;
  loginFrequency: number;
  averageSessionDuration: number;
  mostActiveHours: number[];
  deviceUsage: Record<string, number>;
}

interface SystemAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: Record<string, number>;
  activityByType: Record<ActivityType, number>;
  topActiveUsers: Array<{ userId: string; activityCount: number }>;
  deviceDistribution: Record<string, number>;
}
```

### UserActivityService
```typescript
interface UserActivityService {
  // Get activity by ID
  getActivityById(id: string): Promise<UserActivityResponseDto>;
  
  // Get activities by user
  getActivitiesByUser(userId: string, query: UserActivityQueryDto): Promise<PaginatedActivityResponse>;
  
  // Get activities by type
  getActivitiesByType(activityType: ActivityType, query: UserActivityQueryDto): Promise<PaginatedActivityResponse>;
  
  // Get activities by date range
  getActivitiesByDateRange(dateFrom: Date, dateTo: Date, query: UserActivityQueryDto): Promise<PaginatedActivityResponse>;
  
  // Search activities
  searchActivities(searchTerm: string, query: UserActivityQueryDto): Promise<PaginatedActivityResponse>;
  
  // Create activity
  createActivity(data: CreateActivityDto): Promise<UserActivityResponseDto>;
  
  // Get activity statistics
  getActivityStatistics(): Promise<ActivityStatistics>;
  
  // Get recent activities
  getRecentActivities(limit?: number): Promise<UserActivityResponseDto[]>;
  
  // Get user activity summary
  getUserActivitySummary(userId: string, days?: number): Promise<ActivitySummary>;
  
  // Export activities
  exportActivities(query: UserActivityQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Clean old activities
  cleanOldActivities(daysOld: number): Promise<void>;
}
```

## Controller Interfaces

### PublicUserController
```typescript
interface PublicUserController {
  // Get current user
  getCurrentUser(
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
  
  // Update current user profile
  updateCurrentUserProfile(
    @Body() profile: Partial<UserProfile>,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
  
  // Update current user preferences
  updateCurrentUserPreferences(
    @Body() preferences: Partial<UserPreferences>,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
  
  // Get current user activity
  getCurrentUserActivity(
    @Query() query: UserActivityQueryDto,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
  
  // Get current user sessions
  getCurrentUserSessions(
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
  
  // Get user activity
  getUserActivity(
    @Param('id') id: string,
    @Query() query: UserActivityQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get user sessions
  getUserSessions(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get user analytics
  getUserAnalytics(
    @Param('id') id: string,
    @Query('days') days?: number,
    @Res() response: Response
  ): Promise<void>;
  
  // Get system analytics
  getSystemAnalytics(
    @Query('days') days?: number,
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
  
  bulkUpdateRole(
    @Body() data: { ids: string[]; role: UserRole },
    @Res() response: Response
  ): Promise<void>;
}
```

## API Endpoints

### Public User Endpoints

#### GET /api/v1/users/me
**Description:** Get current user
**Access:** Authenticated

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "isActive": true,
    "isEmailVerified": true,
    "profile": {
      "avatar": "https://example.com/avatar.jpg",
      "phoneNumber": "+977-1234567890",
      "address": {
        "en": "Kathmandu, Nepal",
        "ne": "काठमाडौं, नेपाल"
      },
      "bio": {
        "en": "System Administrator",
        "ne": "सिस्टम प्रशासक"
      },
      "department": "IT",
      "position": "System Administrator",
      "employeeId": "EMP001"
    },
    "preferences": {
      "language": "en",
      "timezone": "Asia/Kathmandu",
      "dateFormat": "YYYY-MM-DD",
      "timeFormat": "24h",
      "notifications": {
        "email": true,
        "push": true,
        "sms": false
      },
      "theme": "light"
    },
    "lastLoginAt": "2024-01-01T00:00:00Z",
    "lastActivityAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/v1/users/me/profile
**Description:** Update current user profile
**Access:** Authenticated

#### PUT /api/v1/users/me/preferences
**Description:** Update current user preferences
**Access:** Authenticated

#### GET /api/v1/users/me/activity
**Description:** Get current user activity
**Access:** Authenticated

#### GET /api/v1/users/me/sessions
**Description:** Get current user sessions
**Access:** Authenticated

### Admin User Endpoints

#### GET /api/v1/admin/users/{id}
**Description:** Get user by ID (admin)
**Access:** Admin

#### POST /api/v1/admin/users
**Description:** Create user
**Access:** Admin

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "EDITOR",
  "isActive": true,
  "profile": {
    "phoneNumber": "+977-1234567890",
    "department": "Content",
    "position": "Content Editor"
  },
  "preferences": {
    "language": "en",
    "timezone": "Asia/Kathmandu",
    "theme": "light"
  }
}
```

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

#### GET /api/v1/admin/users/{id}/activity
**Description:** Get user activity
**Access:** Admin

#### GET /api/v1/admin/users/{id}/sessions
**Description:** Get user sessions
**Access:** Admin

#### GET /api/v1/admin/users/{id}/analytics
**Description:** Get user analytics
**Access:** Admin

#### GET /api/v1/admin/users/analytics
**Description:** Get system analytics
**Access:** Admin

#### GET /api/v1/admin/users/export
**Description:** Export users
**Access:** Admin

#### POST /api/v1/admin/users/import
**Description:** Import users
**Access:** Admin

#### POST /api/v1/admin/users/bulk-activate
**Description:** Bulk activate users
**Access:** Admin

#### POST /api/v1/admin/users/bulk-deactivate
**Description:** Bulk deactivate users
**Access:** Admin

#### PUT /api/v1/admin/users/bulk-update-role
**Description:** Bulk update user roles
**Access:** Admin

## Business Logic

### 1. User Management
- **Complete user lifecycle** management from creation to deletion
- **Profile management** with comprehensive user information
- **Preference management** for personalized user experience
- **Role-based access control** for security

### 2. Activity Tracking
- **Comprehensive activity logging** for all user actions
- **Activity analytics** for user behavior insights
- **Session management** for security monitoring
- **Performance metrics** for system optimization

### 3. User Analytics
- **User behavior analysis** for insights
- **System usage analytics** for optimization
- **Activity patterns** for security monitoring
- **Performance metrics** for system health

### 4. Security Features
- **Account status management** for security control
- **Session monitoring** for suspicious activity
- **Activity audit trails** for compliance
- **Role-based permissions** for access control

## Error Handling

### User Creation Errors
```json
{
  "success": false,
  "error": {
    "code": "USER_CREATION_ERROR",
    "message": "User creation failed",
    "details": [
      {
        "field": "email",
        "message": "Email already exists",
        "code": "EMAIL_EXISTS"
      }
    ]
  }
}
```

### User Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "User not found",
    "details": []
  }
}
```

## Performance Considerations

### 1. User Data Management
- **Efficient user queries** with proper indexing
- **Caching** for frequently accessed user data
- **Pagination** for large user lists
- **Optimized profile updates** for performance

### 2. Activity Tracking
- **Asynchronous activity logging** for performance
- **Batch processing** for activity data
- **Activity cleanup** for database optimization
- **Caching** for activity analytics

### 3. Analytics Performance
- **Pre-computed analytics** for fast retrieval
- **Analytics caching** for performance
- **Scheduled analytics generation** for efficiency
- **Optimized queries** for large datasets

## Security Considerations

### 1. Data Protection
- **Sensitive data encryption** for user information
- **Access control** for user data
- **Audit logging** for all user operations
- **Data backup** for user information

### 2. Account Security
- **Account status management** for security
- **Session monitoring** for suspicious activity
- **Activity tracking** for security monitoring
- **Role-based permissions** for access control

### 3. Privacy Compliance
- **Data anonymization** for analytics
- **Privacy controls** for user data
- **Consent management** for data processing
- **Data retention** policies for compliance 