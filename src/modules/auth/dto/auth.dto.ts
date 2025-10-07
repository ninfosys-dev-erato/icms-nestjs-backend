import { IsEmail, IsString, IsOptional, IsBoolean, IsEnum, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

// ========================================
// AUTHENTICATION DTOs
// ========================================

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  confirmPassword: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'EDITOR', 'VIEWER'], example: 'VIEWER' })
  @IsOptional()
  @IsEnum(['ADMIN', 'EDITOR', 'VIEWER'])
  role?: UserRole;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token_here' })
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset_token_here' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  confirmPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentpassword123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  confirmPassword: string;
}

// ========================================
// RESPONSE DTOs
// ========================================

export class UserResponseDto {
  @ApiProperty({ example: 'user_id' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ enum: ['ADMIN', 'EDITOR', 'VIEWER'], example: 'ADMIN' })
  role: UserRole;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: true })
  isEmailVerified: boolean;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
  lastLoginAt?: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty()
  user: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'refresh_token_here' })
  refreshToken: string;

  @ApiProperty({ example: 3600 })
  expiresIn: number;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;
}

export class SessionResponseDto {
  @ApiProperty({ example: 'session_id' })
  id: string;

  @ApiProperty({ example: '192.168.1.1' })
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  userAgent: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  expiresAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;
}

export class AuditLogResponseDto {
  @ApiProperty({ example: 'log_id' })
  id: string;

  @ApiPropertyOptional()
  user?: UserResponseDto;

  @ApiProperty({ example: 'LOGIN' })
  action: string;

  @ApiProperty({ example: 'AUTH' })
  resource: string;

  @ApiPropertyOptional({ example: 'user_id' })
  resourceId?: string;

  @ApiProperty({ example: { ipAddress: '192.168.1.1' } })
  details: Record<string, any>;

  @ApiProperty({ example: '192.168.1.1' })
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  userAgent: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;
}

// ========================================
// QUERY DTOs
// ========================================

export class UserQueryDto {
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  limit?: number;

  @ApiPropertyOptional({ example: 'john' })
  search?: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'EDITOR', 'VIEWER'] })
  role?: UserRole;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ example: 'createdAt' })
  sort?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc' })
  order?: 'asc' | 'desc';
}

export class AuditLogQueryDto {
  @ApiPropertyOptional({ example: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  limit?: number;

  @ApiPropertyOptional({ example: 'user_id' })
  userId?: string;

  @ApiPropertyOptional({ example: 'LOGIN' })
  action?: string;

  @ApiPropertyOptional({ example: 'AUTH' })
  resource?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
  dateFrom?: Date;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
  dateTo?: Date;

  @ApiPropertyOptional({ example: 'createdAt' })
  sort?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc' })
  order?: 'asc' | 'desc';
}

// ========================================
// INTERNAL DTOs
// ========================================

export class CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
}

export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  emailVerificationToken?: string;
}

export class CreateSessionDto {
  userId: string;
  token: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
}

export class UpdateSessionDto {
  isActive?: boolean;
  expiresAt?: Date;
  token?: string;
  refreshToken?: string;
}

export class CreateLoginAttemptDto {
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
}

export class CreateAuditLogDto {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

// ========================================
// STATISTICS DTOs
// ========================================

export class UserStatistics {
  total: number;
  active: number;
  byRole: Record<UserRole, number>;
  verified: number;
  unverified: number;
}

export class SessionStatistics {
  total: number;
  active: number;
  expired: number;
  byUser: Record<string, number>;
}

export class LoginAttemptStatistics {
  total: number;
  successful: number;
  failed: number;
  byEmail: Record<string, number>;
  byIP: Record<string, number>;
}

export class AuditLogStatistics {
  total: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byUser: Record<string, number>;
  byDate: Record<string, number>;
}

// ========================================
// VALIDATION DTOs
// ========================================

export class ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationError {
  field: string;
  message: string;
  code: string;
}

export class PaginatedUserResult {
  data: UserResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class PaginatedAuditLogResult {
  data: AuditLogResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} 