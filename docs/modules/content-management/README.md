# Content Management System Module

## Overview

The Content Management System module provides comprehensive content management capabilities with hierarchical categories, content creation, editing, publishing workflow, and file attachment support. This module is the core of the CMS system.

## Module Purpose

- **Hierarchical Content Organization:** Support for infinite nested categories
- **Rich Content Management:** Multi-language content with rich text support
- **Publishing Workflow:** Draft, published, and archived content states
- **File Management:** Support for multiple file attachments per content
- **SEO Optimization:** URL-friendly slugs and meta information
- **Search and Filtering:** Advanced content discovery capabilities

## Database Schema

### Category Entity
```typescript
interface Category {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  slug: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  parent?: Category;
  children: Category[];
  contents: Content[];
}

interface TranslatableEntity {
  en: string;
  ne: string;
}
```

### Content Entity
```typescript
interface Content {
  id: string;
  title: TranslatableEntity;
  content: TranslatableEntity;
  excerpt?: TranslatableEntity;
  slug: string;
  categoryId: string;
  status: ContentStatus;
  publishedAt?: Date;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  category: Category;
  attachments: ContentAttachment[];
  createdBy: User;
  updatedBy: User;
}

enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}
```

### ContentAttachment Entity
```typescript
interface ContentAttachment {
  id: string;
  contentId: string;
  fileName: string;
  filePath: string; // S3 path
  fileSize: number;
  mimeType: string;
  order: number;
  createdAt: Date;
  
  // Relations
  content: Content;
}
```

## DTOs (Data Transfer Objects)

### Category DTOs

#### CreateCategoryDto
```typescript
interface CreateCategoryDto {
  name: TranslatableEntity;
  description?: TranslatableEntity;
  slug?: string; // Auto-generated if not provided
  parentId?: string;
  order?: number;
  isActive?: boolean;
}
```

#### UpdateCategoryDto
```typescript
interface UpdateCategoryDto {
  name?: TranslatableEntity;
  description?: TranslatableEntity;
  slug?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
}
```

#### CategoryResponseDto
```typescript
interface CategoryResponseDto {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  slug: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: CategoryResponseDto[];
  contentCount: number;
}
```

### Content DTOs

#### CreateContentDto
```typescript
interface CreateContentDto {
  title: TranslatableEntity;
  content: TranslatableEntity;
  excerpt?: TranslatableEntity;
  slug?: string; // Auto-generated if not provided
  categoryId: string;
  status?: ContentStatus;
  featured?: boolean;
  order?: number;
}
```

#### UpdateContentDto
```typescript
interface UpdateContentDto {
  title?: TranslatableEntity;
  content?: TranslatableEntity;
  excerpt?: TranslatableEntity;
  slug?: string;
  categoryId?: string;
  status?: ContentStatus;
  featured?: boolean;
  order?: number;
}
```

#### ContentResponseDto
```typescript
interface ContentResponseDto {
  id: string;
  title: TranslatableEntity;
  content: TranslatableEntity;
  excerpt?: TranslatableEntity;
  slug: string;
  categoryId: string;
  status: ContentStatus;
  publishedAt?: Date;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  category: CategoryResponseDto;
  attachments: ContentAttachmentResponseDto[];
  createdBy: UserResponseDto;
  updatedBy: UserResponseDto;
}
```

#### ContentQueryDto
```typescript
interface ContentQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: ContentStatus;
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

## Repository Interfaces

### CategoryRepository
```typescript
interface CategoryRepository {
  // Find category by ID
  findById(id: string): Promise<Category | null>;
  
  // Find category by slug
  findBySlug(slug: string): Promise<Category | null>;
  
  // Find all categories with hierarchy
  findAll(): Promise<Category[]>;
  
  // Find active categories
  findActive(): Promise<Category[]>;
  
  // Find categories by parent
  findByParent(parentId?: string): Promise<Category[]>;
  
  // Find category tree
  findTree(): Promise<Category[]>;
  
  // Create category
  create(data: CreateCategoryDto): Promise<Category>;
  
  // Update category
  update(id: string, data: UpdateCategoryDto): Promise<Category>;
  
  // Delete category
  delete(id: string): Promise<void>;
  
  // Check if slug exists
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  
  // Get category with content count
  findWithContentCount(id: string): Promise<CategoryWithContentCount>;
  
  // Reorder categories
  reorder(orders: { id: string; order: number }[]): Promise<void>;
}

interface CategoryWithContentCount extends Category {
  contentCount: number;
}
```

### ContentRepository
```typescript
interface ContentRepository {
  // Find content by ID
  findById(id: string): Promise<Content | null>;
  
  // Find content by slug
  findBySlug(slug: string): Promise<Content | null>;
  
  // Find all content with pagination and filters
  findAll(query: ContentQueryDto): Promise<PaginatedContentResult>;
  
  // Find published content
  findPublished(query: ContentQueryDto): Promise<PaginatedContentResult>;
  
  // Find content by category
  findByCategory(categoryId: string, query: ContentQueryDto): Promise<PaginatedContentResult>;
  
  // Find featured content
  findFeatured(limit?: number): Promise<Content[]>;
  
  // Search content
  search(searchTerm: string, query: ContentQueryDto): Promise<PaginatedContentResult>;
  
  // Create content
  create(data: CreateContentDto, userId: string): Promise<Content>;
  
  // Update content
  update(id: string, data: UpdateContentDto, userId: string): Promise<Content>;
  
  // Delete content
  delete(id: string): Promise<void>;
  
  // Publish content
  publish(id: string, userId: string): Promise<Content>;
  
  // Archive content
  archive(id: string, userId: string): Promise<Content>;
  
  // Check if slug exists
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  
  // Get content statistics
  getStatistics(): Promise<ContentStatistics>;
  
  // Get content by date range
  findByDateRange(dateFrom: Date, dateTo: Date): Promise<Content[]>;
}

interface PaginatedContentResult {
  data: Content[];
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

interface ContentStatistics {
  total: number;
  published: number;
  draft: number;
  archived: number;
  featured: number;
}
```

### ContentAttachmentRepository
```typescript
interface ContentAttachmentRepository {
  // Find attachment by ID
  findById(id: string): Promise<ContentAttachment | null>;
  
  // Find attachments by content
  findByContent(contentId: string): Promise<ContentAttachment[]>;
  
  // Create attachment
  create(data: CreateAttachmentDto): Promise<ContentAttachment>;
  
  // Update attachment
  update(id: string, data: UpdateAttachmentDto): Promise<ContentAttachment>;
  
  // Delete attachment
  delete(id: string): Promise<void>;
  
  // Reorder attachments
  reorder(contentId: string, orders: { id: string; order: number }[]): Promise<void>;
  
  // Get attachment statistics
  getStatistics(): Promise<AttachmentStatistics>;
}

interface CreateAttachmentDto {
  contentId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  order?: number;
}

interface UpdateAttachmentDto {
  fileName?: string;
  order?: number;
}

interface AttachmentStatistics {
  total: number;
  totalSize: number;
  byType: Record<string, number>;
}
```

## Service Interfaces

### CategoryService
```typescript
interface CategoryService {
  // Get category by ID
  getCategoryById(id: string): Promise<CategoryResponseDto>;
  
  // Get category by slug
  getCategoryBySlug(slug: string): Promise<CategoryResponseDto>;
  
  // Get all categories
  getAllCategories(): Promise<CategoryResponseDto[]>;
  
  // Get category tree
  getCategoryTree(): Promise<CategoryResponseDto[]>;
  
  // Get active categories
  getActiveCategories(): Promise<CategoryResponseDto[]>;
  
  // Create category
  createCategory(data: CreateCategoryDto): Promise<CategoryResponseDto>;
  
  // Update category
  updateCategory(id: string, data: UpdateCategoryDto): Promise<CategoryResponseDto>;
  
  // Delete category
  deleteCategory(id: string): Promise<void>;
  
  // Reorder categories
  reorderCategories(orders: { id: string; order: number }[]): Promise<void>;
  
  // Validate category data
  validateCategory(data: CreateCategoryDto | UpdateCategoryDto): Promise<ValidationResult>;
  
  // Generate slug
  generateSlug(title: string, excludeId?: string): Promise<string>;
  
  // Get category statistics
  getCategoryStatistics(): Promise<CategoryStatistics>;
}

interface CategoryStatistics {
  total: number;
  active: number;
  withContent: number;
  averageContentPerCategory: number;
}
```

### ContentService
```typescript
interface ContentService {
  // Get content by ID
  getContentById(id: string): Promise<ContentResponseDto>;
  
  // Get content by slug
  getContentBySlug(slug: string): Promise<ContentResponseDto>;
  
  // Get all content with pagination
  getAllContent(query: ContentQueryDto): Promise<PaginatedContentResponse>;
  
  // Get published content
  getPublishedContent(query: ContentQueryDto): Promise<PaginatedContentResponse>;
  
  // Get content by category
  getContentByCategory(categoryId: string, query: ContentQueryDto): Promise<PaginatedContentResponse>;
  
  // Get featured content
  getFeaturedContent(limit?: number): Promise<ContentResponseDto[]>;
  
  // Search content
  searchContent(searchTerm: string, query: ContentQueryDto): Promise<PaginatedContentResponse>;
  
  // Create content
  createContent(data: CreateContentDto, userId: string): Promise<ContentResponseDto>;
  
  // Update content
  updateContent(id: string, data: UpdateContentDto, userId: string): Promise<ContentResponseDto>;
  
  // Delete content
  deleteContent(id: string): Promise<void>;
  
  // Publish content
  publishContent(id: string, userId: string): Promise<ContentResponseDto>;
  
  // Archive content
  archiveContent(id: string, userId: string): Promise<ContentResponseDto>;
  
  // Validate content data
  validateContent(data: CreateContentDto | UpdateContentDto): Promise<ValidationResult>;
  
  // Generate slug
  generateSlug(title: string, excludeId?: string): Promise<string>;
  
  // Get content statistics
  getContentStatistics(): Promise<ContentStatistics>;
  
  // Export content
  exportContent(query: ContentQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Import content
  importContent(file: Express.Multer.File, userId: string): Promise<ImportResult>;
}

interface PaginatedContentResponse {
  data: ContentResponseDto[];
  pagination: PaginationInfo;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}
```

### ContentAttachmentService
```typescript
interface ContentAttachmentService {
  // Get attachment by ID
  getAttachmentById(id: string): Promise<ContentAttachmentResponseDto>;
  
  // Get attachments by content
  getAttachmentsByContent(contentId: string): Promise<ContentAttachmentResponseDto[]>;
  
  // Upload attachment
  uploadAttachment(contentId: string, file: Express.Multer.File): Promise<ContentAttachmentResponseDto>;
  
  // Update attachment
  updateAttachment(id: string, data: UpdateAttachmentDto): Promise<ContentAttachmentResponseDto>;
  
  // Delete attachment
  deleteAttachment(id: string): Promise<void>;
  
  // Reorder attachments
  reorderAttachments(contentId: string, orders: { id: string; order: number }[]): Promise<void>;
  
  // Validate file
  validateFile(file: Express.Multer.File): Promise<ValidationResult>;
  
  // Get attachment statistics
  getAttachmentStatistics(): Promise<AttachmentStatistics>;
  
  // Download attachment
  downloadAttachment(id: string): Promise<DownloadResult>;
}

interface ContentAttachmentResponseDto {
  id: string;
  contentId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  order: number;
  createdAt: Date;
  downloadUrl: string;
}

interface DownloadResult {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}
```

## Controller Interfaces

### PublicCategoryController
```typescript
interface PublicCategoryController {
  // Get all categories
  getAllCategories(
    @Res() response: Response
  ): Promise<void>;
  
  // Get category by slug
  getCategoryBySlug(
    @Param('slug') slug: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get category tree
  getCategoryTree(
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminCategoryController
```typescript
interface AdminCategoryController {
  // Get category by ID
  getCategoryById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create category
  createCategory(
    @Body() data: CreateCategoryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update category
  updateCategory(
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete category
  deleteCategory(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Reorder categories
  reorderCategories(
    @Body() orders: { id: string; order: number }[],
    @Res() response: Response
  ): Promise<void>;
  
  // Get category statistics
  getCategoryStatistics(
    @Res() response: Response
  ): Promise<void>;
}
```

### PublicContentController
```typescript
interface PublicContentController {
  // Get all published content
  getAllContent(
    @Query() query: ContentQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get content by slug
  getContentBySlug(
    @Param('slug') slug: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get content by category
  getContentByCategory(
    @Param('categoryId') categoryId: string,
    @Query() query: ContentQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get featured content
  getFeaturedContent(
    @Query('limit') limit?: number,
    @Res() response: Response
  ): Promise<void>;
  
  // Search content
  searchContent(
    @Query('q') searchTerm: string,
    @Query() query: ContentQueryDto,
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminContentController
```typescript
interface AdminContentController {
  // Get content by ID
  getContentById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create content
  createContent(
    @Body() data: CreateContentDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update content
  updateContent(
    @Param('id') id: string,
    @Body() data: UpdateContentDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete content
  deleteContent(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Publish content
  publishContent(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Archive content
  archiveContent(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get content statistics
  getContentStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Export content
  exportContent(
    @Query() query: ContentQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
    @Res() response: Response
  ): Promise<void>;
  
  // Import content
  importContent(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
}
```

### ContentAttachmentController
```typescript
interface ContentAttachmentController {
  // Get attachments by content
  getAttachmentsByContent(
    @Param('contentId') contentId: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Upload attachment
  uploadAttachment(
    @Param('contentId') contentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
  
  // Update attachment
  updateAttachment(
    @Param('id') id: string,
    @Body() data: UpdateAttachmentDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete attachment
  deleteAttachment(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Download attachment
  downloadAttachment(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Reorder attachments
  reorderAttachments(
    @Param('contentId') contentId: string,
    @Body() orders: { id: string; order: number }[],
    @Res() response: Response
  ): Promise<void>;
}
```

## API Endpoints

### Public Category Endpoints

#### GET /api/v1/categories
**Description:** Get all categories
**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_id",
      "name": {
        "en": "Legal Documents",
        "ne": "कानूनी कागजातहरू"
      },
      "description": {
        "en": "Official legal documents",
        "ne": "आधिकारिक कानूनी कागजातहरू"
      },
      "slug": "legal-documents",
      "parentId": null,
      "order": 1,
      "isActive": true,
      "children": [],
      "contentCount": 15
    }
  ]
}
```

#### GET /api/v1/categories/tree
**Description:** Get category tree structure
**Access:** Public

#### GET /api/v1/categories/{slug}
**Description:** Get category by slug
**Access:** Public

### Admin Category Endpoints

#### GET /api/v1/admin/categories/{id}
**Description:** Get category by ID
**Access:** Admin, Editor

#### POST /api/v1/admin/categories
**Description:** Create category
**Access:** Admin, Editor

#### PUT /api/v1/admin/categories/{id}
**Description:** Update category
**Access:** Admin, Editor

#### DELETE /api/v1/admin/categories/{id}
**Description:** Delete category
**Access:** Admin only

#### PUT /api/v1/admin/categories/reorder
**Description:** Reorder categories
**Access:** Admin, Editor

### Public Content Endpoints

#### GET /api/v1/contents
**Description:** Get all published content
**Access:** Public

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `category`: Category ID
- `featured`: Featured content only
- `dateFrom`: Filter from date
- `dateTo`: Filter to date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "content_id",
      "title": {
        "en": "New Policy Announcement",
        "ne": "नयाँ नीति घोषणा"
      },
      "content": {
        "en": "Content body...",
        "ne": "सामग्री मुख्य भाग..."
      },
      "excerpt": {
        "en": "Brief summary...",
        "ne": "संक्षिप्त सारांश..."
      },
      "slug": "new-policy-announcement",
      "categoryId": "cat_id",
      "status": "PUBLISHED",
      "publishedAt": "2024-01-01T00:00:00Z",
      "featured": false,
      "order": 1,
      "category": {
        "name": {
          "en": "Legal Documents",
          "ne": "कानूनी कागजातहरू"
        }
      },
      "attachments": []
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

#### GET /api/v1/contents/{slug}
**Description:** Get content by slug
**Access:** Public

#### GET /api/v1/categories/{categoryId}/contents
**Description:** Get content by category
**Access:** Public

#### GET /api/v1/contents/featured
**Description:** Get featured content
**Access:** Public

#### GET /api/v1/contents/search
**Description:** Search content
**Access:** Public

### Admin Content Endpoints

#### GET /api/v1/admin/contents/{id}
**Description:** Get content by ID
**Access:** Admin, Editor

#### POST /api/v1/admin/contents
**Description:** Create content
**Access:** Admin, Editor

#### PUT /api/v1/admin/contents/{id}
**Description:** Update content
**Access:** Admin, Editor

#### DELETE /api/v1/admin/contents/{id}
**Description:** Delete content
**Access:** Admin only

#### PUT /api/v1/admin/contents/{id}/publish
**Description:** Publish content
**Access:** Admin, Editor

#### PUT /api/v1/admin/contents/{id}/archive
**Description:** Archive content
**Access:** Admin, Editor

#### GET /api/v1/admin/contents/export
**Description:** Export content
**Access:** Admin, Editor

#### POST /api/v1/admin/contents/import
**Description:** Import content
**Access:** Admin only

### Content Attachment Endpoints

#### GET /api/v1/contents/{contentId}/attachments
**Description:** Get content attachments
**Access:** Public

#### POST /api/v1/admin/contents/{contentId}/attachments
**Description:** Upload attachment
**Access:** Admin, Editor

#### PUT /api/v1/admin/attachments/{id}
**Description:** Update attachment
**Access:** Admin, Editor

#### DELETE /api/v1/admin/attachments/{id}
**Description:** Delete attachment
**Access:** Admin, Editor

#### GET /api/v1/attachments/{id}/download
**Description:** Download attachment
**Access:** Public

## Business Logic

### 1. Content Publishing Workflow
- **Draft:** Content in creation/editing phase
- **Published:** Content available to public
- **Archived:** Content removed from public view

### 2. Slug Generation
- **Auto-generation** from title
- **Uniqueness validation**
- **URL-friendly format**
- **Fallback mechanism**

### 3. File Upload Rules
- **File size limits** (configurable)
- **Allowed file types** (configurable)
- **Virus scanning** integration
- **S3 storage** with CDN

### 4. Search Functionality
- **Full-text search** across title and content
- **Category filtering**
- **Date range filtering**
- **Status filtering**

### 5. SEO Optimization
- **Meta tags** generation
- **Structured data** (JSON-LD)
- **Sitemap** generation
- **Canonical URLs**

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
        "field": "title",
        "message": "Title is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  }
}
```

### Content Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "Content not found",
    "details": []
  }
}
```

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

## Performance Considerations

### 1. Database Optimization
- **Indexing** on frequently queried fields
- **Query optimization** for complex searches
- **Connection pooling** for high concurrency
- **Read replicas** for read-heavy workloads

### 2. Caching Strategy
- **Content caching** for frequently accessed content
- **Category tree caching** for navigation
- **Search result caching** for repeated queries
- **File URL caching** for attachments

### 3. File Management
- **CDN integration** for fast file delivery
- **Image optimization** and resizing
- **Lazy loading** for large files
- **Compression** for text-based files

## Security Considerations

### 1. Content Security
- **Input sanitization** for rich content
- **XSS prevention** in content rendering
- **Access control** based on content status
- **Audit logging** for content changes

### 2. File Security
- **File type validation** to prevent malicious uploads
- **Virus scanning** for uploaded files
- **Access control** for file downloads
- **Secure file storage** with encryption

### 3. API Security
- **Rate limiting** for content endpoints
- **Authentication** for admin operations
- **Authorization** based on user roles
- **Input validation** for all endpoints 