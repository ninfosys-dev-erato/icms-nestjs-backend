# Office Settings Module

## Overview

The Office Settings module manages all configuration and settings for the government office. This includes office information, contact details, social media links, and visual assets like background photos.

## Features

- **Centralized Configuration:** Single source of truth for office settings
- **Bilingual Support:** All text fields support English and Nepali translations
- **Media Integration:** Background photo upload and management
- **SEO Optimization:** Structured data for search engine optimization
- **Admin Controls:** Full CRUD operations for administrators
- **Public Access:** Read-only access for public endpoints

## Module Structure

```
src/modules/office-settings/
├── controllers/
│   └── office-settings.controller.ts
├── services/
│   └── office-settings.service.ts
├── repositories/
│   └── office-settings.repository.ts
├── dto/
│   ├── create-office-settings.dto.ts
│   ├── update-office-settings.dto.ts
│   └── office-settings-response.dto.ts
├── entities/
│   └── office-settings.entity.ts
├── office-settings.module.ts
├── index.ts
└── README.md
```

## API Endpoints

### Public Endpoints

#### GET /api/v1/office-settings
Get office settings (public access)
- **Query Parameters:** `lang` (optional) - Language preference (en/ne)
- **Response:** Office settings data

#### GET /api/v1/office-settings/seo
Get office settings for SEO optimization
- **Response:** SEO-optimized office information

### Admin Endpoints

#### GET /api/v1/office-settings/:id
Get office settings by ID (admin only)
- **Parameters:** `id` - Office settings ID
- **Response:** Office settings data

#### POST /api/v1/office-settings
Create new office settings (admin only)
- **Body:** CreateOfficeSettingsDto
- **Response:** Created office settings

#### PUT /api/v1/office-settings/:id
Update office settings (admin only)
- **Parameters:** `id` - Office settings ID
- **Body:** UpdateOfficeSettingsDto
- **Response:** Updated office settings

#### PUT /api/v1/office-settings/upsert
Upsert office settings (admin only)
- **Body:** CreateOfficeSettingsDto
- **Response:** Upserted office settings

#### DELETE /api/v1/office-settings/:id
Delete office settings (admin only)
- **Parameters:** `id` - Office settings ID
- **Response:** Success message

#### POST /api/v1/office-settings/:id/background-photo
Update background photo (admin only)
- **Parameters:** `id` - Office settings ID
- **Body:** Multipart form data with image file
- **Response:** Updated office settings

#### DELETE /api/v1/office-settings/:id/background-photo
Remove background photo (admin only)
- **Parameters:** `id` - Office settings ID
- **Response:** Updated office settings

## Data Models

### OfficeSettings Entity
```typescript
interface OfficeSettings {
  id: string;
  directorate: TranslatableEntity;
  officeName: TranslatableEntity;
  officeAddress: TranslatableEntity;
  backgroundPhoto?: string;
  email: string;
  phoneNumber: TranslatableEntity;
  xLink?: string;
  mapIframe?: string;
  website?: string;
  youtube?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### TranslatableEntityDto
```typescript
class TranslatableEntityDto {
  @IsString()
  @IsNotEmpty()
  en: string;

  @IsString()
  @IsNotEmpty()
  ne: string;
}
```

## Usage Examples

### Creating Office Settings
```typescript
const officeSettings = await this.officeSettingsService.createOfficeSettings({
  directorate: { en: 'Ministry of Education', ne: 'शिक्षा मन्त्रालय' },
  officeName: { en: 'District Education Office', ne: 'जिल्ला शिक्षा कार्यालय' },
  officeAddress: { en: 'Dadeldura, Nepal', ne: 'दादेलधुरा, नेपाल' },
  email: 'info@example.gov.np',
  phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
  website: 'https://example.gov.np',
  xLink: 'https://x.com/example',
  youtube: 'https://youtube.com/example'
});
```

### Getting Office Settings
```typescript
// Public access
const settings = await this.officeSettingsService.getOfficeSettings('en');

// Admin access by ID
const settings = await this.officeSettingsService.getOfficeSettingsById('settings_id');
```

### Updating Office Settings
```typescript
const updatedSettings = await this.officeSettingsService.updateOfficeSettings('settings_id', {
  email: 'new-email@example.gov.np',
  website: 'https://new-website.gov.np'
});
```

## Validation Rules

### Email Validation
- Must be a valid email format
- Required field

### URL Validation
- xLink, website, youtube must be valid URLs
- Optional fields

### Translatable Fields
- Both English and Nepali must be provided
- Required fields: directorate, officeName, officeAddress, phoneNumber
- Length limits: 1-500 characters for most fields, 1-1000 for address

### File Upload Validation
- Background photo: JPG, PNG, WebP only
- Maximum size: 5MB
- Minimum dimensions: 1920x1080px

## Error Handling

The module provides comprehensive error handling:

- **Validation Errors:** Detailed field-level validation errors
- **Not Found Errors:** When office settings don't exist
- **Permission Errors:** When user lacks required permissions
- **File Upload Errors:** When file validation fails

## Security Considerations

- **Admin-only Operations:** All modification operations require ADMIN role
- **Input Validation:** All inputs are validated and sanitized
- **File Upload Security:** File type and size validation
- **SQL Injection Protection:** Using Prisma ORM for safe database operations

## Performance Considerations

- **Single Record Design:** Office settings typically has only one record
- **Caching Ready:** Service methods are designed for easy caching integration
- **Efficient Queries:** Minimal database queries using Prisma optimization

## Testing

The module includes comprehensive testing support:

- **Unit Tests:** Service and repository method testing
- **Integration Tests:** API endpoint testing
- **E2E Tests:** Complete workflow testing

## Dependencies

- **NestJS:** Core framework
- **Prisma:** Database ORM
- **class-validator:** Input validation
- **class-transformer:** Data transformation
- **@nestjs/swagger:** API documentation

## Future Enhancements

- **Caching Integration:** Redis caching for public endpoints
- **S3 Integration:** Cloud storage for background photos
- **Image Processing:** Automatic image optimization
- **Audit Logging:** Track all modifications
- **Version History:** Track settings changes over time 