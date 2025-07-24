# HR Module Tests

This directory contains comprehensive tests for the HR (Human Resources) module, covering both Department and Employee management.

## Test Structure

### 1. `hr.e2e-spec.ts`
End-to-end tests for the HR module that test the complete flow from HTTP request to database operations.

**Coverage:**
- Public HR endpoints (`/api/v1/departments/*`, `/api/v1/employees/*`)
- Admin HR endpoints (`/api/v1/admin/departments/*`, `/api/v1/admin/employees/*`)
- Authentication and authorization
- CRUD operations (Create, Read, Update, Delete)
- Bulk operations (bulk activate, bulk deactivate, bulk delete)
- Search functionality
- Pagination
- Department hierarchy
- Employee management by department
- Import/Export functionality
- Statistics and analytics

**Key Features Tested:**
- ✅ GET `/api/v1/departments` - Get all departments
- ✅ GET `/api/v1/departments/hierarchy` - Get department hierarchy
- ✅ GET `/api/v1/departments/search` - Search departments
- ✅ GET `/api/v1/departments/:id` - Get department by ID
- ✅ GET `/api/v1/employees` - Get all employees
- ✅ GET `/api/v1/employees/search` - Search employees
- ✅ GET `/api/v1/employees/department/:departmentId` - Get employees by department
- ✅ GET `/api/v1/employees/position/:position` - Get employees by position
- ✅ GET `/api/v1/employees/:id` - Get employee by ID
- ✅ POST `/api/v1/admin/departments` - Create department
- ✅ PUT `/api/v1/admin/departments/:id` - Update department
- ✅ DELETE `/api/v1/admin/departments/:id` - Delete department
- ✅ POST `/api/v1/admin/employees` - Create employee
- ✅ PUT `/api/v1/admin/employees/:id` - Update employee
- ✅ DELETE `/api/v1/admin/employees/:id` - Delete employee
- ✅ POST `/api/v1/admin/departments/bulk-activate` - Bulk activate departments
- ✅ POST `/api/v1/admin/departments/bulk-deactivate` - Bulk deactivate departments
- ✅ POST `/api/v1/admin/departments/bulk-delete` - Bulk delete departments
- ✅ POST `/api/v1/admin/employees/bulk-activate` - Bulk activate employees
- ✅ POST `/api/v1/admin/employees/bulk-deactivate` - Bulk deactivate employees
- ✅ POST `/api/v1/admin/employees/bulk-delete` - Bulk delete employees
- ✅ GET `/api/v1/admin/departments/export` - Export departments
- ✅ POST `/api/v1/admin/departments/import` - Import departments
- ✅ GET `/api/v1/admin/employees/export` - Export employees
- ✅ POST `/api/v1/admin/employees/import` - Import employees
- ✅ GET `/api/v1/admin/hr/statistics` - Get HR statistics

### 2. `department.repository.spec.ts`
Unit tests for the Department repository layer that test database operations in isolation.

**Coverage:**
- Database CRUD operations
- Search functionality
- Pagination logic
- Hierarchy management
- Statistics queries
- Error handling

**Key Methods Tested:**
- ✅ `findById()` - Find department by ID
- ✅ `findAll()` - Find all departments with optional filtering
- ✅ `findActive()` - Find active departments
- ✅ `search()` - Search departments by name
- ✅ `create()` - Create new department
- ✅ `update()` - Update existing department
- ✅ `delete()` - Delete department
- ✅ `getHierarchy()` - Get department hierarchy
- ✅ `getStatistics()` - Get department statistics
- ✅ `isDepartmentActive()` - Check if department is active

### 3. `employee.repository.spec.ts`
Unit tests for the Employee repository layer that test database operations in isolation.

**Coverage:**
- Database CRUD operations
- Search functionality
- Pagination logic
- Department-based queries
- Position-based queries
- Statistics queries
- Error handling

**Key Methods Tested:**
- ✅ `findById()` - Find employee by ID
- ✅ `findAll()` - Find all employees with optional filtering
- ✅ `findActive()` - Find active employees
- ✅ `search()` - Search employees by name
- ✅ `create()` - Create new employee
- ✅ `update()` - Update existing employee
- ✅ `delete()` - Delete employee
- ✅ `findByDepartment()` - Find employees by department
- ✅ `findByPosition()` - Find employees by position
- ✅ `isEmployeeActive()` - Check if employee is active

### 4. `department.service.spec.ts`
Unit tests for the Department service layer that test business logic in isolation.

**Coverage:**
- Business logic validation
- Data transformation
- Error handling
- Service method orchestration
- Validation logic

**Key Methods Tested:**
- ✅ `getDepartmentById()` - Get department by ID with error handling
- ✅ `getAllDepartments()` - Get all departments with filtering
- ✅ `getActiveDepartments()` - Get active departments
- ✅ `searchDepartments()` - Search departments
- ✅ `createDepartment()` - Create department with validation
- ✅ `updateDepartment()` - Update department with validation
- ✅ `deleteDepartment()` - Delete department with existence check
- ✅ `getDepartmentHierarchy()` - Get department hierarchy
- ✅ `validateDepartment()` - Validate department data
- ✅ `getHRStatistics()` - Get HR statistics
- ✅ `exportDepartments()` - Export departments
- ✅ `importDepartments()` - Import departments with error handling
- ✅ `bulkActivate()` - Bulk activate departments
- ✅ `bulkDeactivate()` - Bulk deactivate departments
- ✅ `bulkDelete()` - Bulk delete departments

### 5. `employee.service.spec.ts`
Unit tests for the Employee service layer that test business logic in isolation.

**Coverage:**
- Business logic validation
- Data transformation
- Error handling
- Service method orchestration
- Validation logic

**Key Methods Tested:**
- ✅ `getEmployeeById()` - Get employee by ID with error handling
- ✅ `getAllEmployees()` - Get all employees with filtering
- ✅ `getActiveEmployees()` - Get active employees
- ✅ `searchEmployees()` - Search employees
- ✅ `createEmployee()` - Create employee with validation
- ✅ `updateEmployee()` - Update employee with validation
- ✅ `deleteEmployee()` - Delete employee with existence check
- ✅ `getEmployeesByDepartment()` - Get employees by department
- ✅ `getEmployeesByPosition()` - Get employees by position
- ✅ `validateEmployee()` - Validate employee data
- ✅ `exportEmployees()` - Export employees
- ✅ `importEmployees()` - Import employees with error handling
- ✅ `bulkActivate()` - Bulk activate employees
- ✅ `bulkDeactivate()` - Bulk deactivate employees
- ✅ `bulkDelete()` - Bulk delete employees

### 6. `setup-hr.spec.ts`
Setup and integration tests that verify the HR module is properly configured and integrated.

**Coverage:**
- Module configuration
- Database schema validation
- Endpoint accessibility
- Authentication requirements
- Basic CRUD operations
- Search functionality
- Pagination support
- Statistics functionality
- Department hierarchy
- Employee management

## Test Data

The tests use realistic test data with both English and Nepali translations:

```typescript
const testDepartment = {
  departmentName: {
    en: 'Information Technology',
    ne: 'सूचना प्रविधि',
  },
  parentId: null,
  departmentHeadId: null,
  order: 1,
  isActive: true,
};

const testEmployee = {
  name: {
    en: 'John Doe',
    ne: 'जोन डो',
  },
  departmentId: 'dept-1',
  position: {
    en: 'Software Engineer',
    ne: 'सफ्टवेयर इन्जिनियर',
  },
  order: 1,
  mobileNumber: '+977-9841234567',
  telephone: '+977-1-1234567',
  email: 'john.doe@example.com',
  roomNumber: 'Room 101',
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

- **Required fields**: Department name, employee name, department ID, position are required
- **Translation structure**: Both English and Nepali translations required
- **Field lengths**: Minimum and maximum length constraints
- **Data types**: Proper type validation
- **Business rules**: Department hierarchy, employee-department relationships, etc.
- **Email validation**: Proper email format validation
- **Phone number validation**: Proper phone number format validation

## Error Handling

The tests verify proper error handling for:

- **Not found errors**: 404 responses for non-existent resources
- **Validation errors**: 400 responses for invalid data
- **Authentication errors**: 401 responses for unauthorized access
- **Authorization errors**: 403 responses for insufficient permissions
- **Server errors**: 500 responses for internal errors
- **Hierarchy errors**: Circular reference prevention
- **Relationship errors**: Orphaned employee prevention

## Running the Tests

```bash
# Run all HR tests
npm test -- --testPathPattern=hr

# Run specific test file
npm test -- hr.e2e-spec.ts
npm test -- department.repository.spec.ts
npm test -- employee.repository.spec.ts
npm test -- department.service.spec.ts
npm test -- employee.service.spec.ts
npm test -- setup-hr.spec.ts

# Run with coverage
npm test -- --testPathPattern=hr --coverage
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
    'employees',
    'departments',
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
9. **Hierarchy Management**: Department hierarchy relationships are properly tested
10. **Employee Management**: Employee-department relationships are properly tested 