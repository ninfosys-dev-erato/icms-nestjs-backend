import { IsEmail, IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

// ========================================
// USER MANAGEMENT DTOs
// ========================================

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ enum: ['ADMIN', 'EDITOR', 'VIEWER'], example: 'VIEWER' })
  @IsEnum(['ADMIN', 'EDITOR', 'VIEWER'])
  role: UserRole;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'EDITOR', 'VIEWER'] })
  @IsOptional()
  @IsEnum(['ADMIN', 'EDITOR', 'VIEWER'])
  role?: UserRole;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

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

// ========================================
// BULK OPERATIONS DTOs
// ========================================

export class BulkOperationDto {
  @ApiProperty({ example: ['user_id_1', 'user_id_2'] })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

export class BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

// ========================================
// IMPORT/EXPORT DTOs
// ========================================

export class ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export class ExportFormatDto {
  @ApiPropertyOptional({ enum: ['json', 'csv', 'pdf'], example: 'json' })
  @IsOptional()
  @IsEnum(['json', 'csv', 'pdf'])
  format?: 'json' | 'csv' | 'pdf';
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
  recentRegistrations: number;
  recentLogins: number;
}

export class UserActivityDto {
  @ApiProperty({ example: 'user_id' })
  userId: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'LOGIN' })
  action: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  timestamp: Date;

  @ApiProperty({ example: '192.168.1.1' })
  ipAddress: string;
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

// ========================================
// USER PROFILE DTOs
// ========================================

export class UserProfileDto {
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

  // Additional profile fields
  @ApiPropertyOptional({ example: 'John Doe' })
  fullName?: string;

  @ApiPropertyOptional({ example: 'john.doe' })
  username?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class EmailVerificationDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isEmailVerified: boolean;
} 