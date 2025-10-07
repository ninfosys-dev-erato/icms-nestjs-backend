# Database Schema Documentation

## Overview

This document defines the complete database schema for the Government CMS Backend using Prisma ORM with PostgreSQL. The schema is designed to support bilingual content, hierarchical structures, and scalable content management.

## Database Design Principles

### 1. Normalization
- **Third Normal Form (3NF)** compliance
- **Minimal data redundancy**
- **Referential integrity**
- **Consistent naming conventions**

### 2. Internationalization Support
- **Translatable entity pattern**
- **Language-specific content storage**
- **Locale-aware queries**
- **Fallback mechanisms**

### 3. Audit Trail
- **Created/Updated timestamps**
- **Soft delete support**
- **User tracking**
- **Change history**

## Core Schema Definitions

### 1. User Management

#### User Table
```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  firstName   String
  lastName    String
  role        UserRole @default(VIEWER)
  isActive    Boolean  @default(true)
  lastLoginAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  createdContents Content[] @relation("CreatedBy")
  updatedContents Content[] @relation("UpdatedBy")
  departmentHead  Department[] @relation("DepartmentHead")
  
  @@map("users")
}
```

**Field Descriptions:**
- `id`: Unique identifier using CUID
- `email`: User's email address (unique)
- `password`: Hashed password
- `firstName`: User's first name
- `lastName`: User's last name
- `role`: User role (ADMIN, EDITOR, VIEWER)
- `isActive`: Account status
- `lastLoginAt`: Last login timestamp
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

#### UserRole Enum
```prisma
enum UserRole {
  ADMIN
  EDITOR
  VIEWER
}
```

### 2. Translation System

#### GlobalTranslation Table
```prisma
model GlobalTranslation {
  id        String @id @default(cuid())
  key       String @unique
  enValue   String
  neValue   String
  groupName String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("global_translations")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `key`: Translation key identifier
- `enValue`: English translation
- `neValue`: Nepali translation
- `groupName`: Translation category/group
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### 3. Office Settings Management

#### OfficeSettings Table
```prisma
model OfficeSettings {
  id            String @id @default(cuid())
  directorate   Json   // Translatable entity
  officeName    Json   // Translatable entity
  officeAddress Json   // Translatable entity
  backgroundPhoto String? // S3 path
  email         String
  phoneNumber   Json   // Translatable entity
  xLink         String?
  mapIframe     String? // HTML string
  website       String?
  youtube       String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("office_settings")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `directorate`: Translatable directorate name
- `officeName`: Translatable office name
- `officeAddress`: Translatable office address
- `backgroundPhoto`: S3 path to background image
- `email`: Office email address
- `phoneNumber`: Translatable phone number
- `xLink`: X (Twitter) profile URL
- `mapIframe`: Embedded map HTML
- `website`: Office website URL
- `youtube`: YouTube channel URL

### 4. Office Description System

#### OfficeDescription Table
```prisma
model OfficeDescription {
  id                    String                @id @default(cuid())
  officeDescriptionType OfficeDescriptionType
  content               Json                  // Translatable entity
  createdAt             DateTime              @default(now())
  updatedAt             DateTime              @updatedAt
  
  @@map("office_descriptions")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `officeDescriptionType`: Type of description
- `content`: Translatable content
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

#### OfficeDescriptionType Enum
```prisma
enum OfficeDescriptionType {
  INTRODUCTION
  OBJECTIVE
  WORK_DETAILS
  ORGANIZATIONAL_STRUCTURE
  DIGITAL_CHARTER
  EMPLOYEE_SANCTIONS
}
```

### 5. Content Management System

#### Category Table
```prisma
model Category {
  id          String   @id @default(cuid())
  name        Json     // Translatable entity
  description Json?    // Translatable entity
  slug        String   @unique
  parentId    String?
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  contents    Content[]
  
  @@map("categories")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `name`: Translatable category name
- `description`: Translatable category description
- `slug`: URL-friendly identifier
- `parentId`: Parent category reference
- `order`: Display order
- `isActive`: Category status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

#### Content Table
```prisma
model Content {
  id          String   @id @default(cuid())
  title       Json     // Translatable entity
  content     Json     // Translatable entity
  excerpt     Json?    // Translatable entity
  slug        String   @unique
  categoryId  String
  status      ContentStatus @default(DRAFT)
  publishedAt DateTime?
  featured    Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  category    Category @relation(fields: [categoryId], references: [id])
  attachments ContentAttachment[]
  createdBy   User     @relation("CreatedBy", fields: [createdById], references: [id])
  updatedBy   User     @relation("UpdatedBy", fields: [updatedById], references: [id])
  
  @@map("contents")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `title`: Translatable content title
- `content`: Translatable content body
- `excerpt`: Translatable content excerpt
- `slug`: URL-friendly identifier
- `categoryId`: Category reference
- `status`: Content status (DRAFT, PUBLISHED, ARCHIVED)
- `publishedAt`: Publication timestamp
- `featured`: Featured content flag
- `order`: Display order
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

#### ContentStatus Enum
```prisma
enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

#### ContentAttachment Table
```prisma
model ContentAttachment {
  id        String @id @default(cuid())
  contentId String
  fileName  String
  filePath  String // S3 path
  fileSize  Int
  mimeType  String
  order     Int    @default(0)
  createdAt DateTime @default(now())
  
  // Relations
  content   Content @relation(fields: [contentId], references: [id], onDelete: Cascade)
  
  @@map("content_attachments")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `contentId`: Content reference
- `fileName`: Original file name
- `filePath`: S3 storage path
- `fileSize`: File size in bytes
- `mimeType`: MIME type
- `order`: Display order
- `createdAt`: Creation timestamp

### 6. Important Links

#### ImportantLink Table
```prisma
model ImportantLink {
  id        String @id @default(cuid())
  linkTitle Json   // Translatable entity
  linkUrl   String
  order     Int    @default(0)
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("important_links")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `linkTitle`: Translatable link title
- `linkUrl`: Link URL
- `order`: Display order
- `isActive`: Link status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### 7. FAQ System

#### FAQ Table
```prisma
model FAQ {
  id        String @id @default(cuid())
  question  Json   // Translatable entity
  answer    Json   // Translatable entity
  order     Int    @default(0)
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("faqs")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `question`: Translatable question
- `answer`: Translatable answer
- `order`: Display order
- `isActive`: FAQ status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### 8. Media Management

#### Media Table
```prisma
model Media {
  id          String      @id @default(cuid())
  fileName    String
  originalName String
  filePath    String      // S3 path
  fileSize    Int
  mimeType    String
  mediaType   MediaType
  altText     Json?       // Translatable entity
  caption     Json?       // Translatable entity
  width       Int?
  height      Int?
  duration    Int?        // For video/audio in seconds
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  albums      MediaAlbum[]
  sliders     Slider[]
  
  @@map("media")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `fileName`: Generated file name
- `originalName`: Original file name
- `filePath`: S3 storage path
- `fileSize`: File size in bytes
- `mimeType`: MIME type
- `mediaType`: Type of media (IMAGE, VIDEO, AUDIO, DOCUMENT)
- `altText`: Translatable alt text
- `caption`: Translatable caption
- `width`: Image/video width
- `height`: Image/video height
- `duration`: Media duration in seconds
- `isActive`: Media status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

#### MediaType Enum
```prisma
enum MediaType {
  IMAGE
  VIDEO
  AUDIO
  DOCUMENT
}
```

#### MediaAlbum Table
```prisma
model MediaAlbum {
  id          String @id @default(cuid())
  name        Json   // Translatable entity
  description Json?  // Translatable entity
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  media       Media[]
  
  @@map("media_albums")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `name`: Translatable album name
- `description`: Translatable album description
- `isActive`: Album status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### 9. Slider/Banner System

#### Slider Table
```prisma
model Slider {
  id             String @id @default(cuid())
  position       Int    @default(0)
  displayTime    Int    @default(5000) // milliseconds
  title          Json?  // Translatable entity
  mediaId        String
  isActive       Boolean @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  media          Media @relation(fields: [mediaId], references: [id])
  
  @@map("sliders")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `position`: Display order
- `displayTime`: Display duration in milliseconds
- `title`: Translatable slider title
- `mediaId`: Media reference
- `isActive`: Slider status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### 10. Human Resources Management

#### Department Table
```prisma
model Department {
  id             String @id @default(cuid())
  departmentName Json   // Translatable entity
  parentId       String?
  departmentHeadId String?
  order          Int    @default(0)
  isActive       Boolean @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  parent         Department? @relation("DepartmentHierarchy", fields: [parentId], references: [id])
  children       Department[] @relation("DepartmentHierarchy")
  employees      Employee[]
  departmentHead User? @relation("DepartmentHead", fields: [departmentHeadId], references: [id])
  
  @@map("departments")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `departmentName`: Translatable department name
- `parentId`: Parent department reference
- `departmentHeadId`: Department head user reference
- `order`: Display order
- `isActive`: Department status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

#### Employee Table
```prisma
model Employee {
  id           String @id @default(cuid())
  name         Json   // Translatable entity
  departmentId String
  position     Json   // Translatable entity
  order        Int    @default(0)
  mobileNumber String?
  telephone    String?
  email        String?
  roomNumber   String?
  isActive     Boolean @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relations
  department   Department @relation(fields: [departmentId], references: [id])
  
  @@map("employees")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `name`: Translatable employee name
- `departmentId`: Department reference
- `position`: Translatable job position
- `order`: Display order
- `mobileNumber`: Mobile phone number
- `telephone`: Office phone number
- `email`: Email address
- `roomNumber`: Office room number
- `isActive`: Employee status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### 11. Menu & Navigation System

#### Menu Table
```prisma
model Menu {
  id          String @id @default(cuid())
  name        Json   // Translatable entity
  parentId    String?
  url         String?
  order       Int    @default(0)
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  parent      Menu?  @relation("MenuHierarchy", fields: [parentId], references: [id])
  children    Menu[] @relation("MenuHierarchy")
  
  @@map("menus")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `name`: Translatable menu name
- `parentId`: Parent menu reference
- `url`: Menu URL
- `order`: Display order
- `isActive`: Menu status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

### 12. Header Configuration

#### HeaderConfig Table
```prisma
model HeaderConfig {
  id        String @id @default(cuid())
  name      Json   // Translatable entity
  order     Int    @default(0)
  fontSize  String @default("16px")
  color     String @default("#000000")
  alignment String @default("left") // left, center, right
  logoLeft  String? // S3 path
  logoRight String? // S3 path
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("header_configs")
}
```

**Field Descriptions:**
- `id`: Unique identifier
- `name`: Translatable header name
- `order`: Display order
- `fontSize`: Font size
- `color`: Text color
- `alignment`: Text alignment
- `logoLeft`: Left logo S3 path
- `logoRight`: Right logo S3 path
- `isActive`: Configuration status
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

## Indexes and Performance

### Primary Indexes
```sql
-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Content indexes
CREATE INDEX idx_contents_category_id ON contents(category_id);
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_published_at ON contents(published_at);
CREATE INDEX idx_contents_slug ON contents(slug);

-- Category indexes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Media indexes
CREATE INDEX idx_media_media_type ON media(media_type);
CREATE INDEX idx_media_created_at ON media(created_at);

-- Employee indexes
CREATE INDEX idx_employees_department_id ON employees(department_id);
```

### Composite Indexes
```sql
-- Content search optimization
CREATE INDEX idx_contents_search ON contents(status, published_at, category_id);

-- Category hierarchy optimization
CREATE INDEX idx_categories_hierarchy ON categories(parent_id, order, is_active);

-- Media album optimization
CREATE INDEX idx_media_album ON media(media_type, is_active, created_at);
```

## Migration Strategy

### 1. Initial Migration
```bash
# Generate initial migration
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate deploy
```

### 2. Schema Evolution
- **Backward compatible changes**
- **Data migration scripts**
- **Rollback strategies**
- **Version control integration**

### 3. Environment Management
- **Development schema**
- **Staging schema**
- **Production schema**
- **Schema validation**

## Data Seeding

### 1. Initial Data
- **Default users (admin)**
- **System translations**
- **Default categories**
- **Sample content**

### 2. Seed Scripts
```typescript
// Example seed script structure
async function seed() {
  // Create admin user
  // Create default translations
  // Create initial categories
  // Create sample content
}
```

## Backup and Recovery

### 1. Backup Strategy
- **Daily automated backups**
- **Point-in-time recovery**
- **Cross-region replication**
- **Backup validation**

### 2. Recovery Procedures
- **Database restoration**
- **Data integrity checks**
- **Service recovery**
- **Rollback procedures** 