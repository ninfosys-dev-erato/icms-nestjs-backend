# Frontend API Schemas & DTOs Documentation

This document contains all the Data Transfer Objects (DTOs), response schemas, and validation information that the frontend application needs to interact with the backend API.

## Table of Contents

- [Global API Response Structure](#global-api-response-structure)
- [Common Types](#common-types)
- [Authentication Module](#authentication-module)
- [Content Management Module](#content-management-module)
- [FAQ Module](#faq-module)
- [Search Module](#search-module)
- [Navigation Module](#navigation-module)
- [Slider Module](#slider-module)
- [Header Module](#header-module)
- [Important Links Module](#important-links-module)
- [Office Description Module](#office-description-module)
- [Office Settings Module](#office-settings-module)
- [Documents Module](#documents-module)
- [HR Module](#hr-module)
- [Media Module](#media-module)
- [Frontend Implementation Guide](#frontend-implementation-guide)

---

## Global API Response Structure

All API responses follow this standardized format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  pagination?: PaginationInfo;
}

interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
  stack?: string;
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

interface ApiMeta {
  timestamp: string;
  version: string;
  requestId?: string;
  processingTime?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### Response Examples

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

---

## Common Types

### TranslatableEntity (Bilingual Support)
All text content supports both English and Nepali languages:

```typescript
interface TranslatableEntity {
  en: string;  // English text
  ne: string;  // Nepali text (नेपाली पाठ)
}
```

### Validation Error Codes
```typescript
type ValidationErrorCode = 
  | 'REQUIRED_FIELD'
  | 'INVALID_FIELD'
  | 'FIELD_TOO_LONG'
  | 'FIELD_TOO_SHORT'
  | 'INVALID_FORMAT'
  | 'NOT_UNIQUE'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'UNAUTHORIZED_ERROR'
  | 'FORBIDDEN_ERROR'
  | 'INTERNAL_SERVER_ERROR'
  | 'BAD_REQUEST_ERROR'
  | 'CONFLICT_ERROR';
```

---

## Authentication Module

### Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/verify-email/:token` - Verify email address
- `POST /auth/resend-verification` - Resend verification email
- `GET /auth/me` - Get current user (authenticated)
- `GET /auth/sessions` - Get user sessions (authenticated)

### Request DTOs

#### LoginRequest
```typescript
interface LoginRequest {
  email: string;           // Required, valid email format
  password: string;        // Required, min 8 characters
  rememberMe?: boolean;    // Optional
}
```

#### RegisterRequest
```typescript
interface RegisterRequest {
  email: string;           // Required, valid email format
  password: string;        // Required, min 8 chars, complex password
  confirmPassword: string; // Required, must match password
  firstName: string;       // Required
  lastName: string;        // Required
  role?: 'ADMIN' | 'EDITOR' | 'VIEWER'; // Optional, defaults to VIEWER
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

#### ForgotPasswordRequest
```typescript
interface ForgotPasswordRequest {
  email: string;           // Required, valid email format
}
```

#### ResetPasswordRequest
```typescript
interface ResetPasswordRequest {
  token: string;           // Required, reset token from email
  password: string;        // Required, min 8 chars, complex password
  confirmPassword: string; // Required, must match password
}
```

#### ChangePasswordRequest
```typescript
interface ChangePasswordRequest {
  currentPassword: string; // Required
  newPassword: string;     // Required, min 8 chars, complex password
  confirmPassword: string; // Required, must match newPassword
}
```

### Response DTOs

#### AuthResponse
```typescript
interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;      // Seconds until token expires
  tokenType: string;      // Always "Bearer"
}
```

#### UserResponse
```typescript
interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### SessionResponse
```typescript
interface SessionResponse {
  id: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
}
```

---

## Content Management Module

### Endpoints
- `GET /content` - Get all published content
- `GET /content/featured` - Get featured content
- `GET /content/search` - Search content
- `GET /content/:slug` - Get content by slug
- `GET /categories` - Get all categories
- `GET /categories/tree` - Get category tree structure
- `GET /categories/active` - Get active categories
- `GET /categories/:slug` - Get category by slug

### Request DTOs

#### ContentQuery
```typescript
interface ContentQuery {
  page?: number;           // Default: 1
  limit?: number;          // Default: 10, Maximum: 100
  search?: string;         // Search term
  categoryId?: string;     // Filter by category ID
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;      // Filter featured content
  order?: 'asc' | 'desc'; // Sort order
  sortBy?: string;         // Sort field
  lang?: string;           // Language preference
}
```

### Response DTOs

#### ContentResponse
```typescript
interface ContentResponse {
  id: string;
  title: TranslatableEntity;
  content: TranslatableEntity;
  excerpt?: TranslatableEntity;
  slug: string;
  categoryId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  category: CategoryResponse;
  attachments: ContentAttachmentResponse[];
  createdBy: UserResponse;
  updatedBy: UserResponse;
}
```

#### CategoryResponse
```typescript
interface CategoryResponse {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  slug: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: CategoryResponse[];
  contentCount: number;
}
```

#### ContentAttachmentResponse
```typescript
interface ContentAttachmentResponse {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;        // Bytes
  mimeType: string;
  downloadUrl: string;
  createdAt: Date;
}
```

---

## FAQ Module

### Endpoints
- `GET /faq` - Get all FAQs
- `GET /faq/paginated` - Get FAQs with pagination
- `GET /faq/search` - Search FAQs
- `GET /faq/:id` - Get FAQ by ID

### Request DTOs

#### FAQQuery
```typescript
interface FAQQuery {
  page?: number;           // Default: 1
  limit?: number;          // Default: 10
  isActive?: boolean;      // Filter active FAQs
  lang?: string;           // Language preference
}
```

### Response DTOs

#### FAQResponse
```typescript
interface FAQResponse {
  id: string;
  question: TranslatableEntity;
  answer: TranslatableEntity;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Search Module

### Endpoints
- `GET /search` - Search content
- `POST /search/advanced` - Advanced search
- `GET /search/suggestions` - Get search suggestions
- `GET /search/popular` - Get popular searches
- `GET /search/history` - Get search history

### Request DTOs

#### SearchQuery
```typescript
interface SearchQuery {
  q: string;               // Required search term
  language?: string;        // Language preference
  contentType?: string;     // Filter by content type
  page?: number;           // Default: 1
  limit?: number;          // Default: 10
  sort?: string;           // Sort field
  order?: 'asc' | 'desc'; // Sort order
}
```

#### AdvancedSearchQuery
```typescript
interface AdvancedSearchQuery {
  query: string;           // Search term
  filters: {
    contentType?: string[];
    categoryId?: string[];
    dateFrom?: string;     // ISO date string
    dateTo?: string;       // ISO date string
    language?: string;
    tags?: string[];
  };
  pagination: {
    page: number;
    limit: number;
  };
  sorting: {
    field: string;
    order: 'asc' | 'desc';
  };
}
```

### Response DTOs

#### SearchResponse
```typescript
interface SearchResponse {
  data: SearchResult[];
  pagination: PaginationInfo;
  suggestions?: string[];
  totalResults: number;
  searchTime: number;      // Milliseconds
}
```

#### SearchResult
```typescript
interface SearchResult {
  id: string;
  type: 'content' | 'document' | 'faq' | 'employee';
  title: TranslatableEntity;
  excerpt?: TranslatableEntity;
  url: string;
  relevance: number;       // 0-1 score
  metadata: Record<string, any>;
}
```

#### PopularQuery
```typescript
interface PopularQuery {
  query: string;
  count: number;
  lastSearched: Date;
}
```

---

## Navigation Module

### Endpoints
- `GET /menus` - Get all published menus
- `GET /menus/:id` - Get menu by ID
- `GET /menus/location/:location` - Get menu by location
- `GET /menus/:id/tree` - Get menu tree
- `GET /menu-items` - Get all published menu items
- `GET /menu-items/search` - Search menu items
- `GET /menu-items/menu/:menuId` - Get menu items by menu
- `GET /menu-items/:itemId/breadcrumb` - Get breadcrumb for item
- `GET /menu-items/:id` - Get menu item by ID

### Request DTOs

#### MenuQuery
```typescript
interface MenuQuery {
  page?: number;
  limit?: number;
  location?: 'HEADER' | 'FOOTER' | 'SIDEBAR' | 'MOBILE';
  isActive?: boolean;
  isPublished?: boolean;
}
```

#### MenuItemQuery
```typescript
interface MenuItemQuery {
  page?: number;
  limit?: number;
  menuId?: string;
  parentId?: string;
  isActive?: boolean;
}
```

### Response DTOs

#### MenuResponse
```typescript
interface MenuResponse {
  id: string;
  name: string;
  location: 'HEADER' | 'FOOTER' | 'SIDEBAR' | 'MOBILE';
  isActive: boolean;
  isPublished: boolean;
  items: MenuItemResponse[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### MenuItemResponse
```typescript
interface MenuItemResponse {
  id: string;
  title: TranslatableEntity;
  url?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  order: number;
  parentId?: string;
  isActive: boolean;
  children?: MenuItemResponse[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Slider Module

### Endpoints
- `GET /sliders` - Get all published sliders
- `GET /sliders/:id` - Get slider by ID
- `GET /sliders/display/active` - Get active sliders for display
- `GET /sliders/position/:position` - Get sliders by position
- `POST /sliders/:id/click` - Record slider click
- `POST /sliders/:id/view` - Record slider view

### Request DTOs

#### SliderQuery
```typescript
interface SliderQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isPublished?: boolean;
  position?: number;
}
```

### Response DTOs

#### SliderResponse
```typescript
interface SliderResponse {
  id: string;
  title?: TranslatableEntity;
  position: number;
  displayTime: number;     // Milliseconds
  isActive: boolean;
  isPublished: boolean;
  media: MediaResponse;
  clickCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Header Module

### Endpoints
- `GET /header-configs` - Get all published header configs
- `GET /header-configs/:id` - Get header config by ID
- `GET /header-configs/display/active` - Get active header config for display

### Request DTOs

#### HeaderConfigQuery
```typescript
interface HeaderConfigQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isPublished?: boolean;
}
```

### Response DTOs

#### HeaderConfigResponse
```typescript
interface HeaderConfigResponse {
  id: string;
  title: TranslatableEntity;
  description?: TranslatableEntity;
  logo?: MediaResponse;
  isActive: boolean;
  isPublished: boolean;
  settings: {
    showSearch: boolean;
    showLanguageSwitcher: boolean;
    showUserMenu: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Important Links Module

### Endpoints
- `GET /important-links` - Get all important links
- `GET /important-links/pagination` - Get important links with pagination
- `GET /important-links/footer` - Get footer links
- `GET /important-links/active` - Get active important links
- `GET /important-links/:id` - Get important link by ID

### Request DTOs

#### ImportantLinksQuery
```typescript
interface ImportantLinksQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
  lang?: string;
  category?: string;
}
```

### Response DTOs

#### ImportantLinkResponse
```typescript
interface ImportantLinkResponse {
  id: string;
  title: TranslatableEntity;
  description?: TranslatableEntity;
  url: string;
  target?: '_self' | '_blank';
  icon?: string;
  order: number;
  isActive: boolean;
  category?: string;
  lang?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### FooterLinksDto
```typescript
interface FooterLinksDto {
  quickLinks: ImportantLinkResponse[];
  socialMedia: ImportantLinkResponse[];
  contactInfo: ImportantLinkResponse[];
  legalLinks: ImportantLinkResponse[];
}
```

---

## Office Description Module

### Endpoints
- `GET /office-descriptions` - Get all office descriptions
- `GET /office-descriptions/types` - Get all office description types
- `GET /office-descriptions/type/:type` - Get office description by type
- `GET /office-descriptions/introduction` - Get office introduction
- `GET /office-descriptions/objective` - Get office objective
- `GET /office-descriptions/work-details` - Get office work details
- `GET /office-descriptions/organizational-structure` - Get organizational structure
- `GET /office-descriptions/digital-charter` - Get digital charter
- `GET /office-descriptions/employee-sanctions` - Get employee sanctions
- `GET /office-descriptions/:id` - Get office description by ID

### Request DTOs

#### OfficeDescriptionQuery
```typescript
interface OfficeDescriptionQuery {
  lang?: string;
  type?: OfficeDescriptionType;
}
```

### Response DTOs

#### OfficeDescriptionResponse
```typescript
interface OfficeDescriptionResponse {
  id: string;
  title: TranslatableEntity;
  content: TranslatableEntity;
  type: OfficeDescriptionType;
  lang: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### OfficeDescriptionType
```typescript
enum OfficeDescriptionType {
  INTRODUCTION = 'INTRODUCTION',
  OBJECTIVE = 'OBJECTIVE',
  WORK_DETAILS = 'WORK_DETAILS',
  ORGANIZATIONAL_STRUCTURE = 'ORGANIZATIONAL_STRUCTURE',
  DIGITAL_CHARTER = 'DIGITAL_CHARTER',
  EMPLOYEE_SANCTIONS = 'EMPLOYEE_SANCTIONS'
}
```

---

## Office Settings Module

### Endpoints
- `GET /office-settings` - Get office settings
- `GET /office-settings/seo` - Get office settings for SEO

### Response DTOs

#### OfficeSettingsResponse
```typescript
interface OfficeSettingsResponse {
  id: string;
  officeName: TranslatableEntity;
  officeDescription?: TranslatableEntity;
  contactInfo: {
    address: TranslatableEntity;
    phone: string;
    email: string;
    website?: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  seoSettings: {
    title: TranslatableEntity;
    description: TranslatableEntity;
    keywords: string[];
    ogImage?: string;
  };
  lang: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Documents Module

### Endpoints
- `GET /documents` - Get all public documents
- `GET /documents/type/:type` - Get documents by type
- `GET /documents/category/:category` - Get documents by category
- `GET /documents/search` - Search documents
- `GET /documents/:id` - Get document by ID

### Request DTOs

#### DocumentQuery
```typescript
interface DocumentQuery {
  page?: number;
  limit?: number;
  search?: string;
  documentType?: DocumentType;
  category?: DocumentCategory;
  sort?: string;
  order?: 'asc' | 'desc';
  isActive?: boolean;
}
```

### Response DTOs

#### DocumentResponse
```typescript
interface DocumentResponse {
  id: string;
  title: TranslatableEntity;
  description?: TranslatableEntity;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;        // Bytes
  mimeType: string;
  documentType: DocumentType;
  category: DocumentCategory;
  status: DocumentStatus;
  documentNumber?: string;
  version?: string;
  publishDate?: Date;
  expiryDate?: Date;
  tags?: string[];
  isPublic: boolean;
  requiresAuth: boolean;
  order: number;
  isActive: boolean;
  downloadCount: number;
  downloadUrl: string;
  presignedDownloadUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### DocumentType
```typescript
enum DocumentType {
  PDF = 'PDF',
  DOC = 'DOC',
  DOCX = 'DOCX',
  XLS = 'XLS',
  XLSX = 'XLSX',
  PPT = 'PPT',
  PPTX = 'PPTX'
}
```

#### DocumentCategory
```typescript
enum DocumentCategory {
  OFFICIAL = 'OFFICIAL',
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL'
}
```

#### DocumentStatus
```typescript
enum DocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}
```

---

## HR Module

### Endpoints

#### Departments
- `GET /departments` - Get all active departments
- `GET /departments/hierarchy` - Get department hierarchy
- `GET /departments/search` - Search departments
- `GET /departments/:id` - Get department by ID

#### Employees
- `GET /employees` - Get all active employees
- `GET /employees/search` - Search employees
- `GET /employees/department/:departmentId` - Get employees by department
- `GET /employees/position/:position` - Get employees by position
- `GET /employees/:id` - Get employee by ID

### Request DTOs

#### DepartmentQuery
```typescript
interface DepartmentQuery {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
}
```

#### EmployeeQuery
```typescript
interface EmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  isActive?: boolean;
}
```

### Response DTOs

#### DepartmentResponse
```typescript
interface DepartmentResponse {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  code: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  employeeCount: number;
  createdAt: Date;
  updatedAt: Date;
  children?: DepartmentResponse[];
}
```

#### EmployeeResponse
```typescript
interface EmployeeResponse {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  departmentId: string;
  department: DepartmentResponse;
  isActive: boolean;
  joinDate: Date;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Media Module

### Endpoints
- `GET /media` - Get media files
- `GET /media/:id` - Get media by ID
- `GET /media/search` - Search media
- `GET /media/albums` - Get media albums
- `GET /media/albums/:id` - Get album by ID

### Request DTOs

#### MediaQuery
```typescript
interface MediaQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}
```

### Response DTOs

#### MediaResponse
```typescript
interface MediaResponse {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;        // Bytes
  mimeType: string;
  altText?: string;
  title?: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  downloadUrl: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### MediaAlbumResponse
```typescript
interface MediaAlbumResponse {
  id: string;
  name: string;
  description?: string;
  coverImage?: MediaResponse;
  mediaCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  media: MediaResponse[];
}
```

---

## Frontend Implementation Guide

### Zod Validation Schemas

```typescript
import { z } from 'zod';

// Translatable Entity Schema
const TranslatableEntitySchema = z.object({
  en: z.string().min(1, 'English text is required'),
  ne: z.string().min(1, 'Nepali text is required'),
});

// API Response Schema
const ApiResponseSchema = <T>(dataSchema: z.ZodType<T>) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.array(z.object({
        field: z.string(),
        message: z.string(),
        code: z.string(),
        value: z.any().optional(),
      })).optional(),
    }).optional(),
    meta: z.object({
      timestamp: z.string(),
      version: z.string(),
      requestId: z.string().optional(),
      processingTime: z.number().optional(),
    }).optional(),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }).optional(),
  });

// Usage Examples
const ContentResponseSchema = z.object({
  id: z.string(),
  title: TranslatableEntitySchema,
  content: TranslatableEntitySchema,
  excerpt: TranslatableEntitySchema.optional(),
  slug: z.string(),
  categoryId: z.string(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  featured: z.boolean(),
  order: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const ContentApiResponseSchema = ApiResponseSchema(ContentResponseSchema);
```

### Error Handling

```typescript
// Handle API errors
const handleApiError = (error: any) => {
  if (error.error?.code === 'VALIDATION_ERROR') {
    // Handle validation errors
    error.error.details?.forEach((detail: ValidationError) => {
      console.error(`Field: ${detail.field}, Error: ${detail.message}`);
    });
  } else if (error.error?.code === 'UNAUTHORIZED_ERROR') {
    // Redirect to login
    router.push('/login');
  } else if (error.error?.code === 'NOT_FOUND_ERROR') {
    // Show 404 page
    router.push('/404');
  }
};
```

### Pagination Helper

```typescript
const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  
  const nextPage = () => setPage(prev => prev + 1);
  const prevPage = () => setPage(prev => Math.max(1, prev - 1));
  const goToPage = (newPage: number) => setPage(Math.max(1, newPage));
  
  return { page, limit, setLimit, nextPage, prevPage, goToPage };
};
```

### API Client Setup

```typescript
// API client with error handling
const apiClient = {
  async get<T>(url: string, schema: z.ZodType<T>): Promise<T> {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // Validate response
      const validatedData = schema.parse(data);
      
      if (!validatedData.success) {
        throw new Error(validatedData.error?.message || 'API request failed');
      }
      
      return validatedData.data;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Response validation failed:', error.errors);
      }
      throw error;
    }
  },
  
  async post<T>(url: string, body: any, schema: z.ZodType<T>): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      const validatedData = schema.parse(data);
      
      if (!validatedData.success) {
        throw new Error(validatedData.error?.message || 'API request failed');
      }
      
      return validatedData.data;
    } catch (error) {
      throw error;
    }
  }
};
```

### TypeScript Types

```typescript
// Export all types for frontend use
export type {
  ApiResponse,
  ApiError,
  ValidationError,
  ApiMeta,
  PaginationInfo,
  TranslatableEntity,
  ContentResponse,
  CategoryResponse,
  FAQResponse,
  SearchResponse,
  MenuResponse,
  SliderResponse,
  DocumentResponse,
  DepartmentResponse,
  EmployeeResponse,
  MediaResponse,
  // ... other types
} from './types';
```

---

## Notes

1. **Language Support**: All text content supports both English (en) and Nepali (ne) languages
2. **Pagination**: Default page size is 10, maximum is 100
3. **Authentication**: Use Bearer token in Authorization header for protected endpoints
4. **File Uploads**: Use multipart/form-data for file uploads
5. **Error Handling**: Always check the `success` field in responses
6. **Validation**: Use Zod schemas to validate API responses
7. **Rate Limiting**: API has rate limiting (100 requests per minute)
8. **Caching**: Implement appropriate caching strategies for static content

This documentation provides everything needed to build a robust frontend application that integrates with the backend API.
