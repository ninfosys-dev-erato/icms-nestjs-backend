# Header Configuration Module

## Overview

The Header Configuration module manages website header customization including logo management, typography settings, layout configuration, and responsive design. This module provides a comprehensive solution for customizing the website header to match branding requirements and user preferences.

## Module Purpose

- **Header Customization:** Manage header layout and appearance
- **Logo Management:** Handle left and right logo positioning
- **Typography Settings:** Control font sizes, colors, and styles
- **Layout Configuration:** Manage header structure and alignment
- **Responsive Design:** Support for different screen sizes
- **Branding Integration:** Maintain consistent brand identity

## Database Schema

### HeaderConfig Entity
```typescript
interface HeaderConfig {
  id: string;
  name: TranslatableEntity;
  order: number;
  isActive: boolean;
  isPublished: boolean;
  typography: TypographySettings;
  alignment: HeaderAlignment;
  logo: LogoConfiguration;
  layout: LayoutConfiguration;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  createdBy: User;
  updatedBy: User;
}

interface TranslatableEntity {
  en: string;
  ne: string;
}

interface TypographySettings {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | number;
  color: string;
  lineHeight: number;
  letterSpacing: number;
}

enum HeaderAlignment {
  LEFT = 'LEFT',
  CENTER = 'CENTER',
  RIGHT = 'RIGHT',
  JUSTIFY = 'JUSTIFY'
}

interface LogoConfiguration {
  leftLogo?: {
    mediaId: string;
    altText: TranslatableEntity;
    width: number;
    height: number;
  };
  rightLogo?: {
    mediaId: string;
    altText: TranslatableEntity;
    width: number;
    height: number;
  };
  logoAlignment: 'left' | 'center' | 'right';
  logoSpacing: number;
}

interface LayoutConfiguration {
  headerHeight: number;
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  responsive: {
    mobile: Partial<LayoutConfiguration>;
    tablet: Partial<LayoutConfiguration>;
    desktop: Partial<LayoutConfiguration>;
  };
}
```

## DTOs (Data Transfer Objects)

### CreateHeaderConfigDto
```typescript
interface CreateHeaderConfigDto {
  name: TranslatableEntity;
  order?: number;
  isActive?: boolean;
  isPublished?: boolean;
  typography: TypographySettings;
  alignment: HeaderAlignment;
  logo: LogoConfiguration;
  layout: LayoutConfiguration;
}
```

### UpdateHeaderConfigDto
```typescript
interface UpdateHeaderConfigDto {
  name?: TranslatableEntity;
  order?: number;
  isActive?: boolean;
  isPublished?: boolean;
  typography?: TypographySettings;
  alignment?: HeaderAlignment;
  logo?: LogoConfiguration;
  layout?: LayoutConfiguration;
}
```

### HeaderConfigResponseDto
```typescript
interface HeaderConfigResponseDto {
  id: string;
  name: TranslatableEntity;
  order: number;
  isActive: boolean;
  isPublished: boolean;
  typography: TypographySettings;
  alignment: HeaderAlignment;
  logo: LogoConfigurationResponse;
  layout: LayoutConfiguration;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserResponseDto;
  updatedBy: UserResponseDto;
}

interface LogoConfigurationResponse {
  leftLogo?: {
    media: MediaResponseDto;
    altText: TranslatableEntity;
    width: number;
    height: number;
  };
  rightLogo?: {
    media: MediaResponseDto;
    altText: TranslatableEntity;
    width: number;
    height: number;
  };
  logoAlignment: 'left' | 'center' | 'right';
  logoSpacing: number;
}
```

### HeaderConfigQueryDto
```typescript
interface HeaderConfigQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isPublished?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

## Repository Interfaces

### HeaderConfigRepository
```typescript
interface HeaderConfigRepository {
  // Find header config by ID
  findById(id: string): Promise<HeaderConfig | null>;
  
  // Find all header configs with pagination and filters
  findAll(query: HeaderConfigQueryDto): Promise<PaginatedHeaderConfigResult>;
  
  // Find active header configs
  findActive(query: HeaderConfigQueryDto): Promise<PaginatedHeaderConfigResult>;
  
  // Find published header configs
  findPublished(query: HeaderConfigQueryDto): Promise<PaginatedHeaderConfigResult>;
  
  // Find header config by order
  findByOrder(order: number): Promise<HeaderConfig | null>;
  
  // Search header configs
  search(searchTerm: string, query: HeaderConfigQueryDto): Promise<PaginatedHeaderConfigResult>;
  
  // Create header config
  create(data: CreateHeaderConfigDto, userId: string): Promise<HeaderConfig>;
  
  // Update header config
  update(id: string, data: UpdateHeaderConfigDto, userId: string): Promise<HeaderConfig>;
  
  // Delete header config
  delete(id: string): Promise<void>;
  
  // Publish header config
  publish(id: string, userId: string): Promise<HeaderConfig>;
  
  // Unpublish header config
  unpublish(id: string, userId: string): Promise<HeaderConfig>;
  
  // Reorder header configs
  reorder(orders: { id: string; order: number }[]): Promise<void>;
  
  // Get active header config for display
  getActiveHeaderConfig(): Promise<HeaderConfig | null>;
  
  // Get header config statistics
  getStatistics(): Promise<HeaderConfigStatistics>;
  
  // Find header configs by logo
  findByLogo(mediaId: string): Promise<HeaderConfig[]>;
}

interface PaginatedHeaderConfigResult {
  data: HeaderConfig[];
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

interface HeaderConfigStatistics {
  total: number;
  active: number;
  published: number;
  byAlignment: Record<HeaderAlignment, number>;
  averageOrder: number;
}
```

## Service Interfaces

### HeaderConfigService
```typescript
interface HeaderConfigService {
  // Get header config by ID
  getHeaderConfigById(id: string): Promise<HeaderConfigResponseDto>;
  
  // Get all header configs with pagination
  getAllHeaderConfigs(query: HeaderConfigQueryDto): Promise<PaginatedHeaderConfigResponse>;
  
  // Get active header configs
  getActiveHeaderConfigs(query: HeaderConfigQueryDto): Promise<PaginatedHeaderConfigResponse>;
  
  // Get published header configs
  getPublishedHeaderConfigs(query: HeaderConfigQueryDto): Promise<PaginatedHeaderConfigResponse>;
  
  // Get header config by order
  getHeaderConfigByOrder(order: number): Promise<HeaderConfigResponseDto>;
  
  // Search header configs
  searchHeaderConfigs(searchTerm: string, query: HeaderConfigQueryDto): Promise<PaginatedHeaderConfigResponse>;
  
  // Create header config
  createHeaderConfig(data: CreateHeaderConfigDto, userId: string): Promise<HeaderConfigResponseDto>;
  
  // Update header config
  updateHeaderConfig(id: string, data: UpdateHeaderConfigDto, userId: string): Promise<HeaderConfigResponseDto>;
  
  // Delete header config
  deleteHeaderConfig(id: string): Promise<void>;
  
  // Publish header config
  publishHeaderConfig(id: string, userId: string): Promise<HeaderConfigResponseDto>;
  
  // Unpublish header config
  unpublishHeaderConfig(id: string, userId: string): Promise<HeaderConfigResponseDto>;
  
  // Reorder header configs
  reorderHeaderConfigs(orders: { id: string; order: number }[]): Promise<void>;
  
  // Validate header config data
  validateHeaderConfig(data: CreateHeaderConfigDto | UpdateHeaderConfigDto): Promise<ValidationResult>;
  
  // Get header config statistics
  getHeaderConfigStatistics(): Promise<HeaderConfigStatistics>;
  
  // Get active header config for display
  getActiveHeaderConfigForDisplay(): Promise<HeaderConfigResponseDto>;
  
  // Update logo
  updateLogo(id: string, logoType: 'left' | 'right', logoData: Partial<LogoConfiguration>, userId: string): Promise<HeaderConfigResponseDto>;
  
  // Remove logo
  removeLogo(id: string, logoType: 'left' | 'right', userId: string): Promise<HeaderConfigResponseDto>;
  
  // Export header configs
  exportHeaderConfigs(query: HeaderConfigQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Import header configs
  importHeaderConfigs(file: Express.Multer.File, userId: string): Promise<ImportResult>;
  
  // Bulk operations
  bulkPublish(ids: string[], userId: string): Promise<BulkOperationResult>;
  bulkUnpublish(ids: string[], userId: string): Promise<BulkOperationResult>;
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;
  
  // Generate CSS
  generateCSS(id: string): Promise<string>;
  
  // Preview header config
  previewHeaderConfig(data: CreateHeaderConfigDto | UpdateHeaderConfigDto): Promise<HeaderPreview>;
}

interface PaginatedHeaderConfigResponse {
  data: HeaderConfigResponseDto[];
  pagination: PaginationInfo;
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

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

interface HeaderPreview {
  css: string;
  html: string;
  config: HeaderConfigResponseDto;
}
```

## Controller Interfaces

### PublicHeaderController
```typescript
interface PublicHeaderController {
  // Get all published header configs
  getAllHeaderConfigs(
    @Query() query: HeaderConfigQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get header config by ID
  getHeaderConfigById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get active header config for display
  getActiveHeaderConfigForDisplay(
    @Res() response: Response
  ): Promise<void>;
  
  // Get header config by order
  getHeaderConfigByOrder(
    @Param('order') order: number,
    @Res() response: Response
  ): Promise<void>;
  
  // Get header CSS
  getHeaderCSS(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Preview header config
  previewHeaderConfig(
    @Body() data: CreateHeaderConfigDto | UpdateHeaderConfigDto,
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminHeaderController
```typescript
interface AdminHeaderController {
  // Get header config by ID (admin)
  getHeaderConfigById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create header config
  createHeaderConfig(
    @Body() data: CreateHeaderConfigDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update header config
  updateHeaderConfig(
    @Param('id') id: string,
    @Body() data: UpdateHeaderConfigDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete header config
  deleteHeaderConfig(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Publish header config
  publishHeaderConfig(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Unpublish header config
  unpublishHeaderConfig(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Reorder header configs
  reorderHeaderConfigs(
    @Body() orders: { id: string; order: number }[],
    @Res() response: Response
  ): Promise<void>;
  
  // Update logo
  updateLogo(
    @Param('id') id: string,
    @Param('logoType') logoType: 'left' | 'right',
    @Body() logoData: Partial<LogoConfiguration>,
    @Res() response: Response
  ): Promise<void>;
  
  // Remove logo
  removeLogo(
    @Param('id') id: string,
    @Param('logoType') logoType: 'left' | 'right',
    @Res() response: Response
  ): Promise<void>;
  
  // Get header config statistics
  getHeaderConfigStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Export header configs
  exportHeaderConfigs(
    @Query() query: HeaderConfigQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
    @Res() response: Response
  ): Promise<void>;
  
  // Import header configs
  importHeaderConfigs(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
  
  // Bulk operations
  bulkPublish(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
  
  bulkUnpublish(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
  
  bulkDelete(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
  
  // Generate CSS
  generateCSS(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
}
```

## API Endpoints

### Public Header Endpoints

#### GET /api/v1/header-configs
**Description:** Get all published header configs
**Access:** Public

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `isActive`: Active status filter
- `isPublished`: Published status filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "header_id",
      "name": {
        "en": "Main Header",
        "ne": "मुख्य हेडर"
      },
      "order": 1,
      "isActive": true,
      "isPublished": true,
      "typography": {
        "fontFamily": "Arial, sans-serif",
        "fontSize": 16,
        "fontWeight": "normal",
        "color": "#333333",
        "lineHeight": 1.5,
        "letterSpacing": 0.5
      },
      "alignment": "CENTER",
      "logo": {
        "leftLogo": {
          "media": {
            "id": "media_id",
            "fileName": "logo_left.png",
            "url": "https://cdn.example.com/logos/logo_left.png"
          },
          "altText": {
            "en": "Left Logo",
            "ne": "बायाँ लोगो"
          },
          "width": 150,
          "height": 50
        },
        "rightLogo": null,
        "logoAlignment": "left",
        "logoSpacing": 20
      },
      "layout": {
        "headerHeight": 80,
        "backgroundColor": "#ffffff",
        "borderColor": "#e0e0e0",
        "borderWidth": 1,
        "padding": {
          "top": 10,
          "right": 20,
          "bottom": 10,
          "left": 20
        },
        "margin": {
          "top": 0,
          "right": 0,
          "bottom": 0,
          "left": 0
        },
        "responsive": {
          "mobile": {
            "headerHeight": 60,
            "padding": {
              "top": 5,
              "right": 10,
              "bottom": 5,
              "left": 10
            }
          }
        }
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

#### GET /api/v1/header-configs/{id}
**Description:** Get header config by ID
**Access:** Public

#### GET /api/v1/header-configs/display/active
**Description:** Get active header config for display
**Access:** Public

#### GET /api/v1/header-configs/order/{order}
**Description:** Get header config by order
**Access:** Public

#### GET /api/v1/header-configs/{id}/css
**Description:** Get header CSS
**Access:** Public

#### POST /api/v1/header-configs/preview
**Description:** Preview header config
**Access:** Public

### Admin Header Endpoints

#### POST /api/v1/admin/header-configs
**Description:** Create header config
**Access:** Admin, Editor

**Request Body:**
```json
{
  "name": {
    "en": "Main Header",
    "ne": "मुख्य हेडर"
  },
  "order": 1,
  "isActive": true,
  "isPublished": true,
  "typography": {
    "fontFamily": "Arial, sans-serif",
    "fontSize": 16,
    "fontWeight": "normal",
    "color": "#333333",
    "lineHeight": 1.5,
    "letterSpacing": 0.5
  },
  "alignment": "CENTER",
  "logo": {
    "leftLogo": {
      "mediaId": "media_id",
      "altText": {
        "en": "Left Logo",
        "ne": "बायाँ लोगो"
      },
      "width": 150,
      "height": 50
    },
    "logoAlignment": "left",
    "logoSpacing": 20
  },
  "layout": {
    "headerHeight": 80,
    "backgroundColor": "#ffffff",
    "borderColor": "#e0e0e0",
    "borderWidth": 1,
    "padding": {
      "top": 10,
      "right": 20,
      "bottom": 10,
      "left": 20
    },
    "margin": {
      "top": 0,
      "right": 0,
      "bottom": 0,
      "left": 0
    }
  }
}
```

#### PUT /api/v1/admin/header-configs/{id}
**Description:** Update header config
**Access:** Admin, Editor

#### DELETE /api/v1/admin/header-configs/{id}
**Description:** Delete header config
**Access:** Admin only

#### POST /api/v1/admin/header-configs/{id}/publish
**Description:** Publish header config
**Access:** Admin, Editor

#### POST /api/v1/admin/header-configs/{id}/unpublish
**Description:** Unpublish header config
**Access:** Admin, Editor

#### PUT /api/v1/admin/header-configs/reorder
**Description:** Reorder header configs
**Access:** Admin, Editor

#### POST /api/v1/admin/header-configs/{id}/logo/{logoType}/upload
**Description:** Upload logo file (Supports JPG, PNG, WebP, SVG, and GIF)
**Access:** Admin, Editor

**Request Body (multipart/form-data):**
```json
{
  "image": "file", // or "file" or "logo" field
  "altText": {
    "en": "Company Logo",
    "ne": "कम्पनी लोगो"
  },
  "width": 150,
  "height": 50
}
```

#### PUT /api/v1/admin/header-configs/{id}/logo/{logoType}
**Description:** Update logo
**Access:** Admin, Editor

#### DELETE /api/v1/admin/header-configs/{id}/logo/{logoType}
**Description:** Remove logo
**Access:** Admin, Editor

#### GET /api/v1/admin/header-configs/statistics
**Description:** Get header config statistics
**Access:** Admin, Editor

#### GET /api/v1/admin/header-configs/export
**Description:** Export header configs
**Access:** Admin, Editor

#### POST /api/v1/admin/header-configs/import
**Description:** Import header configs
**Access:** Admin only

#### GET /api/v1/admin/header-configs/{id}/css
**Description:** Generate CSS
**Access:** Admin, Editor

## Business Logic

### 1. Header Configuration Management
- **Typography control** for consistent branding
- **Layout management** for responsive design
- **Logo positioning** for brand identity
- **Alignment options** for design flexibility

### 2. Logo Management
- **Left and right logo support** for branding
- **Multiple file format support** (JPG, PNG, WebP, SVG, GIF)
- **Media integration** with media management system
- **Size control** for responsive design
- **Alt text support** for accessibility

### 3. CSS Generation
- **Dynamic CSS generation** from configuration
- **Responsive design support** for different screen sizes
- **Typography CSS** for consistent styling
- **Layout CSS** for positioning and spacing

### 4. Preview System
- **Real-time preview** of header configurations
- **CSS preview** for styling validation
- **HTML preview** for structure validation
- **Responsive preview** for different devices

## Error Handling

### Header Config Creation Errors
```json
{
  "success": false,
  "error": {
    "code": "HEADER_CONFIG_CREATION_ERROR",
    "message": "Header configuration creation failed",
    "details": [
      {
        "field": "name",
        "message": "Header name is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  }
}
```

### Logo Update Errors
```json
{
  "success": false,
  "error": {
    "code": "LOGO_UPDATE_ERROR",
    "message": "Logo update failed",
    "details": [
      {
        "field": "mediaId",
        "message": "Media not found",
        "code": "MEDIA_NOT_FOUND"
      }
    ]
  }
}
```

## Performance Considerations

### 1. CSS Generation
- **Caching** for generated CSS
- **Minification** for production use
- **Compression** for faster loading
- **CDN integration** for global delivery

### 2. Logo Management
- **Image optimization** for web delivery
- **Responsive images** for different screen sizes
- **Lazy loading** for better performance
- **Caching** for frequently accessed logos

### 3. Configuration Management
- **Caching** for active configurations
- **Database optimization** for configuration queries
- **Indexing** on frequently queried fields
- **Connection pooling** for high concurrency

## Security Considerations

### 1. Input Validation
- **CSS injection prevention** in typography settings
- **File upload validation** for logos
- **Color code validation** for design settings
- **Size limit validation** for responsive design

### 2. Access Control
- **Public read access** for published configurations
- **Admin/Editor write access** for management
- **Preview access** for authorized users
- **Audit logging** for all operations

### 3. Data Protection
- **Configuration backup** for data protection
- **Version control** for configuration changes
- **Secure storage** for sensitive settings
- **Access logging** for security monitoring 