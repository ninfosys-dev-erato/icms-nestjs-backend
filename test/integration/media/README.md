# Media Module Integration Tests

This directory contains comprehensive integration tests for the Media module, covering all aspects of media management including media files, albums, and their relationships.

## Test Files

### 1. `media.e2e-spec.ts`
**Main end-to-end test file** that tests the complete media module functionality including:
- Public media endpoints (GET, search, filtering)
- Admin media endpoints (CRUD operations, bulk operations, processing)
- Public album endpoints (GET, active albums)
- Admin album endpoints (CRUD operations, media management)
- Authentication and authorization
- Validation and error handling

### 2. `media.repository.spec.ts`
**Repository layer tests** for the MediaRepository class:
- Database operations (CRUD)
- Query methods (findByType, findByAlbum, search)
- Bulk operations (bulkCreate, bulkUpdate, bulkDelete)
- Statistics and analytics
- Pagination and filtering

### 3. `media-album.repository.spec.ts`
**Repository layer tests** for the MediaAlbumRepository class:
- Album CRUD operations
- Media-album relationship management
- Album statistics and analytics
- Media reordering within albums

### 4. `media.service.spec.ts`
**Service layer tests** for the MediaService class:
- Business logic validation
- File upload and processing
- Media transformation and URL generation
- Bulk operations
- File validation and media type detection

### 5. `media-album.service.spec.ts`
**Service layer tests** for the MediaAlbumService class:
- Album business logic
- Media-album relationship management
- Album validation
- Export functionality
- Statistics generation

### 6. `setup-media.spec.ts`
**Setup and configuration tests** that verify:
- Database connectivity and schema
- Module dependencies and injection
- Environment configuration
- Data relationships and constraints
- Transaction handling

## Test Coverage

### Media Management
- ✅ File upload and validation
- ✅ Media CRUD operations
- ✅ Media type detection (IMAGE, VIDEO, AUDIO, DOCUMENT)
- ✅ File processing (resize, optimize, watermark)
- ✅ Bulk operations (create, update, delete)
- ✅ Search and filtering
- ✅ Pagination
- ✅ Statistics and analytics

### Album Management
- ✅ Album CRUD operations
- ✅ Media-album relationships
- ✅ Media reordering within albums
- ✅ Album statistics
- ✅ Export functionality (JSON, ZIP)

### Authentication & Authorization
- ✅ JWT token validation
- ✅ Role-based access control (ADMIN, EDITOR, VIEWER)
- ✅ Public vs admin endpoints
- ✅ Unauthorized access handling

### Validation & Error Handling
- ✅ Input validation (DTOs)
- ✅ File validation (type, size, format)
- ✅ Business rule validation
- ✅ Error response formatting
- ✅ 404, 400, 401, 403 status codes

### Database Operations
- ✅ CRUD operations
- ✅ Complex queries and relationships
- ✅ Transactions
- ✅ Pagination
- ✅ Search functionality
- ✅ Statistics aggregation

## Running Tests

### Run all media tests
```bash
npm run test:e2e -- --testPathPattern=media
```

### Run specific test file
```bash
npm run test:e2e -- --testPathPattern=media.e2e-spec.ts
```

### Run with coverage
```bash
npm run test:e2e -- --testPathPattern=media --coverage
```

## Test Data

The tests create and manage the following test data:
- **Users**: Admin, Editor, and Viewer users with different roles
- **Media**: Various types of media files (images, videos, documents)
- **Albums**: Media albums with different configurations
- **Relationships**: Media-album associations with ordering

## Database Cleanup

Tests automatically clean up the database between runs by truncating:
- `media_albums_media` (junction table)
- `media` (media files)
- `media_albums` (albums)
- `user_sessions`
- `login_attempts`
- `audit_logs`
- `users`

## Environment Requirements

Tests require the following environment variables:
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: JWT expiration time
- `JWT_REFRESH_SECRET`: JWT refresh secret
- `JWT_REFRESH_EXPIRES_IN`: JWT refresh expiration time

## Mock Services

The tests use mocked versions of:
- **S3Service**: For file upload/download operations
- **PrismaService**: For database operations (in unit tests)
- **JWT Service**: For token generation and validation

## Test Patterns

### E2E Tests
- Use real HTTP requests via supertest
- Test complete request/response cycles
- Verify API response formats
- Test authentication and authorization flows

### Unit Tests
- Mock dependencies for isolated testing
- Test business logic in isolation
- Verify error handling and edge cases
- Test data transformation methods

### Integration Tests
- Test service-repository interactions
- Verify database operations
- Test transaction handling
- Validate data relationships

## Common Test Scenarios

1. **Happy Path**: Successful operations with valid data
2. **Error Handling**: Invalid data, missing resources, unauthorized access
3. **Edge Cases**: Empty results, pagination boundaries, large datasets
4. **Authentication**: Valid/invalid tokens, role-based access
5. **Validation**: Required fields, data formats, business rules
6. **Performance**: Bulk operations, complex queries

## Best Practices

- Tests are independent and can run in any order
- Database is cleaned between test runs
- Mock external dependencies (S3, external APIs)
- Use descriptive test names and assertions
- Test both success and failure scenarios
- Verify API response formats and status codes
- Test data validation and error messages

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure test database is running and accessible
2. **Environment Variables**: Verify all required env vars are set
3. **File Permissions**: Ensure test files can be created/deleted
4. **Port Conflicts**: Check if test server port is available

### Debug Mode

Run tests with debug output:
```bash
npm run test:e2e -- --testPathPattern=media --verbose
```

### Database Reset

If tests fail due to database state:
```bash
npm run db:reset
npm run test:e2e -- --testPathPattern=media
``` 