import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========================================
// COMMON TYPES
// ========================================

export class PaginationInfo {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

export class TranslatableEntityDto {
  @ApiProperty({ example: 'English text' })
  @IsString()
  @IsNotEmpty()
  en: string;

  @ApiProperty({ example: 'नेपाली पाठ' })
  @IsString()
  @IsNotEmpty()
  ne: string;
}

export enum ContentType {
  CONTENT = 'CONTENT',
  DOCUMENT = 'DOCUMENT',
  MEDIA = 'MEDIA',
  FAQ = 'FAQ',
  USER = 'USER',
  DEPARTMENT = 'DEPARTMENT',
  EMPLOYEE = 'EMPLOYEE'
}

// ========================================
// SEARCH DTOs
// ========================================

export class SearchQueryDto {
  @ApiProperty({ example: 'government services' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ enum: ContentType })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'relevance' })
  @IsOptional()
  @IsString()
  sort?: 'relevance' | 'date' | 'title';

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiPropertyOptional({ example: ['government', 'services'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class AdvancedSearchQueryDto extends SearchQueryDto {
  @ApiPropertyOptional({ example: 'exact phrase' })
  @IsOptional()
  @IsString()
  exactPhrase?: string;

  @ApiPropertyOptional({ example: ['exclude', 'words'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeWords?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  dateRange?: {
    from: Date;
    to: Date;
  };

  @ApiPropertyOptional({ enum: ContentType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ContentType, { each: true })
  contentTypes?: ContentType[];

  @ApiPropertyOptional({ example: ['en', 'ne'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ example: ['author1', 'author2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authors?: string[];
}

export class SearchResultResponseDto {
  @ApiProperty({ example: 'content_id' })
  id: string;

  @ApiProperty({ enum: ContentType, example: ContentType.CONTENT })
  contentType: ContentType;

  @ApiProperty()
  title: TranslatableEntityDto;

  @ApiPropertyOptional()
  description?: TranslatableEntityDto;

  @ApiProperty({ example: '...government services portal provides access...' })
  snippet: string;

  @ApiProperty({ example: '/content/government-services-portal' })
  url: string;

  @ApiProperty({ example: 0.95 })
  relevanceScore: number;

  @ApiProperty({ example: ['government', 'services', 'portal'] })
  tags: string[];

  @ApiProperty({ example: 'en' })
  language: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  metadata: Record<string, any>;
}

export class SearchFacets {
  @ApiProperty({ example: { CONTENT: 100, DOCUMENT: 30, FAQ: 20 } })
  contentType: Record<ContentType, number>;

  @ApiProperty({ example: { en: 120, ne: 30 } })
  language: Record<string, number>;

  @ApiProperty({ example: { government: 50, services: 45, portal: 30 } })
  tags: Record<string, number>;

  @ApiProperty()
  dateRange: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
}

export class SearchResponseDto {
  @ApiProperty({ example: 'government services' })
  query: string;

  @ApiProperty({ example: 150 })
  totalResults: number;

  @ApiProperty({ example: 0.045 })
  executionTime: number;

  @ApiProperty({ example: ['government services online', 'government services portal'] })
  suggestions: string[];

  @ApiProperty({ type: [SearchResultResponseDto] })
  results: SearchResultResponseDto[];

  @ApiProperty()
  pagination: PaginationInfo;

  @ApiProperty()
  facets: SearchFacets;
}

// ========================================
// SEARCH INDEX DTOs
// ========================================

export class CreateSearchIndexDto {
  @ApiProperty({ example: 'content_id' })
  @IsString()
  @IsNotEmpty()
  contentId: string;

  @ApiProperty({ enum: ContentType, example: ContentType.CONTENT })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  title: TranslatableEntityDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  content: TranslatableEntityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  description?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'en' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSearchIndexDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  title?: TranslatableEntityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  content?: TranslatableEntityDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  description?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SearchIndexResponseDto {
  @ApiProperty({ example: 'index_id' })
  id: string;

  @ApiProperty({ example: 'content_id' })
  contentId: string;

  @ApiProperty({ enum: ContentType, example: ContentType.CONTENT })
  contentType: ContentType;

  @ApiProperty()
  title: TranslatableEntityDto;

  @ApiProperty()
  content: TranslatableEntityDto;

  @ApiPropertyOptional()
  description?: TranslatableEntityDto;

  @ApiProperty({ example: ['tag1', 'tag2'] })
  tags: string[];

  @ApiProperty({ example: 'en' })
  language: string;

  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 0.95 })
  searchScore: number;

  @ApiProperty()
  lastIndexedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SearchIndexQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ enum: ContentType })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}

// ========================================
// SEARCH SUGGESTION DTOs
// ========================================

export class CreateSearchSuggestionDto {
  @ApiProperty({ example: 'government services' })
  @IsString()
  @IsNotEmpty()
  term: string;

  @ApiProperty({ example: 'en' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiPropertyOptional({ enum: ContentType })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  frequency?: number;
}

export class UpdateSearchSuggestionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  frequency?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SearchSuggestionResponseDto {
  @ApiProperty({ example: 'suggestion_id' })
  id: string;

  @ApiProperty({ example: 'government services' })
  term: string;

  @ApiProperty({ example: 'en' })
  language: string;

  @ApiPropertyOptional({ enum: ContentType })
  contentType?: ContentType;

  @ApiProperty({ example: 1 })
  frequency: number;

  @ApiProperty()
  lastUsedAt: Date;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SearchSuggestionQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'government' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ enum: ContentType })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'frequency' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}

// ========================================
// SEARCH QUERY DTOs
// ========================================

export class CreateSearchQueryDto {
  @ApiPropertyOptional({ example: 'user_id' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'government services' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ example: 'en' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiPropertyOptional({ enum: ContentType })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiProperty({ example: 150 })
  @IsNumber()
  resultsCount: number;

  @ApiProperty({ example: 0.045 })
  @IsNumber()
  executionTime: number;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  @IsString()
  @IsNotEmpty()
  userAgent: string;
}

export class SearchQueryHistoryQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}

export class PopularQueriesQueryDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  days?: number;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ enum: ContentType })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;
}

export class PopularQuery {
  @ApiProperty({ example: 'government services' })
  query: string;

  @ApiProperty({ example: 15 })
  count: number;

  @ApiProperty()
  lastUsed: Date;

  @ApiProperty({ example: 120 })
  averageResults: number;
}

// ========================================
// SEARCH EXPORT DTOs
// ========================================

export class SearchExportQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiPropertyOptional({ enum: ContentType })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'user_id' })
  @IsOptional()
  @IsString()
  userId?: string;
}

// ========================================
// STATISTICS DTOs
// ========================================

export class SearchIndexStatistics {
  @ApiProperty({ example: 1000 })
  total: number;

  @ApiProperty({ example: { CONTENT: 500, DOCUMENT: 300, FAQ: 200 } })
  byContentType: Record<ContentType, number>;

  @ApiProperty({ example: { en: 800, ne: 200 } })
  byLanguage: Record<string, number>;

  @ApiProperty({ example: 800 })
  published: number;

  @ApiProperty({ example: 950 })
  active: number;

  @ApiProperty({ example: 0.85 })
  averageScore: number;
}

export class SearchQueryStatistics {
  @ApiProperty({ example: 5000 })
  total: number;

  @ApiProperty({ example: { en: 4000, ne: 1000 } })
  byLanguage: Record<string, number>;

  @ApiProperty({ example: { CONTENT: 3000, DOCUMENT: 1500, FAQ: 500 } })
  byContentType: Record<ContentType, number>;

  @ApiProperty({ example: 120 })
  averageResults: number;

  @ApiProperty({ example: 0.045 })
  averageExecutionTime: number;
}

export class SearchSuggestionStatistics {
  @ApiProperty({ example: 500 })
  total: number;

  @ApiProperty({ example: 450 })
  active: number;

  @ApiProperty({ example: { en: 400, ne: 100 } })
  byLanguage: Record<string, number>;

  @ApiProperty({ example: { CONTENT: 300, DOCUMENT: 150, FAQ: 50 } })
  byContentType: Record<ContentType, number>;

  @ApiProperty({ example: 5.5 })
  averageFrequency: number;
}

export class SearchAnalytics {
  @ApiProperty({ example: 5000 })
  totalQueries: number;

  @ApiProperty({ example: 1200 })
  uniqueUsers: number;

  @ApiProperty({ example: 4.2 })
  averageQueriesPerUser: number;

  @ApiProperty({ type: [PopularQuery] })
  topQueries: PopularQuery[];

  @ApiProperty({ example: { 9: 100, 10: 150, 11: 200 } })
  queriesByHour: Record<number, number>;

  @ApiProperty({ example: { '2024-01-01': 500, '2024-01-02': 600 } })
  queriesByDay: Record<string, number>;

  @ApiProperty({ example: 120 })
  averageResults: number;

  @ApiProperty({ example: 150 })
  zeroResultsQueries: number;
}

export class SearchStatistics {
  @ApiProperty({ example: 1000 })
  totalIndexed: number;

  @ApiProperty({ example: 5000 })
  totalQueries: number;

  @ApiProperty({ example: 0.045 })
  averageQueryTime: number;

  @ApiProperty({ example: 0.85 })
  cacheHitRate: number;

  @ApiProperty({ example: 1024000 })
  indexSize: number;

  @ApiProperty()
  lastOptimization: Date;
}

// ========================================
// COMMON DTOs
// ========================================

export class ValidationError {
  @ApiProperty({ example: 'title' })
  field: string;

  @ApiProperty({ example: 'Title is required' })
  message: string;

  @ApiProperty({ example: 'REQUIRED_FIELD' })
  code: string;
}

export class ValidationResult {
  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ type: [ValidationError] })
  errors: ValidationError[];
}

export class BulkOperationResult {
  @ApiProperty({ example: 5 })
  success: number;

  @ApiProperty({ example: 1 })
  failed: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}

export class BulkReindexResult {
  @ApiProperty({ example: 100 })
  success: number;

  @ApiProperty({ example: 5 })
  failed: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}

export class ImportResult {
  @ApiProperty({ example: 10 })
  success: number;

  @ApiProperty({ example: 2 })
  failed: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}