# FAQ System Module

## Overview

The FAQ System module manages frequently asked questions with bilingual support, search functionality, and ordering capabilities. This module provides a comprehensive solution for organizing and presenting common questions and answers to users.

## Module Purpose

- **Question Management:** Create, edit, and organize FAQ entries
- **Bilingual Support:** Full English and Nepali language support
- **Search Functionality:** Find relevant questions quickly
- **Ordering System:** Customizable display order
- **SEO Optimization:** Search engine friendly FAQ structure
- **Public Access:** Easy access to common information

## Database Schema

### FAQ Entity
```typescript
interface FAQ {
  id: string;
  question: TranslatableEntity;
  answer: TranslatableEntity;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TranslatableEntity {
  en: string;
  ne: string;
}
```

## DTOs (Data Transfer Objects)

### CreateFAQDto
```typescript
interface CreateFAQDto {
  question: TranslatableEntity;
  answer: TranslatableEntity;
  order?: number;
  isActive?: boolean;
}
```

### UpdateFAQDto
```typescript
interface UpdateFAQDto {
  question?: TranslatableEntity;
  answer?: TranslatableEntity;
  order?: number;
  isActive?: boolean;
}
```

### FAQResponseDto
```typescript
interface FAQResponseDto {
  id: string;
  question: TranslatableEntity;
  answer: TranslatableEntity;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### FAQQueryDto
```typescript
interface FAQQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

## Repository Interface

### FAQRepository
```typescript
interface FAQRepository {
  // Find FAQ by ID
  findById(id: string): Promise<FAQ | null>;
  
  // Find all FAQs with pagination and filters
  findAll(query: FAQQueryDto): Promise<PaginatedFAQResult>;
  
  // Find active FAQs
  findActive(query: FAQQueryDto): Promise<PaginatedFAQResult>;
  
  // Search FAQs
  search(searchTerm: string, query: FAQQueryDto): Promise<PaginatedFAQResult>;
  
  // Create FAQ
  create(data: CreateFAQDto): Promise<FAQ>;
  
  // Update FAQ
  update(id: string, data: UpdateFAQDto): Promise<FAQ>;
  
  // Delete FAQ
  delete(id: string): Promise<void>;
  
  // Reorder FAQs
  reorder(orders: { id: string; order: number }[]): Promise<void>;
  
  // Get FAQ statistics
  getStatistics(): Promise<FAQStatistics>;
  
  // Find FAQs by search term
  findBySearchTerm(searchTerm: string): Promise<FAQ[]>;
}

interface PaginatedFAQResult {
  data: FAQ[];
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

interface FAQStatistics {
  total: number;
  active: number;
  inactive: number;
  averageLength: number;
}
```

## Service Interface

### FAQService
```typescript
interface FAQService {
  // Get FAQ by ID
  getFAQById(id: string): Promise<FAQResponseDto>;
  
  // Get all FAQs with pagination
  getAllFAQs(query: FAQQueryDto): Promise<PaginatedFAQResponse>;
  
  // Get active FAQs
  getActiveFAQs(query: FAQQueryDto): Promise<PaginatedFAQResponse>;
  
  // Search FAQs
  searchFAQs(searchTerm: string, query: FAQQueryDto): Promise<PaginatedFAQResponse>;
  
  // Create FAQ
  createFAQ(data: CreateFAQDto): Promise<FAQResponseDto>;
  
  // Update FAQ
  updateFAQ(id: string, data: UpdateFAQDto): Promise<FAQResponseDto>;
  
  // Delete FAQ
  deleteFAQ(id: string): Promise<void>;
  
  // Reorder FAQs
  reorderFAQs(orders: { id: string; order: number }[]): Promise<void>;
  
  // Validate FAQ data
  validateFAQ(data: CreateFAQDto | UpdateFAQDto): Promise<ValidationResult>;
  
  // Get FAQ statistics
  getFAQStatistics(): Promise<FAQStatistics>;
  
  // Export FAQs
  exportFAQs(query: FAQQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Import FAQs
  importFAQs(file: Express.Multer.File): Promise<ImportResult>;
  
  // Get FAQ suggestions
  getSuggestions(searchTerm: string, limit?: number): Promise<FAQResponseDto[]>;
}

interface PaginatedFAQResponse {
  data: FAQResponseDto[];
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
```

## Controller Interfaces

### PublicFAQController
```typescript
interface PublicFAQController {
  // Get all active FAQs
  getAllFAQs(
    @Query() query: FAQQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get FAQ by ID
  getFAQById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Search FAQs
  searchFAQs(
    @Query('q') searchTerm: string,
    @Query() query: FAQQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get FAQ suggestions
  getSuggestions(
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminFAQController
```typescript
interface AdminFAQController {
  // Get FAQ by ID (admin)
  getFAQById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create FAQ
  createFAQ(
    @Body() data: CreateFAQDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update FAQ
  updateFAQ(
    @Param('id') id: string,
    @Body() data: UpdateFAQDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete FAQ
  deleteFAQ(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Reorder FAQs
  reorderFAQs(
    @Body() orders: { id: string; order: number }[],
    @Res() response: Response
  ): Promise<void>;
  
  // Get FAQ statistics
  getFAQStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Export FAQs
  exportFAQs(
    @Query() query: FAQQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
    @Res() response: Response
  ): Promise<void>;
  
  // Import FAQs
  importFAQs(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
}
```

## API Endpoints

### Public Endpoints

#### GET /api/v1/faqs
**Description:** Get all active FAQs
**Access:** Public

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `sort`: Sort field
- `order`: Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "faq_id",
      "question": {
        "en": "How do I apply for a government service?",
        "ne": "सरकारी सेवाको लागि कसरी आवेदन दिने?"
      },
      "answer": {
        "en": "You can apply online through our portal...",
        "ne": "तपाईंले हाम्रो पोर्टल मार्फत अनलाइन आवेदन दिन सक्नुहुन्छ..."
      },
      "order": 1,
      "isActive": true,
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

#### GET /api/v1/faqs/{id}
**Description:** Get FAQ by ID
**Access:** Public

#### GET /api/v1/faqs/search
**Description:** Search FAQs
**Access:** Public

#### GET /api/v1/faqs/suggestions
**Description:** Get FAQ suggestions
**Access:** Public

### Admin Endpoints

#### GET /api/v1/admin/faqs/{id}
**Description:** Get FAQ by ID (admin)
**Access:** Admin, Editor

#### POST /api/v1/admin/faqs
**Description:** Create FAQ
**Access:** Admin, Editor

**Request Body:**
```json
{
  "question": {
    "en": "How do I apply for a government service?",
    "ne": "सरकारी सेवाको लागि कसरी आवेदन दिने?"
  },
  "answer": {
    "en": "You can apply online through our portal...",
    "ne": "तपाईंले हाम्रो पोर्टल मार्फत अनलाइन आवेदन दिन सक्नुहुन्छ..."
  },
  "order": 1,
  "isActive": true
}
```

#### PUT /api/v1/admin/faqs/{id}
**Description:** Update FAQ
**Access:** Admin, Editor

#### DELETE /api/v1/admin/faqs/{id}
**Description:** Delete FAQ
**Access:** Admin only

#### PUT /api/v1/admin/faqs/reorder
**Description:** Reorder FAQs
**Access:** Admin, Editor

#### GET /api/v1/admin/faqs/statistics
**Description:** Get FAQ statistics
**Access:** Admin, Editor

#### GET /api/v1/admin/faqs/export
**Description:** Export FAQs
**Access:** Admin, Editor

#### POST /api/v1/admin/faqs/import
**Description:** Import FAQs
**Access:** Admin only

## Business Logic

### 1. FAQ Management
- **Question-Answer pairs** with bilingual support
- **Ordering system** for display priority
- **Active/Inactive status** for content management
- **Search functionality** across questions and answers

### 2. Search Implementation
- **Full-text search** across question and answer fields
- **Language-specific search** (English/Nepali)
- **Fuzzy matching** for better results
- **Search result ranking** by relevance

### 3. Import/Export Functionality
- **JSON format** for data exchange
- **CSV format** for spreadsheet compatibility
- **PDF format** for documentation
- **Validation** during import process

### 4. SEO Optimization
- **Structured data** (FAQ schema)
- **Meta tags** for FAQ pages
- **Sitemap** inclusion
- **Search engine** friendly URLs

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
        "field": "question",
        "message": "Question is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  }
}
```

### FAQ Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "FAQ not found",
    "details": []
  }
}
```

## Performance Considerations

### 1. Search Optimization
- **Database indexing** on search fields
- **Full-text search** capabilities
- **Caching** for frequent searches
- **Pagination** for large result sets

### 2. Caching Strategy
- **FAQ list caching** for public access
- **Search result caching** for repeated queries
- **Statistics caching** for admin dashboard
- **Cache invalidation** on updates

### 3. Database Optimization
- **Indexing** on frequently queried fields
- **Query optimization** for complex searches
- **Connection pooling** for high concurrency

## Security Considerations

### 1. Input Validation
- **Question and answer sanitization**
- **Length limits** for content
- **HTML sanitization** if rich text is supported
- **Language validation** for translatable fields

### 2. Access Control
- **Public read access** for active FAQs
- **Admin/Editor write access** for management
- **Role-based permissions** for different operations
- **Audit logging** for content changes

### 3. Data Protection
- **Input sanitization** to prevent XSS
- **Output encoding** for safe display
- **Access logging** for security monitoring 