import { IsString, IsOptional, IsBoolean, IsNumber, ValidateNested, IsNotEmpty, IsUrl, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========================================
// COMMON TYPES
// ========================================

export class TranslatableEntityDto {
  @ApiProperty({ example: 'Important Link Title' })
  @IsString()
  @IsNotEmpty()
  en: string;

  @ApiProperty({ example: 'महत्वपूर्ण लिङ्क शीर्षक' })
  @IsString()
  @IsNotEmpty()
  ne: string;
}

// ========================================
// CREATE DTOs
// ========================================

export class CreateImportantLinkDto {
  @ApiProperty({ type: TranslatableEntityDto })
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  linkTitle: TranslatableEntityDto;

  @ApiProperty({ example: 'https://example.gov.np' })
  @IsString()
  @IsUrl()
  linkUrl: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ========================================
// UPDATE DTOs
// ========================================

export class UpdateImportantLinkDto {
  @ApiPropertyOptional({ type: TranslatableEntityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  linkTitle?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 'https://example.gov.np' })
  @IsOptional()
  @IsString()
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ========================================
// RESPONSE DTOs
// ========================================

export class ImportantLinkResponseDto {
  @ApiProperty({ example: 'link-id' })
  id: string;

  @ApiProperty({ type: TranslatableEntityDto })
  linkTitle: TranslatableEntityDto;

  @ApiProperty({ example: 'https://example.gov.np' })
  linkUrl: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;
}

// ========================================
// QUERY DTOs
// ========================================

export class ImportantLinksQueryDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  lang?: string;

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
}

// ========================================
// BULK OPERATIONS DTOs
// ========================================

export class BulkCreateImportantLinksDto {
  @ApiProperty({ type: [CreateImportantLinkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImportantLinkDto)
  links: CreateImportantLinkDto[];
}

export class BulkUpdateImportantLinkItemDto {
  @ApiProperty({ example: 'link-id' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({ type: TranslatableEntityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  linkTitle?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 'https://example.gov.np' })
  @IsOptional()
  @IsString()
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BulkUpdateImportantLinksDto {
  @ApiProperty({ example: [{ id: 'link-id', order: 1 }] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateImportantLinkItemDto)
  links: BulkUpdateImportantLinkItemDto[];
}

// ========================================
// REORDER DTOs
// ========================================

export class ReorderImportantLinksDto {
  @ApiProperty({ example: [{ id: 'link-id', order: 1 }] })
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  orders: ReorderItemDto[];
}

export class ReorderItemDto {
  @ApiProperty({ example: 'link-id' })
  @IsString()
  id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;
}

// ========================================
// STATISTICS DTOs
// ========================================

export class ImportantLinksStatistics {
  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 20 })
  active: number;

  @ApiProperty({ example: 5 })
  inactive: number;

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
  data: ImportantLinkResponseDto[];
  total: number;
  exportedAt: Date;
}

// ========================================
// FOOTER DTOs
// ========================================

export class FooterLinksDto {
  @ApiProperty({ type: [ImportantLinkResponseDto] })
  quickLinks: ImportantLinkResponseDto[];

  @ApiProperty({ type: [ImportantLinkResponseDto] })
  governmentLinks: ImportantLinkResponseDto[];

  @ApiProperty({ type: [ImportantLinkResponseDto] })
  socialMediaLinks: ImportantLinkResponseDto[];

  @ApiProperty({ type: [ImportantLinkResponseDto] })
  contactLinks: ImportantLinkResponseDto[];
}

 