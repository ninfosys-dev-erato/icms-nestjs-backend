# Office Settings Module Tests

This directory contains comprehensive test suites for the Office Settings module, which manages all configuration and settings for the government office including office information, contact details, social media links, and visual assets like background photos with bilingual support (English and Nepali).

## Test Structure

The office settings module tests are organized into the following files:

### Repository Tests
- **`office-settings.repository.spec.ts`** - Tests for the OfficeSettingsRepository class

### Service Tests
- **`office-settings.service.spec.ts`** - Tests for the OfficeSettingsService class

### Integration Tests
- **`office-settings.e2e-spec.ts`** - End-to-end tests for the office settings module
- **`setup-office-settings.spec.ts`** - Setup and teardown tests for the office settings module

## Test Coverage

### Office Settings Repository Tests (`office-settings.repository.spec.ts`)

Tests the following methods:
- `findById()` - Find office settings by ID
- `findFirst()` - Find first office settings
- `create()` - Create new office settings
- `update()` - Update existing office settings
- `upsert()` - Upsert office settings
- `delete()` - Delete office settings
- `exists()` - Check if office settings exist

### Office Settings Service Tests (`office-settings.service.spec.ts`)

Tests the following methods:
- `getOfficeSettings()` - Get office settings (public)
- `getOfficeSettingsById()` - Get office settings by ID (admin)
- `createOfficeSettings()` - Create new office settings
- `updateOfficeSettings()` - Update existing office settings
- `upsertOfficeSettings()` - Upsert office settings
- `deleteOfficeSettings()` - Delete office settings
- `validateOfficeSettings()` - Validate office settings data
- `getOfficeSettingsForSEO()` - Get office settings for SEO
- `updateBackgroundPhoto()` - Update background photo
- `removeBackgroundPhoto()` - Remove background photo
- `transformToResponseDto()` - Transform to response DTO

### End-to-End Tests (`office-settings.e2e-spec.ts`)

Tests the following API endpoints:

#### Public Endpoints
- `GET /api/v1/office-settings` - Get office settings
- `GET /api/v1/office-settings?lang=en` - Get office settings with language filter
- `GET /api/v1/office-settings/seo` - Get office settings for SEO

#### Admin Endpoints
- `POST /api/v1/office-settings` - Create office settings
- `GET /api/v1/office-settings/:id` - Get office settings by ID
- `PUT /api/v1/office-settings/:id` - Update office settings
- `PUT /api/v1/office-settings/upsert` - Upsert office settings
- `DELETE /api/v1/office-settings/:id` - Delete office settings
- `POST /api/v1/office-settings/:id/background-photo` - Update background photo
- `DELETE /api/v1/office-settings/:id/background-photo` - Remove background photo

#### Authentication & Authorization
- Tests require authentication for admin endpoints
- Tests verify role-based access control (ADMIN role required)
- Tests include both authenticated and unauthenticated scenarios

### Setup Tests (`setup-office-settings.spec.ts`)

Tests the following setup and teardown operations:
- Database cleanup
- Test user creation
- Test office settings creation
- Office settings with different field combinations
- Data structure validation
- Database constraints validation
- Query operations validation
- Update operations validation
- Delete operations validation
- Translatable entity handling

## Test Data

The tests use the following test data:

### Test Users
- **Admin User**: `admin@office-settings.com` (ADMIN role)
- **Editor User**: `editor@office-settings.com` (EDITOR role)
- **Viewer User**: `viewer@office-settings.com` (VIEWER role)

### Test Office Settings
- **Basic Settings**: Minimal required fields
- **Full Settings**: All fields including optional ones
- **Translatable Settings**: Bilingual content in English and Nepali
- **SEO Settings**: Settings optimized for search engines

### Office Settings Fields
- `directorate` - Translatable entity (en/ne)
- `officeName` - Translatable entity (en/ne)
- `officeAddress` - Translatable entity (en/ne)
- `backgroundPhoto` - Optional string (file path)
- `email` - Required string (email format)
- `phoneNumber` - Translatable entity (en/ne)
- `xLink` - Optional string (URL format)
- `mapIframe` - Optional string (HTML iframe)
- `website` - Optional string (URL format)
- `youtube` - Optional string (URL format)

## Running the Tests

### Run All Office Settings Tests
```bash
npm run test:e2e -- --testPathPattern=office-settings
```

### Run Specific Test Files
```bash
# Repository tests
npm run test:e2e -- --testPathPattern=office-settings.repository.spec.ts

# Service tests
npm run test:e2e -- --testPathPattern=office-settings.service.spec.ts

# E2E tests
npm run test:e2e -- --testPathPattern=office-settings.e2e-spec.ts

# Setup tests
npm run test:e2e -- --testPathPattern=setup-office-settings.spec.ts
```

### Run Tests with Coverage
```bash
npm run test:e2e -- --testPathPattern=office-settings --coverage
```

## Test Features

### Authentication & Authorization
- Tests require authentication for admin endpoints
- Tests verify role-based access control (ADMIN role required)
- Tests include both authenticated and unauthenticated scenarios
- Tests verify proper error responses for unauthorized access

### Data Validation
- Tests validate required fields
- Tests check for proper error responses
- Tests verify data structure integrity
- Tests validate bilingual content (English and Nepali)
- Tests validate email format
- Tests validate URL formats
- Tests validate file upload constraints

### File Upload Testing
- Tests verify background photo upload functionality
- Tests validate file type restrictions (JPG, PNG, WebP)
- Tests validate file size limits (5MB maximum)
- Tests verify file removal functionality
- Tests handle missing file scenarios

### Translatable Entity Support
- Tests verify bilingual content handling
- Tests validate both English and Nepali translations
- Tests verify language-specific queries
- Tests validate translatable field structure

### SEO Functionality
- Tests verify SEO-optimized data generation
- Tests validate structured data format
- Tests verify social media link handling
- Tests validate meta information generation

### API Response Format
- Tests verify consistent API response format
- Tests validate success response structure
- Tests validate error response structure
- Tests verify metadata inclusion (processing time, request ID)

## Test Dependencies

The tests depend on the following modules:
- **PrismaService** - Database operations
- **OfficeSettingsRepository** - Office settings data access
- **OfficeSettingsService** - Office settings business logic
- **AuthModule** - Authentication and authorization
- **ApiResponseInterceptor** - Global API response formatting
- **HttpExceptionFilter** - Global error handling

## Database Schema

The tests work with the following Prisma models:
- **OfficeSettings** - Main office settings container with translatable fields
- **User** - User accounts for authentication
- **TranslatableEntity** - Bilingual content structure (en/ne)

## API Response Format

All tests follow the global API response format enforced via `api-response.interceptor.ts`:
```typescript
{
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  pagination?: PaginationInfo;
}
```

## Bilingual Support

The office settings module supports bilingual content (English and Nepali):
- All translatable fields support both languages
- Language-specific queries are supported
- Content validation ensures both languages are provided
- Response transformation includes language-specific content

## File Upload Testing

The tests include comprehensive file upload testing:
- **File Type Validation**: Only JPG, PNG, WebP allowed
- **File Size Validation**: Maximum 5MB
- **File Processing**: Mock file upload and processing
- **Error Handling**: Invalid file types and sizes
- **File Removal**: Background photo removal functionality

## Validation Testing

The tests validate various input constraints:
- **Email Validation**: Proper email format required
- **URL Validation**: Valid URL format for website, xLink, youtube
- **Translatable Fields**: Both English and Nepali required
- **Field Lengths**: Appropriate length limits for all fields
- **Required Fields**: All required fields must be provided

## Error Handling

The tests verify comprehensive error handling:
- **Validation Errors**: Field-level validation with detailed messages
- **Not Found Errors**: When office settings don't exist
- **Permission Errors**: When user lacks required permissions
- **File Upload Errors**: When file validation fails
- **Database Errors**: When database operations fail

## Performance Considerations

The tests include performance-related validations:
- **Response Time**: API response time validation
- **Database Queries**: Efficient query execution
- **File Processing**: Optimized file upload handling
- **Caching Ready**: Service methods designed for caching

## Security Testing

The tests verify security measures:
- **Authentication**: All admin endpoints require authentication
- **Authorization**: Role-based access control
- **Input Validation**: All inputs are validated and sanitized
- **File Upload Security**: File type and size validation
- **SQL Injection Protection**: Using Prisma ORM for safe operations

## Notes

- All tests follow the global API response format enforced via `api-response.interceptor.ts`
- Tests include both English and Nepali language support
- Tests verify proper error handling and validation
- Tests ensure data integrity and type consistency
- Tests cover both success and failure scenarios
- Tests validate authentication and authorization requirements
- Tests verify file upload functionality and constraints
- Tests include comprehensive validation coverage
- Tests ensure proper cleanup and teardown
- Tests verify SEO functionality and structured data
- Tests validate translatable entity handling
- Tests verify background photo management
- Tests include performance and security validations 