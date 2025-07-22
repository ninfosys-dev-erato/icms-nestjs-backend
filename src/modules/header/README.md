# Header Configuration Module

## Overview

The Header Configuration module manages website header customization including logo management, typography settings, layout configuration, and responsive design. This module provides a comprehensive solution for customizing the website header to match branding requirements and user preferences.

## Features

- **Header Customization:** Manage header layout and appearance
- **Logo Management:** Handle left and right logo positioning
- **Typography Settings:** Control font sizes, colors, and styles
- **Layout Configuration:** Manage header structure and alignment
- **Responsive Design:** Support for different screen sizes
- **Branding Integration:** Maintain consistent brand identity
- **CSS Generation:** Dynamic CSS generation from configuration
- **Preview System:** Real-time preview of header configurations
- **Bulk Operations:** Bulk publish, unpublish, and delete operations
- **Import/Export:** Import and export header configurations

## Implementation Status

✅ **Completed:**
- [x] HeaderConfigService - Complete implementation with all methods
- [x] HeaderConfigRepository - Complete implementation with all methods
- [x] DTOs for header configuration - All DTOs implemented
- [x] Controllers for public and admin endpoints - Both controllers implemented
- [x] Logo management functionality - Complete implementation
- [x] Typography settings management - Complete implementation
- [x] Layout configuration system - Complete implementation
- [x] CSS generation system - Complete implementation
- [x] Preview system - Complete implementation
- [x] Bulk operations - Complete implementation
- [x] Import/Export functionality - Complete implementation
- [x] Database schema updated - Enhanced HeaderConfig model
- [x] Module configuration - Complete module setup

## API Endpoints

### Public Endpoints
- `GET /header-configs` - Get all published header configs
- `GET /header-configs/:id` - Get header config by ID
- `GET /header-configs/display/active` - Get active header config for display
- `GET /header-configs/order/:order` - Get header config by order
- `GET /header-configs/:id/css` - Get header CSS
- `POST /header-configs/preview` - Preview header config

### Admin Endpoints
- `GET /admin/header-configs` - Get all header configs (Admin)
- `GET /admin/header-configs/statistics` - Get header config statistics
- `GET /admin/header-configs/search` - Search header configs
- `GET /admin/header-configs/:id` - Get header config by ID (Admin)
- `POST /admin/header-configs` - Create header config
- `PUT /admin/header-configs/:id` - Update header config
- `DELETE /admin/header-configs/:id` - Delete header config
- `POST /admin/header-configs/:id/publish` - Publish header config
- `POST /admin/header-configs/:id/unpublish` - Unpublish header config
- `PUT /admin/header-configs/reorder` - Reorder header configs
- `PUT /admin/header-configs/:id/logo/:logoType` - Update logo
- `DELETE /admin/header-configs/:id/logo/:logoType` - Remove logo
- `GET /admin/header-configs/export` - Export header configs
- `POST /admin/header-configs/import` - Import header configs
- `POST /admin/header-configs/bulk-publish` - Bulk publish header configs
- `POST /admin/header-configs/bulk-unpublish` - Bulk unpublish header configs
- `POST /admin/header-configs/bulk-delete` - Bulk delete header configs
- `GET /admin/header-configs/:id/css` - Generate CSS (Admin)

## Database Schema

The HeaderConfig model includes:
- **name**: Translatable entity (JSON)
- **order**: Integer for ordering
- **isActive**: Boolean for active status
- **isPublished**: Boolean for published status
- **typography**: JSON object with font settings
- **alignment**: HeaderAlignment enum (LEFT, CENTER, RIGHT, JUSTIFY)
- **logo**: JSON object with logo configuration
- **layout**: JSON object with layout configuration

## Usage

The module is fully implemented and ready for use. It provides comprehensive header configuration management with:

1. **Typography Control** for consistent branding
2. **Layout Management** for responsive design
3. **Logo Positioning** for brand identity
4. **Alignment Options** for design flexibility
5. **CSS Generation** for dynamic styling
6. **Preview System** for real-time configuration testing
7. **Bulk Operations** for efficient management
8. **Import/Export** for data portability

## Security Features

- **Input Validation** for all configuration data
- **Access Control** with role-based permissions
- **Audit Logging** for all operations
- **Data Protection** with secure storage
- **CSS Injection Prevention** in typography settings 