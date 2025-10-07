# Translation Module

## Overview

The Translation module manages global translations with language detection, fallback mechanisms, and translation caching. This module provides comprehensive internationalization support for the entire application with English and Nepali language support.

## Module Purpose

- **Translation Management:** Centralized translation storage and retrieval
- **Language Detection:** Automatic language detection and fallback
- **Translation Caching:** Performance optimization for translations
- **Bilingual Support:** English and Nepali language support
- **Translation Groups:** Organized translation management
- **Dynamic Translation:** Runtime translation updates and management

## Database Schema

### Translation Entity
```typescript
interface Translation {
  id: string;
  key: string;
  enValue: string;
  neValue: string;
  groupName: string;
  description?: string;
  isActive: boolean;
  isPublished: boolean;
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
```

### Language Entity
```typescript
interface Language {
  id: string;
  code: string; // 'en', 'ne'
  name: TranslatableEntity;
  nativeName: string;
  isActive: boolean;
  isDefault: boolean;
  direction: 'ltr' | 'rtl';
  createdAt: Date;
  updatedAt: Date;
}
```

### TranslationCache Entity
```typescript
interface TranslationCache {
  id: string;
  language: string;
  groupName: string;
  cacheKey: string;
  cacheValue: string;
  expiresAt: Date;
  createdAt: Date;
}
```

## DTOs (Data Transfer Objects)

### Translation DTOs

#### CreateTranslationDto
```typescript
interface CreateTranslationDto {
  key: string;
  enValue: string;
  neValue: string;
  groupName: string;
  description?: string;
  isActive?: boolean;
  isPublished?: boolean;
}
```

#### UpdateTranslationDto
```typescript
interface UpdateTranslationDto {
  enValue?: string;
  neValue?: string;
  groupName?: string;
  description?: string;
  isActive?: boolean;
  isPublished?: boolean;
}
```

#### TranslationResponseDto
```typescript
interface TranslationResponseDto {
  id: string;
  key: string;
  enValue: string;
  neValue: string;
  groupName: string;
  description?: string;
  isActive: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserResponseDto;
  updatedBy: UserResponseDto;
}
```

#### TranslationQueryDto
```typescript
interface TranslationQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  groupName?: string;
  language?: string;
  isActive?: boolean;
  isPublished?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

### Language DTOs

#### CreateLanguageDto
```typescript
interface CreateLanguageDto {
  code: string;
  name: TranslatableEntity;
  nativeName: string;
  isActive?: boolean;
  isDefault?: boolean;
  direction?: 'ltr' | 'rtl';
}
```

#### UpdateLanguageDto
```typescript
interface UpdateLanguageDto {
  name?: TranslatableEntity;
  nativeName?: string;
  isActive?: boolean;
  isDefault?: boolean;
  direction?: 'ltr' | 'rtl';
}
```

#### LanguageResponseDto
```typescript
interface LanguageResponseDto {
  id: string;
  code: string;
  name: TranslatableEntity;
  nativeName: string;
  isActive: boolean;
  isDefault: boolean;
  direction: 'ltr' | 'rtl';
  createdAt: Date;
  updatedAt: Date;
}
```

## Repository Interfaces

### TranslationRepository
```typescript
interface TranslationRepository {
  // Find translation by ID
  findById(id: string): Promise<Translation | null>;
  
  // Find translation by key
  findByKey(key: string): Promise<Translation | null>;
  
  // Find all translations with pagination and filters
  findAll(query: TranslationQueryDto): Promise<PaginatedTranslationResult>;
  
  // Find active translations
  findActive(query: TranslationQueryDto): Promise<PaginatedTranslationResult>;
  
  // Find published translations
  findPublished(query: TranslationQueryDto): Promise<PaginatedTranslationResult>;
  
  // Find translations by group
  findByGroup(groupName: string, query: TranslationQueryDto): Promise<PaginatedTranslationResult>;
  
  // Find translations by language
  findByLanguage(language: string, query: TranslationQueryDto): Promise<PaginatedTranslationResult>;
  
  // Search translations
  search(searchTerm: string, query: TranslationQueryDto): Promise<PaginatedTranslationResult>;
  
  // Create translation
  create(data: CreateTranslationDto, userId: string): Promise<Translation>;
  
  // Update translation
  update(id: string, data: UpdateTranslationDto, userId: string): Promise<Translation>;
  
  // Delete translation
  delete(id: string): Promise<void>;
  
  // Publish translation
  publish(id: string, userId: string): Promise<Translation>;
  
  // Unpublish translation
  unpublish(id: string, userId: string): Promise<Translation>;
  
  // Get translation by key and language
  getTranslation(key: string, language: string): Promise<string | null>;
  
  // Get all translations for language
  getAllTranslationsForLanguage(language: string): Promise<Record<string, string>>;
  
  // Get translation statistics
  getStatistics(): Promise<TranslationStatistics>;
  
  // Find translations by keys
  findByKeys(keys: string[]): Promise<Translation[]>;
  
  // Bulk create translations
  bulkCreate(translations: CreateTranslationDto[], userId: string): Promise<Translation[]>;
  
  // Bulk update translations
  bulkUpdate(translations: { id: string; data: UpdateTranslationDto }[], userId: string): Promise<Translation[]>;
}

interface PaginatedTranslationResult {
  data: Translation[];
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

interface TranslationStatistics {
  total: number;
  active: number;
  published: number;
  byGroup: Record<string, number>;
  byLanguage: Record<string, number>;
  missingTranslations: number;
}
```

### LanguageRepository
```typescript
interface LanguageRepository {
  // Find language by ID
  findById(id: string): Promise<Language | null>;
  
  // Find language by code
  findByCode(code: string): Promise<Language | null>;
  
  // Find all languages
  findAll(): Promise<Language[]>;
  
  // Find active languages
  findActive(): Promise<Language[]>;
  
  // Find default language
  findDefault(): Promise<Language | null>;
  
  // Create language
  create(data: CreateLanguageDto): Promise<Language>;
  
  // Update language
  update(id: string, data: UpdateLanguageDto): Promise<Language>;
  
  // Delete language
  delete(id: string): Promise<void>;
  
  // Set default language
  setDefault(id: string): Promise<void>;
  
  // Get language statistics
  getStatistics(): Promise<LanguageStatistics>;
}

interface LanguageStatistics {
  total: number;
  active: number;
  default: string;
  byDirection: Record<string, number>;
}
```

### TranslationCacheRepository
```typescript
interface TranslationCacheRepository {
  // Find cache by key
  findByKey(language: string, groupName: string, cacheKey: string): Promise<TranslationCache | null>;
  
  // Create cache entry
  create(data: CreateCacheDto): Promise<TranslationCache>;
  
  // Update cache entry
  update(id: string, data: UpdateCacheDto): Promise<TranslationCache>;
  
  // Delete cache entry
  delete(id: string): Promise<void>;
  
  // Clear cache by language
  clearByLanguage(language: string): Promise<void>;
  
  // Clear cache by group
  clearByGroup(groupName: string): Promise<void>;
  
  // Clear all cache
  clearAll(): Promise<void>;
  
  // Clean expired cache
  cleanExpired(): Promise<void>;
  
  // Get cache statistics
  getStatistics(): Promise<CacheStatistics>;
}

interface CreateCacheDto {
  language: string;
  groupName: string;
  cacheKey: string;
  cacheValue: string;
  expiresAt: Date;
}

interface UpdateCacheDto {
  cacheValue: string;
  expiresAt: Date;
}

interface CacheStatistics {
  total: number;
  byLanguage: Record<string, number>;
  byGroup: Record<string, number>;
  expired: number;
}
```

## Service Interfaces

### TranslationService
```typescript
interface TranslationService {
  // Get translation by ID
  getTranslationById(id: string): Promise<TranslationResponseDto>;
  
  // Get all translations with pagination
  getAllTranslations(query: TranslationQueryDto): Promise<PaginatedTranslationResponse>;
  
  // Get active translations
  getActiveTranslations(query: TranslationQueryDto): Promise<PaginatedTranslationResponse>;
  
  // Get published translations
  getPublishedTranslations(query: TranslationQueryDto): Promise<PaginatedTranslationResponse>;
  
  // Get translations by group
  getTranslationsByGroup(groupName: string, query: TranslationQueryDto): Promise<PaginatedTranslationResponse>;
  
  // Get translations by language
  getTranslationsByLanguage(language: string, query: TranslationQueryDto): Promise<PaginatedTranslationResponse>;
  
  // Search translations
  searchTranslations(searchTerm: string, query: TranslationQueryDto): Promise<PaginatedTranslationResponse>;
  
  // Create translation
  createTranslation(data: CreateTranslationDto, userId: string): Promise<TranslationResponseDto>;
  
  // Update translation
  updateTranslation(id: string, data: UpdateTranslationDto, userId: string): Promise<TranslationResponseDto>;
  
  // Delete translation
  deleteTranslation(id: string): Promise<void>;
  
  // Publish translation
  publishTranslation(id: string, userId: string): Promise<TranslationResponseDto>;
  
  // Unpublish translation
  unpublishTranslation(id: string, userId: string): Promise<TranslationResponseDto>;
  
  // Validate translation data
  validateTranslation(data: CreateTranslationDto | UpdateTranslationDto): Promise<ValidationResult>;
  
  // Get translation statistics
  getTranslationStatistics(): Promise<TranslationStatistics>;
  
  // Get translation by key and language
  getTranslationByKey(key: string, language: string): Promise<string>;
  
  // Get all translations for language
  getAllTranslationsForLanguage(language: string): Promise<Record<string, string>>;
  
  // Translate text
  translate(text: string, fromLanguage: string, toLanguage: string): Promise<string>;
  
  // Detect language
  detectLanguage(text: string): Promise<string>;
  
  // Export translations
  exportTranslations(query: TranslationQueryDto, format: 'json' | 'csv' | 'xlsx'): Promise<Buffer>;
  
  // Import translations
  importTranslations(file: Express.Multer.File, userId: string): Promise<ImportResult>;
  
  // Bulk operations
  bulkPublish(ids: string[], userId: string): Promise<BulkOperationResult>;
  bulkUnpublish(ids: string[], userId: string): Promise<BulkOperationResult>;
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;
  
  // Cache management
  clearCache(language?: string, groupName?: string): Promise<void>;
  getCacheStatistics(): Promise<CacheStatistics>;
}

interface PaginatedTranslationResponse {
  data: TranslationResponseDto[];
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
```

### LanguageService
```typescript
interface LanguageService {
  // Get language by ID
  getLanguageById(id: string): Promise<LanguageResponseDto>;
  
  // Get language by code
  getLanguageByCode(code: string): Promise<LanguageResponseDto>;
  
  // Get all languages
  getAllLanguages(): Promise<LanguageResponseDto[]>;
  
  // Get active languages
  getActiveLanguages(): Promise<LanguageResponseDto[]>;
  
  // Get default language
  getDefaultLanguage(): Promise<LanguageResponseDto>;
  
  // Create language
  createLanguage(data: CreateLanguageDto): Promise<LanguageResponseDto>;
  
  // Update language
  updateLanguage(id: string, data: UpdateLanguageDto): Promise<LanguageResponseDto>;
  
  // Delete language
  deleteLanguage(id: string): Promise<void>;
  
  // Set default language
  setDefaultLanguage(id: string): Promise<void>;
  
  // Validate language data
  validateLanguage(data: CreateLanguageDto | UpdateLanguageDto): Promise<ValidationResult>;
  
  // Get language statistics
  getLanguageStatistics(): Promise<LanguageStatistics>;
  
  // Get supported languages
  getSupportedLanguages(): Promise<LanguageResponseDto[]>;
  
  // Check language support
  isLanguageSupported(code: string): Promise<boolean>;
}
```

## Controller Interfaces

### PublicTranslationController
```typescript
interface PublicTranslationController {
  // Get all published translations
  getAllTranslations(
    @Query() query: TranslationQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get translation by ID
  getTranslationById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get translations by group
  getTranslationsByGroup(
    @Param('groupName') groupName: string,
    @Query() query: TranslationQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get translations by language
  getTranslationsByLanguage(
    @Param('language') language: string,
    @Query() query: TranslationQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get translation by key
  getTranslationByKey(
    @Param('key') key: string,
    @Query('language') language: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get all translations for language
  getAllTranslationsForLanguage(
    @Param('language') language: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Search translations
  searchTranslations(
    @Query('q') searchTerm: string,
    @Query() query: TranslationQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Translate text
  translateText(
    @Body() data: { text: string; fromLanguage: string; toLanguage: string },
    @Res() response: Response
  ): Promise<void>;
  
  // Detect language
  detectLanguage(
    @Body() data: { text: string },
    @Res() response: Response
  ): Promise<void>;
  
  // Get all languages
  getAllLanguages(
    @Res() response: Response
  ): Promise<void>;
  
  // Get supported languages
  getSupportedLanguages(
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminTranslationController
```typescript
interface AdminTranslationController {
  // Get translation by ID (admin)
  getTranslationById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create translation
  createTranslation(
    @Body() data: CreateTranslationDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update translation
  updateTranslation(
    @Param('id') id: string,
    @Body() data: UpdateTranslationDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete translation
  deleteTranslation(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Publish translation
  publishTranslation(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Unpublish translation
  unpublishTranslation(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get translation statistics
  getTranslationStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Export translations
  exportTranslations(
    @Query() query: TranslationQueryDto,
    @Query('format') format: 'json' | 'csv' | 'xlsx',
    @Res() response: Response
  ): Promise<void>;
  
  // Import translations
  importTranslations(
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
  
  // Cache management
  clearCache(
    @Query('language') language?: string,
    @Query('groupName') groupName?: string,
    @Res() response: Response
  ): Promise<void>;
  
  getCacheStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Language management
  getLanguageById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  createLanguage(
    @Body() data: CreateLanguageDto,
    @Res() response: Response
  ): Promise<void>;
  
  updateLanguage(
    @Param('id') id: string,
    @Body() data: UpdateLanguageDto,
    @Res() response: Response
  ): Promise<void>;
  
  deleteLanguage(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  setDefaultLanguage(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
}
```

## API Endpoints

### Public Translation Endpoints

#### GET /api/v1/translations
**Description:** Get all published translations
**Access:** Public

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `groupName`: Group filter
- `language`: Language filter
- `isActive`: Active status filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "trans_id",
      "key": "welcome_message",
      "enValue": "Welcome to our website",
      "neValue": "हाम्रो वेबसाइटमा स्वागत छ",
      "groupName": "common",
      "description": "Welcome message for homepage",
      "isActive": true,
      "isPublished": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
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

#### GET /api/v1/translations/{id}
**Description:** Get translation by ID
**Access:** Public

#### GET /api/v1/translations/group/{groupName}
**Description:** Get translations by group
**Access:** Public

#### GET /api/v1/translations/language/{language}
**Description:** Get translations by language
**Access:** Public

#### GET /api/v1/translations/key/{key}
**Description:** Get translation by key
**Access:** Public

#### GET /api/v1/translations/language/{language}/all
**Description:** Get all translations for language
**Access:** Public

#### GET /api/v1/translations/search
**Description:** Search translations
**Access:** Public

#### POST /api/v1/translations/translate
**Description:** Translate text
**Access:** Public

#### POST /api/v1/translations/detect
**Description:** Detect language
**Access:** Public

#### GET /api/v1/languages
**Description:** Get all languages
**Access:** Public

#### GET /api/v1/languages/supported
**Description:** Get supported languages
**Access:** Public

### Admin Translation Endpoints

#### POST /api/v1/admin/translations
**Description:** Create translation
**Access:** Admin, Editor

**Request Body:**
```json
{
  "key": "welcome_message",
  "enValue": "Welcome to our website",
  "neValue": "हाम्रो वेबसाइटमा स्वागत छ",
  "groupName": "common",
  "description": "Welcome message for homepage",
  "isActive": true,
  "isPublished": true
}
```

#### PUT /api/v1/admin/translations/{id}
**Description:** Update translation
**Access:** Admin, Editor

#### DELETE /api/v1/admin/translations/{id}
**Description:** Delete translation
**Access:** Admin only

#### POST /api/v1/admin/translations/{id}/publish
**Description:** Publish translation
**Access:** Admin, Editor

#### POST /api/v1/admin/translations/{id}/unpublish
**Description:** Unpublish translation
**Access:** Admin, Editor

#### GET /api/v1/admin/translations/statistics
**Description:** Get translation statistics
**Access:** Admin, Editor

#### GET /api/v1/admin/translations/export
**Description:** Export translations
**Access:** Admin, Editor

#### POST /api/v1/admin/translations/import
**Description:** Import translations
**Access:** Admin only

#### POST /api/v1/admin/translations/bulk-publish
**Description:** Bulk publish translations
**Access:** Admin, Editor

#### POST /api/v1/admin/translations/bulk-unpublish
**Description:** Bulk unpublish translations
**Access:** Admin, Editor

#### DELETE /api/v1/admin/translations/bulk-delete
**Description:** Bulk delete translations
**Access:** Admin only

#### DELETE /api/v1/admin/translations/cache
**Description:** Clear translation cache
**Access:** Admin, Editor

#### GET /api/v1/admin/translations/cache/statistics
**Description:** Get cache statistics
**Access:** Admin, Editor

## Business Logic

### 1. Translation Management
- **Key-based translation** system for easy management
- **Group organization** for logical translation grouping
- **Language-specific values** for each translation key
- **Publishing workflow** for content control

### 2. Language Support
- **Multi-language support** with extensible language system
- **Default language** configuration
- **Language direction** support (LTR/RTL)
- **Language detection** for automatic language selection

### 3. Caching System
- **Translation caching** for performance optimization
- **Cache invalidation** on translation updates
- **Language-specific caching** for efficient retrieval
- **Cache expiration** for memory management

### 4. Translation Features
- **Dynamic translation** loading and updating
- **Fallback mechanisms** for missing translations
- **Translation validation** for data integrity
- **Bulk operations** for efficient management

## Error Handling

### Translation Creation Errors
```json
{
  "success": false,
  "error": {
    "code": "TRANSLATION_CREATION_ERROR",
    "message": "Translation creation failed",
    "details": [
      {
        "field": "key",
        "message": "Translation key is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  }
}
```

### Translation Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND_ERROR",
    "message": "Translation not found",
    "details": []
  }
}
```

## Performance Considerations

### 1. Translation Caching
- **Redis caching** for fast translation retrieval
- **Cache warming** for frequently used translations
- **Cache invalidation** strategies for updates
- **Memory optimization** for large translation sets

### 2. Language Detection
- **Efficient language detection** algorithms
- **Caching** for detection results
- **Fallback mechanisms** for unknown languages
- **Performance optimization** for detection queries

### 3. Database Optimization
- **Indexing** on translation keys and groups
- **Query optimization** for language-specific queries
- **Connection pooling** for high concurrency
- **Caching** for frequently accessed translations

## Security Considerations

### 1. Input Validation
- **Translation key validation** for security
- **Content sanitization** for translation values
- **Language code validation** for supported languages
- **File upload validation** for import operations

### 2. Access Control
- **Public read access** for published translations
- **Admin/Editor write access** for management
- **Role-based permissions** for translation operations
- **Audit logging** for all translation changes

### 3. Data Protection
- **Translation backup** for data protection
- **Version control** for translation changes
- **Secure storage** for sensitive translations
- **Access logging** for security monitoring 