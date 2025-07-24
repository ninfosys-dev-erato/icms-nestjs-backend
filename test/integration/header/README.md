# Header Module Tests

This directory contains comprehensive tests for the Header Configuration module.

## Test Structure

### 1. `header.e2e-spec.ts`
End-to-end tests for the Header Configuration module that test the complete flow from HTTP request to database operations.

**Coverage:**
- Public Header endpoints (`/api/v1/header-configs/*`)
- Admin Header endpoints (`/api/v1/admin/header-configs/*`)
- Authentication and authorization
- CRUD operations (Create, Read, Update, Delete)
- Publish/Unpublish functionality
- Logo management (add/remove logos)
- Reordering
- Import/Export functionality
- Statistics
- CSS generation
- Preview functionality

**Key Features Tested:**
- ✅ GET `/api/v1/header-configs` - Get all published header configs
- ✅ GET `/api/v1/header-configs/:id` - Get header config by ID
- ✅ GET `/api/v1/header-configs/display/active` - Get active header config for display
- ✅ GET `/api/v1/header-configs/order/:order` - Get header config by order
- ✅ GET `/api/v1/header-configs/:id/css` - Get header CSS
- ✅ POST `/api/v1/header-configs/preview` - Preview header config
- ✅ GET `/api/v1/admin/header-configs` - Get all header configs (admin)
- ✅ GET `/api/v1/admin/header-configs/statistics` - Get header config statistics
- ✅ GET `/api/v1/admin/header-configs/search` - Search header configs
- ✅ GET `/api/v1/admin/header-configs/:id` - Get header config by ID (admin)
- ✅ POST `/api/v1/admin/header-configs` - Create header config
- ✅ PUT `/api/v1/admin/header-configs/:id` - Update header config
- ✅ DELETE `/api/v1/admin/header-configs/:id` - Delete header config
- ✅ POST `/api/v1/admin/header-configs/:id/publish` - Publish header config
- ✅ POST `/api/v1/admin/header-configs/:id/unpublish` - Unpublish header config
- ✅ POST `/api/v1/admin/header-configs/reorder` - Reorder header configs
- ✅ PUT `/api/v1/admin/header-configs/:id/logo/:logoType` - Update logo
- ✅ DELETE `/api/v1/admin/header-configs/:id/logo/:logoType` - Remove logo
- ✅ GET `/api/v1/admin/header-configs/:id/css` - Generate CSS
- ✅ POST `/api/v1/admin/header-configs/export` - Export header configs
- ✅ POST `/api/v1/admin/header-configs/import` - Import header configs
- ✅ POST `/api/v1/admin/header-configs/bulk-publish` - Bulk publish
- ✅ POST `/api/v1/admin/header-configs/bulk-unpublish` - Bulk unpublish
- ✅ POST `/api/v1/admin/header-configs/bulk-delete` - Bulk delete

### 2. `header-config.repository.spec.ts`
Unit tests for the Header Configuration repository layer that test database operations in isolation.

**Coverage:**
- Database CRUD operations
- Search functionality
- Pagination logic
- Publish/Unpublish operations
- Logo management queries
- Statistics queries
- Error handling

**Key Methods Tested:**
- ✅ `findById()` - Find header config by ID
- ✅ `findAll()` - Find all header configs with optional filtering
- ✅ `findActive()` - Find active header configs
- ✅ `findPublished()` - Find published header configs
- ✅ `findByOrder()` - Find header config by order
- ✅ `search()` - Search header configs by text
- ✅ `create()` - Create new header config
- ✅ `update()` - Update existing header config
- ✅ `delete()` - Delete header config
- ✅ `publish()` - Publish header config
- ✅ `unpublish()` - Unpublish header config
- ✅ `reorder()` - Reorder header configs
- ✅ `getActiveHeaderConfig()` - Get active header config for display
- ✅ `getStatistics()` - Get header config statistics
- ✅ `findByLogo()` - Find header configs by logo media ID

### 3. `header-config.service.spec.ts`
Unit tests for the Header Configuration service layer that test business logic in isolation.

**Coverage:**
- Business logic validation
- Data transformation
- Error handling
- Service method orchestration
- Validation logic
- CSS generation
- Preview functionality

**Key Methods Tested:**
- ✅ `getHeaderConfigById()` - Get header config by ID with error handling
- ✅ `getAllHeaderConfigs()` - Get all header configs with filtering
- ✅ `getActiveHeaderConfigs()` - Get active header configs
- ✅ `getPublishedHeaderConfigs()` - Get published header configs
- ✅ `getHeaderConfigByOrder()` - Get header config by order
- ✅ `searchHeaderConfigs()` - Search header configs
- ✅ `createHeaderConfig()` - Create header config with validation
- ✅ `updateHeaderConfig()` - Update header config with validation
- ✅ `deleteHeaderConfig()` - Delete header config with existence check
- ✅ `publishHeaderConfig()` - Publish header config
- ✅ `unpublishHeaderConfig()` - Unpublish header config
- ✅ `reorderHeaderConfigs()` - Reorder header configs
- ✅ `getHeaderConfigStatistics()` - Get statistics
- ✅ `getActiveHeaderConfigForDisplay()` - Get active header config for display
- ✅ `updateLogo()` - Update logo
- ✅ `removeLogo()` - Remove logo
- ✅ `exportHeaderConfigs()` - Export header configs
- ✅ `importHeaderConfigs()` - Import header configs with error handling
- ✅ `bulkPublish()` - Bulk publish header configs
- ✅ `bulkUnpublish()` - Bulk unpublish header configs
- ✅ `bulkDelete()` - Bulk delete header configs
- ✅ `generateCSS()` - Generate CSS for header config
- ✅ `previewHeaderConfig()` - Preview header config
- ✅ `validateHeaderConfig()` - Validate header config data

### 4. `setup-header.spec.ts`
Setup and integration tests that verify the Header Configuration module is properly configured and integrated.

**Coverage:**
- Module configuration
- Database schema validation
- Endpoint accessibility
- Authentication requirements
- Basic CRUD operations
- Search functionality
- Pagination support
- Statistics functionality
- CSS generation

## Test Data

The tests use realistic test data with both English and Nepali translations:

```typescript
const testHeaderConfig = {
  name: {
    en: 'Main Header',
    ne: 'मुख्य हेडर',
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
    fontWeight: 'normal',
    color: '#333333',
    lineHeight: 1.5,
    letterSpacing: 0.5,
  },
  alignment: 'LEFT',
  logo: {
    leftLogo: null,
    rightLogo: null,
    logoAlignment: 'left',
    logoSpacing: 20,
  },
  layout: {
    headerHeight: 80,
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    padding: { top: 10, right: 20, bottom: 10, left: 20 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  order: 1,
  isActive: true,
  isPublished: true,
};
```

## Authentication Testing

The tests include comprehensive authentication testing:

- **Public endpoints**: No authentication required
- **Admin endpoints**: Require valid JWT token with ADMIN or EDITOR role
- **Role-based access**: Different permissions for different operations
- **Token validation**: Invalid tokens are properly rejected

## Validation Testing

The tests verify proper validation of:

- **Required fields**: Name, typography, alignment, logo, and layout are required
- **Translation structure**: Both English and Nepali translations required
- **Typography validation**: Font family, size, weight, color, line height, letter spacing
- **Layout validation**: Header height, background color, border settings, padding, margin
- **Logo validation**: Logo configuration, alignment, spacing
- **Data types**: Proper type validation for all fields
- **Business rules**: Order validation, active status, published status, etc.

## Error Handling

The tests verify proper error handling for:

- **Not found errors**: 404 responses for non-existent resources
- **Validation errors**: 400 responses for invalid data
- **Authentication errors**: 401 responses for unauthorized access
- **Authorization errors**: 403 responses for insufficient permissions
- **Server errors**: 500 responses for internal errors

## CSS Generation Testing

The tests verify CSS generation functionality:

- **Valid CSS output**: Generated CSS should be valid and contain expected properties
- **Typography CSS**: Font family, size, weight, color, line height, letter spacing
- **Layout CSS**: Height, background color, border, padding, margin
- **Logo CSS**: Logo positioning, alignment, spacing
- **Responsive CSS**: Mobile, tablet, desktop responsive styles

## Logo Management Testing

The tests verify logo management functionality:

- **Add logos**: Adding left and right logos with proper configuration
- **Remove logos**: Removing logos and updating configuration
- **Logo validation**: Media ID, alt text, width, height validation
- **Logo positioning**: Left, center, right alignment
- **Logo spacing**: Proper spacing between logos

## Publish/Unpublish Testing

The tests verify publish/unpublish functionality:

- **Publish config**: Making header config available for public display
- **Unpublish config**: Making header config unavailable for public display
- **Bulk operations**: Publishing/unpublishing multiple configs at once
- **Status tracking**: Proper tracking of published status
- **Display logic**: Only published configs are shown in public endpoints

## Running the Tests

```bash
# Run all header tests
npm test -- --testPathPattern=header

# Run specific test file
npm test -- header.e2e-spec.ts
npm test -- header-config.repository.spec.ts
npm test -- header-config.service.spec.ts
npm test -- setup-header.spec.ts

# Run with coverage
npm test -- --testPathPattern=header --coverage
```

## Test Dependencies

The tests depend on:

- **NestJS Testing Module**: For dependency injection and mocking
- **Supertest**: For HTTP endpoint testing
- **Jest**: For test framework and assertions
- **Prisma**: For database operations
- **JWT**: For authentication testing

## Database Cleanup

Each test properly cleans up the database to ensure test isolation:

```typescript
const cleanupDatabase = async () => {
  const tables = [
    'header_configs',
    'user_sessions',
    'login_attempts',
    'audit_logs',
    'users',
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
};
```

## Best Practices

1. **Test Isolation**: Each test is independent and cleans up after itself
2. **Realistic Data**: Tests use realistic multilingual data with proper typography and layout
3. **Comprehensive Coverage**: All public and admin endpoints are tested
4. **Error Scenarios**: Both success and failure cases are tested
5. **Authentication**: Proper authentication and authorization testing
6. **Validation**: Comprehensive input validation testing
7. **Performance**: Pagination and bulk operations are tested
8. **CSS Generation**: CSS output validation and testing
9. **Logo Management**: Logo operations and validation testing
10. **Documentation**: Tests serve as documentation for API behavior

## Header Configuration Features

The header module supports the following key features:

### Typography Settings
- Font family, size, weight, color
- Line height and letter spacing
- Multilingual text support

### Layout Configuration
- Header height and background color
- Border settings (color, width)
- Padding and margin configuration
- Responsive design support

### Logo Management
- Left and right logo support
- Logo alignment (left, center, right)
- Logo spacing configuration
- Media integration

### Publishing System
- Active/Inactive status
- Published/Unpublished status
- Bulk publish/unpublish operations
- Display logic for public endpoints

### CSS Generation
- Dynamic CSS generation
- Typography CSS rules
- Layout CSS rules
- Logo positioning CSS
- Responsive CSS support

### Import/Export
- JSON format support
- Bulk import with validation
- Export with filtering
- Error handling for invalid data 