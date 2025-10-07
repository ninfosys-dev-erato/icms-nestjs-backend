# Header Configuration User Stories

This directory contains user story scenarios for the Header Configuration module of the government website management system.

## Overview

The Header Configuration module allows administrators and content managers to customize the website header with:

- **Typography Settings**: Font family, size, weight, color, line height, and letter spacing
- **Logo Management**: Left and right logo positioning with alignment and spacing controls
- **Layout Configuration**: Header height, background colors, borders, padding, and margins
- **Responsive Design**: Support for different screen sizes and devices
- **Publishing Workflow**: Draft, preview, and publish functionality
- **CSS Generation**: Dynamic CSS generation for header styling
- **Bulk Operations**: Managing multiple header configurations efficiently

## Story Categories

### 1. Header Management Stories
These stories focus on administrative tasks for creating and managing header configurations:

- **Basic Setup**: Creating fundamental header configurations with typography and layout
- **Logo Management**: Adding and positioning government logos with proper branding
- **Layout Customization**: Advanced styling including colors, spacing, and responsive design
- **Publishing Workflow**: Complete process from creation to public deployment
- **Bulk Operations**: Managing multiple configurations efficiently
- **Analytics**: Reviewing configuration statistics and usage patterns

### 2. Public Access Stories
These stories show how citizens and visitors interact with the published headers:

- **Public Display**: How headers appear to website visitors
- **Cross-Device Access**: Header display across different devices and screen sizes
- **Performance**: Header loading and rendering performance

### 3. Technical Stories
These stories cover technical aspects and edge cases:

- **Error Handling**: Managing invalid configurations and system errors
- **Import/Export**: Backing up and migrating header configurations
- **Version Control**: Tracking changes and managing configuration history
- **CSS Generation**: Dynamic stylesheet creation and optimization

## User Personas

### Primary Personas

1. **Ramesh Kumar (Senior Government Officer)** - `ramesh-admin`
   - **Role**: ADMIN
   - **Use Case**: Overall system administration and header management
   - **Goals**: Maintain professional government branding and ensure system reliability

2. **Maya Adhikari (Content Manager)** - `maya-content-manager`
   - **Role**: ADMIN  
   - **Use Case**: Logo management and advanced layout customization
   - **Goals**: Implement consistent branding and organize visual content effectively

### Secondary Personas

3. **John Smith (Tourist)** - `tourist-viewer`
   - **Role**: VIEWER
   - **Use Case**: Public website access and header viewing
   - **Goals**: Access government information with clear, professional interface

4. **Sita Sharma (Communications Officer)** - `sita-editor`
   - **Role**: EDITOR
   - **Use Case**: Content publishing and header preview
   - **Goals**: Ensure published content has proper visual presentation

## Story Scenarios

### headerBasicSetup
**Title**: Set Up Basic Header Configuration  
**Persona**: Ramesh Kumar (Admin)  
**Complexity**: MEDIUM (2 minutes)

Creates fundamental header configuration with typography and layout settings for professional government website appearance.

**Key Actions**:
- Configure typography (font family, size, weight, color)
- Set layout properties (height, background, padding, margins)
- Define header alignment and basic structure
- Generate CSS preview for verification

---

### logoManagement  
**Title**: Manage Header Logos and Branding  
**Persona**: Maya Adhikari (Content Manager)  
**Complexity**: MEDIUM (90 seconds)

Configures government logos with proper positioning and alignment according to official branding guidelines.

**Key Actions**:
- Add left and right logos with proper dimensions
- Configure logo alignment and spacing
- Set alt text and accessibility properties
- Verify logo positioning in generated CSS

---

### headerPublishingWorkflow
**Title**: Complete Header Publishing Workflow  
**Persona**: Ramesh Kumar (Admin)  
**Complexity**: MEDIUM (2 minutes)

Full workflow from header creation through testing to public deployment, ensuring quality and approval processes.

**Key Actions**:
- Create complete header configuration
- Preview configuration before publishing
- Publish header for public access
- Verify public visibility and accessibility

---

### publicHeaderDisplay
**Title**: View Published Header on Public Website  
**Persona**: John Smith (Tourist)  
**Complexity**: EASY (30 seconds)

Shows how published headers appear to website visitors, demonstrating the end-user experience.

**Key Actions**:
- Access public website with published header
- Load header styling and verify display
- Experience professional government branding
- Navigate website with clear header design

---

### headerAnalyticsAndStatistics
**Title**: Analyze Header Configuration Statistics  
**Persona**: Maya Adhikari (Content Manager)  
**Complexity**: EASY (60 seconds)

Reviews header configuration usage and performance for reporting and optimization purposes.

**Key Actions**:
- Access administrative statistics dashboard
- Review configuration counts and status breakdown
- Search and filter header configurations
- Generate reports for management review

## Technical Implementation

### API Endpoints Covered

**Public Endpoints**:
- `GET /api/v1/header-configs` - List published headers
- `GET /api/v1/header-configs/:id` - Get specific header
- `GET /api/v1/header-configs/display/active` - Get active header
- `GET /api/v1/header-configs/:id/css` - Get header CSS
- `POST /api/v1/header-configs/preview` - Preview header

**Admin Endpoints**:
- `GET /api/v1/admin/header-configs` - List all headers
- `POST /api/v1/admin/header-configs` - Create header
- `PUT /api/v1/admin/header-configs/:id` - Update header
- `DELETE /api/v1/admin/header-configs/:id` - Delete header
- `POST /api/v1/admin/header-configs/:id/publish` - Publish header
- `POST /api/v1/admin/header-configs/:id/unpublish` - Unpublish header
- `GET /api/v1/admin/header-configs/statistics` - Get statistics
- `GET /api/v1/admin/header-configs/search` - Search headers

### Data Structures

**Header Configuration**:
```typescript
{
  name: { en: string, ne: string },
  order: number,
  isActive: boolean,
  isPublished: boolean,
  typography: {
    fontFamily: string,
    fontSize: number,
    fontWeight: string,
    color: string,
    lineHeight: number,
    letterSpacing: number
  },
  alignment: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFY',
  logo: {
    leftLogo?: {
      url: string,
      alt: string,
      width: number,
      height: number
    },
    rightLogo?: {
      url: string,
      alt: string,
      width: number,
      height: number
    },
    logoAlignment: string,
    logoSpacing: number
  },
  layout: {
    headerHeight: number,
    backgroundColor: string,
    borderColor?: string,
    borderWidth?: number,
    padding: { top: number, right: number, bottom: number, left: number },
    margin: { top: number, right: number, bottom: number, left: number }
  }
}
```

## Running the Stories

### Execute All Header Stories
```bash
npm test -- test/integration/header/header.story.e2e-spec.ts
```

### Execute Specific Story
```bash
npm test -- test/integration/header/header.story.e2e-spec.ts -t "Set Up Basic Header Configuration"
```

### Generate Documentation
The stories automatically generate markdown documentation showing:
- Complete user narratives with personas
- Step-by-step API interactions
- Request/response examples
- Performance metrics
- Success/failure analysis

## Story Flow Examples

### Basic Header Creation Flow
1. **Authentication**: Admin logs into system
2. **Configuration**: Creates header with typography and layout
3. **Verification**: Confirms settings were saved correctly
4. **Preview**: Generates CSS to verify appearance
5. **Documentation**: Captures complete interaction for review

### Logo Management Flow
1. **Setup**: Content manager authenticates
2. **Creation**: Creates header configuration with logos
3. **Verification**: Confirms logo settings and positioning
4. **CSS Generation**: Verifies logo positioning in stylesheet
5. **Documentation**: Records branding implementation process

### Publishing Workflow
1. **Admin Access**: Authenticates for publishing operations
2. **Complete Configuration**: Creates full header with all elements
3. **Preview**: Tests configuration before publishing
4. **Publishing**: Makes header live for public access
5. **Verification**: Confirms public availability
6. **Documentation**: Records complete deployment process

## Quality Assurance

Each story includes:
- **Input Validation**: Proper data structure validation
- **Error Handling**: Graceful handling of invalid inputs
- **Authentication**: Proper role-based access control
- **Response Validation**: Verification of API response structure
- **Performance Tracking**: Response time measurement
- **Documentation**: Automatic generation of user-friendly documentation

## Integration with Testing Framework

The header stories integrate with:
- **NestJS Testing Module**: For application testing
- **Supertest**: For HTTP endpoint testing
- **Jest**: For test framework and assertions
- **Prisma**: For database operations
- **Story Framework**: For narrative documentation generation

This comprehensive testing approach ensures the Header Configuration module works correctly from both technical and user experience perspectives. 