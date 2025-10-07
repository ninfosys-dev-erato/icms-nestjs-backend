import { IsString, IsOptional, IsBoolean, IsNumber, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========================================
// COMMON TYPES
// ========================================

export class TranslatableEntityDto {
  @ApiProperty({ example: 'What are the office hours?' })
  @IsString()
  @IsNotEmpty()
  en: string;

  @ApiProperty({ example: 'कार्यालयको समय के हो?' })
  @IsString()
  @IsNotEmpty()
  ne: string;
}

// ========================================
// CREATE DTOs
// ========================================

export class CreateFAQDto {
  @ApiProperty({ type: TranslatableEntityDto })
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  question: TranslatableEntityDto;

  @ApiProperty({ type: TranslatableEntityDto })
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  answer: TranslatableEntityDto;

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

export class UpdateFAQDto {
  @ApiPropertyOptional({ type: TranslatableEntityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  question?: TranslatableEntityDto;

  @ApiPropertyOptional({ type: TranslatableEntityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  answer?: TranslatableEntityDto;

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

export class FAQResponseDto {
  @ApiProperty({ example: 'faq-id' })
  id: string;

  @ApiProperty({ type: TranslatableEntityDto })
  question: TranslatableEntityDto;

  @ApiProperty({ type: TranslatableEntityDto })
  answer: TranslatableEntityDto;

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

export class FAQQueryDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  lang?: string;

  @ApiPropertyOptional({ example: 'office hours' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  limit?: number;
}

// ========================================
// BULK OPERATIONS DTOs
// ========================================

export class BulkCreateFAQDto {
  @ApiProperty({ type: [CreateFAQDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateFAQDto)
  faqs: CreateFAQDto[];
}

export class BulkUpdateFAQDto {
  @ApiProperty({ example: [{ id: 'faq-id', question: { en: 'Updated question', ne: 'अपडेटेड प्रश्न' } }] })
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateItemDto)
  faqs: BulkUpdateItemDto[];
}

export class BulkUpdateItemDto {
  @ApiProperty({ example: 'faq-id' })
  @IsString()
  id: string;

  @ApiPropertyOptional({ type: TranslatableEntityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  question?: TranslatableEntityDto;

  @ApiPropertyOptional({ type: TranslatableEntityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  answer?: TranslatableEntityDto;

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
// REORDER DTOs
// ========================================

export class ReorderFAQDto {
  @ApiProperty({ example: [{ id: 'faq-id', order: 1 }] })
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  orders: ReorderItemDto[];
}

export class ReorderItemDto {
  @ApiProperty({ example: 'faq-id' })
  @IsString()
  id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;
}

// ========================================
// STATISTICS DTOs
// ========================================

export class FAQStatistics {
  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 45 })
  active: number;

  @ApiProperty({ example: 5 })
  inactive: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  lastUpdated: Date;
}

// ========================================
// SEARCH DTOs
// ========================================

export class FAQSearchResult {
  @ApiProperty({ type: [FAQResponseDto] })
  data: FAQResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 'office hours' })
  searchTerm: string;

  @ApiProperty({ example: 0.85 })
  relevanceScore: number;
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
  data: FAQResponseDto[];
  total: number;
  exportedAt: Date;
}

// ========================================
// CATEGORY DTOs (Future Enhancement)
// ========================================

export class FAQCategoryDto {
  @ApiProperty({ example: 'general' })
  id: string;

  @ApiProperty({ type: TranslatableEntityDto })
  name: TranslatableEntityDto;

  @ApiProperty({ example: 10 })
  faqCount: number;
}

export class FAQWithCategoryDto extends FAQResponseDto {
  @ApiPropertyOptional({ type: FAQCategoryDto })
  category?: FAQCategoryDto;
} 