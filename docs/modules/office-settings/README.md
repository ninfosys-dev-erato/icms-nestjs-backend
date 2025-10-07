# Office Settings Management Module

## Overview

The Office Settings Management module handles all configuration and settings for the government office. This includes office information, contact details, social media links, and visual assets like background photos and logos.

## Module Purpose

- **Centralized Configuration:** Single source of truth for office settings
- **Bilingual Support:** All text fields support English and Nepali translations
- **Media Integration:** Seamless integration with media management for images
- **SEO Optimization:** Structured data for search engine optimization

## Database Schema

### OfficeSettings Entity
```typescript
interface OfficeSettings {
  id: string;
  directorate: TranslatableEntity;
  officeName: TranslatableEntity;
  officeAddress: TranslatableEntity;
  backgroundPhoto?: string; // S3 path
  email: string;
  phoneNumber: TranslatableEntity;
  xLink?: string;
  mapIframe?: string; // HTML string
  website?: string;
  youtube?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TranslatableEntity {
  en: string;
  ne: string;
}
```

## DTOs (Data Transfer Objects)

### CreateOfficeSettingsDto
```typescript
interface CreateOfficeSettingsDto {
  directorate: TranslatableEntity;
  officeName: TranslatableEntity;
  officeAddress: TranslatableEntity;
  backgroundPhoto?: string;
  email: string;
  phoneNumber: TranslatableEntity;
  xLink?: string;
  mapIframe?: string;
  website?: string;
  youtube?: string;
}
```

### UpdateOfficeSettingsDto
```typescript
interface UpdateOfficeSettingsDto {
  directorate?: TranslatableEntity;
  officeName?: TranslatableEntity;
  officeAddress?: TranslatableEntity;
  backgroundPhoto?: string;
  email?: string;
  phoneNumber?: TranslatableEntity;
  xLink?: string;
  mapIframe?: string;
  website?: string;
  youtube?: string;
}
```

### OfficeSettingsResponseDto
```typescript
interface OfficeSettingsResponseDto {
  id: string;
  directorate: TranslatableEntity;
  officeName: TranslatableEntity;
  officeAddress: TranslatableEntity;
  backgroundPhoto?: string;
  email: string;
  phoneNumber: TranslatableEntity;
  xLink?: string;
  mapIframe?: string;
  website?: string;
  youtube?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Repository Interface

### OfficeSettingsRepository
```typescript
interface OfficeSettingsRepository {
  // Find office settings by ID
  findById(id: string): Promise<OfficeSettings | null>;
  
  // Find the first (and only) office settings record
  findFirst(): Promise<OfficeSettings | null>;
  
  // Create new office settings
  create(data: CreateOfficeSettingsDto): Promise<OfficeSettings>;
  
  // Update existing office settings
  update(id: string, data: UpdateOfficeSettingsDto): Promise<OfficeSettings>;
  
  // Upsert office settings (create if not exists, update if exists)
  upsert(data: CreateOfficeSettingsDto): Promise<OfficeSettings>;
  
  // Delete office settings
  delete(id: string): Promise<void>;
  
  // Check if office settings exist
  exists(): Promise<boolean>;
}
```

## Service Interface

### OfficeSettingsService
```typescript
interface OfficeSettingsService {
  // Get office settings (public)
  getOfficeSettings(lang?: string): Promise<OfficeSettingsResponseDto>;
  
  // Get office settings by ID (admin)
  getOfficeSettingsById(id: string): Promise<OfficeSettingsResponseDto>;
  
  // Create office settings (admin only)
  createOfficeSettings(data: CreateOfficeSettingsDto): Promise<OfficeSettingsResponseDto>;
  
  // Update office settings (admin only)
  updateOfficeSettings(id: string, data: UpdateOfficeSettingsDto): Promise<OfficeSettingsResponseDto>;
  
  // Upsert office settings (admin only)
  upsertOfficeSettings(data: CreateOfficeSettingsDto): Promise<OfficeSettingsResponseDto>;
  
  // Delete office settings (admin only)
  deleteOfficeSettings(id: string): Promise<void>;
  
  // Validate office settings data
  validateOfficeSettings(data: CreateOfficeSettingsDto | UpdateOfficeSettingsDto): Promise<ValidationResult>;
  
  // Get office settings for SEO
  getOfficeSettingsForSEO(): Promise<SEOOfficeSettings>;
  
  // Update background photo
  updateBackgroundPhoto(id: string, file: Express.Multer.File): Promise<OfficeSettingsResponseDto>;
  
  // Remove background photo
  removeBackgroundPhoto(id: string): Promise<OfficeSettingsResponseDto>;
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

interface SEOOfficeSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  socialMedia: {
    x?: string;
    youtube?: string;
  };
}
```

## Controller Interfaces

### PublicOfficeSettingsController
```typescript
interface PublicOfficeSettingsController {
  // Get office settings (public endpoint)
  getOfficeSettings(
    @Query('lang') lang?: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get office settings for SEO
  getOfficeSettingsForSEO(
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminOfficeSettingsController
```typescript
interface AdminOfficeSettingsController {
  // Get office settings by ID (admin)
  getOfficeSettingsById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create office settings (admin)
  createOfficeSettings(
    @Body() data: CreateOfficeSettingsDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update office settings (admin)
  updateOfficeSettings(
    @Param('id') id: string,
    @Body() data: UpdateOfficeSettingsDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Upsert office settings (admin)
  upsertOfficeSettings(
    @Body() data: CreateOfficeSettingsDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete office settings (admin)
  deleteOfficeSettings(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Update background photo (admin)
  updateBackgroundPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
  
  // Remove background photo (admin)
  removeBackgroundPhoto(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
}
```

## Guards and Interceptors

### OfficeSettingsGuard
```typescript
interface OfficeSettingsGuard {
  // Check if user can access office settings
  canAccess(user: User): boolean;
  
  // Check if user can modify office settings
  canModify(user: User): boolean;
  
  // Check if user can delete office settings
  canDelete(user: User): boolean;
}
```

### OfficeSettingsInterceptor
```typescript
interface OfficeSettingsInterceptor {
  // Transform response data
  transform(data: OfficeSettings): OfficeSettingsResponseDto;
  
  // Add SEO metadata
  addSEOMetadata(data: OfficeSettingsResponseDto): SEOOfficeSettings;
  
  // Cache response
  cacheResponse(data: OfficeSettingsResponseDto): Promise<void>;
}
```

## API Endpoints

### Public Endpoints

#### GET /api/v1/office-settings
**Description:** Get office settings
**Access:** Public
**Query Parameters:**
- `lang`: Language preference (en/ne)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "settings_id",
    "directorate": {
      "en": "Ministry of Education",
      "ne": "शिक्षा मन्त्रालय"
    },
    "officeName": {
      "en": "District Education Office",
      "ne": "जिल्ला शिक्षा कार्यालय"
    },
    "officeAddress": {
      "en": "Dadeldura, Nepal",
      "ne": "दादेलधुरा, नेपाल"
    },
    "backgroundPhoto": "https://s3.amazonaws.com/...",
    "email": "info@example.gov.np",
    "phoneNumber": {
      "en": "+977-123456789",
      "ne": "+९७७-१२३४५६७८९"
    },
    "xLink": "https://x.com/example",
    "mapIframe": "<iframe>...</iframe>",
    "website": "https://example.gov.np",
    "youtube": "https://youtube.com/example"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

#### GET /api/v1/office-settings/seo
**Description:** Get office settings for SEO
**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "District Education Office",
    "description": "Official website of District Education Office",
    "address": "Dadeldura, Nepal",
    "phone": "+977-123456789",
    "email": "info@example.gov.np",
    "website": "https://example.gov.np",
    "socialMedia": {
      "x": "https://x.com/example",
      "youtube": "https://youtube.com/example"
    }
  }
}
```

### Admin Endpoints

#### GET /api/v1/admin/office-settings/{id}
**Description:** Get office settings by ID
**Access:** Admin only

#### POST /api/v1/admin/office-settings
**Description:** Create office settings
**Access:** Admin only

**Request Body:**
```json
{
  "directorate": {
    "en": "Ministry of Education",
    "ne": "शिक्षा मन्त्रालय"
  },
  "officeName": {
    "en": "District Education Office",
    "ne": "जिल्ला शिक्षा कार्यालय"
  },
  "officeAddress": {
    "en": "Dadeldura, Nepal",
    "ne": "दादेलधुरा, नेपाल"
  },
  "email": "info@example.gov.np",
  "phoneNumber": {
    "en": "+977-123456789",
    "ne": "+९७७-१२३४५६७८९"
  }
}
```

#### PUT /api/v1/admin/office-settings/{id}
**Description:** Update office settings
**Access:** Admin only

#### PUT /api/v1/admin/office-settings/upsert
**Description:** Upsert office settings
**Access:** Admin only

#### DELETE /api/v1/admin/office-settings/{id}
**Description:** Delete office settings
**Access:** Admin only

#### POST /api/v1/admin/office-settings/{id}/background-photo
**Description:** Update background photo
**Access:** Admin only

**Request:** Multipart form data with image file

#### DELETE /api/v1/admin/office-settings/{id}/background-photo
**Description:** Remove background photo
**Access:** Admin only

## Business Logic

### 1. Validation Rules
- **Email:** Must be valid email format
- **Phone Number:** Must be valid phone format
- **URLs:** Must be valid URL format (xLink, website, youtube)
- **Translatable Fields:** Both English and Nepali must be provided
- **Map Iframe:** Must contain valid HTML iframe

### 2. File Upload Rules
- **Background Photo:** 
  - Max size: 5MB
  - Allowed formats: JPG, PNG, WebP
  - Dimensions: Min 1920x1080px
  - Auto-resize for optimization

### 3. SEO Optimization
- **Structured Data:** Generate JSON-LD for office information
- **Meta Tags:** Generate meta tags for social sharing
- **Sitemap:** Include office information in sitemap
- **Open Graph:** Generate Open Graph tags

### 4. Caching Strategy
- **Public Endpoints:** Cache for 1 hour
- **Admin Endpoints:** No caching
- **Cache Invalidation:** On any update operation

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email must be a valid email address",
        "code": "INVALID_EMAIL"
      }
    ]
  }
}
```

### Not Found Error
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "Office settings not found",
    "details": []
  }
}
```

### Permission Error
```json
{
  "success": false,
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Insufficient permissions",
    "details": []
  }
}
```

## Testing Strategy

### Unit Tests
- **Service Methods:** Test all business logic
- **Repository Methods:** Test data access layer
- **DTO Validation:** Test input validation
- **Guard Logic:** Test authorization rules

### Integration Tests
- **API Endpoints:** Test complete request/response cycle
- **Database Operations:** Test with real database
- **File Upload:** Test file upload functionality
- **Cache Operations:** Test caching behavior

### E2E Tests
- **Complete Workflows:** Test admin operations
- **Public Access:** Test public endpoints
- **Error Scenarios:** Test error handling
- **Performance:** Test response times

## Performance Considerations

### 1. Database Optimization
- **Single Record:** Office settings is typically a single record
- **Indexing:** Primary key indexing
- **Query Optimization:** Minimal queries needed

### 2. Caching Strategy
- **Redis Cache:** Cache public responses
- **Memory Cache:** Cache frequently accessed data
- **Cache Warming:** Pre-load cache on startup

### 3. File Optimization
- **Image Compression:** Compress background photos
- **CDN Integration:** Serve images via CDN
- **Lazy Loading:** Load images on demand

## Security Considerations

### 1. Input Validation
- **Sanitization:** Sanitize all input data
- **Type Checking:** Validate data types
- **Format Validation:** Validate email, URL formats

### 2. File Upload Security
- **File Type Validation:** Only allow image files
- **Size Limits:** Enforce file size limits
- **Virus Scanning:** Scan uploaded files
- **Secure Storage:** Store in secure S3 bucket

### 3. Access Control
- **Role-Based Access:** Admin-only modifications
- **Resource Ownership:** Validate resource access
- **Audit Logging:** Log all modifications

## Monitoring and Logging

### 1. Performance Monitoring
- **Response Times:** Monitor API response times
- **Error Rates:** Track error frequencies
- **Cache Hit Rates:** Monitor cache effectiveness

### 2. Security Monitoring
- **Access Logs:** Log all access attempts
- **Modification Logs:** Log all data modifications
- **File Upload Logs:** Log file upload activities

### 3. Business Metrics
- **Usage Statistics:** Track API usage
- **Popular Fields:** Monitor most accessed data
- **Update Frequency:** Track modification patterns 