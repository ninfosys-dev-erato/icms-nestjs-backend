# API Documentation

## Overview

This document provides comprehensive API specifications for the Government CMS Backend. The API follows RESTful principles and supports bilingual content, authentication, and standardized response formats.

## Base URL

```
Development: http://localhost:3000/api/v1
Staging: https://staging-api.example.com/api/v1
Production: https://api.example.com/api/v1
```

## Authentication

### JWT Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /auth/login
**Description:** Authenticate user and return JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN"
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

#### POST /auth/refresh
**Description:** Refresh JWT token

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /auth/logout
**Description:** Logout user and invalidate token

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

## Pagination

### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

### Pagination Response
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

## Filtering

### Query Parameters
- `search`: Full-text search
- `status`: Filter by status
- `category`: Filter by category
- `dateFrom`: Filter from date
- `dateTo`: Filter to date

### Example
```
GET /api/v1/contents?search=government&status=published&page=1&limit=20
```

## Internationalization

### Language Detection
- **Header:** `Accept-Language: en, ne`
- **Query Parameter:** `lang=en` or `lang=ne`
- **Default:** English (en)

### Translatable Fields
All translatable fields follow this structure:
```json
{
  "en": "English content",
  "ne": "नेपाली सामग्री"
}
```

## Error Codes

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

### Application Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND_ERROR`: Resource not found
- `DUPLICATE_ERROR`: Resource already exists
- `INTERNAL_ERROR`: Internal server error

## Core API Endpoints

### 1. Office Settings Management

#### GET /office-settings
**Description:** Get office settings
**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "settings_id",
    "directorate": {
      "en": "Ministry of Education",
      "ne": "शिक्षा मन्त्रालय"
    },
    "officeName": {
      "en": "District Education Office",
      "ne": "जिल्ला शिक्षा कार्यालय"
    },
    "officeAddress": {
      "en": "Dadeldura, Nepal",
      "ne": "दादेलधुरा, नेपाल"
    },
    "backgroundPhoto": "https://s3.amazonaws.com/...",
    "email": "info@example.gov.np",
    "phoneNumber": {
      "en": "+977-123456789",
      "ne": "+९७७-१२३४५६७८९"
    },
    "xLink": "https://x.com/example",
    "mapIframe": "<iframe>...</iframe>",
    "website": "https://example.gov.np",
    "youtube": "https://youtube.com/example"
  }
}
```

#### PUT /office-settings
**Description:** Update office settings
**Access:** Admin only

**Request Body:**
```json
{
  "directorate": {
    "en": "Ministry of Education",
    "ne": "शिक्षा मन्त्रालय"
  },
  "officeName": {
    "en": "District Education Office",
    "ne": "जिल्ला शिक्षा कार्यालय"
  }
}
```

### 2. Office Description System

#### GET /office-descriptions
**Description:** Get all office descriptions
**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "desc_id",
      "officeDescriptionType": "INTRODUCTION",
      "content": {
        "en": "Welcome to our office...",
        "ne": "हाम्रो कार्यालयमा स्वागत छ..."
      }
    }
  ]
}
```

#### GET /office-descriptions/{type}
**Description:** Get office description by type
**Access:** Public

#### POST /office-descriptions
**Description:** Create office description
**Access:** Admin, Editor

#### PUT /office-descriptions/{id}
**Description:** Update office description
**Access:** Admin, Editor

### 3. Content Management System

#### GET /categories
**Description:** Get all categories
**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_id",
      "name": {
        "en": "Legal Documents",
        "ne": "कानूनी कागजातहरू"
      },
      "description": {
        "en": "Official legal documents",
        "ne": "आधिकारिक कानूनी कागजातहरू"
      },
      "slug": "legal-documents",
      "parentId": null,
      "order": 1,
      "isActive": true,
      "children": []
    }
  ]
}
```

#### GET /categories/{id}
**Description:** Get category by ID
**Access:** Public

#### POST /categories
**Description:** Create category
**Access:** Admin, Editor

#### PUT /categories/{id}
**Description:** Update category
**Access:** Admin, Editor

#### DELETE /categories/{id}
**Description:** Delete category
**Access:** Admin only

#### GET /contents
**Description:** Get all contents with pagination
**Access:** Public

**Query Parameters:**
- `category`: Category ID
- `status`: Content status
- `search`: Search term
- `featured`: Featured content only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "content_id",
      "title": {
        "en": "New Policy Announcement",
        "ne": "नयाँ नीति घोषणा"
      },
      "content": {
        "en": "Content body...",
        "ne": "सामग्री मुख्य भाग..."
      },
      "excerpt": {
        "en": "Brief summary...",
        "ne": "संक्षिप्त सारांश..."
      },
      "slug": "new-policy-announcement",
      "categoryId": "cat_id",
      "status": "PUBLISHED",
      "publishedAt": "2024-01-01T00:00:00Z",
      "featured": false,
      "order": 1,
      "category": {
        "name": {
          "en": "Legal Documents",
          "ne": "कानूनी कागजातहरू"
        }
      },
      "attachments": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET /contents/{slug}
**Description:** Get content by slug
**Access:** Public

#### POST /contents
**Description:** Create content
**Access:** Admin, Editor

**Request Body:**
```json
{
  "title": {
    "en": "New Policy Announcement",
    "ne": "नयाँ नीति घोषणा"
  },
  "content": {
    "en": "Content body...",
    "ne": "सामग्री मुख्य भाग..."
  },
  "excerpt": {
    "en": "Brief summary...",
    "ne": "संक्षिप्त सारांश..."
  },
  "categoryId": "cat_id",
  "status": "DRAFT",
  "featured": false
}
```

#### PUT /contents/{id}
**Description:** Update content
**Access:** Admin, Editor

#### DELETE /contents/{id}
**Description:** Delete content
**Access:** Admin only

#### POST /contents/{id}/attachments
**Description:** Upload content attachments
**Access:** Admin, Editor

**Request:** Multipart form data

### 4. Important Links

#### GET /important-links
**Description:** Get all important links
**Access:** Public

#### POST /important-links
**Description:** Create important link
**Access:** Admin, Editor

#### PUT /important-links/{id}
**Description:** Update important link
**Access:** Admin, Editor

#### DELETE /important-links/{id}
**Description:** Delete important link
**Access:** Admin only

### 5. FAQ System

#### GET /faqs
**Description:** Get all FAQs
**Access:** Public

#### POST /faqs
**Description:** Create FAQ
**Access:** Admin, Editor

#### PUT /faqs/{id}
**Description:** Update FAQ
**Access:** Admin, Editor

#### DELETE /faqs/{id}
**Description:** Delete FAQ
**Access:** Admin only

### 6. Media Management

#### GET /media
**Description:** Get all media with pagination
**Access:** Public

#### POST /media
**Description:** Upload media
**Access:** Admin, Editor

**Request:** Multipart form data

#### GET /media/{id}
**Description:** Get media by ID
**Access:** Public

#### PUT /media/{id}
**Description:** Update media
**Access:** Admin, Editor

#### DELETE /media/{id}
**Description:** Delete media
**Access:** Admin only

#### GET /media-albums
**Description:** Get all media albums
**Access:** Public

#### POST /media-albums
**Description:** Create media album
**Access:** Admin, Editor

### 7. Slider/Banner System

#### GET /sliders
**Description:** Get all sliders
**Access:** Public

#### POST /sliders
**Description:** Create slider
**Access:** Admin, Editor

#### PUT /sliders/{id}
**Description:** Update slider
**Access:** Admin, Editor

#### DELETE /sliders/{id}
**Description:** Delete slider
**Access:** Admin only

### 8. Human Resources Management

#### GET /departments
**Description:** Get all departments
**Access:** Public

#### POST /departments
**Description:** Create department
**Access:** Admin only

#### PUT /departments/{id}
**Description:** Update department
**Access:** Admin only

#### DELETE /departments/{id}
**Description:** Delete department
**Access:** Admin only

#### GET /employees
**Description:** Get all employees
**Access:** Public

#### POST /employees
**Description:** Create employee
**Access:** Admin only

#### PUT /employees/{id}
**Description:** Update employee
**Access:** Admin only

#### DELETE /employees/{id}
**Description:** Delete employee
**Access:** Admin only

### 9. Menu & Navigation System

#### GET /menus
**Description:** Get all menus
**Access:** Public

#### POST /menus
**Description:** Create menu
**Access:** Admin only

#### PUT /menus/{id}
**Description:** Update menu
**Access:** Admin only

#### DELETE /menus/{id}
**Description:** Delete menu
**Access:** Admin only

### 10. Header Configuration

#### GET /header-configs
**Description:** Get all header configurations
**Access:** Public

#### POST /header-configs
**Description:** Create header configuration
**Access:** Admin only

#### PUT /header-configs/{id}
**Description:** Update header configuration
**Access:** Admin only

#### DELETE /header-configs/{id}
**Description:** Delete header configuration
**Access:** Admin only

### 11. Translation Management

#### GET /translations
**Description:** Get all translations
**Access:** Public

#### POST /translations
**Description:** Create translation
**Access:** Admin only

#### PUT /translations/{id}
**Description:** Update translation
**Access:** Admin only

#### DELETE /translations/{id}
**Description:** Delete translation
**Access:** Admin only

### 12. User Management

#### GET /users
**Description:** Get all users
**Access:** Admin only

#### POST /users
**Description:** Create user
**Access:** Admin only

#### PUT /users/{id}
**Description:** Update user
**Access:** Admin only

#### DELETE /users/{id}
**Description:** Delete user
**Access:** Admin only

## Search API

### GET /search
**Description:** Global search across all content types
**Access:** Public

**Query Parameters:**
- `q`: Search query
- `type`: Content type filter
- `lang`: Language filter

**Response:**
```json
{
  "success": true,
  "data": {
    "contents": [],
    "faqs": [],
    "employees": [],
    "total": 50
  }
}
```

## Health Check

### GET /health
**Description:** API health check
**Access:** Public

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

## Rate Limiting

### Limits
- **Public endpoints:** 100 requests per minute
- **Authenticated endpoints:** 1000 requests per minute
- **File uploads:** 10 requests per minute

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## CORS Configuration

### Allowed Origins
- Development: `http://localhost:3000`
- Staging: `https://staging.example.com`
- Production: `https://example.com`

### Allowed Methods
- GET, POST, PUT, DELETE, OPTIONS

### Allowed Headers
- Content-Type, Authorization, Accept-Language

## WebSocket Support

### Real-time Updates
- **Content changes**
- **User activity**
- **System notifications**

### Connection
```
ws://localhost:3000/ws
```

### Events
- `content.updated`
- `user.login`
- `system.notification` 