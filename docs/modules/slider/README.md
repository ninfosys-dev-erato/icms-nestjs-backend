# Slider/Banner System Module

## Overview

The Slider/Banner System module manages website sliders and banners with configurable display settings, timing controls, and media integration. This module provides a flexible solution for creating dynamic, engaging banner content that can be easily managed and scheduled.

## Module Purpose

- **Banner Management:** Create, edit, and organize banner content
- **Display Configuration:** Control banner positioning and timing
- **Media Integration:** Seamless integration with media management
- **Scheduling:** Set display schedules and time-based activation
- **Responsive Design:** Support for different screen sizes
- **Analytics:** Track banner performance and engagement

## Database Schema

### Slider Entity
```typescript
interface Slider {
  id: string;
  title?: TranslatableEntity;
  subtitle?: TranslatableEntity;
  description?: TranslatableEntity;
  position: number;
  displayTime: number; // Duration in seconds
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  isPublished: boolean;
  clickUrl?: string;
  target: 'self' | '_blank' | '_parent' | '_top';
  mediaId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  media: Media;
  createdBy: User;
  updatedBy: User;
  clicks: SliderClick[];
  views: SliderView[];
}

interface TranslatableEntity {
  en: string;
  ne: string;
}
```

### SliderClick Entity
```typescript
interface SliderClick {
  id: string;
  sliderId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  clickedAt: Date;
  
  // Relations
  slider: Slider;
  user?: User;
}
```

### SliderView Entity
```typescript
interface SliderView {
  id: string;
  sliderId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  viewedAt: Date;
  viewDuration?: number; // Time spent viewing in seconds
  
  // Relations
  slider: Slider;
  user?: User;
}
```

## DTOs (Data Transfer Objects)

### CreateSliderDto
```typescript
interface CreateSliderDto {
  title?: TranslatableEntity;
  subtitle?: TranslatableEntity;
  description?: TranslatableEntity;
  position: number;
  displayTime: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  isPublished?: boolean;
  clickUrl?: string;
  target?: 'self' | '_blank' | '_parent' | '_top';
  mediaId: string;
}
```

### UpdateSliderDto
```typescript
interface UpdateSliderDto {
  title?: TranslatableEntity;
  subtitle?: TranslatableEntity;
  description?: TranslatableEntity;
  position?: number;
  displayTime?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  isPublished?: boolean;
  clickUrl?: string;
  target?: 'self' | '_blank' | '_parent' | '_top';
  mediaId?: string;
}
```

### SliderResponseDto
```typescript
interface SliderResponseDto {
  id: string;
  title?: TranslatableEntity;
  subtitle?: TranslatableEntity;
  description?: TranslatableEntity;
  position: number;
  displayTime: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  isPublished: boolean;
  clickUrl?: string;
  target: 'self' | '_blank' | '_parent' | '_top';
  media: MediaResponseDto;
  clickCount: number;
  viewCount: number;
  clickThroughRate: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserResponseDto;
  updatedBy: UserResponseDto;
}
```

### SliderQueryDto
```typescript
interface SliderQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isPublished?: boolean;
  position?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
}
```

## Repository Interfaces

### SliderRepository
```typescript
interface SliderRepository {
  // Find slider by ID
  findById(id: string): Promise<Slider | null>;
  
  // Find all sliders with pagination and filters
  findAll(query: SliderQueryDto): Promise<PaginatedSliderResult>;
  
  // Find active sliders
  findActive(query: SliderQueryDto): Promise<PaginatedSliderResult>;
  
  // Find published sliders
  findPublished(query: SliderQueryDto): Promise<PaginatedSliderResult>;
  
  // Find sliders by position
  findByPosition(position: number): Promise<Slider[]>;
  
  // Search sliders
  search(searchTerm: string, query: SliderQueryDto): Promise<PaginatedSliderResult>;
  
  // Create slider
  create(data: CreateSliderDto, userId: string): Promise<Slider>;
  
  // Update slider
  update(id: string, data: UpdateSliderDto, userId: string): Promise<Slider>;
  
  // Delete slider
  delete(id: string): Promise<void>;
  
  // Publish slider
  publish(id: string, userId: string): Promise<Slider>;
  
  // Unpublish slider
  unpublish(id: string, userId: string): Promise<Slider>;
  
  // Reorder sliders
  reorder(orders: { id: string; position: number }[]): Promise<void>;
  
  // Get slider statistics
  getStatistics(): Promise<SliderStatistics>;
  
  // Find sliders by media
  findByMedia(mediaId: string): Promise<Slider[]>;
  
  // Get active sliders for display
  getActiveSlidersForDisplay(): Promise<Slider[]>;
  
  // Check if slider is currently active
  isSliderActive(id: string): Promise<boolean>;
}

interface PaginatedSliderResult {
  data: Slider[];
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

interface SliderStatistics {
  total: number;
  active: number;
  published: number;
  totalClicks: number;
  totalViews: number;
  averageClickThroughRate: number;
  byPosition: Record<number, number>;
}
```

### SliderClickRepository
```typescript
interface SliderClickRepository {
  // Create click record
  create(data: CreateSliderClickDto): Promise<SliderClick>;
  
  // Find clicks by slider
  findBySlider(sliderId: string, query: ClickQueryDto): Promise<PaginatedClickResult>;
  
  // Find clicks by user
  findByUser(userId: string, query: ClickQueryDto): Promise<PaginatedClickResult>;
  
  // Get click statistics
  getStatistics(): Promise<ClickStatistics>;
  
  // Get recent clicks
  getRecentClicks(limit?: number): Promise<SliderClick[]>;
  
  // Get clicks by date range
  getClicksByDateRange(startDate: Date, endDate: Date): Promise<SliderClick[]>;
}

interface CreateSliderClickDto {
  sliderId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
}

interface ClickQueryDto {
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

interface PaginatedClickResult {
  data: SliderClick[];
  pagination: PaginationInfo;
}

interface ClickStatistics {
  total: number;
  bySlider: Record<string, number>;
  byUser: Record<string, number>;
  byDate: Record<string, number>;
}
```

### SliderViewRepository
```typescript
interface SliderViewRepository {
  // Create view record
  create(data: CreateSliderViewDto): Promise<SliderView>;
  
  // Find views by slider
  findBySlider(sliderId: string, query: ViewQueryDto): Promise<PaginatedViewResult>;
  
  // Find views by user
  findByUser(userId: string, query: ViewQueryDto): Promise<PaginatedViewResult>;
  
  // Get view statistics
  getStatistics(): Promise<ViewStatistics>;
  
  // Get recent views
  getRecentViews(limit?: number): Promise<SliderView[]>;
  
  // Get views by date range
  getViewsByDateRange(startDate: Date, endDate: Date): Promise<SliderView[]>;
  
  // Update view duration
  updateViewDuration(id: string, duration: number): Promise<void>;
}

interface CreateSliderViewDto {
  sliderId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  viewDuration?: number;
}

interface ViewQueryDto {
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

interface PaginatedViewResult {
  data: SliderView[];
  pagination: PaginationInfo;
}

interface ViewStatistics {
  total: number;
  bySlider: Record<string, number>;
  byUser: Record<string, number>;
  byDate: Record<string, number>;
  averageViewDuration: number;
}
```

## Service Interfaces

### SliderService
```typescript
interface SliderService {
  // Get slider by ID
  getSliderById(id: string): Promise<SliderResponseDto>;
  
  // Get all sliders with pagination
  getAllSliders(query: SliderQueryDto): Promise<PaginatedSliderResponse>;
  
  // Get active sliders
  getActiveSliders(query: SliderQueryDto): Promise<PaginatedSliderResponse>;
  
  // Get published sliders
  getPublishedSliders(query: SliderQueryDto): Promise<PaginatedSliderResponse>;
  
  // Get sliders by position
  getSlidersByPosition(position: number): Promise<SliderResponseDto[]>;
  
  // Search sliders
  searchSliders(searchTerm: string, query: SliderQueryDto): Promise<PaginatedSliderResponse>;
  
  // Create slider
  createSlider(data: CreateSliderDto, userId: string): Promise<SliderResponseDto>;
  
  // Update slider
  updateSlider(id: string, data: UpdateSliderDto, userId: string): Promise<SliderResponseDto>;
  
  // Delete slider
  deleteSlider(id: string): Promise<void>;
  
  // Publish slider
  publishSlider(id: string, userId: string): Promise<SliderResponseDto>;
  
  // Unpublish slider
  unpublishSlider(id: string, userId: string): Promise<SliderResponseDto>;
  
  // Reorder sliders
  reorderSliders(orders: { id: string; position: number }[]): Promise<void>;
  
  // Validate slider data
  validateSlider(data: CreateSliderDto | UpdateSliderDto): Promise<ValidationResult>;
  
  // Get slider statistics
  getSliderStatistics(): Promise<SliderStatistics>;
  
  // Get active sliders for display
  getActiveSlidersForDisplay(): Promise<SliderResponseDto[]>;
  
  // Record slider click
  recordSliderClick(sliderId: string, userId?: string, ipAddress: string, userAgent: string): Promise<void>;
  
  // Record slider view
  recordSliderView(sliderId: string, userId?: string, ipAddress: string, userAgent: string, duration?: number): Promise<void>;
  
  // Get slider analytics
  getSliderAnalytics(sliderId: string, dateFrom?: Date, dateTo?: Date): Promise<SliderAnalytics>;
  
  // Export sliders
  exportSliders(query: SliderQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Import sliders
  importSliders(file: Express.Multer.File, userId: string): Promise<ImportResult>;
  
  // Bulk operations
  bulkPublish(ids: string[], userId: string): Promise<BulkOperationResult>;
  bulkUnpublish(ids: string[], userId: string): Promise<BulkOperationResult>;
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;
}

interface PaginatedSliderResponse {
  data: SliderResponseDto[];
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

interface SliderAnalytics {
  sliderId: string;
  totalClicks: number;
  totalViews: number;
  clickThroughRate: number;
  averageViewDuration: number;
  clicksByDate: Record<string, number>;
  viewsByDate: Record<string, number>;
  topReferrers: Array<{ referrer: string; count: number }>;
  deviceBreakdown: Record<string, number>;
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
```

## Controller Interfaces

### PublicSliderController
```typescript
interface PublicSliderController {
  // Get all published sliders
  getAllSliders(
    @Query() query: SliderQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get slider by ID
  getSliderById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get active sliders for display
  getActiveSlidersForDisplay(
    @Res() response: Response
  ): Promise<void>;
  
  // Get sliders by position
  getSlidersByPosition(
    @Param('position') position: number,
    @Res() response: Response
  ): Promise<void>;
  
  // Record slider click
  recordSliderClick(
    @Param('id') id: string,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
  
  // Record slider view
  recordSliderView(
    @Param('id') id: string,
    @Body() data: { duration?: number },
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminSliderController
```typescript
interface AdminSliderController {
  // Get slider by ID (admin)
  getSliderById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create slider
  createSlider(
    @Body() data: CreateSliderDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update slider
  updateSlider(
    @Param('id') id: string,
    @Body() data: UpdateSliderDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete slider
  deleteSlider(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Publish slider
  publishSlider(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Unpublish slider
  unpublishSlider(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Reorder sliders
  reorderSliders(
    @Body() orders: { id: string; position: number }[],
    @Res() response: Response
  ): Promise<void>;
  
  // Get slider statistics
  getSliderStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Get slider analytics
  getSliderAnalytics(
    @Param('id') id: string,
    @Query('dateFrom') dateFrom?: Date,
    @Query('dateTo') dateTo?: Date,
    @Res() response: Response
  ): Promise<void>;
  
  // Export sliders
  exportSliders(
    @Query() query: SliderQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
    @Res() response: Response
  ): Promise<void>;
  
  // Import sliders
  importSliders(
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
}
```

## API Endpoints

### Public Slider Endpoints

#### GET /api/v1/sliders
**Description:** Get all published sliders
**Access:** Public

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `isActive`: Active status filter
- `isPublished`: Published status filter
- `position`: Position filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "slider_id",
      "title": {
        "en": "Welcome to Our Office",
        "ne": "हाम्रो कार्यालयमा स्वागत छ"
      },
      "subtitle": {
        "en": "Providing excellent services",
        "ne": "उत्कृष्ट सेवा प्रदान गर्दै"
      },
      "description": {
        "en": "Learn more about our services",
        "ne": "हाम्रो सेवाहरूको बारेमा थप जानकारी"
      },
      "position": 1,
      "displayTime": 5000,
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-12-31T23:59:59Z",
      "isActive": true,
      "isPublished": true,
      "clickUrl": "https://example.com/services",
      "target": "_blank",
      "media": {
        "id": "media_id",
        "fileName": "banner_1.jpg",
        "url": "https://cdn.example.com/banners/banner_1.jpg"
      },
      "clickCount": 150,
      "viewCount": 2500,
      "clickThroughRate": 6.0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### GET /api/v1/sliders/{id}
**Description:** Get slider by ID
**Access:** Public

#### GET /api/v1/sliders/display/active
**Description:** Get active sliders for display
**Access:** Public

#### GET /api/v1/sliders/position/{position}
**Description:** Get sliders by position
**Access:** Public

#### POST /api/v1/sliders/{id}/click
**Description:** Record slider click
**Access:** Public

#### POST /api/v1/sliders/{id}/view
**Description:** Record slider view
**Access:** Public

### Admin Slider Endpoints

#### POST /api/v1/admin/sliders
**Description:** Create slider
**Access:** Admin, Editor

**Request Body:**
```json
{
  "title": {
    "en": "Welcome to Our Office",
    "ne": "हाम्रो कार्यालयमा स्वागत छ"
  },
  "subtitle": {
    "en": "Providing excellent services",
    "ne": "उत्कृष्ट सेवा प्रदान गर्दै"
  },
  "description": {
    "en": "Learn more about our services",
    "ne": "हाम्रो सेवाहरूको बारेमा थप जानकारी"
  },
  "position": 1,
  "displayTime": 5000,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "isActive": true,
  "isPublished": true,
  "clickUrl": "https://example.com/services",
  "target": "_blank",
  "mediaId": "media_id"
}
```

#### PUT /api/v1/admin/sliders/{id}
**Description:** Update slider
**Access:** Admin, Editor

#### DELETE /api/v1/admin/sliders/{id}
**Description:** Delete slider
**Access:** Admin only

#### POST /api/v1/admin/sliders/{id}/publish
**Description:** Publish slider
**Access:** Admin, Editor

#### POST /api/v1/admin/sliders/{id}/unpublish
**Description:** Unpublish slider
**Access:** Admin, Editor

#### PUT /api/v1/admin/sliders/reorder
**Description:** Reorder sliders
**Access:** Admin, Editor

#### GET /api/v1/admin/sliders/statistics
**Description:** Get slider statistics
**Access:** Admin, Editor

#### GET /api/v1/admin/sliders/{id}/analytics
**Description:** Get slider analytics
**Access:** Admin, Editor

#### GET /api/v1/admin/sliders/export
**Description:** Export sliders
**Access:** Admin, Editor

#### POST /api/v1/admin/sliders/import
**Description:** Import sliders
**Access:** Admin only

## Business Logic

### 1. Slider Management
- **Banner creation** with media integration
- **Position ordering** for display sequence
- **Timing controls** for display duration
- **Scheduling** with start/end dates
- **Publishing workflow** for content control

### 2. Display Logic
- **Active slider filtering** based on dates and status
- **Position-based ordering** for proper display
- **Responsive design** support for different screen sizes
- **Performance optimization** for fast loading

### 3. Analytics Implementation
- **Click tracking** for engagement measurement
- **View tracking** for impression counting
- **Click-through rate** calculation
- **Performance analytics** and reporting

### 4. Media Integration
- **Seamless media management** integration
- **Image optimization** for web delivery
- **CDN integration** for fast loading
- **Responsive image** support

## Error Handling

### Slider Creation Errors
```json
{
  "success": false,
  "error": {
    "code": "SLIDER_CREATION_ERROR",
    "message": "Slider creation failed",
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

### Slider Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "Slider not found",
    "details": []
  }
}
```

## Performance Considerations

### 1. Display Optimization
- **Caching** for active sliders
- **Image optimization** for fast loading
- **Lazy loading** for better performance
- **CDN integration** for global delivery

### 2. Analytics Performance
- **Asynchronous tracking** to avoid blocking
- **Batch processing** for analytics data
- **Database optimization** for analytics queries
- **Caching** for frequently accessed statistics

### 3. Database Optimization
- **Indexing** on frequently queried fields
- **Query optimization** for complex filters
- **Connection pooling** for high concurrency
- **Caching** for frequently accessed data

## Security Considerations

### 1. Input Validation
- **Slider data validation** for security
- **URL validation** for click targets
- **Media ID validation** for integration
- **Date validation** for scheduling

### 2. Access Control
- **Public read access** for published sliders
- **Admin/Editor write access** for management
- **Analytics access** for authorized users
- **Audit logging** for all operations

### 3. Data Protection
- **User privacy** in analytics tracking
- **IP address anonymization** for GDPR compliance
- **Secure data storage** with encryption
- **Access logging** for security monitoring 