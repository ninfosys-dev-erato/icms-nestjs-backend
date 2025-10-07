# Slider Module Tests

This directory contains comprehensive test suites for the Slider module, which manages website sliders and banners with configurable display settings, timing controls, media integration, and analytics tracking with bilingual support (English and Nepali).

## Test Structure

The slider module tests are organized into the following files:

### Repository Tests
- **`slider.repository.spec.ts`** - Tests for the SliderRepository class

### Service Tests
- **`slider.service.spec.ts`** - Tests for the SliderService class

### Integration Tests
- **`slider.e2e-spec.ts`** - End-to-end tests for the slider module
- **`setup-slider.spec.ts`** - Setup and teardown tests for the slider module

## Test Coverage

### Slider Repository Tests (`slider.repository.spec.ts`)

Tests the following methods:
- `findById()` - Find slider by ID
- `findAll()` - Find all sliders with pagination and filters
- `findActive()` - Find active sliders
- `findPublished()` - Find published sliders  
- `findByPosition()` - Find sliders by position
- `search()` - Search sliders by title
- `create()` - Create new slider
- `update()` - Update existing slider
- `delete()` - Delete slider
- `publish()` - Publish slider (set isActive to true)
- `unpublish()` - Unpublish slider (set isActive to false)
- `reorder()` - Reorder sliders by position
- `getStatistics()` - Get slider statistics
- `getActiveSlidersForDisplay()` - Get active sliders for display
- `findByMedia()` - Find sliders by media ID
- `isSliderActive()` - Check if slider is active

### Slider Service Tests (`slider.service.spec.ts`)

Tests the following methods:
- `getSliderById()` - Get slider by ID with analytics
- `getAllSliders()` - Get all sliders with pagination
- `getActiveSliders()` - Get active sliders
- `getPublishedSliders()` - Get published sliders
- `getSlidersByPosition()` - Get sliders by position
- `searchSliders()` - Search sliders
- `createSlider()` - Create new slider with validation
- `updateSlider()` - Update existing slider with validation
- `deleteSlider()` - Delete slider
- `publishSlider()` - Publish slider
- `unpublishSlider()` - Unpublish slider
- `reorderSliders()` - Reorder sliders
- `validateSlider()` - Validate slider data
- `getSliderStatistics()` - Get slider statistics
- `getActiveSlidersForDisplay()` - Get active sliders for display
- `recordSliderClick()` - Record slider click event
- `recordSliderView()` - Record slider view event
- `getSliderAnalytics()` - Get slider analytics
- `bulkPublish()` - Bulk publish sliders
- `bulkUnpublish()` - Bulk unpublish sliders
- `bulkDelete()` - Bulk delete sliders
- `exportSliders()` - Export sliders (JSON/CSV/PDF)
- `importSliders()` - Import sliders from file
- `transformToResponseDto()` - Transform to response DTO

### End-to-End Tests (`slider.e2e-spec.ts`)

Tests the following API endpoints:

#### Public Endpoints
- `GET /api/v1/sliders` - Get all published sliders
- `GET /api/v1/sliders?page=1&limit=5` - Get sliders with pagination
- `GET /api/v1/sliders?search=Test` - Get sliders with search filter
- `GET /api/v1/sliders?position=1` - Get sliders with position filter
- `GET /api/v1/sliders/:id` - Get slider by ID
- `GET /api/v1/sliders/display/active` - Get active sliders for display
- `GET /api/v1/sliders/position/:position` - Get sliders by position
- `POST /api/v1/sliders/:id/click` - Record slider click
- `POST /api/v1/sliders/:id/view` - Record slider view

#### Admin Endpoints
- `POST /api/v1/admin/sliders` - Create slider
- `GET /api/v1/admin/sliders` - Get all sliders (Admin)
- `GET /api/v1/admin/sliders?isActive=true&position=1` - Get sliders with filters
- `GET /api/v1/admin/sliders/:id` - Get slider by ID (Admin)
- `PUT /api/v1/admin/sliders/:id` - Update slider
- `DELETE /api/v1/admin/sliders/:id` - Delete slider
- `POST /api/v1/admin/sliders/:id/publish` - Publish slider
- `POST /api/v1/admin/sliders/:id/unpublish` - Unpublish slider
- `PUT /api/v1/admin/sliders/reorder` - Reorder sliders
- `GET /api/v1/admin/sliders/statistics` - Get slider statistics
- `GET /api/v1/admin/sliders/search` - Search sliders (Admin)
- `GET /api/v1/admin/sliders/:id/analytics` - Get slider analytics
- `GET /api/v1/admin/sliders/export` - Export sliders
- `POST /api/v1/admin/sliders/import` - Import sliders
- `POST /api/v1/admin/sliders/bulk-publish` - Bulk publish sliders
- `POST /api/v1/admin/sliders/bulk-unpublish` - Bulk unpublish sliders
- `POST /api/v1/admin/sliders/bulk-delete` - Bulk delete sliders

#### Authentication & Authorization
- Tests require authentication for admin endpoints
- Tests verify role-based access control (ADMIN/EDITOR roles)
- Tests include both authenticated and unauthenticated scenarios
- Tests verify proper error responses for unauthorized access

### Setup Tests (`setup-slider.spec.ts`)

Tests the following setup and teardown operations:
- Database cleanup
- Test user creation
- Test media creation
- Test slider creation
- Slider clicks and views creation
- Sliders with different field combinations
- Data structure validation
- Database constraints validation
- Query operations validation
- Update operations validation
- Delete operations validation
- Translatable entity handling
- Analytics and statistics validation

## Test Data

The tests use the following test data:

### Test Users
- **Admin User**: `admin@slider.com` (ADMIN role)
- **Editor User**: `editor@slider.com` (EDITOR role)
- **Viewer User**: `viewer@slider.com` (VIEWER role)

### Test Media
- **Test Image**: `test-slider-image.jpg` (IMAGE type)
- **File Path**: `/uploads/test-slider-image.jpg`
- **MIME Type**: `image/jpeg`
- **File Size**: 1024 bytes

### Test Sliders
- **Basic Slider**: Minimal required fields
- **Full Slider**: All fields including optional title
- **Minimal Slider**: Without optional title
- **Translatable Slider**: Bilingual content in English and Nepali

### Slider Fields
- `id` - Unique identifier (UUID)
- `title` - Optional translatable entity (en/ne)
- `position` - Required number (display order)
- `displayTime` - Required number (milliseconds)
- `isActive` - Required boolean (published status)
- `mediaId` - Required string (media reference)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Slider Analytics Fields
- **Clicks**: IP address, user agent, user ID (optional), timestamp
- **Views**: IP address, user agent, user ID (optional), view duration (optional), timestamp
- **Statistics**: Total, active, published counts, click/view metrics
- **Device Breakdown**: Desktop, mobile, tablet usage
- **Date-based Analytics**: Clicks/views by date

## Running the Tests

### Run All Slider Tests
```bash
npm run test:e2e -- --testPathPattern=slider
```

### Run Specific Test Files
```bash
# Repository tests
npm run test:e2e -- --testPathPattern=slider.repository.spec.ts

# Service tests
npm run test:e2e -- --testPathPattern=slider.service.spec.ts

# E2E tests
npm run test:e2e -- --testPathPattern=slider.e2e-spec.ts

# Setup tests
npm run test:e2e -- --testPathPattern=setup-slider.spec.ts
```

### Run Tests with Coverage
```bash
npm run test:e2e -- --testPathPattern=slider --coverage
```

## Test Features

### Authentication & Authorization
- Tests require authentication for admin endpoints
- Tests verify role-based access control (ADMIN/EDITOR roles required)
- Tests include both authenticated and unauthenticated scenarios
- Tests verify proper error responses for unauthorized access
- ADMIN role required for deletion operations
- EDITOR role can create, update, publish/unpublish sliders

### Data Validation
- Tests validate required fields (position, displayTime, mediaId)
- Tests check for proper error responses
- Tests verify data structure integrity
- Tests validate bilingual content (English and Nepali)
- Tests validate position constraints (non-negative numbers)
- Tests validate display time constraints (minimum 1000ms)
- Tests validate media ID format
- Tests validate translatable field structure

### Analytics & Tracking
- Tests verify click tracking functionality
- Tests verify view tracking functionality
- Tests validate analytics data generation
- Tests verify device breakdown calculation
- Tests validate date-based analytics
- Tests verify click-through rate calculation
- Tests validate view duration tracking
- Tests verify statistics aggregation

### Translatable Entity Support
- Tests verify bilingual content handling
- Tests validate both English and Nepali translations
- Tests verify language-specific queries
- Tests validate translatable field structure
- Tests handle optional translatable fields (title can be null)

### Pagination & Filtering
- Tests verify pagination functionality
- Tests validate filter parameters (isActive, position, search)
- Tests verify sorting capabilities
- Tests validate date range filtering
- Tests verify search functionality across translations

### Bulk Operations
- Tests verify bulk publish functionality
- Tests verify bulk unpublish functionality
- Tests verify bulk delete functionality
- Tests validate error handling in bulk operations
- Tests verify partial success scenarios

### Position Management
- Tests verify slider reordering functionality
- Tests validate position constraints
- Tests allow multiple sliders at same position
- Tests verify position-based queries

### Import/Export (Planned)
- Tests verify export functionality (JSON format implemented)
- Tests validate import functionality (not yet implemented)
- Tests verify file format validation
- Tests validate error handling for invalid imports

### API Response Format
- Tests verify consistent API response format
- Tests validate success response structure
- Tests validate error response structure
- Tests verify metadata inclusion (processing time, request ID)
- Tests verify pagination response format

## Test Dependencies

The tests depend on the following modules:
- **PrismaService** - Database operations
- **SliderRepository** - Slider data access
- **SliderClickRepository** - Click tracking data access
- **SliderViewRepository** - View tracking data access
- **SliderService** - Slider business logic
- **AuthModule** - Authentication and authorization
- **MediaModule** - Media management integration
- **ApiResponseInterceptor** - Global API response formatting
- **HttpExceptionFilter** - Global error handling

## Database Schema

The tests work with the following Prisma models:
- **Slider** - Main slider entity with translatable title
- **SliderClick** - Click tracking events
- **SliderView** - View tracking events with duration
- **Media** - Media files referenced by sliders
- **User** - User accounts for authentication and tracking
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

The slider module supports bilingual content (English and Nepali):
- Title fields support both languages (optional)
- Language-specific queries are supported
- Content validation ensures proper structure
- Response transformation includes language-specific content
- Search functionality works across both languages

## Analytics & Statistics

The tests include comprehensive analytics testing:
- **Click Tracking**: IP address, user agent, user association
- **View Tracking**: Duration tracking, device detection
- **Statistics**: Aggregate counts, click-through rates
- **Device Breakdown**: Desktop, mobile, tablet detection
- **Date-based Analytics**: Historical click/view data
- **Performance Metrics**: Average view duration, engagement rates

## Position & Display Management

The tests verify position and display functionality:
- **Position Ordering**: Sliders ordered by position
- **Display Time**: Configurable slide duration
- **Active Status**: Published/unpublished state management
- **Reordering**: Dynamic position updates
- **Multiple Positions**: Multiple sliders can share positions

## Validation Testing

The tests validate various input constraints:
- **Position Validation**: Non-negative numbers required
- **Display Time Validation**: Minimum 1000ms required
- **Media Reference Validation**: Valid media ID required
- **Translatable Fields**: Proper structure validation
- **Foreign Key Constraints**: Valid references enforced
- **Required Fields**: All mandatory fields validated

## Error Handling

The tests verify comprehensive error handling:
- **Validation Errors**: Field-level validation with detailed messages
- **Not Found Errors**: When sliders don't exist
- **Permission Errors**: When user lacks required permissions
- **Database Errors**: When database operations fail
- **Analytics Errors**: When tracking operations fail
- **Bulk Operation Errors**: Partial failure handling

## Performance Considerations

The tests include performance-related validations:
- **Response Time**: API response time validation
- **Database Queries**: Efficient query execution
- **Analytics Processing**: Optimized analytics calculations
- **Bulk Operations**: Efficient batch processing
- **Caching Ready**: Service methods designed for caching

## Security Testing

The tests verify security measures:
- **Authentication**: All admin endpoints require authentication
- **Authorization**: Role-based access control
- **Input Validation**: All inputs are validated and sanitized
- **Analytics Privacy**: IP tracking with privacy considerations
- **SQL Injection Protection**: Using Prisma ORM for safe operations

## Media Integration

The tests verify media integration:
- **Media References**: Foreign key constraints enforced
- **File Type Validation**: Media type compatibility
- **Media Lifecycle**: Handling media updates/deletions
- **Display Integration**: Media display in slider responses

## Notes

- All tests follow the global API response format enforced via `api-response.interceptor.ts`
- Tests include both English and Nepali language support
- Tests verify proper error handling and validation
- Tests ensure data integrity and type consistency
- Tests cover both success and failure scenarios
- Tests validate authentication and authorization requirements
- Tests verify analytics and tracking functionality
- Tests include comprehensive validation coverage
- Tests ensure proper cleanup and teardown
- Tests verify position and display management
- Tests validate translatable entity handling
- Tests include performance and security validations
- Tests verify media integration and constraints
- Tests validate bulk operations and error handling 