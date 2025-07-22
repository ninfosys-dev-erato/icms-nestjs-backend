# Search Module

## Overview

The Search module provides comprehensive global search functionality across all content types with full-text search capabilities, search result ranking, and search analytics. This module serves as the central search engine for the entire CMS system.

## Module Purpose

- **Global Search:** Search across all content types and modules
- **Full-Text Search:** Advanced text search with relevance ranking
- **Multi-Content Search:** Search across content, documents, media, and more
- **Search Analytics:** Track search patterns and user behavior
- **Search Suggestions:** Provide intelligent search suggestions
- **Search Optimization:** Optimize search performance and accuracy

## Database Schema

### SearchIndex Entity
```typescript
interface SearchIndex {
  id: string;
  contentId: string;
  contentType: ContentType;
  title: TranslatableEntity;
  content: TranslatableEntity;
  description?: TranslatableEntity;
  tags: string[];
  language: string;
  isPublished: boolean;
  isActive: boolean;
  searchScore: number;
  lastIndexedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  content: any; // Polymorphic relation
}

enum ContentType {
  CONTENT = 'CONTENT',
  DOCUMENT = 'DOCUMENT',
  MEDIA = 'MEDIA',
  FAQ = 'FAQ',
  USER = 'USER',
  DEPARTMENT = 'DEPARTMENT',
  EMPLOYEE = 'EMPLOYEE'
}

interface TranslatableEntity {
  en: string;
  ne: string;
}
```

### SearchQuery Entity
```typescript
interface SearchQuery {
  id: string;
  userId?: string;
  query: string;
  language: string;
  contentType?: ContentType;
  filters?: Record<string, any>;
  resultsCount: number;
  executionTime: number;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  
  // Relations
  user?: User;
  results: SearchResult[];
}

interface SearchResult {
  id: string;
  searchQueryId: string;
  contentId: string;
  contentType: ContentType;
  title: string;
  snippet: string;
  relevanceScore: number;
  rank: number;
  
  // Relations
  searchQuery: SearchQuery;
}
```

### SearchSuggestion Entity
```typescript
interface SearchSuggestion {
  id: string;
  term: string;
  language: string;
  contentType?: ContentType;
  frequency: number;
  lastUsedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## DTOs (Data Transfer Objects)

### Search DTOs

#### SearchQueryDto
```typescript
interface SearchQueryDto {
  q: string;
  language?: string;
  contentType?: ContentType;
  page?: number;
  limit?: number;
  sort?: 'relevance' | 'date' | 'title';
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
}
```

#### SearchResponseDto
```typescript
interface SearchResponseDto {
  query: string;
  totalResults: number;
  executionTime: number;
  suggestions: string[];
  results: SearchResultResponseDto[];
  pagination: PaginationInfo;
  facets: SearchFacets;
}

interface SearchResultResponseDto {
  id: string;
  contentType: ContentType;
  title: TranslatableEntity;
  description?: TranslatableEntity;
  snippet: string;
  url: string;
  relevanceScore: number;
  tags: string[];
  language: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface SearchFacets {
  contentType: Record<ContentType, number>;
  language: Record<string, number>;
  tags: Record<string, number>;
  dateRange: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
}
```

### SearchSuggestion DTOs

#### SearchSuggestionResponseDto
```typescript
interface SearchSuggestionResponseDto {
  id: string;
  term: string;
  language: string;
  contentType?: ContentType;
  frequency: number;
  lastUsedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### SearchSuggestionQueryDto
```typescript
interface SearchSuggestionQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  language?: string;
  contentType?: ContentType;
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

## Repository Interfaces

### SearchIndexRepository
```typescript
interface SearchIndexRepository {
  // Find index by ID
  findById(id: string): Promise<SearchIndex | null>;
  
  // Find index by content
  findByContent(contentId: string, contentType: ContentType): Promise<SearchIndex | null>;
  
  // Find all indices with pagination
  findAll(query: SearchIndexQueryDto): Promise<PaginatedSearchIndexResult>;
  
  // Search indices
  search(searchTerm: string, query: SearchQueryDto): Promise<PaginatedSearchIndexResult>;
  
  // Create index
  create(data: CreateSearchIndexDto): Promise<SearchIndex>;
  
  // Update index
  update(id: string, data: UpdateSearchIndexDto): Promise<SearchIndex>;
  
  // Delete index
  delete(id: string): Promise<void>;
  
  // Delete by content
  deleteByContent(contentId: string, contentType: ContentType): Promise<void>;
  
  // Reindex content
  reindex(contentId: string, contentType: ContentType): Promise<SearchIndex>;
  
  // Bulk reindex
  bulkReindex(contentType?: ContentType): Promise<BulkReindexResult>;
  
  // Get index statistics
  getStatistics(): Promise<SearchIndexStatistics>;
  
  // Find indices by content type
  findByContentType(contentType: ContentType): Promise<SearchIndex[]>;
  
  // Find indices by language
  findByLanguage(language: string): Promise<SearchIndex[]>;
  
  // Update search score
  updateSearchScore(id: string, score: number): Promise<void>;
}

interface SearchIndexQueryDto {
  page?: number;
  limit?: number;
  contentType?: ContentType;
  language?: string;
  isPublished?: boolean;
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface PaginatedSearchIndexResult {
  data: SearchIndex[];
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

interface CreateSearchIndexDto {
  contentId: string;
  contentType: ContentType;
  title: TranslatableEntity;
  content: TranslatableEntity;
  description?: TranslatableEntity;
  tags?: string[];
  language: string;
  isPublished?: boolean;
  isActive?: boolean;
}

interface UpdateSearchIndexDto {
  title?: TranslatableEntity;
  content?: TranslatableEntity;
  description?: TranslatableEntity;
  tags?: string[];
  isPublished?: boolean;
  isActive?: boolean;
}

interface BulkReindexResult {
  success: number;
  failed: number;
  errors: string[];
}

interface SearchIndexStatistics {
  total: number;
  byContentType: Record<ContentType, number>;
  byLanguage: Record<string, number>;
  published: number;
  active: number;
  averageScore: number;
}
```

### SearchQueryRepository
```typescript
interface SearchQueryRepository {
  // Find query by ID
  findById(id: string): Promise<SearchQuery | null>;
  
  // Find queries by user
  findByUser(userId: string, query: SearchQueryHistoryQueryDto): Promise<PaginatedSearchQueryResult>;
  
  // Find popular queries
  findPopularQueries(query: PopularQueriesQueryDto): Promise<PopularQuery[]>;
  
  // Create query
  create(data: CreateSearchQueryDto): Promise<SearchQuery>;
  
  // Get query statistics
  getStatistics(): Promise<SearchQueryStatistics>;
  
  // Get search analytics
  getSearchAnalytics(days?: number): Promise<SearchAnalytics>;
  
  // Clean old queries
  cleanOldQueries(daysOld: number): Promise<void>;
}

interface SearchQueryHistoryQueryDto {
  page?: number;
  limit?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface PopularQueriesQueryDto {
  limit?: number;
  days?: number;
  language?: string;
  contentType?: ContentType;
}

interface PaginatedSearchQueryResult {
  data: SearchQuery[];
  pagination: PaginationInfo;
}

interface PopularQuery {
  query: string;
  count: number;
  lastUsed: Date;
  averageResults: number;
}

interface CreateSearchQueryDto {
  userId?: string;
  query: string;
  language: string;
  contentType?: ContentType;
  filters?: Record<string, any>;
  resultsCount: number;
  executionTime: number;
  ipAddress: string;
  userAgent: string;
}

interface SearchQueryStatistics {
  total: number;
  byLanguage: Record<string, number>;
  byContentType: Record<ContentType, number>;
  averageResults: number;
  averageExecutionTime: number;
}

interface SearchAnalytics {
  totalQueries: number;
  uniqueUsers: number;
  averageQueriesPerUser: number;
  topQueries: PopularQuery[];
  queriesByHour: Record<number, number>;
  queriesByDay: Record<string, number>;
  averageResults: number;
  zeroResultsQueries: number;
}
```

### SearchSuggestionRepository
```typescript
interface SearchSuggestionRepository {
  // Find suggestion by ID
  findById(id: string): Promise<SearchSuggestion | null>;
  
  // Find suggestions by term
  findByTerm(term: string, language: string): Promise<SearchSuggestion | null>;
  
  // Find all suggestions with pagination
  findAll(query: SearchSuggestionQueryDto): Promise<PaginatedSearchSuggestionResult>;
  
  // Find suggestions by prefix
  findByPrefix(prefix: string, language: string, limit?: number): Promise<SearchSuggestion[]>;
  
  // Create suggestion
  create(data: CreateSearchSuggestionDto): Promise<SearchSuggestion>;
  
  // Update suggestion
  update(id: string, data: UpdateSearchSuggestionDto): Promise<SearchSuggestion>;
  
  // Delete suggestion
  delete(id: string): Promise<void>;
  
  // Increment frequency
  incrementFrequency(term: string, language: string): Promise<void>;
  
  // Get popular suggestions
  getPopularSuggestions(language: string, limit?: number): Promise<SearchSuggestion[]>;
  
  // Get suggestion statistics
  getStatistics(): Promise<SearchSuggestionStatistics>;
  
  // Clean inactive suggestions
  cleanInactiveSuggestions(): Promise<void>;
}

interface PaginatedSearchSuggestionResult {
  data: SearchSuggestion[];
  pagination: PaginationInfo;
}

interface CreateSearchSuggestionDto {
  term: string;
  language: string;
  contentType?: ContentType;
  frequency?: number;
}

interface UpdateSearchSuggestionDto {
  frequency?: number;
  isActive?: boolean;
}

interface SearchSuggestionStatistics {
  total: number;
  active: number;
  byLanguage: Record<string, number>;
  byContentType: Record<ContentType, number>;
  averageFrequency: number;
}
```

## Service Interfaces

### SearchService
```typescript
interface SearchService {
  // Search content
  search(query: SearchQueryDto): Promise<SearchResponseDto>;
  
  // Search with filters
  searchWithFilters(query: SearchQueryDto, filters: Record<string, any>): Promise<SearchResponseDto>;
  
  // Advanced search
  advancedSearch(query: AdvancedSearchQueryDto): Promise<SearchResponseDto>;
  
  // Get search suggestions
  getSearchSuggestions(prefix: string, language: string, limit?: number): Promise<string[]>;
  
  // Get popular searches
  getPopularSearches(language: string, limit?: number): Promise<PopularQuery[]>;
  
  // Get search analytics
  getSearchAnalytics(days?: number): Promise<SearchAnalytics>;
  
  // Index content
  indexContent(contentId: string, contentType: ContentType): Promise<void>;
  
  // Reindex content
  reindexContent(contentId: string, contentType: ContentType): Promise<void>;
  
  // Remove from index
  removeFromIndex(contentId: string, contentType: ContentType): Promise<void>;
  
  // Bulk reindex
  bulkReindex(contentType?: ContentType): Promise<BulkReindexResult>;
  
  // Get search statistics
  getSearchStatistics(): Promise<SearchStatistics>;
  
  // Optimize search index
  optimizeIndex(): Promise<void>;
  
  // Clear search cache
  clearSearchCache(): Promise<void>;
  
  // Export search data
  exportSearchData(query: SearchExportQueryDto, format: 'json' | 'csv' | 'xlsx'): Promise<Buffer>;
}

interface AdvancedSearchQueryDto extends SearchQueryDto {
  exactPhrase?: string;
  excludeWords?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  contentTypes?: ContentType[];
  languages?: string[];
  tags?: string[];
  authors?: string[];
}

interface SearchExportQueryDto {
  dateFrom?: Date;
  dateTo?: Date;
  contentType?: ContentType;
  language?: string;
  userId?: string;
}

interface SearchStatistics {
  totalIndexed: number;
  totalQueries: number;
  averageQueryTime: number;
  cacheHitRate: number;
  indexSize: number;
  lastOptimization: Date;
}
```

### SearchIndexService
```typescript
interface SearchIndexService {
  // Get index by ID
  getIndexById(id: string): Promise<SearchIndexResponseDto>;
  
  // Get all indices with pagination
  getAllIndices(query: SearchIndexQueryDto): Promise<PaginatedSearchIndexResponse>;
  
  // Create index
  createIndex(data: CreateSearchIndexDto): Promise<SearchIndexResponseDto>;
  
  // Update index
  updateIndex(id: string, data: UpdateSearchIndexDto): Promise<SearchIndexResponseDto>;
  
  // Delete index
  deleteIndex(id: string): Promise<void>;
  
  // Reindex content
  reindexContent(contentId: string, contentType: ContentType): Promise<SearchIndexResponseDto>;
  
  // Bulk reindex
  bulkReindex(contentType?: ContentType): Promise<BulkReindexResult>;
  
  // Validate index data
  validateIndex(data: CreateSearchIndexDto | UpdateSearchIndexDto): Promise<ValidationResult>;
  
  // Get index statistics
  getIndexStatistics(): Promise<SearchIndexStatistics>;
  
  // Optimize index
  optimizeIndex(): Promise<void>;
  
  // Export indices
  exportIndices(query: SearchIndexQueryDto, format: 'json' | 'csv' | 'xlsx'): Promise<Buffer>;
  
  // Import indices
  importIndices(file: Express.Multer.File): Promise<ImportResult>;
}

interface SearchIndexResponseDto {
  id: string;
  contentId: string;
  contentType: ContentType;
  title: TranslatableEntity;
  content: TranslatableEntity;
  description?: TranslatableEntity;
  tags: string[];
  language: string;
  isPublished: boolean;
  isActive: boolean;
  searchScore: number;
  lastIndexedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginatedSearchIndexResponse {
  data: SearchIndexResponseDto[];
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

### SearchSuggestionService
```typescript
interface SearchSuggestionService {
  // Get suggestion by ID
  getSuggestionById(id: string): Promise<SearchSuggestionResponseDto>;
  
  // Get all suggestions with pagination
  getAllSuggestions(query: SearchSuggestionQueryDto): Promise<PaginatedSearchSuggestionResponse>;
  
  // Get suggestions by prefix
  getSuggestionsByPrefix(prefix: string, language: string, limit?: number): Promise<SearchSuggestionResponseDto[]>;
  
  // Create suggestion
  createSuggestion(data: CreateSearchSuggestionDto): Promise<SearchSuggestionResponseDto>;
  
  // Update suggestion
  updateSuggestion(id: string, data: UpdateSearchSuggestionDto): Promise<SearchSuggestionResponseDto>;
  
  // Delete suggestion
  deleteSuggestion(id: string): Promise<void>;
  
  // Increment suggestion frequency
  incrementSuggestionFrequency(term: string, language: string): Promise<void>;
  
  // Get popular suggestions
  getPopularSuggestions(language: string, limit?: number): Promise<SearchSuggestionResponseDto[]>;
  
  // Validate suggestion data
  validateSuggestion(data: CreateSearchSuggestionDto | UpdateSearchSuggestionDto): Promise<ValidationResult>;
  
  // Get suggestion statistics
  getSuggestionStatistics(): Promise<SearchSuggestionStatistics>;
  
  // Export suggestions
  exportSuggestions(query: SearchSuggestionQueryDto, format: 'json' | 'csv' | 'xlsx'): Promise<Buffer>;
  
  // Import suggestions
  importSuggestions(file: Express.Multer.File): Promise<ImportResult>;
  
  // Clean inactive suggestions
  cleanInactiveSuggestions(): Promise<void>;
}

interface PaginatedSearchSuggestionResponse {
  data: SearchSuggestionResponseDto[];
  pagination: PaginationInfo;
}
```

## Controller Interfaces

### PublicSearchController
```typescript
interface PublicSearchController {
  // Search content
  search(
    @Query() query: SearchQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Advanced search
  advancedSearch(
    @Body() query: AdvancedSearchQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get search suggestions
  getSearchSuggestions(
    @Query('q') prefix: string,
    @Query('language') language: string,
    @Query('limit') limit?: number,
    @Res() response: Response
  ): Promise<void>;
  
  // Get popular searches
  getPopularSearches(
    @Query('language') language: string,
    @Query('limit') limit?: number,
    @Res() response: Response
  ): Promise<void>;
  
  // Get search history
  getSearchHistory(
    @Query() query: SearchQueryHistoryQueryDto,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminSearchController
```typescript
interface AdminSearchController {
  // Get search analytics
  getSearchAnalytics(
    @Query('days') days?: number,
    @Res() response: Response
  ): Promise<void>;
  
  // Get search statistics
  getSearchStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Reindex content
  reindexContent(
    @Param('contentId') contentId: string,
    @Param('contentType') contentType: ContentType,
    @Res() response: Response
  ): Promise<void>;
  
  // Bulk reindex
  bulkReindex(
    @Query('contentType') contentType?: ContentType,
    @Res() response: Response
  ): Promise<void>;
  
  // Optimize search index
  optimizeIndex(
    @Res() response: Response
  ): Promise<void>;
  
  // Clear search cache
  clearSearchCache(
    @Res() response: Response
  ): Promise<void>;
  
  // Export search data
  exportSearchData(
    @Query() query: SearchExportQueryDto,
    @Query('format') format: 'json' | 'csv' | 'xlsx',
    @Res() response: Response
  ): Promise<void>;
  
  // Get index by ID (admin)
  getIndexById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create index
  createIndex(
    @Body() data: CreateSearchIndexDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update index
  updateIndex(
    @Param('id') id: string,
    @Body() data: UpdateSearchIndexDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete index
  deleteIndex(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get index statistics
  getIndexStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Export indices
  exportIndices(
    @Query() query: SearchIndexQueryDto,
    @Query('format') format: 'json' | 'csv' | 'xlsx',
    @Res() response: Response
  ): Promise<void>;
  
  // Import indices
  importIndices(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
  
  // Get suggestion by ID (admin)
  getSuggestionById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create suggestion
  createSuggestion(
    @Body() data: CreateSearchSuggestionDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update suggestion
  updateSuggestion(
    @Param('id') id: string,
    @Body() data: UpdateSearchSuggestionDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete suggestion
  deleteSuggestion(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get suggestion statistics
  getSuggestionStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Export suggestions
  exportSuggestions(
    @Query() query: SearchSuggestionQueryDto,
    @Query('format') format: 'json' | 'csv' | 'xlsx',
    @Res() response: Response
  ): Promise<void>;
  
  // Import suggestions
  importSuggestions(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
}
```

## API Endpoints

### Public Search Endpoints

#### GET /api/v1/search
**Description:** Search content
**Access:** Public

**Query Parameters:**
- `q`: Search query
- `language`: Language filter
- `contentType`: Content type filter
- `page`: Page number
- `limit`: Items per page
- `sort`: Sort field
- `order`: Sort order

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "government services",
    "totalResults": 150,
    "executionTime": 0.045,
    "suggestions": [
      "government services online",
      "government services portal",
      "government services registration"
    ],
    "results": [
      {
        "id": "content_id",
        "contentType": "CONTENT",
        "title": {
          "en": "Government Services Portal",
          "ne": "सरकारी सेवा पोर्टल"
        },
        "description": {
          "en": "Access government services online",
          "ne": "अनलाइन सरकारी सेवाहरूमा पहुँच"
        },
        "snippet": "...government services portal provides access to various government services online...",
        "url": "/content/government-services-portal",
        "relevanceScore": 0.95,
        "tags": ["government", "services", "portal"],
        "language": "en",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "metadata": {
          "category": "Services",
          "author": "Admin"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    },
    "facets": {
      "contentType": {
        "CONTENT": 100,
        "DOCUMENT": 30,
        "FAQ": 20
      },
      "language": {
        "en": 120,
        "ne": 30
      },
      "tags": {
        "government": 50,
        "services": 45,
        "portal": 30
      }
    }
  }
}
```

#### POST /api/v1/search/advanced
**Description:** Advanced search
**Access:** Public

#### GET /api/v1/search/suggestions
**Description:** Get search suggestions
**Access:** Public

#### GET /api/v1/search/popular
**Description:** Get popular searches
**Access:** Public

#### GET /api/v1/search/history
**Description:** Get search history
**Access:** Authenticated

### Admin Search Endpoints

#### GET /api/v1/admin/search/analytics
**Description:** Get search analytics
**Access:** Admin

#### GET /api/v1/admin/search/statistics
**Description:** Get search statistics
**Access:** Admin

#### POST /api/v1/admin/search/reindex/{contentId}/{contentType}
**Description:** Reindex content
**Access:** Admin

#### POST /api/v1/admin/search/bulk-reindex
**Description:** Bulk reindex
**Access:** Admin

#### POST /api/v1/admin/search/optimize
**Description:** Optimize search index
**Access:** Admin

#### DELETE /api/v1/admin/search/cache
**Description:** Clear search cache
**Access:** Admin

#### GET /api/v1/admin/search/export
**Description:** Export search data
**Access:** Admin

#### GET /api/v1/admin/search-indices/{id}
**Description:** Get index by ID (admin)
**Access:** Admin

#### POST /api/v1/admin/search-indices
**Description:** Create index
**Access:** Admin

#### PUT /api/v1/admin/search-indices/{id}
**Description:** Update index
**Access:** Admin

#### DELETE /api/v1/admin/search-indices/{id}
**Description:** Delete index
**Access:** Admin

#### GET /api/v1/admin/search-indices/statistics
**Description:** Get index statistics
**Access:** Admin

#### GET /api/v1/admin/search-indices/export
**Description:** Export indices
**Access:** Admin

#### POST /api/v1/admin/search-indices/import
**Description:** Import indices
**Access:** Admin

#### GET /api/v1/admin/search-suggestions/{id}
**Description:** Get suggestion by ID (admin)
**Access:** Admin

#### POST /api/v1/admin/search-suggestions
**Description:** Create suggestion
**Access:** Admin

#### PUT /api/v1/admin/search-suggestions/{id}
**Description:** Update suggestion
**Access:** Admin

#### DELETE /api/v1/admin/search-suggestions/{id}
**Description:** Delete suggestion
**Access:** Admin

#### GET /api/v1/admin/search-suggestions/statistics
**Description:** Get suggestion statistics
**Access:** Admin

#### GET /api/v1/admin/search-suggestions/export
**Description:** Export suggestions
**Access:** Admin

#### POST /api/v1/admin/search-suggestions/import
**Description:** Import suggestions
**Access:** Admin

## Business Logic

### 1. Search Implementation
- **Full-text search** with relevance ranking
- **Multi-language support** for English and Nepali
- **Content type filtering** for targeted searches
- **Faceted search** for advanced filtering

### 2. Search Indexing
- **Automatic indexing** of new content
- **Real-time updates** for content changes
- **Bulk reindexing** for performance optimization
- **Index optimization** for search accuracy

### 3. Search Analytics
- **Query tracking** for user behavior analysis
- **Search patterns** for optimization insights
- **Performance metrics** for system monitoring
- **Popular searches** for content optimization

### 4. Search Suggestions
- **Intelligent suggestions** based on user queries
- **Popular term suggestions** for better UX
- **Auto-complete** functionality
- **Suggestion ranking** by frequency and relevance

## Error Handling

### Search Errors
```json
{
  "success": false,
  "error": {
    "code": "SEARCH_ERROR",
    "message": "Search failed",
    "details": [
      {
        "field": "query",
        "message": "Search query is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  }
}
```

### Index Errors
```json
{
  "success": false,
  "error": {
    "code": "INDEX_ERROR",
    "message": "Indexing failed",
    "details": [
      {
        "field": "contentId",
        "message": "Content not found",
        "code": "CONTENT_NOT_FOUND"
      }
    ]
  }
}
```

## Performance Considerations

### 1. Search Performance
- **Elasticsearch integration** for fast full-text search
- **Search result caching** for repeated queries
- **Query optimization** for complex searches
- **Index optimization** for search accuracy

### 2. Indexing Performance
- **Asynchronous indexing** for non-blocking operations
- **Batch indexing** for bulk operations
- **Incremental indexing** for updates
- **Index optimization** for storage efficiency

### 3. Analytics Performance
- **Real-time analytics** for immediate insights
- **Analytics caching** for performance
- **Data aggregation** for efficient reporting
- **Analytics cleanup** for storage optimization

## Security Considerations

### 1. Search Security
- **Query sanitization** to prevent injection attacks
- **Access control** for sensitive content
- **Rate limiting** for search queries
- **Audit logging** for search activities

### 2. Index Security
- **Secure indexing** of sensitive content
- **Access control** for index management
- **Data encryption** for sensitive indices
- **Backup and recovery** for index data

### 3. Analytics Security
- **Data anonymization** for user privacy
- **Access control** for analytics data
- **Data retention** policies for compliance
- **Secure storage** for analytics data 