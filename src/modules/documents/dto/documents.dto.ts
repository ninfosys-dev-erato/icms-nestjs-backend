import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, ValidateNested, IsNotEmpty, IsUrl, IsDateString, IsObject } from 'class-validator';
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

export enum DocumentType {
  PDF = 'PDF',
  DOC = 'DOC',
  DOCX = 'DOCX',
  XLS = 'XLS',
  XLSX = 'XLSX',
  PPT = 'PPT',
  PPTX = 'PPTX',
  TXT = 'TXT',
  RTF = 'RTF',
  CSV = 'CSV',
  ZIP = 'ZIP',
  RAR = 'RAR',
  OTHER = 'OTHER'
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  EXPIRED = 'EXPIRED'
}

export enum DocumentCategory {
  OFFICIAL = 'OFFICIAL',
  REPORT = 'REPORT',
  FORM = 'FORM',
  POLICY = 'POLICY',
  PROCEDURE = 'PROCEDURE',
  GUIDELINE = 'GUIDELINE',
  NOTICE = 'NOTICE',
  CIRCULAR = 'CIRCULAR',
  OTHER = 'OTHER'
}

// ========================================
// DOCUMENT DTOs
// ========================================

export class CreateDocumentDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  title: TranslatableEntityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  description?: TranslatableEntityDto;

  @ApiProperty({ example: 'document_123.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 'official_document.pdf' })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({ example: 'uploads/documents/document_123.pdf' })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  fileSize: number;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.PDF })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ enum: DocumentCategory, example: DocumentCategory.OFFICIAL })
  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @ApiProperty({ enum: DocumentStatus, example: DocumentStatus.DRAFT })
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @ApiPropertyOptional({ example: 'DOC-2024-001' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({ example: 'v1.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  publishDate?: Date;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  requiresAuth?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  title?: TranslatableEntityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  description?: TranslatableEntityDto;

  @ApiPropertyOptional({ enum: DocumentCategory })
  @IsOptional()
  @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({ example: 'DOC-2024-001' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({ example: 'v1.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  publishDate?: Date;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  requiresAuth?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class DocumentResponseDto {
  @ApiProperty({ example: 'document_id' })
  id: string;

  @ApiProperty()
  title: TranslatableEntityDto;

  @ApiPropertyOptional()
  description?: TranslatableEntityDto;

  @ApiProperty({ example: 'document_123.pdf' })
  fileName: string;

  @ApiProperty({ example: 'official_document.pdf' })
  originalName: string;

  @ApiProperty({ example: 'uploads/documents/document_123.pdf' })
  filePath: string;

  @ApiProperty({ example: 1024000 })
  fileSize: number;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ enum: DocumentType, example: DocumentType.PDF })
  documentType: DocumentType;

  @ApiProperty({ enum: DocumentCategory, example: DocumentCategory.OFFICIAL })
  category: DocumentCategory;

  @ApiProperty({ enum: DocumentStatus, example: DocumentStatus.PUBLISHED })
  status: DocumentStatus;

  @ApiPropertyOptional({ example: 'DOC-2024-001' })
  documentNumber?: string;

  @ApiPropertyOptional({ example: 'v1.0' })
  version?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  publishDate?: Date;

  @ApiPropertyOptional({ example: '2024-12-31' })
  expiryDate?: Date;

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  tags?: string[];

  @ApiProperty({ example: true })
  isPublic: boolean;

  @ApiProperty({ example: true })
  requiresAuth: boolean;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 150 })
  downloadCount: number;

  @ApiProperty({ example: 'https://cdn.example.com/uploads/documents/document_123.pdf' })
  downloadUrl: string;

  @ApiProperty({ example: 'https://cdn.example.com/presigned/document_123.pdf?expires=...' })
  presignedDownloadUrl: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class DocumentQueryDto {
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

  @ApiPropertyOptional({ example: 'official' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'official' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: DocumentType })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({ enum: DocumentCategory })
  @IsOptional()
  @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

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

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ['json', 'csv', 'pdf'], example: 'json' })
  @IsOptional()
  @IsEnum(['json', 'csv', 'pdf'])
  format?: 'json' | 'csv' | 'pdf';
}

// ========================================
// DOCUMENT DOWNLOAD DTOs
// ========================================

export class CreateDocumentDownloadDto {
  @ApiProperty({ example: 'document_id' })
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiPropertyOptional({ example: 'user_id' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  @IsString()
  @IsNotEmpty()
  userAgent: string;
}

export class DocumentDownloadResponseDto {
  @ApiProperty({ example: 'download_id' })
  id: string;

  @ApiProperty({ example: 'document_id' })
  documentId: string;

  @ApiPropertyOptional({ example: 'user_id' })
  userId?: string;

  @ApiProperty({ example: '192.168.1.1' })
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  userAgent: string;

  @ApiProperty()
  downloadedAt: Date;
}

// ========================================
// DOCUMENT VERSION DTOs
// ========================================

export class CreateDocumentVersionDto {
  @ApiProperty({ example: 'document_id' })
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({ example: 'v2.0' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ example: 'document_v2.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 'uploads/documents/document_v2.pdf' })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  fileSize: number;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  changeLog?: TranslatableEntityDto;
}

export class DocumentVersionResponseDto {
  @ApiProperty({ example: 'version_id' })
  id: string;

  @ApiProperty({ example: 'document_id' })
  documentId: string;

  @ApiProperty({ example: 'v2.0' })
  version: string;

  @ApiProperty({ example: 'document_v2.pdf' })
  fileName: string;

  @ApiProperty({ example: 'uploads/documents/document_v2.pdf' })
  filePath: string;

  @ApiProperty({ example: 1024000 })
  fileSize: number;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiPropertyOptional()
  changeLog?: TranslatableEntityDto;

  @ApiProperty()
  createdAt: Date;
}

// ========================================
// STATISTICS DTOs
// ========================================

export class DocumentStatistics {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 80 })
  published: number;

  @ApiProperty({ example: 15 })
  draft: number;

  @ApiProperty({ example: 5 })
  archived: number;

  @ApiProperty({ example: { PDF: 50, DOCX: 30, XLSX: 20 } })
  byType: Record<DocumentType, number>;

  @ApiProperty({ example: { OFFICIAL: 40, REPORT: 30, POLICY: 20, OTHER: 10 } })
  byCategory: Record<DocumentCategory, number>;

  @ApiProperty({ example: 15000 })
  totalDownloads: number;

  @ApiProperty({ example: 150 })
  averageDownloadsPerDocument: number;

  @ApiProperty({ example: 1024000000 })
  totalSize: number;

  @ApiProperty({ example: 10240000 })
  averageSize: number;
}

export class DocumentAnalytics {
  @ApiProperty({ example: 'document_id' })
  documentId: string;

  @ApiProperty({ example: 'Official Document' })
  documentTitle: string;

  @ApiProperty({ example: 150 })
  totalDownloads: number;

  @ApiProperty({ example: { '2024-01-01': 10, '2024-01-02': 15 } })
  downloadsByDate: Record<string, number>;

  @ApiProperty({ example: { 'Chrome': 60, 'Firefox': 30, 'Safari': 10 } })
  downloadsByBrowser: Record<string, number>;

  @ApiProperty({ example: { 'Desktop': 70, 'Mobile': 25, 'Tablet': 5 } })
  downloadsByDevice: Record<string, number>;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  topDownloaders: Array<{ userId: string; count: number }>;
}

// ========================================
// COMMON DTOs
// ========================================

export class ValidationError {
  @ApiProperty({ example: 'title' })
  field: string;

  @ApiProperty({ example: 'Title is required' })
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

export class BulkOperationDto {
  @ApiProperty({ example: ['document_id_1', 'document_id_2'] })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

export class BulkUpdateDto {
  @ApiProperty({ example: ['document_id_1', 'document_id_2'] })
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => UpdateDocumentDto)
  updates: Partial<UpdateDocumentDto>;
}

// Alternative DTO for bulk update that doesn't use nested validation
export class BulkUpdateRequestDto {
  @ApiProperty({ example: ['document_id_1', 'document_id_2'] })
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({ 
    example: { 
      category: 'POLICY', 
      status: 'PUBLISHED', 
      isPublic: true 
    },
    description: 'Update fields for documents'
  })
  @IsObject()
  updates: Record<string, any>;
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