import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========================================
// COMMON TYPES
// ========================================

export class TranslatableEntity {
  @ApiProperty({ example: 'English text' })
  @IsString()
  en: string;

  @ApiProperty({ example: 'नेपाली पाठ' })
  @IsString()
  ne: string;
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// ========================================
// CATEGORY DTOs
// ========================================

export class CreateCategoryDto {
  @ApiProperty({ type: TranslatableEntity })
  @ValidateNested()
  @Type(() => TranslatableEntity)
  name: TranslatableEntity;

  @ApiPropertyOptional({ type: TranslatableEntity })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntity)
  description?: TranslatableEntity;

  @ApiPropertyOptional({ example: 'legal-documents' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'parent-category-id' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ type: TranslatableEntity })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntity)
  name?: TranslatableEntity;

  @ApiPropertyOptional({ type: TranslatableEntity })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntity)
  description?: TranslatableEntity;

  @ApiPropertyOptional({ example: 'legal-documents' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'parent-category-id' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CategoryResponseDto {
  @ApiProperty({ example: 'category-id' })
  id: string;

  @ApiProperty({ type: TranslatableEntity })
  name: TranslatableEntity;

  @ApiPropertyOptional({ type: TranslatableEntity })
  description?: TranslatableEntity;

  @ApiProperty({ example: 'legal-documents' })
  slug: string;

  @ApiPropertyOptional({ example: 'parent-category-id' })
  parentId?: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ type: [CategoryResponseDto] })
  children: CategoryResponseDto[];

  @ApiProperty({ example: 15 })
  contentCount: number;
}

// ========================================
// CONTENT ATTACHMENT DTOs
// ========================================

export class ContentAttachmentResponseDto {
  @ApiProperty({ example: 'attachment-id' })
  id: string;

  @ApiProperty({ example: 'content-id' })
  contentId: string;

  @ApiProperty({ example: 'document.pdf' })
  fileName: string;

  @ApiProperty({ example: 'uploads/documents/document.pdf' })
  filePath: string;

  @ApiProperty({ example: 1024000 })
  fileSize: number;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: 'https://example.com/download/attachment-id' })
  downloadUrl: string;

  @ApiPropertyOptional({ 
    example: 'https://f003.backblazeb2.com/file/iCMS-bucket/...?Authorization=...',
    description: 'Backblaze B2 presigned URL for direct file access (may be null if generation fails)'
  })
  presignedUrl?: string | null;
}

// ========================================
// CONTENT DTOs
// ========================================

export class CreateContentDto {
  @ApiProperty({ type: TranslatableEntity })
  @ValidateNested()
  @Type(() => TranslatableEntity)
  title: TranslatableEntity;

  @ApiProperty({ type: TranslatableEntity })
  @ValidateNested()
  @Type(() => TranslatableEntity)
  content: TranslatableEntity;

  @ApiPropertyOptional({ type: TranslatableEntity })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntity)
  excerpt?: TranslatableEntity;

  @ApiPropertyOptional({ example: 'new-policy-announcement' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'category-id' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ enum: ContentStatus, example: ContentStatus.DRAFT })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateContentDto {
  @ApiPropertyOptional({ type: TranslatableEntity })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntity)
  title?: TranslatableEntity;

  @ApiPropertyOptional({ type: TranslatableEntity })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntity)
  content?: TranslatableEntity;

  @ApiPropertyOptional({ type: TranslatableEntity })
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntity)
  excerpt?: TranslatableEntity;

  @ApiPropertyOptional({ example: 'new-policy-announcement' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'category-id' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class ContentResponseDto {
  @ApiProperty({ example: 'content-id' })
  id: string;

  @ApiProperty({ type: TranslatableEntity })
  title: TranslatableEntity;

  @ApiProperty({ type: TranslatableEntity })
  content: TranslatableEntity;

  @ApiPropertyOptional({ type: TranslatableEntity })
  excerpt?: TranslatableEntity;

  @ApiProperty({ example: 'new-policy-announcement' })
  slug: string;

  @ApiProperty({ example: 'category-id' })
  categoryId: string;

  @ApiProperty({ enum: ContentStatus, example: ContentStatus.PUBLISHED })
  status: ContentStatus;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
  publishedAt?: Date;

  @ApiProperty({ example: false })
  featured: boolean;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ type: CategoryResponseDto })
  category: CategoryResponseDto;

  @ApiProperty({ type: [ContentAttachmentResponseDto] })
  attachments: ContentAttachmentResponseDto[];

  @ApiProperty({ example: { id: 'user-id', email: 'user@example.com' } })
  createdBy: any;

  @ApiProperty({ example: { id: 'user-id', email: 'user@example.com' } })
  updatedBy: any;
}

export class ContentQueryDto {
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

  @ApiPropertyOptional({ example: 'policy' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'category-id' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}

export class CreateAttachmentDto {
  @ApiProperty({ example: 'content-id' })
  @IsString()
  contentId: string;

  @ApiPropertyOptional({ example: 'document.pdf' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ example: 'uploads/documents/document.pdf' })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiPropertyOptional({ example: 1024000 })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateAttachmentDto {
  @ApiPropertyOptional({ example: 'document.pdf' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;
}

// ========================================
// STATISTICS DTOs
// ========================================

export class CategoryStatistics {
  total: number;
  active: number;
  withContent: number;
  averageContentPerCategory: number;
}

export class ContentStatistics {
  total: number;
  published: number;
  draft: number;
  archived: number;
  featured: number;
}

export class AttachmentStatistics {
  total: number;
  totalSize: number;
  byType: Record<string, number>;
}

// ========================================
// PAGINATION DTOs
// ========================================

export class PaginatedContentResult {
  data: ContentResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class PaginatedContentResponse {
  data: ContentResponseDto[];
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

export class DownloadResult {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

// ========================================
// REORDER DTOs
// ========================================

export class ReorderDto {
  @ApiProperty({ example: [{ id: 'item-id', order: 1 }] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  orders: ReorderItemDto[];
}

export class ReorderItemDto {
  @ApiProperty({ example: 'item-id' })
  @IsString()
  id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;
} 