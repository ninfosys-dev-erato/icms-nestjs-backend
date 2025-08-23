import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, IsNotEmpty, MaxLength, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum MediaCategory {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other'
}

export enum MediaFolder {
  SLIDERS = 'sliders',
  LOGOS = 'logos',
  OFFICE_SETTINGS = 'office-settings',
  USERS = 'users',
  EMPLOYEES = 'employees',
  CONTENT = 'content',
  DOCUMENTS = 'documents',
  REPORTS = 'reports',
  VIDEOS = 'videos',
  AUDIO = 'audio',
  GENERAL = 'general'
}

export interface FileTypeConfig {
  types: string[];
  maxSize: number;
  folders: string[];
}

export const FILE_TYPE_CONFIG: Record<string, FileTypeConfig> = {
  images: {
    types: ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/x-png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/heic', 'image/heif'],
    maxSize: 50 * 1024 * 1024, // 50MB (align with controller validator)
    folders: Object.values(MediaFolder)
  },
  documents: {
    types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 10 * 1024 * 1024, // 10MB
    folders: ['documents', 'reports', 'content']
  },
  videos: {
    types: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxSize: 50 * 1024 * 1024, // 50MB
    folders: ['videos', 'content']
  },
  audio: {
    types: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    maxSize: 20 * 1024 * 1024, // 20MB
    folders: ['audio', 'content']
  }
};

// Create Media DTO
export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  fileId: string;

  @IsNumber()
  @Min(0)
  size: number;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsNotEmpty()
  uploadedBy: string;

  @IsString()
  @IsNotEmpty()
  folder: string;

  @IsEnum(MediaCategory)
  category: MediaCategory;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  metadata?: any;
}

// Update Media DTO
export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  metadata?: any;
}

// Media Response DTO
export class MediaResponseDto {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  presignedUrl?: string;
  fileId: string;
  size: number;
  contentType: string;
  uploadedBy: string;
  folder: string;
  category: MediaCategory;
  altText?: string;
  title?: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  isActive: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// Media Query DTO
export class MediaQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(MediaCategory)
  category?: MediaCategory;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// Upload Response DTO
export class UploadResponseDto {
  success: boolean;
  data: MediaResponseDto;
  message?: string;
}

// Bulk Upload DTO
export class BulkUploadDto {
  @IsArray()
  @Type(() => CreateMediaDto)
  files: CreateMediaDto[];
}

// Bulk Upload Response DTO
export class BulkUploadResponseDto {
  success: boolean;
  data: {
    uploaded: MediaResponseDto[];
    failed: Array<{
      originalName: string;
      error: string;
    }>;
  };
  message?: string;
}

// Media Search DTO
export class MediaSearchDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(MediaCategory)
  category?: MediaCategory;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// Media Library DTO
export class MediaLibraryDto {
  categories: Array<{
    category: MediaCategory;
    count: number;
    totalSize: number;
  }>;
  folders: Array<{
    folder: string;
    count: number;
    totalSize: number;
  }>;
  recent: MediaResponseDto[];
  popular: MediaResponseDto[];
}

// Media Statistics DTO
export class MediaStatisticsDto {
  totalFiles: number;
  totalSize: number;
  categories: Record<MediaCategory, number>;
  folders: Record<string, number>;
  uploadsToday: number;
  uploadsThisWeek: number;
  uploadsThisMonth: number;
}

// File Upload Validation DTO
export class FileUploadValidationDto {
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  size: number;

  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @IsString()
  @IsNotEmpty()
  folder: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// Bulk Upload Metadata DTO (does not require per-file fields like originalName/size/mimetype)
export class BulkUploadMetadataDto {
  @IsString()
  @IsNotEmpty()
  folder: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// Media Processing Options DTO
export class MediaProcessingOptionsDto {
  @IsOptional()
  resize?: {
    width?: number;
    height?: number;
    quality?: number;
  };

  @IsOptional()
  @IsBoolean()
  optimize?: boolean;

  @IsOptional()
  @IsBoolean()
  generateThumbnail?: boolean;

  @IsOptional()
  watermark?: {
    text?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
}

// Validation Result DTO
export class ValidationResultDto {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// Bulk Operation Result DTO
export class BulkOperationResultDto {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// Media URL Generation DTO
export class MediaUrlDto {
  @IsString()
  @IsNotEmpty()
  mediaId: string;

  @IsOptional()
  @IsString()
  variant?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  expiresIn?: number;
}

// Media Metadata DTO
export class MediaMetadataDto {
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  bitrate?: number;
  fps?: number;
  channels?: number;
  sampleRate?: number;
  [key: string]: any;
}

// Media Folder Structure DTO
export class MediaFolderStructureDto {
  folders: Array<{
    name: string;
    path: string;
    count: number;
    totalSize: number;
    lastModified: Date;
  }>;
  files: Array<{
    name: string;
    path: string;
    size: number;
    type: string;
    lastModified: Date;
  }>;
}

// Media Album DTOs
export class MediaAlbumQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class MediaAlbumResponseDto {
  id: string;
  name: any; // translatable
  description?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  mediaCount: number;
  coverMedia?: MediaResponseDto & { presignedUrl?: string };
}

export class CreateMediaAlbumDto {
  @IsNotEmpty()
  name: any; // translatable object { en, ne }

  @IsOptional()
  description?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMediaAlbumDto {
  @IsOptional()
  name?: any;

  @IsOptional()
  description?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AttachMediaToAlbumDto {
  @IsArray()
  @IsString({ each: true })
  mediaIds: string[];
}

export class AlbumMediaQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 12;
}

// Media Import DTO
export class MediaImportDto {
  @IsString()
  @IsNotEmpty()
  sourceUrl: string;

  @IsString()
  @IsNotEmpty()
  folder: string;

  @IsEnum(MediaCategory)
  category: MediaCategory;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// Media Export DTO
export class MediaExportDto {
  @IsArray()
  @IsString({ each: true })
  mediaIds: string[];

  @IsOptional()
  @IsString()
  format?: 'json' | 'csv' | 'xml';

  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;

  @IsOptional()
  @IsBoolean()
  includeUrls?: boolean;
}

// Presigned URL Response DTO
export class PresignedUrlResponseDto {
  presignedUrl: string;
  expiresIn: number;
  operation: 'get' | 'put';
  mediaId: string;
  fileName: string;
  contentType: string;
} 