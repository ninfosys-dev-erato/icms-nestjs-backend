# Universal Media Management System

## Overview

The Universal Media Management System provides comprehensive file management capabilities with Backblaze B2 integration, supporting all content types across the entire application. This system serves as the central hub for all media assets including sliders, office settings, user profiles, content management, and more.

## Features

### 🚀 Core Features

- **Universal File Support**: Images, documents, videos, audio, and other media types
- **Backblaze B2 Integration**: Robust cloud storage with CDN support
- **Advanced File Validation**: Type, size, and security validation
- **Comprehensive Metadata**: Rich metadata storage and management
- **Media Library**: Organized media management with categories and folders
- **Search & Filtering**: Advanced search capabilities with tags and metadata
- **Bulk Operations**: Upload, update, and delete multiple files
- **Image Processing**: Resize, optimize, and generate thumbnails
- **Import/Export**: Import from URLs, export media data
- **Access Control**: Role-based permissions and ownership management

### 📁 Supported Content Types

#### Images

- **Formats**: JPEG, PNG, WebP, GIF, SVG
- **Max Size**: 5MB
- **Folders**: sliders, office-settings, users, content, general
- **Features**: Automatic metadata extraction, resizing, optimization

#### Documents

- **Formats**: PDF, DOC, DOCX
- **Max Size**: 10MB
- **Folders**: documents, reports, content
- **Features**: Version control, metadata extraction

#### Videos

- **Formats**: MP4, WebM, QuickTime
- **Max Size**: 50MB
- **Folders**: videos, content
- **Features**: Duration extraction, thumbnail generation

#### Audio

- **Formats**: MP3, WAV, OGG
- **Max Size**: 20MB
- **Folders**: audio, content
- **Features**: Duration extraction, metadata extraction

## Architecture

### System Components

```
┌─────────────────────────────────────┐
│         Media Controller            │
│  ┌─────────────┬─────────────────┐  │
│  │   Upload    │   Management    │  │
│  │  Endpoints  │   Endpoints     │  │
│  └─────────────┴─────────────────┘  │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│         Media Service               │
│  ┌─────────────┬─────────────────┐  │
│  │   Business  │   File Storage  │  │
│  │    Logic    │   Integration   │  │
│  └─────────────┴─────────────────┘  │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│       Media Repository              │
│  ┌─────────────┬─────────────────┐  │
│  │   Database  │   Query         │  │
│  │  Operations │   Building      │  │
│  └─────────────┴─────────────────┘  │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│      Backblaze B2 Service           │
│  ┌─────────────┬─────────────────┐  │
│  │   Upload    │   Download      │  │
│  │   Delete    │   URL Gen       │  │
│  └─────────────┴─────────────────┘  │
└─────────────────────────────────────┘
```

### Database Schema

```prisma
model Media {
  id            String   @id @default(cuid())
  fileName      String   // Backblaze filename
  originalName  String   // Original uploaded filename
  url           String   // Public Backblaze URL
  fileId        String   // Backblaze file ID
  size          Int      // File size in bytes
  contentType   String   // MIME type
  uploadedBy    String   // User ID
  folder        String   // Content type folder
  category      String   // Media category
  altText       String?  // Alt text for accessibility
  title         String?  // Media title
  description   String?  // Media description
  tags          String[] // Searchable tags
  isPublic      Boolean  @default(true)
  isActive      Boolean  @default(true)
  metadata      Json?    // Additional metadata
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  user          User     @relation("UploadedMedia", fields: [uploadedBy], references: [id])
  sliders       Slider[]
  officeSettings OfficeSettings[]
  profilePictures User[] @relation("ProfilePicture")
  content       Content[] // For future content module
}
```

## API Endpoints

### Authentication

All endpoints require JWT authentication unless specified as public.

### File Upload Endpoints

#### POST `/api/v1/media/upload`

Upload a single file with metadata.

**Request:**

```bash
curl -X POST http://localhost:3000/api/v1/media/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@image.jpg" \
  -F "folder=sliders" \
  -F "title=Office Banner" \
  -F "description=Main office banner for homepage" \
  -F "altText=Office banner image" \
  -F "tags=banner,office,homepage" \
  -F "isPublic=true"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "media_id",
    "fileName": "sliders/1234567890-banner.jpg",
    "originalName": "banner.jpg",
    "url": "https://f004.backblazeb2.com/file/bucket-name/sliders/1234567890-banner.jpg",
    "fileId": "backblaze_file_id",
    "size": 1024000,
    "contentType": "image/jpeg",
    "uploadedBy": "user_id",
    "folder": "sliders",
    "category": "image",
    "altText": "Office banner image",
    "title": "Office Banner",
    "description": "Main office banner for homepage",
    "tags": ["banner", "office", "homepage"],
    "isPublic": true,
    "isActive": true,
    "metadata": {
      "width": 1920,
      "height": 1080,
      "format": "JPEG"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "File uploaded successfully"
}
```

#### POST `/api/v1/media/bulk-upload`

Upload multiple files with shared metadata.

**Request:**

```bash
curl -X POST http://localhost:3000/api/v1/media/bulk-upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "folder=content" \
  -F "tags=content,images"
```

### Media Management Endpoints

#### GET `/api/v1/media`

Get all media with pagination and filtering.

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term
- `category`: Filter by category (image, document, video, audio)
- `folder`: Filter by folder
- `uploadedBy`: Filter by user
- `tags`: Filter by tags (comma-separated)
- `isPublic`: Filter by public status
- `isActive`: Filter by active status
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order (asc/desc, default: desc)

**Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/media?category=image&folder=sliders&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### GET `/api/v1/media/public`

Get public media (no authentication required).

#### GET `/api/v1/media/library`

Get media library with categories and statistics.

#### GET `/api/v1/media/statistics`

Get comprehensive media statistics (Admin/Editor only).

#### GET `/api/v1/media/category/:category`

Get media by category.

#### GET `/api/v1/media/folder/:folder`

Get media by folder.

#### GET `/api/v1/media/user/:userId`

Get media by user.

#### GET `/api/v1/media/my-media`

Get current user's media.

#### GET `/api/v1/media/search`

Search media by query, category, folder, or tags.

#### GET `/api/v1/media/tags`

Get media by tags.

#### GET `/api/v1/media/:id`

Get media by ID.

#### GET `/api/v1/media/:id/url`

Get media URL with optional expiration.

### Media Update Endpoints

#### PUT `/api/v1/media/:id`

Update media metadata.

**Request:**

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "altText": "Updated alt text",
  "tags": ["updated", "tags"],
  "isPublic": false
}
```

#### POST `/api/v1/media/:id/process`

Process media (resize, optimize, etc.).

**Request:**

```json
{
  "resize": {
    "width": 800,
    "height": 600,
    "quality": 80
  },
  "optimize": true,
  "generateThumbnail": true
}
```

### Media Delete Endpoints

#### DELETE `/api/v1/media/:id`

Delete a single media file.

#### POST `/api/v1/media/bulk-delete`

Delete multiple media files (Admin/Editor only).

**Request:**

```json
{
  "ids": ["media_id_1", "media_id_2", "media_id_3"]
}
```

#### POST `/api/v1/media/bulk-update`

Update multiple media files (Admin/Editor only).

**Request:**

```json
{
  "ids": ["media_id_1", "media_id_2"],
  "updates": {
    "isPublic": false,
    "tags": ["updated", "tags"]
  }
}
```

### Advanced Features

#### POST `/api/v1/media/import`

Import media from URL (Admin/Editor only).

**Request:**

```json
{
  "sourceUrl": "https://example.com/image.jpg",
  "folder": "content",
  "category": "image",
  "title": "Imported Image",
  "description": "Imported from external URL",
  "tags": ["imported", "external"]
}
```

#### POST `/api/v1/media/export`

Export media data (Admin/Editor only).

**Request:**

```json
{
  "mediaIds": ["media_id_1", "media_id_2"],
  "format": "json",
  "includeMetadata": true,
  "includeUrls": true
}
```

#### POST `/api/v1/media/cleanup`

Clean up orphaned media files (Admin only).

### Configuration Endpoints

#### GET `/api/v1/media/file-types/config`

Get supported file types configuration.

#### GET `/api/v1/media/folders/list`

Get available folders.

#### GET `/api/v1/media/categories/list`

Get available categories.

## Configuration

### Environment Variables

```bash
# Storage Provider
STORAGE_PROVIDER=backblaze-b2

# Backblaze B2 Configuration
BACKBLAZE_APPLICATION_KEY_ID=your_application_key_id
BACKBLAZE_APPLICATION_KEY=your_application_key
BACKBLAZE_BUCKET_ID=your_bucket_id
BACKBLAZE_BUCKET_NAME=your_bucket_name
BACKBLAZE_ENDPOINT=https://api.backblazeb2.com
BACKBLAZE_MAX_RETRIES=3
BACKBLAZE_RETRY_DELAY=1000

# Media Upload Configuration
MAX_FILE_SIZE_IMAGE=5242880      # 5MB for images
MAX_FILE_SIZE_DOCUMENT=10485760  # 10MB for documents
MAX_FILE_SIZE_VIDEO=52428800     # 50MB for videos
MAX_FILE_SIZE_AUDIO=20971520     # 20MB for audio

ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif,image/svg+xml
ALLOWED_DOCUMENT_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
ALLOWED_VIDEO_TYPES=video/mp4,video/webm,video/quicktime
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/ogg
```

### File Type Configuration

```typescript
const FILE_TYPE_CONFIG = {
  images: {
    types: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ],
    maxSize: 5 * 1024 * 1024, // 5MB
    folders: ['sliders', 'office-settings', 'users', 'content', 'general'],
  },
  documents: {
    types: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    folders: ['documents', 'reports', 'content'],
  },
  videos: {
    types: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxSize: 50 * 1024 * 1024, // 50MB
    folders: ['videos', 'content'],
  },
  audio: {
    types: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    maxSize: 20 * 1024 * 1024, // 20MB
    folders: ['audio', 'content'],
  },
};
```

## Integration Examples

### Slider Module Integration

```typescript
// Upload slider image
const sliderImage = await this.mediaService.uploadMedia(
  file,
  {
    folder: 'sliders',
    title: 'Homepage Slider',
    description: 'Main homepage slider image',
    tags: ['slider', 'homepage'],
    isPublic: true,
  },
  userId,
);

// Use in slider creation
const slider = await this.sliderService.create({
  title: { en: 'Welcome', ne: 'स्वागत छ' },
  mediaId: sliderImage.data.id,
  position: 1,
  displayTime: 5000,
  isActive: true,
});
```

### Office Settings Integration

```typescript
// Upload background photo
const backgroundPhoto = await this.mediaService.uploadMedia(
  file,
  {
    folder: 'office-settings',
    title: 'Office Background',
    description: 'Office background photo',
    tags: ['office', 'background'],
    isPublic: true,
  },
  userId,
);

// Update office settings
await this.officeSettingsService.update({
  backgroundPhotoId: backgroundPhoto.data.id,
  // ... other settings
});
```

### User Profile Integration

```typescript
// Upload profile picture
const profilePicture = await this.mediaService.uploadMedia(
  file,
  {
    folder: 'users',
    title: 'Profile Picture',
    description: 'User profile picture',
    tags: ['profile', 'user'],
    isPublic: false,
  },
  userId,
);

// Update user profile
await this.userService.update(userId, {
  profilePictureId: profilePicture.data.id,
  // ... other profile data
});
```

## Error Handling

### Common Error Responses

#### File Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "File validation failed",
    "details": [
      {
        "field": "size",
        "message": "File size 10485760 exceeds maximum allowed size 5242880",
        "code": "FILE_SIZE_EXCEEDED"
      }
    ]
  }
}
```

#### Unsupported File Type

```json
{
  "success": false,
  "error": {
    "code": "UNSUPPORTED_FILE_TYPE",
    "message": "File type application/exe is not supported"
  }
}
```

#### Upload Failed

```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_FAILED",
    "message": "Failed to upload file to Backblaze B2"
  }
}
```

## Security Considerations

### File Validation

- **Type Validation**: Only allowed MIME types are accepted
- **Size Limits**: Configurable size limits per content type
- **Folder Restrictions**: Files can only be uploaded to compatible folders
- **Duplicate Detection**: Prevents duplicate file uploads

### Access Control

- **Authentication**: All endpoints require JWT authentication
- **Authorization**: Role-based access control (Admin, Editor, Viewer)
- **Ownership**: Users can only modify their own media (unless Admin)
- **Public/Private**: Control over media visibility

### Data Protection

- **Secure URLs**: Backblaze B2 provides secure, signed URLs
- **Metadata Sanitization**: All metadata is validated and sanitized
- **Audit Trail**: All operations are logged with user information

## Performance Optimization

### Caching Strategy

- **CDN Integration**: Backblaze B2 provides global CDN
- **URL Caching**: Generated URLs are cached for performance
- **Metadata Caching**: Frequently accessed metadata is cached

### Database Optimization

- **Indexing**: Proper database indexes for fast queries
- **Pagination**: Efficient pagination for large datasets
- **Query Optimization**: Optimized queries for filtering and search

### File Processing

- **Async Processing**: Image processing is done asynchronously
- **Batch Operations**: Bulk operations for better performance
- **Compression**: Automatic image compression and optimization

## Monitoring and Maintenance

### Health Checks

- **Backblaze B2 Connectivity**: Regular connectivity checks
- **Database Health**: Database connection monitoring
- **File Integrity**: Periodic file integrity checks

### Cleanup Operations

- **Orphaned Files**: Automatic cleanup of unreferenced files
- **Temporary Files**: Cleanup of temporary upload files
- **Database Cleanup**: Regular database maintenance

### Analytics

- **Upload Statistics**: Track upload patterns and usage
- **Storage Analytics**: Monitor storage usage and costs
- **Performance Metrics**: Track API response times and throughput

## Troubleshooting

### Common Issues

#### Upload Failures

1. **Check Backblaze B2 credentials**
2. **Verify bucket permissions**
3. **Check file size and type restrictions**
4. **Review network connectivity**

#### Authentication Issues

1. **Verify JWT token validity**
2. **Check user permissions**
3. **Ensure proper role assignments**

#### Performance Issues

1. **Monitor CDN performance**
2. **Check database query performance**
3. **Review file processing queue**

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
LOG_LEVEL=debug
```

## Future Enhancements

### Planned Features

- **Video Transcoding**: Automatic video format conversion
- **Advanced Image Processing**: Filters, effects, and transformations
- **AI-Powered Tagging**: Automatic tag generation using AI
- **Version Control**: File versioning and history tracking
- **Advanced Analytics**: Detailed usage analytics and insights
- **Multi-Region Support**: Global CDN with multiple regions
- **Backup and Recovery**: Automated backup and disaster recovery
- **Advanced Search**: Full-text search with AI-powered relevance

### Integration Roadmap

- **Content Management**: Full integration with content management system
- **E-commerce**: Product image management
- **Social Media**: Social media integration and sharing
- **Mobile Apps**: Mobile-optimized upload and management
- **Third-party Services**: Integration with external media services
