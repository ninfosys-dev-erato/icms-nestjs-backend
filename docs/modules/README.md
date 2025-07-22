# Core Modules Documentation

## Overview

This section documents all core modules of the Government CMS Backend system. Each module is designed to be self-contained with its own controllers, services, repositories, and DTOs.

## Module Architecture

### Module Structure
Each module follows this standard structure:
```
modules/
├── module-name/
│   ├── controllers/
│   │   ├── public.controller.ts
│   │   └── admin.controller.ts
│   ├── services/
│   │   ├── module.service.ts
│   │   └── module.repository.ts
│   ├── dto/
│   │   ├── create.dto.ts
│   │   ├── update.dto.ts
│   │   └── query.dto.ts
│   ├── entities/
│   │   └── module.entity.ts
│   ├── guards/
│   │   └── module.guard.ts
│   ├── interceptors/
│   │   └── module.interceptor.ts
│   └── module.module.ts
```

### Common Patterns

#### 1. Repository Pattern
- **Abstract data access logic**
- **Database agnostic design**
- **Consistent interface across modules**

#### 2. Service Layer Pattern
- **Business logic encapsulation**
- **Transaction management**
- **Cross-cutting concerns**

#### 3. DTO Pattern
- **Input validation**
- **API contract definition**
- **Type safety**

#### 4. Guard Pattern
- **Authorization checks**
- **Role-based access control**
- **Resource ownership validation**

## Module List

### 1. [Office Settings Management](./office-settings/README.md)
**Purpose:** Manage office configuration and settings
**Key Features:**
- Office information management
- Contact details configuration
- Social media links
- Map integration
- Background photo management

**Controllers:**
- `OfficeSettingsController` (Public & Admin)

**Services:**
- `OfficeSettingsService`
- `OfficeSettingsRepository`

### 2. [Office Description System](./office-description/README.md)
**Purpose:** Manage different types of office descriptions
**Key Features:**
- Multi-type descriptions (Introduction, Objective, etc.)
- Rich content support
- SEO optimization
- Translation management

**Controllers:**
- `OfficeDescriptionController` (Public & Admin)

**Services:**
- `OfficeDescriptionService`
- `OfficeDescriptionRepository`

### 3. [Content Management System](./content-management/README.md)
**Purpose:** Comprehensive content management with categories
**Key Features:**
- Hierarchical categories
- Content creation and editing
- File attachments
- Publishing workflow
- Search and filtering

**Controllers:**
- `CategoryController` (Public & Admin)
- `ContentController` (Public & Admin)

**Services:**
- `CategoryService`
- `ContentService`
- `CategoryRepository`
- `ContentRepository`

### 4. [Important Links](./important-links/README.md)
**Purpose:** Manage footer and important links
**Key Features:**
- Link management
- Ordering and categorization
- Translation support

**Controllers:**
- `ImportantLinkController` (Public & Admin)

**Services:**
- `ImportantLinkService`
- `ImportantLinkRepository`

### 5. [FAQ System](./faq/README.md)
**Purpose:** Manage frequently asked questions
**Key Features:**
- FAQ creation and management
- Translation support
- Search functionality
- Ordering system

**Controllers:**
- `FAQController` (Public & Admin)

**Services:**
- `FAQService`
- `FAQRepository`

### 6. [Media Management](./media/README.md)
**Purpose:** Comprehensive media file management
**Key Features:**
- Multi-media type support
- Album and gallery management
- S3 integration
- Image processing
- File validation

**Controllers:**
- `MediaController` (Public & Admin)
- `MediaAlbumController` (Public & Admin)

**Services:**
- `MediaService`
- `MediaAlbumService`
- `MediaRepository`
- `MediaAlbumRepository`
- `S3Service`

### 7. [Document Management](./documents/README.md)
**Purpose:** Advanced document library system
**Key Features:**
- Document categorization
- Advanced search
- File management
- Version control
- Download tracking

**Controllers:**
- `DocumentController` (Public & Admin)

**Services:**
- `DocumentService`
- `DocumentRepository`

### 8. [Slider/Banner System](./slider/README.md)
**Purpose:** Manage website sliders and banners
**Key Features:**
- Banner management
- Display configuration
- Media integration
- Timing control

**Controllers:**
- `SliderController` (Public & Admin)

**Services:**
- `SliderService`
- `SliderRepository`

### 9. [Human Resources Management](./hr/README.md)
**Purpose:** Manage departments and employees
**Key Features:**
- Department hierarchy
- Employee information
- Organizational structure
- Contact management

**Controllers:**
- `DepartmentController` (Public & Admin)
- `EmployeeController` (Public & Admin)

**Services:**
- `DepartmentService`
- `EmployeeService`
- `DepartmentRepository`
- `EmployeeRepository`

### 10. [Menu & Navigation System](./navigation/README.md)
**Purpose:** Manage website navigation and menus
**Key Features:**
- Hierarchical menu structure
- Dynamic navigation
- Accessibility features
- Menu ordering

**Controllers:**
- `MenuController` (Public & Admin)

**Services:**
- `MenuService`
- `MenuRepository`

### 11. [Header Configuration](./header/README.md)
**Purpose:** Manage website header customization
**Key Features:**
- Header customization
- Logo management
- Typography settings
- Layout configuration

**Controllers:**
- `HeaderConfigController` (Public & Admin)

**Services:**
- `HeaderConfigService`
- `HeaderConfigRepository`

## Shared Modules

### 1. [Authentication Module](./auth/README.md)
**Purpose:** Handle user authentication and authorization
**Key Features:**
- JWT authentication
- Role-based access control
- Password management
- Session management

### 2. [Translation Module](./translation/README.md)
**Purpose:** Manage global translations
**Key Features:**
- Translation management
- Language detection
- Fallback mechanisms
- Translation caching

### 3. [User Management Module](./users/README.md)
**Purpose:** Manage system users
**Key Features:**
- User CRUD operations
- Role management
- Profile management
- User activity tracking

### 4. [Search Module](./search/README.md)
**Purpose:** Global search functionality
**Key Features:**
- Full-text search
- Multi-content type search
- Search result ranking
- Search analytics

## Module Dependencies

### Core Dependencies
```
┌─────────────────────────────────────┐
│         Module Dependencies         │
│                                     │
│  ┌─────────────┬─────────────────┐  │
│  │   Shared    │   Core          │  │
│  │  Modules    │   Modules       │  │
│  └─────────────┴─────────────────┘  │
│                                     │
│  ┌─────────────┬─────────────────┐  │
│  │   Feature   │   Feature       │  │
│  │  Modules    │   Modules       │  │
│  └─────────────┴─────────────────┘  │
└─────────────────────────────────────┘
```

### Dependency Graph
- **Authentication** → **All Modules**
- **Translation** → **All Modules**
- **Media** → **Content, Slider, Header**
- **Content** → **Category, Media**
- **HR** → **Department, Employee**
- **Navigation** → **Menu**

## Module Communication

### 1. Direct Dependencies
- **Import/Export** between modules
- **Service injection**
- **Event emission/listening**

### 2. Event-Driven Communication
- **Content updates** → **Search index updates**
- **Media uploads** → **Cache invalidation**
- **User actions** → **Activity logging**

### 3. Shared Services
- **S3Service** → **Media, Document modules**
- **TranslationService** → **All modules**
- **CacheService** → **All modules**

## Testing Strategy

### 1. Unit Testing
- **Individual service testing**
- **Repository testing**
- **DTO validation testing**

### 2. Integration Testing
- **Module integration testing**
- **Database integration testing**
- **External service testing**

### 3. E2E Testing
- **Complete workflow testing**
- **API endpoint testing**
- **User scenario testing**

## Performance Considerations

### 1. Caching Strategy
- **Module-level caching**
- **Shared cache service**
- **Cache invalidation patterns**

### 2. Database Optimization
- **Module-specific indexes**
- **Query optimization**
- **Connection pooling**

### 3. Lazy Loading
- **Module lazy loading**
- **Service lazy initialization**
- **Resource lazy loading**

## Security Considerations

### 1. Module-Level Security
- **Input validation**
- **Output sanitization**
- **Access control**

### 2. Cross-Module Security
- **Service authentication**
- **Data isolation**
- **Permission propagation**

### 3. Audit Trail
- **Module activity logging**
- **User action tracking**
- **Security event monitoring**

## Deployment Considerations

### 1. Module Packaging
- **Independent deployment**
- **Version management**
- **Dependency resolution**

### 2. Environment Configuration
- **Module-specific configs**
- **Environment variables**
- **Feature flags**

### 3. Monitoring
- **Module health checks**
- **Performance metrics**
- **Error tracking** 