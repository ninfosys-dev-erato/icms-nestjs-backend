# HR Management Module

## Overview

The HR Management module provides comprehensive functionality for managing departments and employees within an organization. This module supports hierarchical department structures, employee management with contact information, **comprehensive photo management with presigned URLs**, and bilingual support (English and Nepali) for all translatable content.

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
- **Homepage Display Control:** Control which employees appear on homepage with `showUpInHomepage` and `showDownInHomepage` flags
- **Display Ordering:** Custom ordering for homepage display with `order` field

### **Photo Management (NEW!)**
- **Photo Upload:** Upload employee photos with validation (JPG, PNG, WebP, GIF)
- **Photo Storage:** Secure storage using Backblaze B2 with media service integration
- **Presigned URLs:** Generate secure, time-limited URLs for photo access
- **Photo Replacement:** Replace existing photos with automatic cleanup
- **Photo Removal:** Remove photos with media service cleanup
- **Bulk Operations:** Bulk photo removal for multiple employees
- **Photo Analytics:** Track photo usage and access patterns
- **Photo Export:** Export photo metadata in multiple formats
- **Photo Search:** Search employees by photo availability and metadata

### Advanced Features
- **Search & Filtering:** Advanced search capabilities across departments and employees
- **Bulk Operations:** Bulk activate, deactivate, delete operations, and **photo management**
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

#### **Photo Endpoints (Public)**
- `GET /employees/photos` - Get all employee photos with presigned URLs
- `GET /employees/photos/search` - Search employee photos
- `GET /employees/photos/statistics` - Get employee photo statistics
- `GET /employees/department/:departmentId/photos` - Get employee photos by department
- `GET /employees/position/:position/photos` - Get employee photos by position
- `GET /employees/:id/photo` - Get specific employee photo with presigned URL

#### **Homepage Endpoints (Public)**
- `GET /employees/homepage/all` - Get all homepage employees (up and down sections)
- `GET /employees/homepage/up` - Get employees for homepage top section
- `GET /employees/homepage/down` - Get employees for homepage bottom section

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

#### **Photo Endpoints (Admin)**
- `GET /admin/employees/photos` - Get all employee photos with presigned URLs
- `GET /admin/employees/photos/search` - Search employee photos
- `GET /admin/employees/photos/statistics` - Get employee photo statistics
- `GET /admin/employees/photos/export` - Export employee photo metadata
- `GET /admin/employees/department/:departmentId/photos` - Get employee photos by department
- `GET /admin/employees/position/:position/photos` - Get employee photos by position
- `GET /admin/employees/:id/photo` - Get specific employee photo with presigned URL
- `GET /admin/employees/:id/photo/analytics` - Get employee photo analytics
- `POST /admin/employees/:id/photo` - Upload/replace employee photo
- `PUT /admin/employees/:id/photo` - Replace employee photo
- `DELETE /admin/employees/:id/photo` - Remove employee photo
- `POST /admin/employees/upload-with-employee` - Create employee with photo upload
- `POST /admin/employees/bulk-remove-photos` - Bulk remove employee photos

#### **Homepage Endpoints (Admin)**
- `GET /admin/employees/homepage/all` - Get all homepage employees (up and down sections)
- `GET /admin/employees/homepage/up` - Get employees for homepage top section
- `GET /admin/employees/homepage/down` - Get employees for homepage bottom section

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
- `order` - Display order for homepage sections
- `mobileNumber` - Mobile phone number
- `telephone` - Office telephone number
- `email` - Email address
- `roomNumber` - Office room number
- `isActive` - Active status
- `showUpInHomepage` - Show in top section of homepage
- `showDownInHomepage` - Show in bottom section of homepage
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### **Employee Photo (NEW!)**
- `photoMediaId` - Reference to media service photo
- `photo` - Photo metadata and media information
- `presignedUrl` - Secure, time-limited access URL (24 hours)

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

### **Uploading Employee Photo**
```typescript
// Single photo upload
const photoFile = // ... file from form data
const employee = await employeeService.uploadEmployeePhoto(employeeId, photoFile, userId);

// Create employee with photo
const employeeWithPhoto = await employeeService.createEmployeeWithImage(photoFile, employeeData, userId);
```

### **Managing Homepage Display**
```typescript
// Create employee with homepage flags
const employeeData = {
  name: { en: "John Doe", ne: "जोन डो" },
  departmentId: "dept-id",
  position: { en: "Software Engineer", ne: "सफ्टवेयर इन्जिनियर" },
  showUpInHomepage: true,    // Show in top section
  showDownInHomepage: false, // Don't show in bottom section
  order: 1                   // Display order within section
};

// Get homepage employees
const homepageEmployees = await employeeService.getHomepageEmployees();

// Get specific section
const upSection = await employeeService.getEmployeesByHomepageSection('up');
const downSection = await employeeService.getEmployeesByHomepageSection('down');
```

### **Getting Employee Photos with Presigned URLs**
```typescript
// Get all employee photos
const photos = await employeeService.getAllEmployeePhotos(query);

// Get specific employee photo
const photo = await employeeService.getEmployeePhoto(employeeId);

// Get photos by department
const deptPhotos = await employeeService.getEmployeePhotosByDepartment(departmentId);
```

## Dependencies

- **NestJS** - Framework
- **Prisma** - Database ORM
- **Class Validator** - Validation
- **Swagger** - API Documentation
- **JWT** - Authentication
- **Media Service** - Photo storage and management
- **Backblaze B2** - Cloud storage for photos

## **Photo Management Features**

### **File Validation**
- **Supported Formats:** JPG, PNG, WebP, GIF
- **Maximum Size:** 10MB per photo
- **Automatic Cleanup:** Old photos are removed when replaced

### **Security Features**
- **Presigned URLs:** 24-hour expiration for secure access
- **Role-based Access:** Admin/Editor permissions required for uploads
- **Media Service Integration:** Secure storage with Backblaze B2

### **Analytics & Reporting**
- **Photo Statistics:** Count of employees with/without photos
- **Department Breakdown:** Photo distribution by department
- **Position Breakdown:** Photo distribution by position
- **Usage Analytics:** Track photo access patterns (future enhancement)

### **Bulk Operations**
- **Bulk Photo Removal:** Remove photos from multiple employees
- **Photo Export:** Export photo metadata in JSON format
- **Photo Search:** Find employees by photo availability

## TODO

- [x] **Implement comprehensive photo upload functionality**
- [x] **Add presigned URL generation for secure photo access**
- [x] **Create photo management endpoints for admin and public access**
- [x] **Add photo validation and error handling**
- [x] **Implement photo statistics and analytics**
- [x] **Add homepage display control with up/down section flags**
- [x] **Implement homepage-specific endpoints for frontend integration**
- [ ] Implement CSV and PDF export functionality for photos
- [ ] Add import functionality for bulk data upload
- [ ] Implement advanced analytics and reporting
- [ ] Create department and employee audit logs
- [ ] Implement employee attendance tracking
- [ ] Add department budget management
- [ ] Create employee performance evaluation system
- [ ] **Add photo usage tracking and analytics**
- [ ] **Implement photo compression and optimization**
- [ ] **Add photo watermarking capabilities**
- [ ] **Add homepage employee ordering management interface**
- [ ] **Implement homepage employee statistics and analytics** 