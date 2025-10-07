# Media Module Stories

This directory contains comprehensive user stories for the Media Module of the Government Content Management System. These stories demonstrate real-world usage scenarios through the lens of different user personas.

## 📁 File Structure

```
media/
├── README.md                           # This documentation
├── media-scenarios.ts                  # Scenario definitions
├── priya-media-upload.story.ts        # Photographer upload workflow
├── arjun-bulk-operations.story.ts     # Admin bulk operations
└── rita-public-access.story.ts        # Citizen public access
```

## 🎭 Personas

### 📷 Priya Gurung - Government Event Photographer
- **Role**: EDITOR
- **Technical Level**: INTERMEDIATE
- **Responsibilities**: Documenting government events, uploading photos, creating albums
- **Goals**: Efficient media upload, proper organization, multilingual metadata
- **Pain Points**: Bulk uploads, metadata management, content discovery

### 🎬 Arjun Pandey - Media Systems Administrator
- **Role**: ADMIN  
- **Technical Level**: ADVANCED
- **Responsibilities**: System management, bulk operations, performance optimization
- **Goals**: System efficiency, bulk processing, storage management
- **Pain Points**: Scale management, resource optimization, system maintenance

### 👩🏽‍💼 Rita Tamang - Local Business Owner
- **Role**: VIEWER
- **Technical Level**: BASIC
- **Responsibilities**: Viewing public content, staying informed about government activities
- **Goals**: Easy content access, visual information consumption
- **Pain Points**: Slow loading, difficult navigation, content discovery

## 📖 Story Scenarios

### 1. Media Upload Workflow
**File**: `priya-media-upload.story.ts`  
**Persona**: Priya Gurung  
**Scenario**: Uploading Event Photos to the Media Library

Priya documents a Community Development Program ceremony and needs to upload 25 high-quality photos with proper bilingual metadata. The story covers:

- Authentication and permission verification
- Single photo upload with comprehensive metadata
- Album creation for event organization
- Content verification and search testing
- System statistics monitoring

**Key API Endpoints**:
- `POST /api/v1/auth/login` - Authentication
- `POST /api/v1/admin/media/upload` - File upload
- `POST /api/v1/albums` - Album creation
- `POST /api/v1/albums/{id}/media/{mediaId}` - Media-album association
- `GET /api/v1/admin/media/search` - Content search

### 2. Bulk Operations Management
**File**: `arjun-bulk-operations.story.ts`  
**Persona**: Arjun Pandey  
**Scenario**: Managing Large Volumes of Media Content

Arjun processes 180 media files from multiple government departments including photos, documents, and videos. The story covers:

- System statistics baseline establishment
- Bulk media creation with different file types
- Departmental album organization
- Bulk metadata updates for consistency
- Media processing and optimization
- Performance monitoring and verification

**Key API Endpoints**:
- `GET /api/v1/admin/media/statistics` - System metrics
- `POST /api/v1/admin/media/bulk-create` - Bulk operations
- `PUT /api/v1/admin/media/bulk-update` - Bulk updates
- `POST /api/v1/admin/media/{id}/process` - Media processing

### 3. Public Content Access
**File**: `rita-public-access.story.ts`  
**Persona**: Rita Tamang  
**Scenario**: Accessing Government Media as a Citizen

Rita explores government visual content to stay informed about community activities. The story covers:

- Public media browsing without authentication
- Album exploration and content discovery
- Search functionality for specific topics
- Individual media viewing with full details
- URL access for content sharing
- Type-specific content filtering

**Key API Endpoints**:
- `GET /api/v1/media` - Public media access
- `GET /api/v1/albums/active` - Public albums
- `GET /api/v1/media/search` - Public search
- `GET /api/v1/media/{id}` - Individual media details
- `GET /api/v1/media/{id}/url` - Media URL access
- `GET /api/v1/media/images` - Type filtering

## 🏃‍♂️ Running the Stories

### Prerequisites
1. Database running and accessible
2. Test environment configured
3. Required environment variables set:
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `JWT_REFRESH_SECRET`
   - `JWT_REFRESH_EXPIRES_IN`

### Execute All Media Stories
```bash
npm run test:e2e -- --testPathPattern=media.story.e2e-spec.ts
```

### Execute Individual Stories
```bash
# Priya's upload workflow
npm run test:e2e -- --testPathPattern=media.story.e2e-spec.ts --testNamePattern="Priya uploads"

# Arjun's bulk operations
npm run test:e2e -- --testPathPattern=media.story.e2e-spec.ts --testNamePattern="Arjun performs bulk"

# Rita's public access
npm run test:e2e -- --testPathPattern=media.story.e2e-spec.ts --testNamePattern="Rita browses"
```

### Debug Mode
```bash
npm run test:e2e -- --testPathPattern=media.story.e2e-spec.ts --verbose
```

## 📊 Story Coverage

### Media Management Features
- ✅ File upload with validation
- ✅ Multilingual metadata support (English/Nepali)
- ✅ Media type detection (IMAGE, VIDEO, DOCUMENT)
- ✅ Album creation and organization
- ✅ Media-album associations
- ✅ Search and discovery
- ✅ Bulk operations (create, update, delete)
- ✅ Media processing and optimization
- ✅ Public access and sharing
- ✅ System statistics and monitoring

### Authentication & Authorization
- ✅ Role-based access (ADMIN, EDITOR, VIEWER)
- ✅ JWT token authentication
- ✅ Permission verification
- ✅ Public vs private content access

### Data Scenarios
- ✅ Multilingual content (English/Nepali)
- ✅ Multiple file types and sizes
- ✅ Complex metadata structures
- ✅ Bulk data processing
- ✅ Search and filtering operations
- ✅ Media organization workflows

### Error Handling
- ✅ Authentication failures
- ✅ Permission denied scenarios
- ✅ File validation errors
- ✅ Missing resource handling
- ✅ System capacity limitations

## 📈 Performance Metrics

The stories track performance metrics including:
- **Upload Times**: File upload duration tracking
- **Processing Times**: Media processing and optimization
- **Search Performance**: Query response times
- **Bulk Operation Efficiency**: Large-scale operation timing
- **API Response Times**: Individual endpoint performance

## 📄 Documentation Generation

Stories automatically generate comprehensive documentation including:

### Individual Story Documents
- Step-by-step narrative with persona context
- Complete API request/response examples
- Performance metrics and timing data
- Success/failure scenarios with explanations

### Overview Documentation
- Test summary with success rates
- Persona descriptions and motivations
- Technical coverage reports
- API endpoint usage patterns

### Output Location
Generated documentation is saved to:
```
test/story-docs/output/media/
├── README.md                           # Overview and summary
├── priya-media-upload.md              # Priya's story documentation
├── arjun-bulk-operations.md           # Arjun's story documentation
└── rita-public-access.md              # Rita's story documentation
```

## 🔧 Technical Implementation

### Story Framework Integration
- Built on the Story Builder framework
- Uses real HTTP requests via supertest
- Integrates with existing test infrastructure
- Generates markdown documentation automatically

### Data Management
- Automatic database cleanup between tests
- Test user creation and management
- Media file generation for testing
- Environment isolation

### Error Handling
- Graceful handling of missing data
- Fallback scenarios for edge cases
- Comprehensive error reporting
- Debug-friendly error messages

## 🎯 Best Practices

### Story Writing
1. **Clear Narratives**: Each step tells a complete story
2. **Realistic Scenarios**: Based on actual user workflows
3. **Comprehensive Coverage**: Test both success and failure paths
4. **Performance Awareness**: Track timing and resource usage

### Persona Development
1. **Authentic Motivations**: Based on real user needs
2. **Technical Accuracy**: Appropriate skill levels and goals
3. **Cultural Context**: Consider local government workflows
4. **Role-Based Scenarios**: Leverage appropriate permissions

### Technical Quality
1. **Maintainable Code**: Clean, documented story implementations
2. **Reliable Tests**: Consistent execution across environments
3. **Comprehensive Documentation**: Auto-generated and human-readable
4. **Performance Monitoring**: Track system impact and optimization

---

## 🚀 Getting Started

1. **Review Personas**: Understand the different user types and their needs
2. **Explore Scenarios**: Read through the scenario definitions
3. **Run Stories**: Execute the story tests to see them in action
4. **Review Documentation**: Check the generated markdown for insights
5. **Extend Stories**: Add new scenarios based on evolving requirements

This media story collection provides a comprehensive view of how different users interact with the government media management system, ensuring that the API meets real-world needs while maintaining high performance and usability standards. 