# Menu & Navigation System Module

## Overview

The Menu & Navigation System module manages website navigation and menus with hierarchical structure, dynamic content, accessibility features, and menu ordering. This module provides a flexible solution for creating and managing website navigation that adapts to different content types and user roles.

## Module Purpose

- **Menu Management:** Create, edit, and organize navigation menus
- **Hierarchical Structure:** Support for nested menu items and sub-menus
- **Dynamic Navigation:** Menu items that adapt to content and user roles
- **Accessibility Features:** WCAG compliant navigation with proper ARIA labels
- **Menu Ordering:** Customizable display order and organization
- **Multi-Language Support:** Bilingual menu items and navigation

## Database Schema

### Menu Entity
```typescript
interface Menu {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  location: MenuLocation;
  isActive: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  menuItems: MenuItem[];
  createdBy: User;
  updatedBy: User;
}

enum MenuLocation {
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
  SIDEBAR = 'SIDEBAR',
  MOBILE = 'MOBILE',
  CUSTOM = 'CUSTOM'
}

interface TranslatableEntity {
  en: string;
  ne: string;
}
```

### MenuItem Entity
```typescript
interface MenuItem {
  id: string;
  menuId: string;
  parentId?: string;
  title: TranslatableEntity;
  description?: TranslatableEntity;
  url?: string;
  target: 'self' | '_blank' | '_parent' | '_top';
  icon?: string;
  order: number;
  isActive: boolean;
  isPublished: boolean;
  itemType: MenuItemType;
  itemId?: string; // Reference to content, page, etc.
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  menu: Menu;
  parent: MenuItem;
  children: MenuItem[];
  createdBy: User;
  updatedBy: User;
}

enum MenuItemType {
  LINK = 'LINK',
  CONTENT = 'CONTENT',
  PAGE = 'PAGE',
  CATEGORY = 'CATEGORY',
  CUSTOM = 'CUSTOM'
}
```

## DTOs (Data Transfer Objects)

### Menu DTOs

#### CreateMenuDto
```typescript
interface CreateMenuDto {
  name: TranslatableEntity;
  description?: TranslatableEntity;
  location: MenuLocation;
  isActive?: boolean;
  isPublished?: boolean;
}
```

#### UpdateMenuDto
```typescript
interface UpdateMenuDto {
  name?: TranslatableEntity;
  description?: TranslatableEntity;
  location?: MenuLocation;
  isActive?: boolean;
  isPublished?: boolean;
}
```

#### MenuResponseDto
```typescript
interface MenuResponseDto {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  location: MenuLocation;
  isActive: boolean;
  isPublished: boolean;
  menuItemCount: number;
  menuItems: MenuItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserResponseDto;
  updatedBy: UserResponseDto;
}
```

### MenuItem DTOs

#### CreateMenuItemDto
```typescript
interface CreateMenuItemDto {
  menuId: string;
  parentId?: string;
  title: TranslatableEntity;
  description?: TranslatableEntity;
  url?: string;
  target?: 'self' | '_blank' | '_parent' | '_top';
  icon?: string;
  order?: number;
  isActive?: boolean;
  isPublished?: boolean;
  itemType: MenuItemType;
  itemId?: string;
}
```

#### UpdateMenuItemDto
```typescript
interface UpdateMenuItemDto {
  parentId?: string;
  title?: TranslatableEntity;
  description?: TranslatableEntity;
  url?: string;
  target?: 'self' | '_blank' | '_parent' | '_top';
  icon?: string;
  order?: number;
  isActive?: boolean;
  isPublished?: boolean;
  itemType?: MenuItemType;
  itemId?: string;
}
```

#### MenuItemResponseDto
```typescript
interface MenuItemResponseDto {
  id: string;
  menuId: string;
  parentId?: string;
  title: TranslatableEntity;
  description?: TranslatableEntity;
  url?: string;
  target: 'self' | '_blank' | '_parent' | '_top';
  icon?: string;
  order: number;
  isActive: boolean;
  isPublished: boolean;
  itemType: MenuItemType;
  itemId?: string;
  children: MenuItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserResponseDto;
  updatedBy: UserResponseDto;
}
```

### Query DTOs

#### MenuQueryDto
```typescript
interface MenuQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  location?: MenuLocation;
  isActive?: boolean;
  isPublished?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

#### MenuItemQueryDto
```typescript
interface MenuItemQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  menuId?: string;
  parentId?: string;
  itemType?: MenuItemType;
  isActive?: boolean;
  isPublished?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

## Repository Interfaces

### MenuRepository
```typescript
interface MenuRepository {
  // Find menu by ID
  findById(id: string): Promise<Menu | null>;
  
  // Find all menus with pagination and filters
  findAll(query: MenuQueryDto): Promise<PaginatedMenuResult>;
  
  // Find active menus
  findActive(query: MenuQueryDto): Promise<PaginatedMenuResult>;
  
  // Find published menus
  findPublished(query: MenuQueryDto): Promise<PaginatedMenuResult>;
  
  // Find menu by location
  findByLocation(location: MenuLocation): Promise<Menu | null>;
  
  // Search menus
  search(searchTerm: string, query: MenuQueryDto): Promise<PaginatedMenuResult>;
  
  // Create menu
  create(data: CreateMenuDto, userId: string): Promise<Menu>;
  
  // Update menu
  update(id: string, data: UpdateMenuDto, userId: string): Promise<Menu>;
  
  // Delete menu
  delete(id: string): Promise<void>;
  
  // Publish menu
  publish(id: string, userId: string): Promise<Menu>;
  
  // Unpublish menu
  unpublish(id: string, userId: string): Promise<Menu>;
  
  // Get menu with items
  findWithItems(id: string): Promise<MenuWithItems>;
  
  // Get menu statistics
  getStatistics(): Promise<MenuStatistics>;
  
  // Get menu tree
  getMenuTree(id: string): Promise<MenuTree>;
}

interface PaginatedMenuResult {
  data: Menu[];
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

interface MenuWithItems extends Menu {
  menuItems: MenuItem[];
}

interface MenuStatistics {
  total: number;
  active: number;
  published: number;
  byLocation: Record<MenuLocation, number>;
  averageItemsPerMenu: number;
}

interface MenuTree {
  menu: Menu;
  items: MenuItemTree[];
}

interface MenuItemTree extends MenuItem {
  children: MenuItemTree[];
}
```

### MenuItemRepository
```typescript
interface MenuItemRepository {
  // Find menu item by ID
  findById(id: string): Promise<MenuItem | null>;
  
  // Find all menu items with pagination and filters
  findAll(query: MenuItemQueryDto): Promise<PaginatedMenuItemResult>;
  
  // Find active menu items
  findActive(query: MenuItemQueryDto): Promise<PaginatedMenuItemResult>;
  
  // Find menu items by menu
  findByMenu(menuId: string, query: MenuItemQueryDto): Promise<PaginatedMenuItemResult>;
  
  // Find menu items by parent
  findByParent(parentId?: string): Promise<MenuItem[]>;
  
  // Find menu items by type
  findByType(itemType: MenuItemType, query: MenuItemQueryDto): Promise<PaginatedMenuItemResult>;
  
  // Search menu items
  search(searchTerm: string, query: MenuItemQueryDto): Promise<PaginatedMenuItemResult>;
  
  // Create menu item
  create(data: CreateMenuItemDto, userId: string): Promise<MenuItem>;
  
  // Update menu item
  update(id: string, data: UpdateMenuItemDto, userId: string): Promise<MenuItem>;
  
  // Delete menu item
  delete(id: string): Promise<void>;
  
  // Reorder menu items
  reorder(orders: { id: string; order: number }[]): Promise<void>;
  
  // Get menu item tree
  getMenuItemTree(menuId: string): Promise<MenuItemTree[]>;
  
  // Get menu item statistics
  getStatistics(): Promise<MenuItemStatistics>;
  
  // Find menu items by item reference
  findByItemReference(itemType: MenuItemType, itemId: string): Promise<MenuItem[]>;
  
  // Get breadcrumb for item
  getBreadcrumb(itemId: string): Promise<MenuItem[]>;
}

interface PaginatedMenuItemResult {
  data: MenuItem[];
  pagination: PaginationInfo;
}

interface MenuItemTree extends MenuItem {
  children: MenuItemTree[];
}

interface MenuItemStatistics {
  total: number;
  active: number;
  byType: Record<MenuItemType, number>;
  byMenu: Record<string, number>;
  averageDepth: number;
}
```

## Service Interfaces

### MenuService
```typescript
interface MenuService {
  // Get menu by ID
  getMenuById(id: string): Promise<MenuResponseDto>;
  
  // Get all menus with pagination
  getAllMenus(query: MenuQueryDto): Promise<PaginatedMenuResponse>;
  
  // Get active menus
  getActiveMenus(query: MenuQueryDto): Promise<PaginatedMenuResponse>;
  
  // Get published menus
  getPublishedMenus(query: MenuQueryDto): Promise<PaginatedMenuResponse>;
  
  // Get menu by location
  getMenuByLocation(location: MenuLocation): Promise<MenuResponseDto>;
  
  // Search menus
  searchMenus(searchTerm: string, query: MenuQueryDto): Promise<PaginatedMenuResponse>;
  
  // Create menu
  createMenu(data: CreateMenuDto, userId: string): Promise<MenuResponseDto>;
  
  // Update menu
  updateMenu(id: string, data: UpdateMenuDto, userId: string): Promise<MenuResponseDto>;
  
  // Delete menu
  deleteMenu(id: string): Promise<void>;
  
  // Publish menu
  publishMenu(id: string, userId: string): Promise<MenuResponseDto>;
  
  // Unpublish menu
  unpublishMenu(id: string, userId: string): Promise<MenuResponseDto>;
  
  // Validate menu data
  validateMenu(data: CreateMenuDto | UpdateMenuDto): Promise<ValidationResult>;
  
  // Get menu statistics
  getMenuStatistics(): Promise<MenuStatistics>;
  
  // Get menu tree
  getMenuTree(id: string): Promise<MenuTreeResponse>;
  
  // Export menus
  exportMenus(query: MenuQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Import menus
  importMenus(file: Express.Multer.File, userId: string): Promise<ImportResult>;
  
  // Bulk operations
  bulkPublish(ids: string[], userId: string): Promise<BulkOperationResult>;
  bulkUnpublish(ids: string[], userId: string): Promise<BulkOperationResult>;
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;
}

interface PaginatedMenuResponse {
  data: MenuResponseDto[];
  pagination: PaginationInfo;
}

interface MenuTreeResponse {
  menu: MenuResponseDto;
  items: MenuItemTreeResponse[];
}

interface MenuItemTreeResponse extends MenuItemResponseDto {
  children: MenuItemTreeResponse[];
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

interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}
```

### MenuItemService
```typescript
interface MenuItemService {
  // Get menu item by ID
  getMenuItemById(id: string): Promise<MenuItemResponseDto>;
  
  // Get all menu items with pagination
  getAllMenuItems(query: MenuItemQueryDto): Promise<PaginatedMenuItemResponse>;
  
  // Get active menu items
  getActiveMenuItems(query: MenuItemQueryDto): Promise<PaginatedMenuItemResponse>;
  
  // Get menu items by menu
  getMenuItemsByMenu(menuId: string, query: MenuItemQueryDto): Promise<PaginatedMenuItemResponse>;
  
  // Get menu items by parent
  getMenuItemsByParent(parentId?: string): Promise<MenuItemResponseDto[]>;
  
  // Get menu items by type
  getMenuItemsByType(itemType: MenuItemType, query: MenuItemQueryDto): Promise<PaginatedMenuItemResponse>;
  
  // Search menu items
  searchMenuItems(searchTerm: string, query: MenuItemQueryDto): Promise<PaginatedMenuItemResponse>;
  
  // Create menu item
  createMenuItem(data: CreateMenuItemDto, userId: string): Promise<MenuItemResponseDto>;
  
  // Update menu item
  updateMenuItem(id: string, data: UpdateMenuItemDto, userId: string): Promise<MenuItemResponseDto>;
  
  // Delete menu item
  deleteMenuItem(id: string): Promise<void>;
  
  // Reorder menu items
  reorderMenuItems(orders: { id: string; order: number }[]): Promise<void>;
  
  // Validate menu item data
  validateMenuItem(data: CreateMenuItemDto | UpdateMenuItemDto): Promise<ValidationResult>;
  
  // Get menu item statistics
  getMenuItemStatistics(): Promise<MenuItemStatistics>;
  
  // Get menu item tree
  getMenuItemTree(menuId: string): Promise<MenuItemTreeResponse[]>;
  
  // Get breadcrumb for item
  getBreadcrumb(itemId: string): Promise<MenuItemResponseDto[]>;
  
  // Export menu items
  exportMenuItems(query: MenuItemQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Import menu items
  importMenuItems(file: Express.Multer.File, userId: string): Promise<ImportResult>;
  
  // Bulk operations
  bulkActivate(ids: string[]): Promise<BulkOperationResult>;
  bulkDeactivate(ids: string[]): Promise<BulkOperationResult>;
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;
}

interface PaginatedMenuItemResponse {
  data: MenuItemResponseDto[];
  pagination: PaginationInfo;
}
```

## Controller Interfaces

### PublicNavigationController
```typescript
interface PublicNavigationController {
  // Get all published menus
  getAllMenus(
    @Query() query: MenuQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get menu by ID
  getMenuById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get menu by location
  getMenuByLocation(
    @Param('location') location: MenuLocation,
    @Res() response: Response
  ): Promise<void>;
  
  // Get menu tree
  getMenuTree(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get all published menu items
  getAllMenuItems(
    @Query() query: MenuItemQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get menu item by ID
  getMenuItemById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get menu items by menu
  getMenuItemsByMenu(
    @Param('menuId') menuId: string,
    @Query() query: MenuItemQueryDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Get breadcrumb for item
  getBreadcrumb(
    @Param('itemId') itemId: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Search menu items
  searchMenuItems(
    @Query('q') searchTerm: string,
    @Query() query: MenuItemQueryDto,
    @Res() response: Response
  ): Promise<void>;
}
```

### AdminNavigationController
```typescript
interface AdminNavigationController {
  // Get menu by ID (admin)
  getMenuById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create menu
  createMenu(
    @Body() data: CreateMenuDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update menu
  updateMenu(
    @Param('id') id: string,
    @Body() data: UpdateMenuDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete menu
  deleteMenu(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Publish menu
  publishMenu(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Unpublish menu
  unpublishMenu(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Get menu statistics
  getMenuStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Export menus
  exportMenus(
    @Query() query: MenuQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
    @Res() response: Response
  ): Promise<void>;
  
  // Import menus
  importMenus(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
  
  // Get menu item by ID (admin)
  getMenuItemById(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Create menu item
  createMenuItem(
    @Body() data: CreateMenuItemDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Update menu item
  updateMenuItem(
    @Param('id') id: string,
    @Body() data: UpdateMenuItemDto,
    @Res() response: Response
  ): Promise<void>;
  
  // Delete menu item
  deleteMenuItem(
    @Param('id') id: string,
    @Res() response: Response
  ): Promise<void>;
  
  // Reorder menu items
  reorderMenuItems(
    @Body() orders: { id: string; order: number }[],
    @Res() response: Response
  ): Promise<void>;
  
  // Get menu item statistics
  getMenuItemStatistics(
    @Res() response: Response
  ): Promise<void>;
  
  // Export menu items
  exportMenuItems(
    @Query() query: MenuItemQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf',
    @Res() response: Response
  ): Promise<void>;
  
  // Import menu items
  importMenuItems(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response
  ): Promise<void>;
  
  // Bulk operations
  bulkPublishMenus(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
  
  bulkUnpublishMenus(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
  
  bulkDeleteMenus(
    @Body() ids: string[],
    @Res() response: Response
  ): Promise<void>;
}
```

## API Endpoints

### Public Navigation Endpoints

#### GET /api/v1/menus
**Description:** Get all published menus
**Access:** Public

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search term
- `location`: Menu location filter
- `isActive`: Active status filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "menu_id",
      "name": {
        "en": "Main Navigation",
        "ne": "मुख्य नेविगेशन"
      },
      "description": {
        "en": "Primary navigation menu",
        "ne": "प्राथमिक नेविगेशन मेनु"
      },
      "location": "HEADER",
      "isActive": true,
      "isPublished": true,
      "menuItemCount": 8,
      "menuItems": [
        {
          "id": "item_id",
          "title": {
            "en": "Home",
            "ne": "गृह"
          },
          "url": "/",
          "target": "self",
          "order": 1,
          "isActive": true,
          "isPublished": true,
          "itemType": "LINK",
          "children": []
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

#### GET /api/v1/menus/{id}
**Description:** Get menu by ID
**Access:** Public

#### GET /api/v1/menus/location/{location}
**Description:** Get menu by location
**Access:** Public

#### GET /api/v1/menus/{id}/tree
**Description:** Get menu tree
**Access:** Public

#### GET /api/v1/menu-items
**Description:** Get all published menu items
**Access:** Public

#### GET /api/v1/menu-items/{id}
**Description:** Get menu item by ID
**Access:** Public

#### GET /api/v1/menu-items/menu/{menuId}
**Description:** Get menu items by menu
**Access:** Public

#### GET /api/v1/menu-items/{itemId}/breadcrumb
**Description:** Get breadcrumb for item
**Access:** Public

#### GET /api/v1/menu-items/search
**Description:** Search menu items
**Access:** Public

### Admin Navigation Endpoints

#### POST /api/v1/admin/menus
**Description:** Create menu
**Access:** Admin, Editor

**Request Body:**
```json
{
  "name": {
    "en": "Main Navigation",
    "ne": "मुख्य नेविगेशन"
  },
  "description": {
    "en": "Primary navigation menu",
    "ne": "प्राथमिक नेविगेशन मेनु"
  },
  "location": "HEADER",
  "isActive": true,
  "isPublished": true
}
```

#### PUT /api/v1/admin/menus/{id}
**Description:** Update menu
**Access:** Admin, Editor

#### DELETE /api/v1/admin/menus/{id}
**Description:** Delete menu
**Access:** Admin only

#### POST /api/v1/admin/menus/{id}/publish
**Description:** Publish menu
**Access:** Admin, Editor

#### POST /api/v1/admin/menus/{id}/unpublish
**Description:** Unpublish menu
**Access:** Admin, Editor

#### GET /api/v1/admin/menus/statistics
**Description:** Get menu statistics
**Access:** Admin, Editor

#### GET /api/v1/admin/menus/export
**Description:** Export menus
**Access:** Admin, Editor

#### POST /api/v1/admin/menus/import
**Description:** Import menus
**Access:** Admin only

#### POST /api/v1/admin/menu-items
**Description:** Create menu item
**Access:** Admin, Editor

#### PUT /api/v1/admin/menu-items/{id}
**Description:** Update menu item
**Access:** Admin, Editor

#### DELETE /api/v1/admin/menu-items/{id}
**Description:** Delete menu item
**Access:** Admin only

#### PUT /api/v1/admin/menu-items/reorder
**Description:** Reorder menu items
**Access:** Admin, Editor

#### GET /api/v1/admin/menu-items/statistics
**Description:** Get menu item statistics
**Access:** Admin, Editor

#### GET /api/v1/admin/menu-items/export
**Description:** Export menu items
**Access:** Admin, Editor

#### POST /api/v1/admin/menu-items/import
**Description:** Import menu items
**Access:** Admin only

## Business Logic

### 1. Menu Management
- **Menu creation** with location-based organization
- **Hierarchical structure** support for complex navigation
- **Publishing workflow** for content control
- **Multi-language support** for internationalization

### 2. Menu Item Management
- **Dynamic menu items** that reference content
- **Parent-child relationships** for nested navigation
- **Ordering system** for display priority
- **Type-based organization** for different content types

### 3. Navigation Logic
- **Tree-based navigation** generation
- **Breadcrumb generation** for user orientation
- **Active state management** for current page
- **Accessibility compliance** with ARIA labels

### 4. Content Integration
- **Dynamic content linking** to CMS content
- **Category-based navigation** for content organization
- **Page-based navigation** for static pages
- **Custom link support** for external resources

## Error Handling

### Menu Creation Errors
```json
{
  "success": false,
  "error": {
    "code": "MENU_CREATION_ERROR",
    "message": "Menu creation failed",
    "details": [
      {
        "field": "name",
        "message": "Menu name is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  }
}
```

### Menu Item Creation Errors
```json
{
  "success": false,
  "error": {
    "code": "MENU_ITEM_CREATION_ERROR",
    "message": "Menu item creation failed",
    "details": [
      {
        "field": "menuId",
        "message": "Menu not found",
        "code": "MENU_NOT_FOUND"
      }
    ]
  }
}
```

## Performance Considerations

### 1. Navigation Generation
- **Caching** for menu trees and navigation
- **Lazy loading** for large menu structures
- **Optimized queries** for hierarchical data
- **Indexing** on menu relationships

### 2. Content Integration
- **Efficient content lookup** for dynamic menu items
- **Caching** for frequently accessed content
- **Batch loading** for multiple content references
- **Optimized joins** for content relationships

### 3. Database Optimization
- **Indexing** on frequently queried fields
- **Query optimization** for complex hierarchies
- **Connection pooling** for high concurrency
- **Caching** for navigation structures

## Security Considerations

### 1. Access Control
- **Public read access** for published menus
- **Admin/Editor write access** for management
- **Role-based permissions** for menu management
- **Audit logging** for all operations

### 2. Content Security
- **URL validation** for external links
- **Content access control** for dynamic items
- **Input sanitization** for menu data
- **XSS prevention** in menu content

### 3. Data Validation
- **Menu structure validation** for integrity
- **Circular reference prevention** in hierarchies
- **Depth limit enforcement** for performance
- **Character limit validation** for accessibility 