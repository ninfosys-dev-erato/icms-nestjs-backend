# Human Resources Management Module

## Overview

The Human Resources Management module manages departments and employees with hierarchical organizational structure, contact information, and role management. This module provides a comprehensive solution for organizing and managing the government office's human resources.

## Module Purpose

- **Department Management:** Create and manage hierarchical department structure
- **Employee Management:** Comprehensive employee information and contact details
- **Organizational Structure:** Visual representation of office hierarchy
- **Contact Management:** Centralized contact information for all employees
- **Role Assignment:** Department head and employee role management
- **Reporting Structure:** Clear reporting relationships and organizational flow

## Database Schema

### Department Entity
```typescript
interface Department {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  parentId?: string;
  order: number;
  isActive: boolean;
  departmentHeadId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  parent: Department;
  children: Department[];
  employees: Employee[];
  departmentHead: Employee;
}

interface TranslatableEntity {
  en: string;
  ne: string;
}
```

### Employee Entity
```typescript
interface Employee {
  id: string;
  name: TranslatableEntity;
  departmentId: string;
  position: TranslatableEntity;
  order: number;
  mobileNumber?: string;
  telephone?: string;
  email?: string;
  roomNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  department: Department;
  departmentHead: Department[];
  createdBy: User;
  updatedBy: User;
}

enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  RETIRED = 'RETIRED'
}
```

## DTOs (Data Transfer Objects)

### Department DTOs

#### CreateDepartmentDto
```typescript
interface CreateDepartmentDto {
  name: TranslatableEntity;
  description?: TranslatableEntity;
  parentId?: string;
  order?: number;
  isActive?: boolean;
  departmentHeadId?: string;
}
```

#### UpdateDepartmentDto
```typescript
interface UpdateDepartmentDto {
  name?: TranslatableEntity;
  description?: TranslatableEntity;
  parentId?: string;
  order?: number;
  isActive?: boolean;
  departmentHeadId?: string;
}
```

#### DepartmentResponseDto
```typescript
interface DepartmentResponseDto {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  parentId?: string;
  order: number;
  isActive: boolean;
  departmentHead?: EmployeeResponseDto;
  employeeCount: number;
  children: DepartmentResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Employee DTOs

#### CreateEmployeeDto
```typescript
interface CreateEmployeeDto {
  name: TranslatableEntity;
  departmentId: string;
  position: TranslatableEntity;
  order?: number;
  mobileNumber?: string;
  telephone?: string;
  email?: string;
  roomNumber?: string;
  isActive?: boolean;
}
```

#### UpdateEmployeeDto
```typescript
interface UpdateEmployeeDto {
  name?: TranslatableEntity;
  departmentId?: string;
  position?: TranslatableEntity;
  order?: number;
  mobileNumber?: string;
  telephone?: string;
  email?: string;
  roomNumber?: string;
  isActive?: boolean;
}
```

#### EmployeeResponseDto
```typescript
interface EmployeeResponseDto {
  id: string;
  name: TranslatableEntity;
  department: DepartmentResponseDto;
  position: TranslatableEntity;
  order: number;
  mobileNumber?: string;
  telephone?: string;
  email?: string;
  roomNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserResponseDto;
  updatedBy: UserResponseDto;
}
```

### Query DTOs

#### DepartmentQueryDto
```typescript
interface DepartmentQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

#### EmployeeQueryDto
```typescript
interface EmployeeQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  position?: string;
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

## Repository Interfaces

### DepartmentRepository
```typescript
interface DepartmentRepository {
  // Find department by ID
  findById(id: string): Promise<Department | null>;
  
  // Find all departments with pagination and filters
  findAll(query: DepartmentQueryDto): Promise<PaginatedDepartmentResult>;
  
  // Find active departments
  findActive(query: DepartmentQueryDto): Promise<PaginatedDepartmentResult>;
  
  // Find departments by parent
  findByParent(parentId?: string): Promise<Department[]>;
  
  // Find department tree
  findDepartmentTree(): Promise<Department[]>;
  
  // Search departments
  search(searchTerm: string, query: DepartmentQueryDto): Promise<PaginatedDepartmentResult>;
  
  // Create department
  create(data: CreateDepartmentDto): Promise<Department>;
  
  // Update department
  update(id: string, data: UpdateDepartmentDto): Promise<Department>;
  
  // Delete department
  delete(id: string): Promise<void>;
  
  // Reorder departments
  reorder(orders: { id: string; order: number }[]): Promise<void>;
  
  // Get department with employee count
  findWithEmployeeCount(id: string): Promise<DepartmentWithCount>;
  
  // Get department statistics
  getStatistics(): Promise<DepartmentStatistics>;
  
  // Find departments by head
  findByHead(employeeId: string): Promise<Department[]>;
  
  // Get organizational chart
  getOrganizationalChart(): Promise<OrganizationalChartNode[]>;
}

interface PaginatedDepartmentResult {
  data: Department[];
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

interface DepartmentWithCount extends Department {
  employeeCount: number;
  children: DepartmentWithCount[];
}

interface DepartmentStatistics {
  total: number;
  active: number;
  withEmployees: number;
  averageEmployeesPerDepartment: number;
  byLevel: Record<number, number>;
}

interface OrganizationalChartNode {
  id: string;
  name: TranslatableEntity;
  type: 'department' | 'employee';
  parentId?: string;
  children: OrganizationalChartNode[];
  employeeCount?: number;
  departmentHead?: EmployeeResponseDto;
}
```

### EmployeeRepository
```typescript
interface EmployeeRepository {
  // Find employee by ID
  findById(id: string): Promise<Employee | null>;
  
  // Find all employees with pagination and filters
  findAll(query: EmployeeQueryDto): Promise<PaginatedEmployeeResult>;
  
  // Find active employees
  findActive(query: EmployeeQueryDto): Promise<PaginatedEmployeeResult>;
  
  // Find employees by department
  findByDepartment(departmentId: string, query: EmployeeQueryDto): Promise<PaginatedEmployeeResult>;
  
  // Find employees by position
  findByPosition(position: string, query: EmployeeQueryDto): Promise<PaginatedEmployeeResult>;
  
  // Search employees
  search(searchTerm: string, query: EmployeeQueryDto): Promise<PaginatedEmployeeResult>;
  
  // Create employee
  create(data: CreateEmployeeDto, userId: string): Promise<Employee>;
  
  // Update employee
  update(id: string, data: UpdateEmployeeDto, userId: string): Promise<Employee>;
  
  // Delete employee
  delete(id: string): Promise<void>;
  
  // Reorder employees
  reorder(orders: { id: string; order: number }[]): Promise<void>;
  
  // Get employee statistics
  getStatistics(): Promise<EmployeeStatistics>;
  
  // Find employees by email
  findByEmail(email: string): Promise<Employee | null>;
  
  // Find employees by phone
  findByPhone(phone: string): Promise<Employee | null>;
  
  // Get department heads
  getDepartmentHeads(): Promise<Employee[]>;
  
  // Get employee directory
  getEmployeeDirectory(): Promise<EmployeeDirectoryEntry[]>;
}

interface PaginatedEmployeeResult {
  data: Employee[];
  pagination: PaginationInfo;
}

interface EmployeeStatistics {
  total: number;
  active: number;
  byDepartment: Record<string, number>;
  byPosition: Record<string, number>;
  averageEmployeesPerDepartment: number;
}

interface EmployeeDirectoryEntry {
  id: string;
  name: TranslatableEntity;
  position: TranslatableEntity;
  department: DepartmentResponseDto;
  contact: {
    mobileNumber?: string;
    telephone?: string;
    email?: string;
    roomNumber?: string;
  };
}
```

## Service Interfaces

### DepartmentService
```typescript
interface DepartmentService {
  // Get department by ID
  getDepartmentById(id: string): Promise<DepartmentResponseDto>;
  
  // Get all departments with pagination
  getAllDepartments(query: DepartmentQueryDto): Promise<PaginatedDepartmentResponse>;
  
  // Get active departments
  getActiveDepartments(query: DepartmentQueryDto): Promise<PaginatedDepartmentResponse>;
  
  // Get departments by parent
  getDepartmentsByParent(parentId?: string): Promise<DepartmentResponseDto[]>;
  
  // Get department tree
  getDepartmentTree(): Promise<DepartmentResponseDto[]>;
  
  // Search departments
  searchDepartments(searchTerm: string, query: DepartmentQueryDto): Promise<PaginatedDepartmentResponse>;
  
  // Create department
  createDepartment(data: CreateDepartmentDto): Promise<DepartmentResponseDto>;
  
  // Update department
  updateDepartment(id: string, data: UpdateDepartmentDto): Promise<DepartmentResponseDto>;
  
  // Delete department
  deleteDepartment(id: string): Promise<void>;
  
  // Reorder departments
  reorderDepartments(orders: { id: string; order: number }[]): Promise<void>;
  
  // Validate department data
  validateDepartment(data: CreateDepartmentDto | UpdateDepartmentDto): Promise<ValidationResult>;
  
  // Get department statistics
  getDepartmentStatistics(): Promise<DepartmentStatistics>;
  
  // Get organizational chart
  getOrganizationalChart(): Promise<OrganizationalChartNode[]>;
  
  // Move employees to department
  moveEmployeesToDepartment(employeeIds: string[], departmentId: string): Promise<void>;
  
  // Export departments
  exportDepartments(query: DepartmentQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Import departments
  importDepartments(file: Express.Multer.File): Promise<ImportResult>;
}

interface PaginatedDepartmentResponse {
  data: DepartmentResponseDto[];
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
```

### EmployeeService
```typescript
interface EmployeeService {
  // Get employee by ID
  getEmployeeById(id: string): Promise<EmployeeResponseDto>;
  
  // Get all employees with pagination
  getAllEmployees(query: EmployeeQueryDto): Promise<PaginatedEmployeeResponse>;
  
  // Get active employees
  getActiveEmployees(query: EmployeeQueryDto): Promise<PaginatedEmployeeResponse>;
  
  // Get employees by department
  getEmployeesByDepartment(departmentId: string, query: EmployeeQueryDto): Promise<PaginatedEmployeeResponse>;
  
  // Get employees by position
  getEmployeesByPosition(position: string, query: EmployeeQueryDto): Promise<PaginatedEmployeeResponse>;
  
  // Search employees
  searchEmployees(searchTerm: string, query: EmployeeQueryDto): Promise<PaginatedEmployeeResponse>;
  
  // Create employee
  createEmployee(data: CreateEmployeeDto, userId: string): Promise<EmployeeResponseDto>;
  
  // Update employee
  updateEmployee(id: string, data: UpdateEmployeeDto, userId: string): Promise<EmployeeResponseDto>;
  
  // Delete employee
  deleteEmployee(id: string): Promise<void>;
  
  // Reorder employees
  reorderEmployees(orders: { id: string; order: number }[]): Promise<void>;
  
  // Validate employee data
  validateEmployee(data: CreateEmployeeDto | UpdateEmployeeDto): Promise<ValidationResult>;
  
  // Get employee statistics
  getEmployeeStatistics(): Promise<EmployeeStatistics>;
  
  // Get employee directory
  getEmployeeDirectory(): Promise<EmployeeDirectoryEntry[]>;
  
  // Get department heads
  getDepartmentHeads(): Promise<EmployeeResponseDto[]>;
  
  // Export employees
  exportEmployees(query: EmployeeQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Import employees
  importEmployees(file: Express.Multer.File, userId: string): Promise<ImportResult>;
  
  // Bulk operations
  bulkActivate(ids: string[]): Promise<BulkOperationResult>;
  bulkDeactivate(ids: string[]): Promise<BulkOperationResult>;
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;
}

interface PaginatedEmployeeResponse {
  data: EmployeeResponseDto[];
  pagination: PaginationInfo;
}

interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}
```

## Controller Interfaces

### PublicHRController
```typescript
interface PublicHRController {
  // Get all active departments
  getAllDepartments(
    @Query() query: DepartmentQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get department by ID
  getDepartmentById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get department tree
  getDepartmentTree(
    @Res() response: Response
  ): Promise<void>;
  
  // Get organizational chart
  getOrganizationalChart(
    @Res() response: Response
  ): Promise<void>;
  
  // Get all active employees
  getAllEmployees(
    @Query() query: EmployeeQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get employee by ID
  getEmployeeById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get employees by department
  getEmployeesByDepartment(
    @Param('departmentId') departmentId: string,
    @Query() query: EmployeeQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get employee directory
  getEmployeeDirectory(
    @Res() response: Response
  ): Promise<void>;
  
  // Search employees
  searchEmployees(
    @Query('q') searchTerm: string,
    @Query() query: EmployeeQueryDto,
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminHRController
```typescript
interface AdminHRController {
  // Get department by ID (admin)
  getDepartmentById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create department
  createDepartment(
    @Body() data: CreateDepartmentDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update department
  updateDepartment(
    @Param('id') id: string,
    @Body() data: UpdateDepartmentDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete department
  deleteDepartment(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Reorder departments
  reorderDepartments(
    @Body() orders: { id: string; order: number }[],
    @Res() response: Response
  ): Promise<void>;
  
  // Get department statistics
  getDepartmentStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Export departments
  exportDepartments(
    @Query() query: DepartmentQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
    @Res() response: Response
  ): Promise<void>;
  
  // Import departments
  importDepartments(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
  
  // Get employee by ID (admin)
  getEmployeeById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create employee
  createEmployee(
    @Body() data: CreateEmployeeDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update employee
  updateEmployee(
    @Param('id') id: string,
    @Body() data: UpdateEmployeeDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete employee
  deleteEmployee(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Reorder employees
  reorderEmployees(
    @Body() orders: { id: string; order: number }[],
    @Res() response: Response
  ): Promise<void>;
  
  // Get employee statistics
  getEmployeeStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Export employees
  exportEmployees(
    @Query() query: EmployeeQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
    @Res() response: Response
  ): Promise<void>;
  
  // Import employees
  importEmployees(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
  
  // Bulk operations
  bulkActivateEmployees(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
  
  bulkDeactivateEmployees(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
  
  bulkDeleteEmployees(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
}
```

## API Endpoints

### Public HR Endpoints

#### GET /api/v1/departments
**Description:** Get all active departments
**Access:** Public

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `parentId`: Parent department filter
- `isActive`: Active status filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dept_id",
      "name": {
        "en": "Information Technology",
        "ne": "सूचना प्रविधि"
      },
      "description": {
        "en": "IT Department responsible for digital services",
        "ne": "डिजिटल सेवाहरूको लागि जिम्मेवार आईटी विभाग"
      },
      "parentId": null,
      "order": 1,
      "isActive": true,
      "departmentHead": {
        "id": "emp_id",
        "name": {
          "en": "John Doe",
          "ne": "जोन डो"
        },
        "position": {
          "en": "IT Director",
          "ne": "आईटी निर्देशक"
        }
      },
      "employeeCount": 15,
      "children": [],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### GET /api/v1/departments/{id}
**Description:** Get department by ID
**Access:** Public

#### GET /api/v1/departments/tree
**Description:** Get department tree
**Access:** Public

#### GET /api/v1/departments/organizational-chart
**Description:** Get organizational chart
**Access:** Public

#### GET /api/v1/employees
**Description:** Get all active employees
**Access:** Public

#### GET /api/v1/employees/{id}
**Description:** Get employee by ID
**Access:** Public

#### GET /api/v1/employees/department/{departmentId}
**Description:** Get employees by department
**Access:** Public

#### GET /api/v1/employees/directory
**Description:** Get employee directory
**Access:** Public

#### GET /api/v1/employees/search
**Description:** Search employees
**Access:** Public

### Admin HR Endpoints

#### POST /api/v1/admin/departments
**Description:** Create department
**Access:** Admin, Editor

**Request Body:**
```json
{
  "name": {
    "en": "Information Technology",
    "ne": "सूचना प्रविधि"
  },
  "description": {
    "en": "IT Department responsible for digital services",
    "ne": "डिजिटल सेवाहरूको लागि जिम्मेवार आईटी विभाग"
  },
  "parentId": null,
  "order": 1,
  "isActive": true,
  "departmentHeadId": "emp_id"
}
```

#### PUT /api/v1/admin/departments/{id}
**Description:** Update department
**Access:** Admin, Editor

#### DELETE /api/v1/admin/departments/{id}
**Description:** Delete department
**Access:** Admin only

#### PUT /api/v1/admin/departments/reorder
**Description:** Reorder departments
**Access:** Admin, Editor

#### GET /api/v1/admin/departments/statistics
**Description:** Get department statistics
**Access:** Admin, Editor

#### GET /api/v1/admin/departments/export
**Description:** Export departments
**Access:** Admin, Editor

#### POST /api/v1/admin/departments/import
**Description:** Import departments
**Access:** Admin only

#### POST /api/v1/admin/employees
**Description:** Create employee
**Access:** Admin, Editor

#### PUT /api/v1/admin/employees/{id}
**Description:** Update employee
**Access:** Admin, Editor

#### DELETE /api/v1/admin/employees/{id}
**Description:** Delete employee
**Access:** Admin only

#### PUT /api/v1/admin/employees/reorder
**Description:** Reorder employees
**Access:** Admin, Editor

#### GET /api/v1/admin/employees/statistics
**Description:** Get employee statistics
**Access:** Admin, Editor

#### GET /api/v1/admin/employees/export
**Description:** Export employees
**Access:** Admin, Editor

#### POST /api/v1/admin/employees/import
**Description:** Import employees
**Access:** Admin only

## Business Logic

### 1. Department Management
- **Hierarchical structure** with parent-child relationships
- **Department head assignment** and management
- **Ordering system** for display priority
- **Employee count tracking** and statistics

### 2. Employee Management
- **Comprehensive employee information** storage
- **Department assignment** and role management
- **Contact information** management
- **Ordering system** within departments

### 3. Organizational Structure
- **Tree-based department hierarchy**
- **Visual organizational chart** generation
- **Reporting relationships** management
- **Department head tracking**

### 4. Contact Management
- **Centralized contact directory**
- **Multiple contact methods** (phone, email, room)
- **Search and filtering** capabilities
- **Privacy controls** for sensitive information

## Error Handling

### Department Creation Errors
```json
{
  "success": false,
  "error": {
    "code": "DEPARTMENT_CREATION_ERROR",
    "message": "Department creation failed",
    "details": [
      {
        "field": "name",
        "message": "Department name is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  }
}
```

### Employee Creation Errors
```json
{
  "success": false,
  "error": {
    "code": "EMPLOYEE_CREATION_ERROR",
    "message": "Employee creation failed",
    "details": [
      {
        "field": "departmentId",
        "message": "Department not found",
        "code": "DEPARTMENT_NOT_FOUND"
      }
    ]
  }
}
```

## Performance Considerations

### 1. Organizational Chart Generation
- **Caching** for complex tree structures
- **Lazy loading** for large hierarchies
- **Optimized queries** for tree traversal
- **Indexing** on hierarchical relationships

### 2. Search and Filtering
- **Full-text search** across employee names and positions
- **Department-based filtering** for efficient queries
- **Caching** for frequently accessed data
- **Pagination** for large result sets

### 3. Database Optimization
- **Indexing** on frequently queried fields
- **Query optimization** for complex joins
- **Connection pooling** for high concurrency
- **Caching** for organizational structures

## Security Considerations

### 1. Data Privacy
- **Contact information protection** for employees
- **Role-based access** to sensitive data
- **Audit logging** for all operations
- **Data encryption** for sensitive fields

### 2. Access Control
- **Public read access** for basic information
- **Admin/Editor write access** for management
- **Department-specific permissions** for managers
- **Employee self-service** for own information

### 3. Data Validation
- **Input sanitization** for all employee data
- **Email validation** for contact information
- **Phone number validation** for consistency
- **Department hierarchy validation** for integrity 