# Office Description Module

## Overview

The Office Description module manages different types of office descriptions for government offices. This includes introduction, objectives, work details, organizational structure, digital charter, and employee sanctions. All content supports bilingual (English and Nepali) translations.

## Features

- **Multiple Description Types:** Support for 6 different office description types
- **Bilingual Content:** Full English and Nepali language support
- **CRUD Operations:** Complete create, read, update, delete functionality
- **Bulk Operations:** Bulk create and update capabilities
- **Import/Export:** Data import and export functionality
- **Statistics:** Comprehensive statistics and analytics
- **Admin Controls:** Full administrative control with role-based access
- **Public Access:** Read-only access for public endpoints

## Module Structure

```
src/modules/office-description/
├── controllers/
│   ├── office-description.controller.ts
│   └── admin-office-description.controller.ts
├── services/
│   └── office-description.service.ts
├── repositories/
│   └── office-description.repository.ts
├── dto/
│   └── office-description.dto.ts
├── entities/
│   └── office-description.entity.ts
├── office-description.module.ts
├── index.ts
└── README.md
```

## Office Description Types

The module supports the following description types:

1. **INTRODUCTION** - Office introduction and overview
2. **OBJECTIVE** - Office objectives and goals
3. **WORK_DETAILS** - Detailed work information
4. **ORGANIZATIONAL_STRUCTURE** - Organizational hierarchy
5. **DIGITAL_CHARTER** - Digital transformation charter
6. **EMPLOYEE_SANCTIONS** - Employee sanctions and policies

## API Endpoints

### Public Endpoints

#### GET /api/v1/office-descriptions
Get all office descriptions (public access)
- **Query Parameters:** 
  - `type` (optional) - Filter by description type
  - `lang` (optional) - Language preference (en/ne)
- **Response:** Array of office descriptions

#### GET /api/v1/office-descriptions/types
Get all available office description types
- **Response:** Array of description type enums

#### GET /api/v1/office-descriptions/type/:type
Get office description by type
- **Parameters:** `type` - Office description type
- **Query Parameters:** `lang` (optional) - Language preference
- **Response:** Office description data

#### GET /api/v1/office-descriptions/:id
Get office description by ID
- **Parameters:** `id` - Office description ID
- **Query Parameters:** `lang` (optional) - Language preference
- **Response:** Office description data

#### Convenience Endpoints

- **GET /api/v1/office-descriptions/introduction** - Get office introduction
- **GET /api/v1/office-descriptions/objective** - Get office objective
- **GET /api/v1/office-descriptions/work-details** - Get work details
- **GET /api/v1/office-descriptions/organizational-structure** - Get organizational structure
- **GET /api/v1/office-descriptions/digital-charter** - Get digital charter
- **GET /api/v1/office-descriptions/employee-sanctions** - Get employee sanctions

### Admin Endpoints

#### GET /api/v1/admin/office-descriptions
Get all office descriptions (admin access)
- **Query Parameters:** Same as public endpoint
- **Authentication:** Required (ADMIN/EDITOR roles)

#### GET /api/v1/admin/office-descriptions/statistics
Get office description statistics
- **Response:** Statistics data
- **Authentication:** Required (ADMIN/EDITOR roles)

#### GET /api/v1/admin/office-descriptions/:id
Get office description by ID (admin access)
- **Parameters:** `id` - Office description ID
- **Authentication:** Required (ADMIN/EDITOR roles)

#### POST /api/v1/admin/office-descriptions
Create new office description
- **Body:** CreateOfficeDescriptionDto
- **Authentication:** Required (ADMIN/EDITOR roles)

#### PUT /api/v1/admin/office-descriptions/:id
Update office description
- **Parameters:** `id` - Office description ID
- **Body:** UpdateOfficeDescriptionDto
- **Authentication:** Required (ADMIN/EDITOR roles)

#### PUT /api/v1/admin/office-descriptions/type/:type/upsert
Upsert office description by type
- **Parameters:** `type` - Office description type
- **Body:** CreateOfficeDescriptionDto
- **Authentication:** Required (ADMIN/EDITOR roles)

#### DELETE /api/v1/admin/office-descriptions/:id
Delete office description
- **Parameters:** `id` - Office description ID
- **Authentication:** Required (ADMIN role only)

#### DELETE /api/v1/admin/office-descriptions/type/:type
Delete office description by type
- **Parameters:** `type` - Office description type
- **Authentication:** Required (ADMIN role only)

#### Bulk Operations

- **POST /api/v1/admin/office-descriptions/bulk-create** - Bulk create descriptions
- **PUT /api/v1/admin/office-descriptions/bulk-update** - Bulk update descriptions
- **POST /api/v1/admin/office-descriptions/import** - Import descriptions
- **GET /api/v1/admin/office-descriptions/export** - Export descriptions

## Data Models

### OfficeDescription Entity
```typescript
interface OfficeDescription {
  id: string;
  officeDescriptionType: OfficeDescriptionType;
  content: TranslatableEntity;
  createdAt: Date;
  updatedAt: Date;
}
```

### CreateOfficeDescriptionDto
```typescript
class CreateOfficeDescriptionDto {
  @IsEnum(OfficeDescriptionType)
  officeDescriptionType: OfficeDescriptionType;

  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  content: TranslatableEntityDto;
}
```

### UpdateOfficeDescriptionDto
```typescript
class UpdateOfficeDescriptionDto {
  @IsOptional()
  @IsEnum(OfficeDescriptionType)
  officeDescriptionType?: OfficeDescriptionType;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  content?: TranslatableEntityDto;
}
```

## Usage Examples

### Creating an Office Description
```typescript
const description = await this.officeDescriptionService.createOfficeDescription({
  officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
  content: {
    en: 'Welcome to our government office. We are committed to serving the citizens with transparency and efficiency.',
    ne: 'हाम्रो सरकारी कार्यालयमा स्वागत छ। हामी पारदर्शिता र कार्यक्षमताको साथ नागरिकहरूलाई सेवा दिन प्रतिबद्ध छौं।'
  }
});
```

### Getting Office Description by Type
```typescript
// Public access
const introduction = await this.officeDescriptionService.getOfficeDescriptionByType(
  OfficeDescriptionType.INTRODUCTION, 
  'en'
);

// Admin access
const allDescriptions = await this.officeDescriptionService.getAllOfficeDescriptions();
```

### Updating Office Description
```typescript
const updatedDescription = await this.officeDescriptionService.updateOfficeDescription('description_id', {
  content: {
    en: 'Updated introduction text',
    ne: 'अपडेटेड परिचय पाठ'
  }
});
```

### Bulk Operations
```typescript
// Bulk create
const descriptions = await this.officeDescriptionService.bulkCreateOfficeDescriptions({
  descriptions: [
    {
      officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
      content: { en: 'Intro', ne: 'परिचय' }
    },
    {
      officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
      content: { en: 'Objective', ne: 'उद्देश्य' }
    }
  ]
});

// Bulk update
const updatedDescriptions = await this.officeDescriptionService.bulkUpdateOfficeDescriptions({
  descriptions: [
    { id: 'desc1', content: { en: 'Updated', ne: 'अपडेटेड' } },
    { id: 'desc2', content: { en: 'Updated 2', ne: 'अपडेटेड २' } }
  ]
});
```

## Validation Rules

### Content Validation
- Both English and Nepali content must be provided
- Minimum length: 10 characters
- Maximum length: 10,000 characters
- Required fields for both languages

### Type Validation
- Office description type must be one of the predefined enum values
- Only one description per type is allowed
- Type cannot be changed after creation

### Business Rules
- Cannot create duplicate descriptions for the same type
- Cannot delete descriptions that are referenced by other modules
- Upsert operations will update existing or create new descriptions

## Error Handling

The module provides comprehensive error handling:

- **Validation Errors:** Detailed field-level validation errors
- **Not Found Errors:** When office descriptions don't exist
- **Duplicate Errors:** When trying to create duplicate descriptions
- **Permission Errors:** When user lacks required permissions
- **Business Logic Errors:** When operations violate business rules

## Security Considerations

- **Role-based Access:** Different endpoints require different roles
- **Input Validation:** All inputs are validated and sanitized
- **SQL Injection Protection:** Using Prisma ORM for safe database operations
- **Data Integrity:** Proper foreign key constraints and validation

## Performance Considerations

- **Efficient Queries:** Optimized database queries using Prisma
- **Caching Ready:** Service methods are designed for easy caching integration
- **Bulk Operations:** Efficient bulk create and update operations
- **Pagination Support:** Ready for pagination implementation

## Testing

The module includes comprehensive testing support:

- **Unit Tests:** Service and repository method testing
- **Integration Tests:** API endpoint testing
- **E2E Tests:** Complete workflow testing
- **Validation Tests:** Input validation testing

## Dependencies

- **NestJS:** Core framework
- **Prisma:** Database ORM
- **class-validator:** Input validation
- **class-transformer:** Data transformation
- **@nestjs/swagger:** API documentation

## Future Enhancements

- **Caching Integration:** Redis caching for public endpoints
- **Version History:** Track description changes over time
- **Audit Logging:** Track all modifications
- **Rich Text Editor:** WYSIWYG editor for content management
- **Media Integration:** Support for images and documents in descriptions
- **Template System:** Predefined templates for different description types 