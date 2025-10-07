# FAQ Module

## Overview

The FAQ module manages frequently asked questions with bilingual support (English and Nepali), search functionality, and comprehensive administrative features. This module provides a complete FAQ management system with categorization, reordering, and advanced search capabilities.

## Module Purpose

- **FAQ Management:** Create, update, delete, and manage frequently asked questions
- **Bilingual Support:** Full English and Nepali language support for questions and answers
- **Search Functionality:** Advanced search with relevance scoring
- **Categorization:** Organize FAQs by categories (future feature)
- **Reordering:** Custom ordering of FAQs for better presentation
- **Statistics:** Comprehensive analytics and usage statistics
- **Bulk Operations:** Efficient bulk creation and updating of FAQs
- **Import/Export:** Data import and export capabilities
- **Random/Popular FAQs:** Special endpoints for featured content

## Database Schema

### FAQ Entity
```typescript
interface FAQ {
  id: string;
  question: TranslatableEntity; // { en: string, ne: string }
  answer: TranslatableEntity;   // { en: string, ne: string }
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Future relations
  category?: FAQCategory;
  createdBy?: User;
  updatedBy?: User;
}
```

### FAQ Category Entity (Future)
```typescript
interface FAQCategory {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## DTOs (Data Transfer Objects)

### FAQ DTOs

#### CreateFAQDto
```typescript
interface CreateFAQDto {
  question: TranslatableEntityDto;
  answer: TranslatableEntityDto;
  order?: number;
  isActive?: boolean;
}
```

#### UpdateFAQDto
```typescript
interface UpdateFAQDto {
  question?: TranslatableEntityDto;
  answer?: TranslatableEntityDto;
  order?: number;
  isActive?: boolean;
}
```

#### FAQResponseDto
```typescript
interface FAQResponseDto {
  id: string;
  question: TranslatableEntityDto | TranslatableEntityWithValue;
  answer: TranslatableEntityDto | TranslatableEntityWithValue;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### FAQQueryDto
```typescript
interface FAQQueryDto {
  isActive?: boolean;
  lang?: string;
}
```

#### BulkCreateFAQDto
```typescript
interface BulkCreateFAQDto {
  faqs: CreateFAQDto[];
}
```

#### BulkUpdateFAQDto
```typescript
interface BulkUpdateFAQDto {
  faqs: { id: string; data: UpdateFAQDto }[];
}
```

#### ReorderFAQDto
```typescript
interface ReorderFAQDto {
  items: { id: string; order: number }[];
}
```

#### FAQStatistics
```typescript
interface FAQStatistics {
  total: number;
  active: number;
  inactive: number;
  averageOrder: number;
  lastCreated: Date;
  lastUpdated: Date;
}
```

#### FAQSearchResult
```typescript
interface FAQSearchResult {
  data: FAQResponseDto[];
  total: number;
  searchTerm: string;
  relevanceScore: number;
}
```

## API Endpoints

### Public Endpoints

#### GET /faq
Get all FAQs with optional filtering
- **Query Parameters:**
  - `isActive` (boolean, optional): Filter by active status
  - `lang` (string, optional): Language preference ('en' or 'ne')
- **Response:** Array of FAQResponseDto

#### GET /faq/paginated
Get FAQs with pagination
- **Query Parameters:**
  - `page` (number, optional): Page number (default: 1)
  - `limit` (number, optional): Items per page (default: 10)
  - `isActive` (boolean, optional): Filter by active status
- **Response:** Paginated FAQResponseDto array

#### GET /faq/search
Search FAQs by question and answer content
- **Query Parameters:**
  - `q` (string, required): Search term
  - `isActive` (boolean, optional): Filter by active status
- **Response:** FAQSearchResult with relevance scoring

#### GET /faq/random
Get random FAQs
- **Query Parameters:**
  - `limit` (number, optional): Number of FAQs (default: 5)
  - `lang` (string, optional): Language preference
- **Response:** Array of FAQResponseDto

#### GET /faq/popular
Get popular FAQs
- **Query Parameters:**
  - `limit` (number, optional): Number of FAQs (default: 10)
  - `lang` (string, optional): Language preference
- **Response:** Array of FAQResponseDto

#### GET /faq/active
Get only active FAQs
- **Query Parameters:**
  - `lang` (string, optional): Language preference
- **Response:** Array of FAQResponseDto

#### GET /faq/:id
Get FAQ by ID
- **Path Parameters:**
  - `id` (string, required): FAQ ID
- **Response:** FAQResponseDto

### Admin Endpoints

All admin endpoints require JWT authentication and appropriate roles (ADMIN or EDITOR).

#### GET /admin/faq
Get all FAQs (Admin)
- **Query Parameters:** Same as public endpoint
- **Authentication:** Required (JWT)
- **Roles:** ADMIN, EDITOR

#### GET /admin/faq/paginated
Get FAQs with pagination (Admin)
- **Query Parameters:** Same as public endpoint
- **Authentication:** Required (JWT)
- **Roles:** ADMIN, EDITOR

#### GET /admin/faq/statistics
Get FAQ statistics
- **Authentication:** Required (JWT)
- **Roles:** ADMIN, EDITOR
- **Response:** FAQStatistics

#### GET /admin/faq/search
Search FAQs (Admin)
- **Query Parameters:** Same as public endpoint
- **Authentication:** Required (JWT)
- **Roles:** ADMIN, EDITOR

#### GET /admin/faq/:id
Get FAQ by ID (Admin)
- **Path Parameters:**
  - `id` (string, required): FAQ ID
- **Authentication:** Required (JWT)
- **Roles:** ADMIN, EDITOR

#### POST /admin/faq
Create new FAQ
- **Body:** CreateFAQDto
- **Authentication:** Required (JWT)
- **Roles:** ADMIN, EDITOR
- **Response:** FAQResponseDto

#### PUT /admin/faq/:id
Update FAQ
- **Path Parameters:**
  - `id` (string, required): FAQ ID
- **Body:** UpdateFAQDto
- **Authentication:** Required (JWT)
- **Roles:** ADMIN, EDITOR
- **Response:** FAQResponseDto

#### DELETE /admin/faq/:id
Delete FAQ
- **Path Parameters:**
  - `id` (string, required): FAQ ID
- **Authentication:** Required (JWT)
- **Roles:** ADMIN

#### POST /admin/faq/reorder
Reorder FAQs
- **Body:** ReorderFAQDto
- **Authentication:** Required (JWT)
- **Roles:** ADMIN, EDITOR

#### POST /admin/faq/bulk-create
Bulk create FAQs
- **Body:** BulkCreateFAQDto
- **Authentication:** Required (JWT)
- **Roles:** ADMIN, EDITOR
- **Response:** Array of FAQResponseDto

#### PUT /admin/faq/bulk-update
Bulk update FAQs
- **Body:** BulkUpdateFAQDto
- **Authentication:** Required (JWT)
- **Roles:** ADMIN, EDITOR
- **Response:** Array of FAQResponseDto

#### POST /admin/faq/import
Import FAQs from external source
- **Body:** { faqs: CreateFAQDto[] }
- **Authentication:** Required (JWT)
- **Roles:** ADMIN
- **Response:** ImportResult

#### GET /admin/faq/export/all
Export all FAQs
- **Authentication:** Required (JWT)
- **Roles:** ADMIN, EDITOR
- **Response:** ExportResult

## Features

### Bilingual Support
- Full English and Nepali language support
- Automatic language detection and fallback
- Language-specific content retrieval

### Search Functionality
- Full-text search in both English and Nepali
- Relevance scoring based on exact and partial matches
- Search in both questions and answers
- Support for active/inactive filtering

### Reordering System
- Custom ordering of FAQs
- Bulk reordering capabilities
- Order validation and conflict resolution

### Statistics and Analytics
- Total FAQ count
- Active/inactive distribution
- Average ordering information
- Creation and update timestamps

### Bulk Operations
- Bulk creation of multiple FAQs
- Bulk updating of existing FAQs
- Validation and error handling for bulk operations

### Import/Export
- JSON-based import/export functionality
- Validation during import
- Detailed import results with success/failure counts

### Random and Popular FAQs
- Random FAQ selection for featured content
- Popular FAQ retrieval (future: based on usage analytics)
- Configurable limits and language preferences

## Future Enhancements

### FAQ Categories
- Category-based organization
- Category-specific endpoints
- Hierarchical category structure

### Usage Analytics
- View count tracking
- Popular FAQ identification
- User interaction analytics

### Advanced Search
- Category-based filtering
- Date range filtering
- Advanced relevance algorithms

### FAQ Templates
- Predefined FAQ templates
- Template-based FAQ creation
- Template management system

### FAQ Scheduling
- Scheduled publication/depublication
- Time-based FAQ visibility
- Content lifecycle management

## Error Handling

The module provides comprehensive error handling:

- **Validation Errors:** Detailed validation messages for all input fields
- **Not Found Errors:** Proper 404 responses for missing FAQs
- **Authorization Errors:** 401/403 responses for unauthorized access
- **Bulk Operation Errors:** Detailed error reporting for bulk operations
- **Import Errors:** Comprehensive import result with success/failure details

## Security

- JWT-based authentication for admin endpoints
- Role-based access control (ADMIN, EDITOR)
- Input validation and sanitization
- SQL injection prevention through Prisma ORM
- Rate limiting support

## Performance

- Efficient database queries with Prisma ORM
- Pagination support for large datasets
- Search optimization with relevance scoring
- Caching support for frequently accessed data
- Bulk operation optimization 