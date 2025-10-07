import { IsString, IsOptional, IsEnum, ValidateNested, IsNotEmpty } from 'class-validator';
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

export enum OfficeDescriptionType {
  INTRODUCTION = 'INTRODUCTION',
  OBJECTIVE = 'OBJECTIVE',
  WORK_DETAILS = 'WORK_DETAILS',
  ORGANIZATIONAL_STRUCTURE = 'ORGANIZATIONAL_STRUCTURE',
  DIGITAL_CHARTER = 'DIGITAL_CHARTER',
  EMPLOYEE_SANCTIONS = 'EMPLOYEE_SANCTIONS',
}

// ========================================
// CREATE DTOs
// ========================================

export class CreateOfficeDescriptionDto {
  @ApiProperty({ enum: OfficeDescriptionType, example: OfficeDescriptionType.INTRODUCTION })
  @IsEnum(OfficeDescriptionType)
  officeDescriptionType: OfficeDescriptionType;

  @ApiProperty({ type: TranslatableEntityDto })
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  content: TranslatableEntityDto;
}

// ========================================
// UPDATE DTOs
// ========================================

export class UpdateOfficeDescriptionDto {
  @ApiPropertyOptional({ enum: OfficeDescriptionType })
  @IsOptional()
  @IsEnum(OfficeDescriptionType)
  officeDescriptionType?: OfficeDescriptionType;

  @ApiPropertyOptional({ type: TranslatableEntityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  content?: TranslatableEntityDto;
}

// ========================================
// RESPONSE DTOs
// ========================================

export class OfficeDescriptionResponseDto {
  @ApiProperty({ example: 'description-id' })
  id: string;

  @ApiProperty({ enum: OfficeDescriptionType, example: OfficeDescriptionType.INTRODUCTION })
  officeDescriptionType: OfficeDescriptionType;

  @ApiProperty({ type: TranslatableEntityDto })
  content: TranslatableEntityDto;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;
}

// ========================================
// QUERY DTOs
// ========================================

export class OfficeDescriptionQueryDto {
  @ApiPropertyOptional({ enum: OfficeDescriptionType })
  @IsOptional()
  @IsEnum(OfficeDescriptionType)
  type?: OfficeDescriptionType;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  lang?: string;
}

// ========================================
// BULK OPERATIONS DTOs
// ========================================

export class BulkCreateOfficeDescriptionDto {
  @ApiProperty({ type: [CreateOfficeDescriptionDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateOfficeDescriptionDto)
  descriptions: CreateOfficeDescriptionDto[];
}

export class BulkUpdateOfficeDescriptionDto {
  @ApiProperty({ example: [{ id: 'description-id', content: { en: 'Updated text', ne: 'अपडेटेड पाठ' } }] })
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateItemDto)
  descriptions: BulkUpdateItemDto[];
}

export class BulkUpdateItemDto {
  @ApiProperty({ example: 'description-id' })
  @IsString()
  id: string;

  @ApiPropertyOptional({ type: TranslatableEntityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  content?: TranslatableEntityDto;
}

// ========================================
// STATISTICS DTOs
// ========================================

export class OfficeDescriptionStatistics {
  @ApiProperty({ example: 6 })
  total: number;

  @ApiProperty({ example: { INTRODUCTION: 1, OBJECTIVE: 1, WORK_DETAILS: 1 } })
  byType: Record<OfficeDescriptionType, number>;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  lastUpdated: Date;
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

// ========================================
// IMPORT/EXPORT DTOs
// ========================================

export class ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export class ExportResult {
  data: OfficeDescriptionResponseDto[];
  total: number;
  exportedAt: Date;
} 