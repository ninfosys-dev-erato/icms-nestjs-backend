import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsNotEmpty, IsEmail, IsUrl, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========================================
// COMMON TYPES
// ========================================

export class TranslatableEntityDto {
  @ApiProperty({ example: 'English text' })
  @IsString()
  @IsNotEmpty()
  en: string;

  @ApiProperty({ example: 'नेपाली पाठ' })
  @IsString()
  @IsNotEmpty()
  ne: string;
}

// ========================================
// DEPARTMENT DTOs
// ========================================

export class CreateDepartmentDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  departmentName: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 'parent_department_id' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: 'department_head_user_id' })
  @IsOptional()
  @IsString()
  departmentHeadId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  departmentName?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 'parent_department_id' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: 'department_head_user_id' })
  @IsOptional()
  @IsString()
  departmentHeadId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class DepartmentResponseDto {
  @ApiProperty({ example: 'department_id' })
  id: string;

  @ApiProperty()
  departmentName: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 'parent_department_id' })
  parentId?: string;

  @ApiPropertyOptional({ example: 'department_head_user_id' })
  departmentHeadId?: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional()
  parent?: DepartmentResponseDto;

  @ApiPropertyOptional({ type: [DepartmentResponseDto] })
  children?: DepartmentResponseDto[];

  @ApiPropertyOptional({ type: [Object] })
  employees?: any[];

  @ApiPropertyOptional()
  departmentHead?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// ========================================
// EMPLOYEE DTOs
// ========================================

export class CreateEmployeeDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  name: TranslatableEntityDto;

  @ApiProperty({ example: 'department_id' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  position: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: '+977-9841234567' })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ example: '+977-1-1234567' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ example: 'employee@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Room 101' })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({ example: 'media_id' })
  @IsOptional()
  @IsString()
  photoMediaId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Show in top section of homepage' })
  @IsOptional()
  @IsBoolean()
  showUpInHomepage?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Show in bottom section of homepage' })
  @IsOptional()
  @IsBoolean()
  showDownInHomepage?: boolean;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  name?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 'department_id' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  position?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: '+977-9841234567' })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiPropertyOptional({ example: '+977-1-1234567' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ example: 'employee@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Room 101' })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({ example: 'media_id' })
  @IsOptional()
  @IsString()
  photoMediaId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Show in top section of homepage' })
  @IsOptional()
  @IsBoolean()
  showUpInHomepage?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Show in bottom section of homepage' })
  @IsOptional()
  @IsBoolean()
  showDownInHomepage?: boolean;
}

export class EmployeeResponseDto {
  @ApiProperty({ example: 'employee_id' })
  id: string;

  @ApiProperty()
  name: TranslatableEntityDto;

  @ApiProperty({ example: 'department_id' })
  departmentId: string;

  @ApiProperty()
  position: TranslatableEntityDto;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiPropertyOptional({ example: '+977-9841234567' })
  mobileNumber?: string;

  @ApiPropertyOptional({ example: '+977-1-1234567' })
  telephone?: string;

  @ApiPropertyOptional({ example: 'employee@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'Room 101' })
  roomNumber?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: 'media_id' })
  photoMediaId?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  photo?: any;

  @ApiPropertyOptional()
  department?: DepartmentResponseDto;

  @ApiProperty({ example: false, description: 'Show in top section of homepage' })
  showUpInHomepage: boolean;

  @ApiProperty({ example: false, description: 'Show in bottom section of homepage' })
  showDownInHomepage: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// ========================================
// QUERY DTOs
// ========================================

export class DepartmentQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'IT' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'parent_department_id' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: Date;
}

export class EmployeeQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'department_id' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  locale?: 'en' | 'ne';

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiPropertyOptional({ example: true, description: 'Filter by show up in homepage' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  showUpInHomepage?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Filter by show down in homepage' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  showDownInHomepage?: boolean;
}

// ========================================
// STATISTICS DTOs
// ========================================

export class HRStatistics {
  @ApiProperty({ example: 10 })
  totalDepartments: number;

  @ApiProperty({ example: 8 })
  activeDepartments: number;

  @ApiProperty({ example: 50 })
  totalEmployees: number;

  @ApiProperty({ example: 45 })
  activeEmployees: number;

  @ApiProperty({ example: { 'IT': 15, 'HR': 8, 'Finance': 12 } })
  employeesByDepartment: Record<string, number>;

  @ApiProperty({ example: 5 })
  departmentsWithHead: number;

  @ApiProperty({ example: 3 })
  departmentsWithoutHead: number;
}

export class DepartmentAnalytics {
  @ApiProperty({ example: 'department_id' })
  departmentId: string;

  @ApiProperty({ example: 'IT Department' })
  departmentName: string;

  @ApiProperty({ example: 15 })
  totalEmployees: number;

  @ApiProperty({ example: 12 })
  activeEmployees: number;

  @ApiProperty({ example: 3 })
  inactiveEmployees: number;

  @ApiProperty({ example: 80.0 })
  activePercentage: number;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  employeePositions: Array<{ position: string; count: number }>;

  @ApiProperty({ example: { '2024-01-01': 2, '2024-01-02': 1 } })
  employeesByDate: Record<string, number>;
}

// ========================================
// COMMON DTOs
// ========================================

export class ValidationError {
  @ApiProperty({ example: 'departmentName' })
  field: string;

  @ApiProperty({ example: 'Department name is required' })
  message: string;

  @ApiProperty({ example: 'REQUIRED_FIELD' })
  code: string;
}

export class ValidationResult {
  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ type: [ValidationError] })
  errors: ValidationError[];
}

export class BulkOperationResult {
  @ApiProperty({ example: 5 })
  success: number;

  @ApiProperty({ example: 1 })
  failed: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}

export class ImportResult {
  @ApiProperty({ example: 10 })
  success: number;

  @ApiProperty({ example: 2 })
  failed: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}

export class PaginationInfo {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

// ========================================
// PHOTO UPLOAD DTOs
// ========================================

export class EmployeePhotoUploadDto {
  @ApiProperty({ example: 'employee_id' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;
}

export class EmployeePhotoUploadResponseDto extends EmployeeResponseDto {
  @ApiProperty({ example: 'https://f003.backblazeb2.com/file/iCMS-bucket/employees/...' })
  photoUrl: string;
}

export class CreateEmployeeWithPhotoDto extends CreateEmployeeDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  photo?: Express.Multer.File;
}

export class BulkPhotoOperationDto {
  @ApiProperty({ type: [String], example: ['emp1', 'emp2', 'emp3'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  employeeIds: string[];
}

export class PhotoValidationResult {
  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ example: 'File type not supported' })
  message?: string;

  @ApiProperty({ example: 'INVALID_FILE_TYPE' })
  code?: string;
}

// ========================================
// HOMEPAGE DTOs
// ========================================

export class HomepageEmployeeDto {
  @ApiProperty({ example: 'employee_id' })
  id: string;

  @ApiProperty()
  name: TranslatableEntityDto;

  @ApiProperty()
  position: TranslatableEntityDto;

  @ApiProperty()
  department: DepartmentResponseDto;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiPropertyOptional({ example: 'media_id' })
  photoMediaId?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  photo?: any;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  presignedUrl?: string;

  @ApiProperty({ example: true })
  showUpInHomepage: boolean;

  @ApiProperty({ example: false })
  showDownInHomepage: boolean;
}

export class HomepageResponseDto {
  @ApiProperty({ type: [HomepageEmployeeDto], description: 'Employees to show in top section' })
  upSection: HomepageEmployeeDto[];

  @ApiProperty({ type: [HomepageEmployeeDto], description: 'Employees to show in bottom section' })
  downSection: HomepageEmployeeDto[];

  @ApiProperty({ example: 5, description: 'Total employees in top section' })
  upSectionCount: number;

  @ApiProperty({ example: 3, description: 'Total employees in bottom section' })
  downSectionCount: number;
} 