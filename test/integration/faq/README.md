# FAQ Module Tests

This directory contains comprehensive tests for the FAQ (Frequently Asked Questions) module.

## Test Structure

### 1. `faq.e2e-spec.ts`
End-to-end tests for the FAQ module that test the complete flow from HTTP request to database operations.

**Coverage:**
- Public FAQ endpoints (`/api/v1/faq/*`)
- Admin FAQ endpoints (`/api/v1/admin/faq/*`)
- Authentication and authorization
- CRUD operations (Create, Read, Update, Delete)
- Bulk operations (bulk create, bulk update)
- Search functionality
- Pagination
- Reordering
- Import/Export functionality
- Statistics

**Key Features Tested:**
- ✅ GET `/api/v1/faq` - Get all FAQs
- ✅ GET `/api/v1/faq/paginated` - Get FAQs with pagination
- ✅ GET `/api/v1/faq/search` - Search FAQs
- ✅ GET `/api/v1/faq/random` - Get random FAQs
- ✅ GET `/api/v1/faq/popular` - Get popular FAQs
- ✅ GET `/api/v1/faq/active` - Get active FAQs only
- ✅ GET `/api/v1/faq/:id` - Get FAQ by ID
- ✅ POST `/api/v1/admin/faq` - Create FAQ
- ✅ PUT `/api/v1/admin/faq/:id` - Update FAQ
- ✅ DELETE `/api/v1/admin/faq/:id` - Delete FAQ
- ✅ POST `/api/v1/admin/faq/reorder` - Reorder FAQs
- ✅ POST `/api/v1/admin/faq/bulk-create` - Bulk create FAQs
- ✅ PUT `/api/v1/admin/faq/bulk-update` - Bulk update FAQs
- ✅ POST `/api/v1/admin/faq/import` - Import FAQs
- ✅ GET `/api/v1/admin/faq/export/all` - Export all FAQs
- ✅ GET `/api/v1/admin/faq/statistics` - Get FAQ statistics

### 2. `faq.repository.spec.ts`
Unit tests for the FAQ repository layer that test database operations in isolation.

**Coverage:**
- Database CRUD operations
- Search functionality
- Pagination logic
- Bulk operations
- Statistics queries
- Error handling

**Key Methods Tested:**
- ✅ `findById()` - Find FAQ by ID
- ✅ `findAll()` - Find all FAQs with optional filtering
- ✅ `findWithPagination()` - Find FAQs with pagination
- ✅ `search()` - Search FAQs by text
- ✅ `create()` - Create new FAQ
- ✅ `update()` - Update existing FAQ
- ✅ `delete()` - Delete FAQ
- ✅ `reorder()` - Reorder FAQs
- ✅ `bulkCreate()` - Bulk create FAQs
- ✅ `bulkUpdate()` - Bulk update FAQs
- ✅ `getStatistics()` - Get FAQ statistics
- ✅ `getRandomFAQs()` - Get random FAQs
- ✅ `getPopularFAQs()` - Get popular FAQs

### 3. `faq.service.spec.ts`
Unit tests for the FAQ service layer that test business logic in isolation.

**Coverage:**
- Business logic validation
- Data transformation
- Error handling
- Service method orchestration
- Validation logic

**Key Methods Tested:**
- ✅ `getFAQ()` - Get FAQ by ID with error handling
- ✅ `getAllFAQs()` - Get all FAQs with filtering
- ✅ `getFAQsWithPagination()` - Get paginated FAQs
- ✅ `searchFAQs()` - Search FAQs with relevance scoring
- ✅ `createFAQ()` - Create FAQ with validation
- ✅ `updateFAQ()` - Update FAQ with validation
- ✅ `deleteFAQ()` - Delete FAQ with existence check
- ✅ `reorderFAQs()` - Reorder FAQs
- ✅ `bulkCreateFAQs()` - Bulk create with validation
- ✅ `bulkUpdateFAQs()` - Bulk update with validation
- ✅ `getFAQStatistics()` - Get statistics
- ✅ `getRandomFAQs()` - Get random FAQs
- ✅ `getPopularFAQs()` - Get popular FAQs
- ✅ `validateFAQ()` - Validate FAQ data
- ✅ `importFAQs()` - Import FAQs with error handling
- ✅ `exportFAQs()` - Export all FAQs

### 4. `setup-faq.spec.ts`
Setup and integration tests that verify the FAQ module is properly configured and integrated.

**Coverage:**
- Module configuration
- Database schema validation
- Endpoint accessibility
- Authentication requirements
- Basic CRUD operations
- Search functionality
- Pagination support
- Statistics functionality

## Test Data

The tests use realistic test data with both English and Nepali translations:

```typescript
const testFAQ = {
  question: {
    en: 'What are the office hours?',
    ne: 'कार्यालयको समय के हो?',
  },
  answer: {
    en: 'Our office is open from 9 AM to 5 PM Monday to Friday.',
    ne: 'हाम्रो कार्यालय सोमबार देखि शुक्रबार सम्म बिहान ९ बजे देखि बेलुका ५ बजेसम्म खुला हुन्छ।',
  },
  order: 1,
  isActive: true,
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

- **Required fields**: Question and answer are required
- **Translation structure**: Both English and Nepali translations required
- **Field lengths**: Minimum and maximum length constraints
- **Data types**: Proper type validation
- **Business rules**: Order validation, active status, etc.

## Error Handling

The tests verify proper error handling for:

- **Not found errors**: 404 responses for non-existent resources
- **Validation errors**: 400 responses for invalid data
- **Authentication errors**: 401 responses for unauthorized access
- **Authorization errors**: 403 responses for insufficient permissions
- **Server errors**: 500 responses for internal errors

## Running the Tests

```bash
# Run all FAQ tests
npm test -- --testPathPattern=faq

# Run specific test file
npm test -- faq.e2e-spec.ts
npm test -- faq.repository.spec.ts
npm test -- faq.service.spec.ts
npm test -- setup-faq.spec.ts

# Run with coverage
npm test -- --testPathPattern=faq --coverage
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
    'f_a_qs',
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