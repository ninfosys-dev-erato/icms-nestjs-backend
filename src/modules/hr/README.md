# HR Management Module

## Overview

The HR Management module provides comprehensive functionality for managing departments and employees within an organization. This module supports hierarchical department structures, employee management with contact information, and bilingual support (English and Nepali) for all translatable content.

## Features

### Department Management
- **Hierarchical Structure:** Support for parent-child department relationships
- **Department Heads:** Assign users as department heads
- **Bilingual Support:** Department names in English and Nepali
- **Ordering:** Custom ordering for department display
- **Status Management:** Active/inactive department states
- **Statistics:** HR analytics and department statistics

### Employee Management
- **Employee Profiles:** Complete employee information management
- **Department Assignment:** Link employees to departments
- **Contact Information:** Mobile, telephone, email, and room number
- **Bilingual Support:** Employee names and positions in English and Nepali
- **Position Management:** Track employee positions and roles
- **Status Management:** Active/inactive employee states

### Advanced Features
- **Search & Filtering:** Advanced search capabilities across departments and employees
- **Bulk Operations:** Bulk activate, deactivate, and delete operations
- **Import/Export:** Data import and export functionality (JSON, CSV, PDF)
- **Pagination:** Efficient data pagination for large datasets
- **Role-based Access:** Admin and Editor role permissions
- **API Documentation:** Complete Swagger/OpenAPI documentation

## API Endpoints

### Public Endpoints
- `GET /departments` - Get all active departments
- `GET /departments/hierarchy` - Get department hierarchy
- `GET /departments/search` - Search departments
- `GET /departments/:id` - Get department by ID
- `GET /employees` - Get all active employees
- `GET /employees/search` - Search employees
- `GET /employees/department/:departmentId` - Get employees by department
- `GET /employees/position/:position` - Get employees by position
- `GET /employees/:id` - Get employee by ID

### Admin Endpoints
- `GET /admin/departments` - Get all departments (Admin)
- `GET /admin/departments/statistics` - Get HR statistics
- `GET /admin/departments/hierarchy` - Get department hierarchy
- `GET /admin/departments/search` - Search departments
- `GET /admin/departments/:id` - Get department by ID
- `POST /admin/departments` - Create department
- `PUT /admin/departments/:id` - Update department
- `DELETE /admin/departments/:id` - Delete department
- `GET /admin/departments/export` - Export departments
- `POST /admin/departments/import` - Import departments
- `POST /admin/departments/bulk-activate` - Bulk activate departments
- `POST /admin/departments/bulk-deactivate` - Bulk deactivate departments
- `POST /admin/departments/bulk-delete` - Bulk delete departments

- `GET /admin/employees` - Get all employees (Admin)
- `GET /admin/employees/search` - Search employees
- `GET /admin/employees/department/:departmentId` - Get employees by department
- `GET /admin/employees/position/:position` - Get employees by position
- `GET /admin/employees/:id` - Get employee by ID
- `POST /admin/employees` - Create employee
- `PUT /admin/employees/:id` - Update employee
- `DELETE /admin/employees/:id` - Delete employee
- `GET /admin/employees/export` - Export employees
- `POST /admin/employees/import` - Import employees
- `POST /admin/employees/bulk-activate` - Bulk activate employees
- `POST /admin/employees/bulk-deactivate` - Bulk deactivate employees
- `POST /admin/employees/bulk-delete` - Bulk delete employees

## Data Models

### Department
- `id` - Unique identifier
- `departmentName` - Translatable department name (en/ne)
- `parentId` - Parent department ID (for hierarchy)
- `departmentHeadId` - User ID of department head
- `order` - Display order
- `isActive` - Active status
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Employee
- `id` - Unique identifier
- `name` - Translatable employee name (en/ne)
- `departmentId` - Associated department ID
- `position` - Translatable position title (en/ne)
- `order` - Display order
- `mobileNumber` - Mobile phone number
- `telephone` - Office telephone number
- `email` - Email address
- `roomNumber` - Office room number
- `isActive` - Active status
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Usage Examples

### Creating a Department
```typescript
const departmentData = {
  departmentName: {
    en: "Information Technology",
    ne: "सूचना प्रविधि"
  },
  parentId: "parent-dept-id", // optional
  departmentHeadId: "user-id", // optional
  order: 1,
  isActive: true
};
```

### Creating an Employee
```typescript
const employeeData = {
  name: {
    en: "John Doe",
    ne: "जोन डो"
  },
  departmentId: "dept-id",
  position: {
    en: "Software Engineer",
    ne: "सफ्टवेयर इन्जिनियर"
  },
  order: 1,
  mobileNumber: "+977-9841234567",
  telephone: "+977-1-1234567",
  email: "john.doe@example.com",
  roomNumber: "Room 101",
  isActive: true
};
```

## Dependencies

- **NestJS** - Framework
- **Prisma** - Database ORM
- **Class Validator** - Validation
- **Swagger** - API Documentation
- **JWT** - Authentication

## TODO

- [ ] Implement CSV and PDF export functionality
- [ ] Add import functionality for bulk data upload
- [ ] Implement advanced analytics and reporting
- [ ] Add employee photo/profile picture support
- [ ] Create department and employee audit logs
- [ ] Implement employee attendance tracking
- [ ] Add department budget management
- [ ] Create employee performance evaluation system 