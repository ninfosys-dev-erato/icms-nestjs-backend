# Media Management Module

## Overview

The Media Management module provides comprehensive file management capabilities with support for multiple media types (images, videos, audio, documents), album organization, S3 integration, and advanced processing features. This module serves as the central hub for all media assets in the CMS.

## Module Purpose

- **Multi-Media Support:** Handle images, videos, audio, and documents
- **Album Management:** Organize media into albums and galleries
- **S3 Integration:** Secure cloud storage with CDN support
- **Image Processing:** Automatic resizing, optimization, and thumbnails
- **File Validation:** Security and format validation
- **Bilingual Metadata:** Alt text and captions in multiple languages

## Database Schema

### Media Entity
```typescript
interface Media {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string; // S3 path
  fileSize: number;
  mimeType: string;
  mediaType: MediaType;
  altText?: TranslatableEntity;
  caption?: TranslatableEntity;
  width?: number;
  height?: number;
  duration?: number; // For video/audio in seconds
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  albums: MediaAlbum[];
  sliders: Slider[];
}

enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT'
}

interface TranslatableEntity {
  en: string;
  ne: string;
}
```

### MediaAlbum Entity
```typescript
interface MediaAlbum {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  media: Media[];
}
```

## DTOs (Data Transfer Objects)

### Media DTOs

#### CreateMediaDto
```typescript
interface CreateMediaDto {
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  mediaType: MediaType;
  altText?: TranslatableEntity;
  caption?: TranslatableEntity;
  width?: number;
  height?: number;
  duration?: number;
  isActive?: boolean;
}
```

#### UpdateMediaDto
```typescript
interface UpdateMediaDto {
  altText?: TranslatableEntity;
  caption?: TranslatableEntity;
  isActive?: boolean;
}
```

#### MediaResponseDto
```typescript
interface MediaResponseDto {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  mediaType: MediaType;
  altText?: TranslatableEntity;
  caption?: TranslatableEntity;
  width?: number;
  height?: number;
  duration?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  url: string;
  thumbnailUrl?: string;
  albums: MediaAlbumResponseDto[];
}
```

#### MediaQueryDto
```typescript
interface MediaQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  mediaType?: MediaType;
  albumId?: string;
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

### MediaAlbum DTOs

#### CreateMediaAlbumDto
```typescript
interface CreateMediaAlbumDto {
  name: TranslatableEntity;
  description?: TranslatableEntity;
  isActive?: boolean;
}
```

#### UpdateMediaAlbumDto
```typescript
interface UpdateMediaAlbumDto {
  name?: TranslatableEntity;
  description?: TranslatableEntity;
  isActive?: boolean;
}
```

#### MediaAlbumResponseDto
```typescript
interface MediaAlbumResponseDto {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  mediaCount: number;
  media: MediaResponseDto[];
}
```

## Repository Interfaces

### MediaRepository
```typescript
interface MediaRepository {
  // Find media by ID
  findById(id: string): Promise<Media | null>;
  
  // Find all media with pagination and filters
  findAll(query: MediaQueryDto): Promise<PaginatedMediaResult>;
  
  // Find media by type
  findByType(mediaType: MediaType, query: MediaQueryDto): Promise<PaginatedMediaResult>;
  
  // Find media by album
  findByAlbum(albumId: string, query: MediaQueryDto): Promise<PaginatedMediaResult>;
  
  // Search media
  search(searchTerm: string, query: MediaQueryDto): Promise<PaginatedMediaResult>;
  
  // Create media
  create(data: CreateMediaDto): Promise<Media>;
  
  // Update media
  update(id: string, data: UpdateMediaDto): Promise<Media>;
  
  // Delete media
  delete(id: string): Promise<void>;
  
  // Get media statistics
  getStatistics(): Promise<MediaStatistics>;
  
  // Find media by file path
  findByFilePath(filePath: string): Promise<Media | null>;
  
  // Get media by IDs
  findByIds(ids: string[]): Promise<Media[]>;
}

interface PaginatedMediaResult {
  data: Media[];
  pagination: PaginationInfo;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface MediaStatistics {
  total: number;
  byType: Record<MediaType, number>;
  totalSize: number;
  averageSize: number;
}
```

### MediaAlbumRepository
```typescript
interface MediaAlbumRepository {
  // Find album by ID
  findById(id: string): Promise<MediaAlbum | null>;
  
  // Find all albums
  findAll(): Promise<MediaAlbum[]>;
  
  // Find active albums
  findActive(): Promise<MediaAlbum[]>;
  
  // Create album
  create(data: CreateMediaAlbumDto): Promise<MediaAlbum>;
  
  // Update album
  update(id: string, data: UpdateMediaAlbumDto): Promise<MediaAlbum>;
  
  // Delete album
  delete(id: string): Promise<void>;
  
  // Add media to album
  addMediaToAlbum(albumId: string, mediaId: string): Promise<void>;
  
  // Remove media from album
  removeMediaFromAlbum(albumId: string, mediaId: string): Promise<void>;
  
  // Get album with media count
  findWithMediaCount(id: string): Promise<MediaAlbumWithCount>;
  
  // Get album statistics
  getStatistics(): Promise<AlbumStatistics>;
}

interface MediaAlbumWithCount extends MediaAlbum {
  mediaCount: number;
}

interface AlbumStatistics {
  total: number;
  active: number;
  withMedia: number;
  averageMediaPerAlbum: number;
}
```

## Service Interfaces

### MediaService
```typescript
interface MediaService {
  // Get media by ID
  getMediaById(id: string): Promise<MediaResponseDto>;
  
  // Get all media with pagination
  getAllMedia(query: MediaQueryDto): Promise<PaginatedMediaResponse>;
  
  // Get media by type
  getMediaByType(mediaType: MediaType, query: MediaQueryDto): Promise<PaginatedMediaResponse>;
  
  // Get media by album
  getMediaByAlbum(albumId: string, query: MediaQueryDto): Promise<PaginatedMediaResponse>;
  
  // Search media
  searchMedia(searchTerm: string, query: MediaQueryDto): Promise<PaginatedMediaResponse>;
  
  // Upload media
  uploadMedia(file: Express.Multer.File, metadata?: Partial<CreateMediaDto>): Promise<MediaResponseDto>;
  
  // Update media
  updateMedia(id: string, data: UpdateMediaDto): Promise<MediaResponseDto>;
  
  // Delete media
  deleteMedia(id: string): Promise<void>;
  
  // Process media (resize, optimize, etc.)
  processMedia(id: string, options: MediaProcessingOptions): Promise<MediaResponseDto>;
  
  // Generate thumbnail
  generateThumbnail(id: string, width: number, height: number): Promise<string>;
  
  // Validate file
  validateFile(file: Express.Multer.File): Promise<ValidationResult>;
  
  // Get media statistics
  getMediaStatistics(): Promise<MediaStatistics>;
  
  // Get media URL
  getMediaUrl(id: string, variant?: string): Promise<string>;
  
  // Bulk operations
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;
  bulkUpdate(ids: string[], data: UpdateMediaDto): Promise<BulkOperationResult>;
}

interface PaginatedMediaResponse {
  data: MediaResponseDto[];
  pagination: PaginationInfo;
}

interface MediaProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  optimize?: boolean;
  generateThumbnail?: boolean;
  watermark?: {
    text?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}
```

### MediaAlbumService
```typescript
interface MediaAlbumService {
  // Get album by ID
  getAlbumById(id: string): Promise<MediaAlbumResponseDto>;
  
  // Get all albums
  getAllAlbums(): Promise<MediaAlbumResponseDto[]>;
  
  // Get active albums
  getActiveAlbums(): Promise<MediaAlbumResponseDto[]>;
  
  // Create album
  createAlbum(data: CreateMediaAlbumDto): Promise<MediaAlbumResponseDto>;
  
  // Update album
  updateAlbum(id: string, data: UpdateMediaAlbumDto): Promise<MediaAlbumResponseDto>;
  
  // Delete album
  deleteAlbum(id: string): Promise<void>;
  
  // Add media to album
  addMediaToAlbum(albumId: string, mediaId: string): Promise<void>;
  
  // Remove media from album
  removeMediaFromAlbum(albumId: string, mediaId: string): Promise<void>;
  
  // Reorder media in album
  reorderMediaInAlbum(albumId: string, mediaIds: string[]): Promise<void>;
  
  // Validate album data
  validateAlbum(data: CreateMediaAlbumDto | UpdateMediaAlbumDto): Promise<ValidationResult>;
  
  // Get album statistics
  getAlbumStatistics(): Promise<AlbumStatistics>;
  
  // Export album
  exportAlbum(id: string, format: 'json' | 'zip'): Promise<Buffer>;
}
```

### S3Service
```typescript
interface S3Service {
  // Upload file to S3
  uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
  
  // Download file from S3
  downloadFile(key: string): Promise<Buffer>;
  
  // Delete file from S3
  deleteFile(key: string): Promise<void>;
  
  // Get file URL
  getFileUrl(key: string, expiresIn?: number): Promise<string>;
  
  // Check if file exists
  fileExists(key: string): Promise<boolean>;
  
  // Copy file
  copyFile(sourceKey: string, destinationKey: string): Promise<void>;
  
  // Get file metadata
  getFileMetadata(key: string): Promise<FileMetadata>;
  
  // Generate presigned URL
  generatePresignedUrl(key: string, operation: 'get' | 'put', expiresIn?: number): Promise<string>;
}

interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  etag: string;
}

interface FileMetadata {
  size: number;
  mimeType: string;
  lastModified: Date;
  etag: string;
}
```

## Controller Interfaces

### PublicMediaController
```typescript
interface PublicMediaController {
  // Get all media
  getAllMedia(
    @Query() query: MediaQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get media by ID
  getMediaById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get media by type
  getMediaByType(
    @Param('type') type: MediaType,
    @Query() query: MediaQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Search media
  searchMedia(
    @Query('q') searchTerm: string,
    @Query() query: MediaQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get media URL
  getMediaUrl(
    @Param('id') id: string,
    @Query('variant') variant?: string,
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminMediaController
```typescript
interface AdminMediaController {
  // Get media by ID (admin)
  getMediaById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Upload media
  uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata?: Partial<CreateMediaDto>,
    @Res() response: Response
  ): Promise<void>;
  
  // Update media
  updateMedia(
    @Param('id') id: string,
    @Body() data: UpdateMediaDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete media
  deleteMedia(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Process media
  processMedia(
    @Param('id') id: string,
    @Body() options: MediaProcessingOptions,
    @Res() response: Response
  ): Promise<void>;
  
  // Get media statistics
  getMediaStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Bulk operations
  bulkDelete(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
  
  bulkUpdate(
    @Body() data: { ids: string[]; updates: UpdateMediaDto },
    @Res() response: Response
  ): Promise<void>;
}
```

### MediaAlbumController
```typescript
interface MediaAlbumController {
  // Get all albums
  getAllAlbums(
    @Res() response: Response
  ): Promise<void>;
  
  // Get album by ID
  getAlbumById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create album
  createAlbum(
    @Body() data: CreateMediaAlbumDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update album
  updateAlbum(
    @Param('id') id: string,
    @Body() data: UpdateMediaAlbumDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete album
  deleteAlbum(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Add media to album
  addMediaToAlbum(
    @Param('albumId') albumId: string,
    @Param('mediaId') mediaId: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Remove media from album
  removeMediaFromAlbum(
    @Param('albumId') albumId: string,
    @Param('mediaId') mediaId: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Reorder media in album
  reorderMediaInAlbum(
    @Param('albumId') albumId: string,
    @Body() mediaIds: string[],
    @Res() response: Response
  ): Promise<void>;
  
  // Export album
  exportAlbum(
    @Param('id') id: string,
    @Query('format') format: 'json' | 'zip',
    @Res() response: Response
  ): Promise<void>;
}
```

## API Endpoints

### Public Media Endpoints

#### GET /api/v1/media
**Description:** Get all media
**Access:** Public

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `mediaType`: Media type filter
- `albumId`: Album filter
- `isActive`: Active status filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "media_id",
      "fileName": "image_123.jpg",
      "originalName": "office_photo.jpg",
      "filePath": "uploads/images/image_123.jpg",
      "fileSize": 1024000,
      "mimeType": "image/jpeg",
      "mediaType": "IMAGE",
      "altText": {
        "en": "Office building",
        "ne": "कार्यालय भवन"
      },
      "caption": {
        "en": "Main office building",
        "ne": "मुख्य कार्यालय भवन"
      },
      "width": 1920,
      "height": 1080,
      "isActive": true,
      "url": "https://cdn.example.com/uploads/images/image_123.jpg",
      "thumbnailUrl": "https://cdn.example.com/uploads/images/thumbnails/image_123.jpg",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET /api/v1/media/{id}
**Description:** Get media by ID
**Access:** Public

#### GET /api/v1/media/type/{type}
**Description:** Get media by type
**Access:** Public

#### GET /api/v1/media/search
**Description:** Search media
**Access:** Public

#### GET /api/v1/media/{id}/url
**Description:** Get media URL
**Access:** Public

### Admin Media Endpoints

#### POST /api/v1/admin/media/upload
**Description:** Upload media
**Access:** Admin, Editor

**Request:** Multipart form data with file and metadata

#### PUT /api/v1/admin/media/{id}
**Description:** Update media
**Access:** Admin, Editor

#### DELETE /api/v1/admin/media/{id}
**Description:** Delete media
**Access:** Admin only

#### POST /api/v1/admin/media/{id}/process
**Description:** Process media
**Access:** Admin, Editor

#### GET /api/v1/admin/media/statistics
**Description:** Get media statistics
**Access:** Admin, Editor

### Album Endpoints

#### GET /api/v1/albums
**Description:** Get all albums
**Access:** Public

#### GET /api/v1/albums/{id}
**Description:** Get album by ID
**Access:** Public

#### POST /api/v1/admin/albums
**Description:** Create album
**Access:** Admin, Editor

#### PUT /api/v1/admin/albums/{id}
**Description:** Update album
**Access:** Admin, Editor

#### DELETE /api/v1/admin/albums/{id}
**Description:** Delete album
**Access:** Admin only

#### POST /api/v1/admin/albums/{albumId}/media/{mediaId}
**Description:** Add media to album
**Access:** Admin, Editor

#### DELETE /api/v1/admin/albums/{albumId}/media/{mediaId}
**Description:** Remove media from album
**Access:** Admin, Editor

## Business Logic

### 1. File Upload Process
- **File validation** (type, size, security)
- **Virus scanning** for uploaded files
- **S3 upload** with proper folder structure
- **Metadata extraction** (dimensions, duration, etc.)
- **Thumbnail generation** for images
- **Database record creation**

### 2. Image Processing
- **Automatic resizing** based on configuration
- **Quality optimization** for web delivery
- **Thumbnail generation** in multiple sizes
- **Watermarking** support
- **Format conversion** (WebP, AVIF support)

### 3. Album Management
- **Flexible album organization**
- **Media ordering** within albums
- **Album sharing** and permissions
- **Bulk operations** for efficiency

### 4. CDN Integration
- **S3 CloudFront** integration
- **Cache invalidation** strategies
- **Geographic distribution** for performance
- **HTTPS enforcement** for security

## Error Handling

### File Upload Errors
```json
{
  "success": false,
  "error": {
    "code": "FILE_UPLOAD_ERROR",
    "message": "File upload failed",
    "details": [
      {
        "field": "file",
        "message": "File size exceeds limit",
        "code": "FILE_TOO_LARGE"
      }
    ]
  }
}
```

### Media Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "Media not found",
    "details": []
  }
}
```

## Performance Considerations

### 1. File Optimization
- **Image compression** and optimization
- **Lazy loading** for large galleries
- **Progressive loading** for better UX
- **CDN caching** strategies

### 2. Storage Optimization
- **S3 lifecycle policies** for cost management
- **File deduplication** to save space
- **Archive policies** for old files
- **Backup strategies** for data protection

### 3. Database Optimization
- **Indexing** on frequently queried fields
- **Query optimization** for large datasets
- **Connection pooling** for high concurrency
- **Caching** for frequently accessed data

## Security Considerations

### 1. File Upload Security
- **File type validation** to prevent malicious uploads
- **Virus scanning** for all uploaded files
- **File size limits** to prevent abuse
- **Secure file storage** with encryption

### 2. Access Control
- **Public read access** for approved media
- **Admin/Editor write access** for management
- **Album-level permissions** for organization
- **Audit logging** for all operations

### 3. Data Protection
- **S3 bucket policies** for secure access
- **Encryption at rest** and in transit
- **Access logging** for security monitoring
- **Backup and recovery** procedures 