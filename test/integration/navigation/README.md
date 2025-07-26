# Navigation Module Tests

This directory contains comprehensive test suites for the Navigation module, which manages website navigation and menus with hierarchical structure, dynamic content, accessibility features, and menu ordering.

## Test Structure

The navigation module tests are organized into the following files:

### Repository Tests
- **`menu.repository.spec.ts`** - Tests for the MenuRepository class
- **`menu-item.repository.spec.ts`** - Tests for the MenuItemRepository class

### Service Tests
- **`menu.service.spec.ts`** - Tests for the MenuService class
- **`menu-item.service.spec.ts`** - Tests for the MenuItemService class

### Integration Tests
- **`navigation.e2e-spec.ts`** - End-to-end tests for the navigation module
- **`setup-navigation.spec.ts`** - Setup and teardown tests for the navigation module

## Test Coverage

### Menu Repository Tests (`menu.repository.spec.ts`)

Tests the following methods:
- `findById()` - Find menu by ID
- `findAll()` - Find all menus with pagination
- `findActive()` - Find active menus
- `findPublished()` - Find published menus
- `findByLocation()` - Find menu by location
- `create()` - Create new menu
- `update()` - Update existing menu
- `delete()` - Delete menu
- `publish()` - Publish menu
- `unpublish()` - Unpublish menu
- `findWithItems()` - Find menu with items
- `getStatistics()` - Get menu statistics
- `getMenuTree()` - Get menu tree structure

### Menu Item Repository Tests (`menu-item.repository.spec.ts`)

Tests the following methods:
- `findById()` - Find menu item by ID
- `findAll()` - Find all menu items with pagination
- `findActive()` - Find active menu items
- `findByMenu()` - Find menu items by menu
- `findByParent()` - Find menu items by parent
- `findByType()` - Find menu items by type
- `search()` - Search menu items
- `create()` - Create new menu item
- `update()` - Update existing menu item
- `delete()` - Delete menu item
- `reorder()` - Reorder menu items
- `getMenuItemTree()` - Get menu item tree
- `getStatistics()` - Get menu item statistics
- `findByItemReference()` - Find menu items by item reference
- `getBreadcrumb()` - Get breadcrumb for menu item

### Menu Service Tests (`menu.service.spec.ts`)

Tests the following methods:
- `getMenuById()` - Get menu by ID
- `getAllMenus()` - Get all menus
- `getActiveMenus()` - Get active menus
- `getPublishedMenus()` - Get published menus
- `getMenuByLocation()` - Get menu by location
- `searchMenus()` - Search menus
- `createMenu()` - Create new menu
- `updateMenu()` - Update existing menu
- `deleteMenu()` - Delete menu
- `publishMenu()` - Publish menu
- `unpublishMenu()` - Unpublish menu
- `validateMenu()` - Validate menu data
- `getMenuStatistics()` - Get menu statistics
- `getMenuTree()` - Get menu tree
- `exportMenus()` - Export menus
- `importMenus()` - Import menus
- `bulkPublish()` - Bulk publish menus
- `bulkUnpublish()` - Bulk unpublish menus
- `bulkDelete()` - Bulk delete menus

### Menu Item Service Tests (`menu-item.service.spec.ts`)

Tests the following methods:
- `getMenuItemById()` - Get menu item by ID
- `getAllMenuItems()` - Get all menu items
- `getActiveMenuItems()` - Get active menu items
- `getMenuItemsByMenu()` - Get menu items by menu
- `getMenuItemsByParent()` - Get menu items by parent
- `getMenuItemsByType()` - Get menu items by type
- `searchMenuItems()` - Search menu items
- `createMenuItem()` - Create new menu item
- `updateMenuItem()` - Update existing menu item
- `deleteMenuItem()` - Delete menu item
- `reorderMenuItems()` - Reorder menu items
- `validateMenuItem()` - Validate menu item data
- `getMenuItemStatistics()` - Get menu item statistics
- `getMenuItemTree()` - Get menu item tree
- `getBreadcrumb()` - Get breadcrumb for menu item
- `exportMenuItems()` - Export menu items
- `importMenuItems()` - Import menu items
- `bulkActivate()` - Bulk activate menu items
- `bulkDeactivate()` - Bulk deactivate menu items
- `bulkDelete()` - Bulk delete menu items

### End-to-End Tests (`navigation.e2e-spec.ts`)

Tests the following API endpoints:

#### Public Endpoints
- `GET /api/v1/menus` - Get all published menus
- `GET /api/v1/menus/:id` - Get menu by ID
- `GET /api/v1/menus/location/:location` - Get menu by location
- `GET /api/v1/menus/:id/tree` - Get menu tree
- `GET /api/v1/menu-items` - Get all published menu items
- `GET /api/v1/menu-items/:id` - Get menu item by ID
- `GET /api/v1/menu-items/menu/:menuId` - Get menu items by menu
- `GET /api/v1/menu-items/:itemId/breadcrumb` - Get breadcrumb for item
- `GET /api/v1/menu-items/search` - Search menu items

#### Admin Endpoints
- `POST /api/v1/admin/menus` - Create menu
- `PUT /api/v1/admin/menus/:id` - Update menu
- `DELETE /api/v1/admin/menus/:id` - Delete menu
- `POST /api/v1/admin/menus/:id/publish` - Publish menu
- `POST /api/v1/admin/menus/:id/unpublish` - Unpublish menu
- `GET /api/v1/admin/menus/statistics` - Get menu statistics
- `GET /api/v1/admin/menus/export` - Export menus
- `POST /api/v1/admin/menu-items` - Create menu item
- `PUT /api/v1/admin/menu-items/:id` - Update menu item
- `DELETE /api/v1/admin/menu-items/:id` - Delete menu item
- `PUT /api/v1/admin/menu-items/reorder` - Reorder menu items
- `GET /api/v1/admin/menu-items/statistics` - Get menu item statistics
- `GET /api/v1/admin/menu-items/export` - Export menu items

#### Bulk Operations
- `POST /api/v1/admin/menus/bulk-publish` - Bulk publish menus
- `POST /api/v1/admin/menus/bulk-unpublish` - Bulk unpublish menus
- `POST /api/v1/admin/menus/bulk-delete` - Bulk delete menus

#### Export/Import Operations
- `GET /api/v1/admin/menus/export` - Export menus as JSON
- `GET /api/v1/admin/menu-items/export` - Export menu items as JSON

### Setup Tests (`setup-navigation.spec.ts`)

Tests the following setup and teardown operations:
- Database cleanup
- Test user creation
- Test menu creation
- Test menu item creation
- Nested menu item creation
- Multiple menus for different locations
- Menu items of different types
- Data structure validation
- Hierarchical relationship validation

## Test Data

The tests use the following test data:

### Test Users
- **Regular User**: `test@example.com` (USER role)
- **Admin User**: `admin@example.com` (ADMIN role)

### Test Menus
- **Test Menu**: Header location, unpublished
- **Footer Menu**: Footer location, published
- **Sidebar Menu**: Sidebar location, unpublished

### Test Menu Items
- **Test Item**: Link type, root level
- **Child Item**: Link type, nested under Test Item
- **Content Item**: Content type, with itemId reference
- **Page Item**: Page type, with itemId reference

## Running the Tests

### Run All Navigation Tests
```bash
npm run test:e2e -- --testPathPattern=navigation
```

### Run Specific Test Files
```bash
# Repository tests
npm run test:e2e -- --testPathPattern=menu.repository.spec.ts
npm run test:e2e -- --testPathPattern=menu-item.repository.spec.ts

# Service tests
npm run test:e2e -- --testPathPattern=menu.service.spec.ts
npm run test:e2e -- --testPathPattern=menu-item.service.spec.ts

# E2E tests
npm run test:e2e -- --testPathPattern=navigation.e2e-spec.ts

# Setup tests
npm run test:e2e -- --testPathPattern=setup-navigation.spec.ts
```

### Run Tests with Coverage
```bash
npm run test:e2e -- --testPathPattern=navigation --coverage
```

## Test Features

### Authentication & Authorization
- Tests require authentication for admin endpoints
- Tests verify role-based access control (ADMIN role required)
- Tests include both authenticated and unauthenticated scenarios

### Data Validation
- Tests validate required fields
- Tests check for proper error responses
- Tests verify data structure integrity

### Pagination
- Tests verify pagination parameters
- Tests check pagination metadata
- Tests validate page and limit parameters

### Search Functionality
- Tests verify search by title and description
- Tests check bilingual search support
- Tests validate search results

### Hierarchical Structure
- Tests verify parent-child relationships
- Tests check menu item tree structure
- Tests validate breadcrumb generation

### Bulk Operations
- Tests verify bulk publish/unpublish operations
- Tests check bulk delete operations
- Tests validate operation results

### Export/Import
- Tests verify JSON export functionality
- Tests check import validation
- Tests validate error handling for unsupported formats

### Statistics
- Tests verify menu statistics calculation
- Tests check menu item statistics
- Tests validate statistical data structure

## Test Dependencies

The tests depend on the following modules:
- **PrismaService** - Database operations
- **MenuRepository** - Menu data access
- **MenuItemRepository** - Menu item data access
- **MenuService** - Menu business logic
- **MenuItemService** - Menu item business logic
- **AuthModule** - Authentication and authorization

## Database Schema

The tests work with the following Prisma models:
- **Menu** - Main menu container with location and publishing status
- **MenuItem** - Individual menu items with hierarchical structure
- **User** - User accounts for authentication
- **MenuLocation** enum - HEADER, FOOTER, SIDEBAR, MOBILE, CUSTOM
- **MenuItemType** enum - LINK, CONTENT, PAGE, CATEGORY, CUSTOM

## Notes

- All tests follow the global API response format enforced via `api-response.interceptor.ts`
- Tests include both English and Nepali language support
- Tests verify proper error handling and validation
- Tests ensure data integrity and relationship consistency
- Tests cover both success and failure scenarios
- Tests validate authentication and authorization requirements 