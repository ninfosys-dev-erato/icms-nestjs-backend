# Government CMS System Requirements - Backend Specification

## Project Overview

This document outlines the requirements for a **Nest.js Content Management System backend** that will serve:
- A **Next.js government website frontend** (public-facing)
- A **Next.js admin CMS frontend** (content management interface)

The system must be **SEO-optimized** and support **bilingual content** (English and Nepali).

## User Roles & Access Control

### Public Users
- General public viewing the government website
- Read-only access to published content

### CMS Administrator Users
1. **Admin**
   - Full system access
   - Can create, edit, and delete users
   - Can manage all content and settings

2. **Editor**
   - Can create and edit content
   - Cannot manage users or system settings

3. **Viewer**
   - Read-only access
   - Can export or print documents only

## Core System Components

### 1. Office Settings Management

**Office Configuration Table:**
- `directorate` (translatable entity)
- `office_name` (translatable entity)
- `office_address` (translatable entity)
- `background_photo` (S3 path, linked to media system)
- `email` (email address)
- `phone_number` (translatable entity)
- `x_link` (URL)
- `map_iframe` (HTML string for embedded maps)
- `website` (URL)
- `youtube` (URL)

### 2. Translation System

**Translatable Entity Structure:**
```json
{
  "en": "English content",
  "ne": "नेपाली सामग्री"
}
```

**Global Translations Table:**
- `id` (primary key)
- `key` (translation identifier)
- `en_value` (English translation)
- `ne_value` (Nepali translation)
- `group_name` (categorization)

### 3. Office Description System

**Office Description Types (Enum):**
- Introduction
- Objective
- Work Details
- Organizational Structure
- Digital Charter
- Employee Sanctions

**Office Description Table:**
- `office_description_type` (enum)
- `content` (translatable entity)

*Note: Future versions will support rich text formatting (bold, italic, font sizing) and embedded media.*

### 4. Content Management System

**Content Categories:**
1. **Legal Documents**
   - Acts, Policies, Directives

2. **News & Information**
   - News articles, Press releases, Bolpatra (tenders)

3. **Publications**
   - Progress reports, Official publications

4. **Downloads**
   - Downloadable documents and resources

**Features:**
- Infinite nested categories and subcategories
- Support for multiple file attachments (PDF documents)
- Currently plain text with file support (rich content editor planned for future)

### 5. Important Links

**Footer Links Configuration:**
- `link_title` (translatable entity)
- `link_url` (URL)

### 6. FAQ System

**FAQ Management:**
- `question` (translatable entity)
- `answer` (translatable entity)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 7. Media Management

**Media Categories:**
- Images
- Audio files
- Videos
- External URLs

**Features:**
- Individual media uploads
- Album/gallery creation with custom names
- Media grouping and organization

### 8. Document Management

**Document System:**
- Comprehensive document library
- Integration with content categories
- Advanced search and filtering capabilities
- Relationship with news, regulations, and other content types

### 9. Slider/Banner System

**Slider Configuration:**
- `position` (display order)
- `display_time` (duration)
- `title` (optional)
- `media_reference` (linked to media entity)

**Features:**
- Integration with media management system
- Configurable display settings

### 10. Human Resources Management

**Department Structure:**
- `department_name` (translatable entity)
- Self-referential relationships (parent/child departments)
- `department_head` (reference to employee)

**Employee Management:**
- `name` (translatable entity)
- `department` (relationship)
- `position` (job title)
- `order` (display priority)
- `mobile_number`
- `telephone`
- `email`
- `room_number`

### 11. Menu & Navigation System

**Features:**
- Hierarchical menu structure
- Configurable menu items and sub-menus
- Accessibility-focused design
- Custom menu ordering and organization

### 12. Header Configuration

**Office Header Management:**
- `name` (translatable entity)
- `order` (display priority)
- Typography settings (font size, color)
- `alignment` options
- Logo management (left and right logo positioning)

## Future Enhancements

### Planned Features:
- **Global Search Functionality**
- **Advanced Rich Text Editor** with styling options
- **Custom Page Builder** (DSL for content creation)
- **Enhanced SEO Optimization**
- **Advanced Nepali-English Translation Tools**

## Technical Requirements

### Core Technologies:
- **Backend:** Nest.js
- **Database:** PostgreSQL (recommended)
- **File Storage:** AWS S3
- **Translation:** Built-in bilingual support (English/Nepali)

### Performance Requirements:
- SEO-optimized architecture
- Fast content delivery
- Responsive design support
- Scalable media handling

---

*This document serves as the foundation for the Nest.js backend development. Detailed API specifications and database schemas will be developed in subsequent phases.*