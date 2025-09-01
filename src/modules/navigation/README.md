# Menu & Navigation System Module

## Overview

The Menu & Navigation System module manages website navigation and menus with hierarchical structure, dynamic content, accessibility features, and menu ordering. This module provides a flexible solution for creating and managing website navigation that adapts to different content types and user roles.

## Features

- **Menu Management:** Create, edit, and organize navigation menus with custom ordering
- **Hierarchical Structure:** Support for nested menu items and sub-menus
- **Dynamic Navigation:** Menu items that adapt to content and user roles
- **Accessibility Features:** WCAG compliant navigation with proper ARIA labels
- **Menu Ordering:** Customizable display order for both menus and menu items
- **Multi-Language Support:** Bilingual menu items and navigation
- **Bulk Operations:** Reorder multiple menus and menu items at once

## Implementation Status

✅ **COMPLETED** - All features have been implemented:

- ✅ MenuService - Complete with CRUD operations, validation, reordering, and business logic
- ✅ MenuItemService - Complete with CRUD operations, validation, reordering, and business logic
- ✅ MenuRepository - Complete with database operations, queries, and reordering
- ✅ MenuItemRepository - Complete with database operations, queries, and reordering
- ✅ DTOs for menu management - Complete with validation decorators and order field
- ✅ DTOs for menu item management - Complete with validation decorators and order field
- ✅ Public controllers - Complete with all public endpoints
- ✅ Admin controllers - Complete with authentication, role-based access, and reordering
- ✅ Hierarchical menu structure - Complete with parent-child relationships
- ✅ Dynamic navigation functionality - Complete with content integration
- ✅ Menu ordering system - Complete with reordering capabilities for both menus and menu items
- ✅ Prisma schema - Complete with Menu and MenuItem models including order fields

## Order Field Functionality

### Menu Ordering
- **Field**: `order` (integer, default: 0)
- **Purpose**: Controls the display order of menus in navigation
- **Behavior**: Lower numbers appear first
- **Admin Control**: Set during creation/editing, bulk reordering available

### Menu Item Ordering
- **Field**: `order` (integer, default: 0)
- **Purpose**: Controls the display order of items within a menu
- **Behavior**: Lower numbers appear first
- **Admin Control**: Set during creation/editing, bulk reordering available

## API Endpoints

### Public Endpoints
- `GET /api/v1/menus` - Get all published menus (ordered by order field)
- `GET /api/v1/menus/:id` - Get menu by ID
- `GET /api/v1/menus/location/:location` - Get menu by location (ordered by order field)
- `GET /api/v1/menus/:id/tree` - Get menu tree
- `GET /api/v1/menu-items` - Get all published menu items (ordered by order field)
- `GET /api/v1/menu-items/:id` - Get menu item by ID
- `GET /api/v1/menu-items/menu/:menuId` - Get menu items by menu (ordered by order field)
- `GET /api/v1/menu-items/:itemId/breadcrumb` - Get breadcrumb for item
- `GET /api/v1/menu-items/search` - Search menu items

### Admin Endpoints
- `POST /api/v1/admin/menus` - Create menu
- `PUT /api/v1/admin/menus/:id` - Update menu
- `DELETE /api/v1/admin/menus/:id` - Delete menu
- `POST /api/v1/admin/menus/:id/publish` - Publish menu
- `POST /api/v1/admin/menus/:id/unpublish` - Unpublish menu
- `PUT /api/v1/admin/menus/reorder` - **NEW**: Reorder menus
- `GET /api/v1/admin/menus/statistics` - Get menu statistics
- `GET /api/v1/admin/menus/export` - Export menus
- `POST /api/v1/admin/menus/import` - Import menus
- `POST /api/v1/admin/menu-items` - Create menu item
- `PUT /api/v1/admin/menu-items/:id` - Update menu item
- `DELETE /api/v1/admin/menu-items/:id` - Delete menu item
- `PUT /api/v1/admin/menu-items/reorder` - Reorder menu items
- `GET /api/v1/admin/menu-items/statistics` - Get menu item statistics
- `GET /api/v1/admin/menu-items/export` - Export menu items
- `POST /api/v1/admin/menu-items/import` - Import menu items

## Database Schema

The module uses the following Prisma models:
- `Menu` - Main menu container with location, publishing status, and **order field**
- `MenuItem` - Individual menu items with hierarchical structure and **order field**
- `MenuLocation` enum - HEADER, FOOTER, SIDEBAR, MOBILE, CUSTOM
- `MenuItemType` enum - LINK, CONTENT, PAGE, CATEGORY, CUSTOM

## Usage

The Navigation module is now fully functional and ready for use. It provides comprehensive menu management capabilities with:

- **Multi-language support** for all menu content
- **Hierarchical menu structures** with unlimited nesting
- **Role-based access control** for admin operations
- **Bulk operations** for efficient management including reordering
- **Import/export functionality** for data migration
- **Search and filtering** capabilities
- **Statistics and analytics** for menu usage
- **Custom ordering** for both menus and menu items

## Order Management Examples

### Creating a Menu with Order
```json
{
  "name": { "en": "Main Menu", "ne": "मुख्य मेनु" },
  "location": "HEADER",
  "order": 1
}
```

### Reordering Menus
```json
PUT /admin/menus/reorder
[
  { "id": "menu1", "order": 1 },
  { "id": "menu2", "order": 2 },
  { "id": "menu3", "order": 3 }
]
```

### Reordering Menu Items
```json
PUT /admin/menu-items/reorder
[
  { "id": "item1", "order": 1 },
  { "id": "item2", "order": 2 },
  { "id": "item3", "order": 3 }
]
``` 