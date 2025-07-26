# Office Description Module Tests

This directory contains comprehensive test suites for the Office Description module, which manages office-related content such as introductions, objectives, work details, organizational structure, digital charter, and employee sanctions with bilingual support (English and Nepali).

## Test Structure

The office description module tests are organized into the following files:

### Repository Tests
- **`office-description.repository.spec.ts`** - Tests for the OfficeDescriptionRepository class

### Service Tests
- **`office-description.service.spec.ts`** - Tests for the OfficeDescriptionService class

### Integration Tests
- **`office-description.e2e-spec.ts`** - End-to-end tests for the office description module
- **`setup-office-description.spec.ts`** - Setup and teardown tests for the office description module

## Test Coverage

### Office Description Repository Tests (`office-description.repository.spec.ts`)

Tests the following methods:
- `findById()` - Find office description by ID
- `findByType()` - Find office description by type
- `findAll()` - Find all office descriptions
- `create()` - Create new office description
- `update()` - Update existing office description
- `upsertByType()` - Upsert office description by type
- `delete()` - Delete office description
- `deleteByType()` - Delete office description by type
- `existsByType()` - Check if office description exists by type
- `getStatistics()` - Get office description statistics
- `bulkCreate()` - Bulk create office descriptions
- `bulkUpdate()` - Bulk update office descriptions

### Office Description Service Tests (`office-description.service.spec.ts`)

Tests the following methods:
- `getOfficeDescription()` - Get office description by ID
- `getOfficeDescriptionByType()` - Get office description by type
- `getAllOfficeDescriptions()` - Get all office descriptions
- `createOfficeDescription()` - Create new office description
- `updateOfficeDescription()` - Update existing office description
- `upsertOfficeDescriptionByType()` - Upsert office description by type
- `deleteOfficeDescription()` - Delete office description
- `deleteOfficeDescriptionByType()` - Delete office description by type
- `bulkCreateOfficeDescriptions()` - Bulk create office descriptions
- `bulkUpdateOfficeDescriptions()` - Bulk update office descriptions
- `getOfficeDescriptionStatistics()` - Get office description statistics
- `validateOfficeDescription()` - Validate office description data
- `importOfficeDescriptions()` - Import office descriptions
- `exportOfficeDescriptions()` - Export office descriptions
- `transformToResponseDto()` - Transform to response DTO

### End-to-End Tests (`office-description.e2e-spec.ts`)

Tests the following API endpoints:

#### Public Endpoints
- `GET /api/v1/office-descriptions` - Get all office descriptions
- `GET /api/v1/office-descriptions/types` - Get all office description types
- `GET /api/v1/office-descriptions/type/:type` - Get office description by type
- `GET /api/v1/office-descriptions/:id` - Get office description by ID
- `GET /api/v1/office-descriptions/introduction` - Get office introduction
- `GET /api/v1/office-descriptions/objective` - Get office objective
- `GET /api/v1/office-descriptions/work-details` - Get office work details
- `GET /api/v1/office-descriptions/organizational-structure` - Get organizational structure
- `GET /api/v1/office-descriptions/digital-charter` - Get digital charter
- `GET /api/v1/office-descriptions/employee-sanctions` - Get employee sanctions

#### Admin Endpoints
- `POST /api/v1/admin/office-descriptions` - Create office description
- `PUT /api/v1/admin/office-descriptions/:id` - Update office description
- `PUT /api/v1/admin/office-descriptions/type/:type/upsert` - Upsert office description by type
- `DELETE /api/v1/admin/office-descriptions/:id` - Delete office description
- `DELETE /api/v1/admin/office-descriptions/type/:type` - Delete office description by type
- `GET /api/v1/admin/office-descriptions/statistics` - Get office description statistics
- `POST /api/v1/admin/office-descriptions/bulk-create` - Bulk create office descriptions
- `PUT /api/v1/admin/office-descriptions/bulk-update` - Bulk update office descriptions
- `POST /api/v1/admin/office-descriptions/import` - Import office descriptions
- `GET /api/v1/admin/office-descriptions/export` - Export office descriptions

#### Authentication & Authorization
- Tests require authentication for admin endpoints
- Tests verify role-based access control (ADMIN/EDITOR roles required)
- Tests include both authenticated and unauthenticated scenarios

### Setup Tests (`setup-office-description.spec.ts`)

Tests the following setup and teardown operations:
- Database cleanup
- Test user creation
- Test office description creation
- Multiple office descriptions for different types
- Office descriptions with different content lengths
- Data structure validation
- Database constraints validation
- Query operations validation
- Update operations validation
- Delete operations validation

## Test Data

The tests use the following test data:

### Test Users
- **Regular User**: `test@example.com` (USER role)
- **Admin User**: `admin@example.com` (ADMIN role)

### Test Office Descriptions
- **Introduction**: Basic office introduction content
- **Objective**: Office objectives and goals
- **Work Details**: Detailed work information
- **Organizational Structure**: Office structure and hierarchy
- **Digital Charter**: Digital transformation guidelines
- **Employee Sanctions**: Employee disciplinary policies

### Office Description Types
- `INTRODUCTION` - Office introduction and overview
- `OBJECTIVE` - Office objectives and goals
- `WORK_DETAILS` - Detailed work information
- `ORGANIZATIONAL_STRUCTURE` - Office structure and hierarchy
- `DIGITAL_CHARTER` - Digital transformation guidelines
- `EMPLOYEE_SANCTIONS` - Employee disciplinary policies

## Running the Tests

### Run All Office Description Tests
```bash
npm run test:e2e -- --testPathPattern=office-description
```

### Run Specific Test Files
```bash
# Repository tests
npm run test:e2e -- --testPathPattern=office-description.repository.spec.ts

# Service tests
npm run test:e2e -- --testPathPattern=office-description.service.spec.ts

# E2E tests
npm run test:e2e -- --testPathPattern=office-description.e2e-spec.ts

# Setup tests
npm run test:e2e -- --testPathPattern=setup-office-description.spec.ts
```

### Run Tests with Coverage
```bash
npm run test:e2e -- --testPathPattern=office-description --coverage
```

## Test Features

### Authentication & Authorization
- Tests require authentication for admin endpoints
- Tests verify role-based access control (ADMIN/EDITOR roles required)
- Tests include both authenticated and unauthenticated scenarios

### Data Validation
- Tests validate required fields
- Tests check for proper error responses
- Tests verify data structure integrity
- Tests validate bilingual content (English and Nepali)

### Content Management
- Tests verify office description type management
- Tests check content creation and updates
- Tests validate bilingual content support
- Tests verify content length handling

### Bulk Operations
- Tests verify bulk create operations
- Tests check bulk update operations
- Tests validate duplicate type prevention
- Tests verify operation results

### Import/Export
- Tests verify import functionality
- Tests check export functionality
- Tests validate data integrity during import/export
- Tests verify error handling

### Statistics
- Tests verify office description statistics calculation
- Tests check statistics by type
- Tests validate statistical data structure

### Type Management
- Tests verify unique office description types
- Tests check type validation
- Tests validate type-specific operations

## Test Dependencies

The tests depend on the following modules:
- **PrismaService** - Database operations
- **OfficeDescriptionRepository** - Office description data access
- **OfficeDescriptionService** - Office description business logic
- **AuthModule** - Authentication and authorization

## Database Schema

The tests work with the following Prisma models:
- **OfficeDescription** - Main office description container with type and bilingual content
- **User** - User accounts for authentication
- **OfficeDescriptionType** enum - INTRODUCTION, OBJECTIVE, WORK_DETAILS, ORGANIZATIONAL_STRUCTURE, DIGITAL_CHARTER, EMPLOYEE_SANCTIONS

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

The office description module supports bilingual content (English and Nepali):
- All content fields support both languages
- Language-specific queries are supported
- Content validation ensures both languages are provided
- Response transformation includes language-specific content

## Notes

- All tests follow the global API response format enforced via `api-response.interceptor.ts`
- Tests include both English and Nepali language support
- Tests verify proper error handling and validation
- Tests ensure data integrity and type consistency
- Tests cover both success and failure scenarios
- Tests validate authentication and authorization requirements
- Tests verify unique office description type constraints
- Tests include comprehensive bulk operation coverage
- Tests validate import/export functionality
- Tests ensure proper cleanup and teardown 