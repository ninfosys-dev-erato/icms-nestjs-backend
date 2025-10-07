# Important Links Module Tests

This directory contains comprehensive tests for the Important Links module, covering both public and admin functionality.

## Test Structure

### 1. `important-links.e2e-spec.ts`
End-to-end tests for the Important Links module that test the complete flow from HTTP request to database operations.

**Coverage:**
- Public Important Links endpoints (`/api/v1/important-links/*`)
- Admin Important Links endpoints (`/api/v1/admin/important-links/*`)
- Authentication and authorization
- CRUD operations (Create, Read, Update, Delete)
- Bulk operations (bulk create, bulk update, bulk delete)
- Search functionality
- Pagination
- Reordering functionality
- Import/Export functionality
- Statistics and analytics
- Footer links categorization

**Key Features Tested:**
- ✅ GET `/api/v1/important-links` - Get all important links
- ✅ GET `/api/v1/important-links/pagination` - Get paginated important links
- ✅ GET `/api/v1/important-links/footer` - Get footer links
- ✅ GET `/api/v1/important-links/active` - Get active important links
- ✅ GET `/api/v1/important-links/:id` - Get important link by ID
- ✅ POST `/api/v1/admin/important-links` - Create important link
- ✅ PUT `/api/v1/admin/important-links/:id` - Update important link
- ✅ DELETE `/api/v1/admin/important-links/:id` - Delete important link
- ✅ POST `/api/v1/admin/important-links/reorder` - Reorder important links
- ✅ POST `/api/v1/admin/important-links/bulk-create` - Bulk create important links
- ✅ POST `/api/v1/admin/important-links/bulk-update` - Bulk update important links
- ✅ POST `/api/v1/admin/important-links/import` - Import important links
- ✅ GET `/api/v1/admin/important-links/export` - Export important links
- ✅ GET `/api/v1/admin/important-links/statistics` - Get important links statistics

### 2. `important-links.repository.spec.ts`
Unit tests for the Important Links repository layer that test database operations in isolation.

**Coverage:**
- Database CRUD operations
- Search functionality
- Pagination logic
- Reordering operations
- Statistics queries
- Footer links categorization
- Error handling

**Key Methods Tested:**
- ✅ `findById()` - Find important link by ID
- ✅ `findAll()` - Find all important links with optional filtering
- ✅ `findWithPagination()` - Find important links with pagination
- ✅ `create()` - Create new important link
- ✅ `update()` - Update existing important link
- ✅ `delete()` - Delete important link
- ✅ `reorder()` - Reorder important links
- ✅ `getStatistics()` - Get important links statistics
- ✅ `bulkCreate()` - Bulk create important links
- ✅ `bulkUpdate()` - Bulk update important links
- ✅ `getFooterLinks()` - Get footer links by category
- ✅ `findByUrl()` - Find important link by URL
- ✅ `existsByUrl()` - Check if URL exists

### 3. `important-links.service.spec.ts`
Unit tests for the Important Links service layer that test business logic in isolation.

**Coverage:**
- Business logic validation
- Data transformation
- Error handling
- Service method orchestration
- Validation logic
- Import/Export functionality

**Key Methods Tested:**
- ✅ `getImportantLink()` - Get important link by ID with error handling
- ✅ `getAllImportantLinks()` - Get all important links with filtering
- ✅ `getImportantLinksWithPagination()` - Get paginated important links
- ✅ `createImportantLink()` - Create important link with validation
- ✅ `updateImportantLink()` - Update important link with validation
- ✅ `deleteImportantLink()` - Delete important link with existence check
- ✅ `reorderImportantLinks()` - Reorder important links
- ✅ `bulkCreateImportantLinks()` - Bulk create important links
- ✅ `bulkUpdateImportantLinks()` - Bulk update important links
- ✅ `getImportantLinksStatistics()` - Get important links statistics
- ✅ `getFooterLinks()` - Get footer links by category
- ✅ `validateImportantLink()` - Validate important link data
- ✅ `importImportantLinks()` - Import important links with error handling
- ✅ `exportImportantLinks()` - Export important links

### 4. `setup-important-links.spec.ts`
Setup and integration tests that verify the Important Links module is properly configured and integrated.

**Coverage:**
- Module configuration
- Database schema validation
- Endpoint accessibility
- Authentication requirements
- Basic CRUD operations
- Search functionality
- Pagination support
- Statistics functionality
- Reordering functionality
- Footer links categorization

## Test Data

The tests use realistic test data with both English and Nepali translations:

```typescript
const testImportantLink = {
  linkTitle: {
    en: 'Government Portal',
    ne: 'सरकारी पोर्टल',
  },
  linkUrl: 'https://www.gov.np',
  order: 1,
  isActive: true,
};

const testFooterLinks = {
  quickLinks: [
    {
      linkTitle: { en: 'Quick Link 1', ne: 'त्वरित लिङ्क १' },
      linkUrl: 'https://example1.com',
      order: 1,
      isActive: true,
    }
  ],
  governmentLinks: [
    {
      linkTitle: { en: 'Government Link 1', ne: 'सरकारी लिङ्क १' },
      linkUrl: 'https://gov1.com',
      order: 1,
      isActive: true,
    }
  ],
  socialMediaLinks: [
    {
      linkTitle: { en: 'Facebook', ne: 'फेसबुक' },
      linkUrl: 'https://facebook.com',
      order: 1,
      isActive: true,
    }
  ],
  contactLinks: [
    {
      linkTitle: { en: 'Contact Us', ne: 'हामीलाई सम्पर्क गर्नुहोस्' },
      linkUrl: 'https://contact.com',
      order: 1,
      isActive: true,
    }
  ],
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

- **Required fields**: Link title and URL are required
- **Translation structure**: Both English and Nepali translations required
- **Field lengths**: Minimum and maximum length constraints
- **Data types**: Proper type validation
- **URL validation**: Proper URL format validation
- **Business rules**: Unique URLs, proper ordering, etc.
- **Order validation**: Positive integer order values

## Error Handling

The tests verify proper error handling for:

- **Not found errors**: 404 responses for non-existent resources
- **Validation errors**: 400 responses for invalid data
- **Authentication errors**: 401 responses for unauthorized access
- **Authorization errors**: 403 responses for insufficient permissions
- **Server errors**: 500 responses for internal errors
- **Duplicate URL errors**: Prevention of duplicate URLs
- **Import errors**: Proper handling of import failures

## Running the Tests

```bash
# Run all Important Links tests
npm test -- --testPathPattern=important-links

# Run specific test file
npm test -- important-links.e2e-spec.ts
npm test -- important-links.repository.spec.ts
npm test -- important-links.service.spec.ts
npm test -- setup-important-links.spec.ts

# Run with coverage
npm test -- --testPathPattern=important-links --coverage
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
    'important_links',
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
2. **Realistic Data**: Tests use realistic multilingual data
3. **Comprehensive Coverage**: All public and admin endpoints are tested
4. **Error Scenarios**: Both success and failure cases are tested
5. **Authentication**: Proper authentication and authorization testing
6. **Validation**: Comprehensive input validation testing
7. **Performance**: Pagination and bulk operations are tested
8. **Documentation**: Tests serve as documentation for API behavior
9. **Reordering**: Link reordering functionality is properly tested
10. **Footer Categorization**: Footer links categorization is properly tested 