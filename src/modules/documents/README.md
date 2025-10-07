# Document Management Module

## Overview

The Document Management module provides a comprehensive document library system with advanced categorization, search capabilities, version control, and download tracking. This module serves as the central repository for all official documents, reports, and downloadable resources.

## Features

- **Document Repository:** Centralized storage for all official documents
- **Advanced Categorization:** Hierarchical document organization with categories (Official, Report, Form, Policy, etc.)
- **Full-Text Search:** Powerful search across document content, titles, and descriptions
- **Version Control:** Track document versions and changes with detailed change logs
- **Download Tracking:** Monitor document access and usage with analytics
- **File Type Support:** Support for PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, CSV, ZIP, RAR
- **Bilingual Support:** Full support for English and Nepali content
- **Access Control:** Public and private document access with authentication requirements
- **Bulk Operations:** Bulk upload, update, and delete operations
- **Export/Import:** Export documents in JSON, CSV, and PDF formats
- **S3 Integration:** Cloud storage integration for document files
- **Analytics:** Detailed download analytics and usage statistics

## API Endpoints

### Public Endpoints

#### GET `/documents`
Get all public documents with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page
- `search` (string): Search term for full-text search
- `documentType` (enum): Filter by document type (PDF, DOC, DOCX, etc.)
- `category` (enum): Filter by category (OFFICIAL, REPORT, FORM, etc.)
- `sort` (string): Sort field (createdAt, updatedAt, title, etc.)
- `order` (string): Sort order (asc, desc)

#### GET `/documents/type/:type`
Get documents by specific type.

#### GET `/documents/category/:category`
Get documents by specific category.

#### GET `/documents/search`
Search documents with advanced filtering.

#### GET `/documents/pdfs`
Get all PDF documents.

#### GET `/documents/forms`
Get all form documents.

#### GET `/documents/policies`
Get all policy documents.

#### GET `/documents/reports`
Get all report documents.

#### GET `/documents/:id`
Get document by ID.

#### GET `/documents/:id/download`
Download document with tracking.

#### GET `/documents/:id/url`
Get document URL and metadata.

### Admin Endpoints

#### GET `/admin/documents`
Get all documents (admin view).

#### GET `/admin/documents/statistics`
Get document statistics and analytics.

#### GET `/admin/documents/search`
Search documents (admin view).

#### GET `/admin/documents/type/:type`
Get documents by type (admin view).

#### GET `/admin/documents/category/:category`
Get documents by category (admin view).

#### GET `/admin/documents/:id`
Get document by ID (admin view).

#### POST `/admin/documents/upload`
Upload new document.

#### PUT `/admin/documents/:id`
Update document.

#### DELETE `/admin/documents/:id`
Delete document.

#### POST `/admin/documents/:id/versions`
Create new document version.

#### GET `/admin/documents/:id/versions`
Get document version history.

#### GET `/admin/documents/:id/analytics`
Get document download analytics.

#### GET `/admin/documents/export`
Export documents in various formats.

#### POST `/admin/documents/import`
Import documents from file.

#### POST `/admin/documents/bulk-delete`
Bulk delete documents.

#### PUT `/admin/documents/bulk-update`
Bulk update documents.

## Data Models

### Document
```typescript
{
  id: string;
  title: TranslatableEntity; // { en: string, ne: string }
  description?: TranslatableEntity;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  category: DocumentCategory;
  status: DocumentStatus;
  documentNumber?: string;
  version?: string;
  publishDate?: Date;
  expiryDate?: Date;
  tags?: string[];
  isPublic: boolean;
  requiresAuth: boolean;
  order: number;
  isActive: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### DocumentDownload
```typescript
{
  id: string;
  documentId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  downloadedAt: Date;
}
```

### DocumentVersion
```typescript
{
  id: string;
  documentId: string;
  version: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  changeLog?: TranslatableEntity;
  createdAt: Date;
}
```

## Enums

### DocumentType
- `PDF` - Portable Document Format
- `DOC` - Microsoft Word Document
- `DOCX` - Microsoft Word Open XML Document
- `XLS` - Microsoft Excel Spreadsheet
- `XLSX` - Microsoft Excel Open XML Spreadsheet
- `PPT` - Microsoft PowerPoint Presentation
- `PPTX` - Microsoft PowerPoint Open XML Presentation
- `TXT` - Plain Text File
- `RTF` - Rich Text Format
- `CSV` - Comma-Separated Values
- `ZIP` - Compressed Archive
- `RAR` - RAR Archive
- `OTHER` - Other file types

### DocumentStatus
- `DRAFT` - Document is in draft state
- `PUBLISHED` - Document is published and available
- `ARCHIVED` - Document is archived
- `EXPIRED` - Document has expired

### DocumentCategory
- `OFFICIAL` - Official documents
- `REPORT` - Reports and publications
- `FORM` - Forms and applications
- `POLICY` - Policies and procedures
- `PROCEDURE` - Standard operating procedures
- `GUIDELINE` - Guidelines and instructions
- `NOTICE` - Notices and announcements
- `CIRCULAR` - Circulars and memos
- `OTHER` - Other categories

## Usage Examples

### Upload a Document
```typescript
// Admin upload
const formData = new FormData();
formData.append('file', file);
formData.append('title', JSON.stringify({ en: 'Annual Report', ne: 'वार्षिक प्रतिवेदन' }));
formData.append('category', 'REPORT');
formData.append('status', 'PUBLISHED');

const response = await fetch('/admin/documents/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Search Documents
```typescript
// Public search
const response = await fetch('/documents/search?q=annual&category=REPORT&page=1&limit=10');
const documents = await response.json();
```

### Download Document
```typescript
// Public download with tracking
const response = await fetch(`/documents/${documentId}/download`);
const { downloadUrl } = await response.json();

// Redirect to download URL
window.location.href = downloadUrl;
```

### Get Document Analytics
```typescript
// Admin analytics
const response = await fetch(`/admin/documents/${documentId}/analytics`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const analytics = await response.json();
```

## Dependencies

- **NestJS:** Core framework
- **Prisma:** Database ORM
- **S3Service:** Cloud storage integration
- **class-validator:** Input validation
- **class-transformer:** Data transformation
- **@nestjs/swagger:** API documentation

## Configuration

The module requires the following configuration:

1. **Database Schema:** Ensure the Document, DocumentDownload, and DocumentVersion models are defined in Prisma schema
2. **S3 Configuration:** Configure S3 service for file storage
3. **File Upload Limits:** Configure maximum file size and allowed file types
4. **Authentication:** Ensure JWT authentication is properly configured

## TODO

- [ ] Implement CSV and PDF export functionality
- [ ] Add import functionality for bulk document upload
- [ ] Implement advanced analytics and reporting
- [ ] Add document preview functionality
- [ ] Create document approval workflow
- [ ] Add document expiration notifications
- [ ] Implement document access logs
- [ ] Add document watermarking
- [ ] Create document templates
- [ ] Implement document collaboration features 