import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, ValidateNested, IsNotEmpty, IsUrl } from 'class-validator';
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

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT'
}

// ========================================
// MEDIA DTOs
// ========================================

export class CreateMediaDto {
  @ApiProperty({ example: 'image_123.jpg' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 'office_photo.jpg' })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({ example: 'uploads/images/image_123.jpg' })
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty({ example: 1024000 })
  @IsNumber()
  fileSize: number;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ enum: MediaType, example: MediaType.IMAGE })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  altText?: TranslatableEntityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  caption?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 1920 })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ example: 1080 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMediaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  altText?: TranslatableEntityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  caption?: TranslatableEntityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class MediaResponseDto {
  @ApiProperty({ example: 'media_id' })
  id: string;

  @ApiProperty({ example: 'image_123.jpg' })
  fileName: string;

  @ApiProperty({ example: 'office_photo.jpg' })
  originalName: string;

  @ApiProperty({ example: 'uploads/images/image_123.jpg' })
  filePath: string;

  @ApiProperty({ example: 1024000 })
  fileSize: number;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ enum: MediaType, example: MediaType.IMAGE })
  mediaType: MediaType;

  @ApiPropertyOptional()
  altText?: TranslatableEntityDto;

  @ApiPropertyOptional()
  caption?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 1920 })
  width?: number;

  @ApiPropertyOptional({ example: 1080 })
  height?: number;

  @ApiPropertyOptional({ example: 120 })
  duration?: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 'https://cdn.example.com/uploads/images/image_123.jpg' })
  url: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/uploads/images/thumbnails/image_123.jpg' })
  thumbnailUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: 'array', items: { $ref: '#/components/schemas/MediaAlbumResponseDto' } })
  albums: any[];
}

export class MediaQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'office' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @ApiPropertyOptional({ example: 'album_id' })
  @IsOptional()
  @IsString()
  albumId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
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
}

export class BulkCreateMediaDto {
  @ApiProperty({ type: [CreateMediaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media: CreateMediaDto[];
}

export class BulkUpdateMediaDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty()
  @ValidateNested()
  @Type(() => UpdateMediaDto)
  updates: UpdateMediaDto;
}

export class MediaStatistics {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: { IMAGE: 50, VIDEO: 30, AUDIO: 15, DOCUMENT: 5 } })
  byType: Record<MediaType, number>;

  @ApiProperty({ example: 1024000000 })
  totalSize: number;

  @ApiProperty({ example: 10240000 })
  averageSize: number;
}

export class ResizeOptions {
  @ApiPropertyOptional({ example: 800 })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ example: 600 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  quality?: number;
}

export class WatermarkOptions {
  @ApiPropertyOptional({ example: 'Watermark Text' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ example: 'bottom-right' })
  @IsOptional()
  @IsString()
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export class MediaProcessingOptions {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ResizeOptions)
  resize?: ResizeOptions;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  optimize?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  generateThumbnail?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => WatermarkOptions)
  watermark?: WatermarkOptions;
}

// ========================================
// MEDIA ALBUM DTOs
// ========================================

export class CreateMediaAlbumDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  name: TranslatableEntityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  description?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMediaAlbumDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  name?: TranslatableEntityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  description?: TranslatableEntityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class MediaAlbumResponseDto {
  @ApiProperty({ example: 'album_id' })
  id: string;

  @ApiProperty()
  name: TranslatableEntityDto;

  @ApiPropertyOptional()
  description?: TranslatableEntityDto;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ example: 10 })
  mediaCount: number;

  @ApiProperty({ type: [MediaResponseDto] })
  media: any[];
}

export class AlbumStatistics {
  @ApiProperty({ example: 20 })
  total: number;

  @ApiProperty({ example: 15 })
  active: number;

  @ApiProperty({ example: 18 })
  withMedia: number;

  @ApiProperty({ example: 5.5 })
  averageMediaPerAlbum: number;
}

// ========================================
// S3 DTOs
// ========================================

export class UploadResult {
  @ApiProperty({ example: 'uploads/images/image_123.jpg' })
  key: string;

  @ApiProperty({ example: 'https://cdn.example.com/uploads/images/image_123.jpg' })
  url: string;

  @ApiProperty({ example: 1024000 })
  size: number;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 'etag123' })
  etag: string;
}

export class FileMetadata {
  @ApiProperty({ example: 1024000 })
  size: number;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty()
  lastModified: Date;

  @ApiProperty({ example: 'etag123' })
  etag: string;
}

// ========================================
// COMMON DTOs
// ========================================

export class ValidationError {
  @ApiProperty({ example: 'fileName' })
  field: string;

  @ApiProperty({ example: 'File name is required' })
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

export class ExportResult {
  @ApiProperty({ type: [MediaResponseDto] })
  data: MediaResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty()
  exportedAt: Date;
} 