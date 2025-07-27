import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as path from 'path';
import * as fs from 'fs';

import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { HttpExceptionFilter } from '../../../src/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '../../../src/common/interceptors/api-response.interceptor';

// Story imports
import { createPriyaMediaUploadStory } from '../../story-docs/stories/media/priya-media-upload.story';
import { createArjunBulkOperationsStory } from '../../story-docs/stories/media/arjun-bulk-operations.story';
import { createRitaPublicAccessStory } from '../../story-docs/stories/media/rita-public-access.story';

// Persona imports
import { priyaPhotographer } from '../../story-docs/personas/priya-photographer';
import { arjunMediaAdmin } from '../../story-docs/personas/arjun-media-admin';
import { ritaCitizen } from '../../story-docs/personas/rita-citizen';

// Framework imports
import { MarkdownGenerator } from '../../story-docs/framework/markdown-generator';
import { PersonaManager } from '../../story-docs/framework/persona-manager';

describe('Media Module Stories (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: any;
  let markdownGenerator: MarkdownGenerator;
  let storyResults: any[] = [];

  beforeAll(async () => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-media-stories';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-media-stories';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    
    app.setGlobalPrefix('api/v1');

    prisma = app.get<PrismaService>(PrismaService);
    httpServer = app.getHttpServer();
    markdownGenerator = new MarkdownGenerator();
    
    await app.init();

    // Register personas
    PersonaManager.addPersona(priyaPhotographer);
    PersonaManager.addPersona(arjunMediaAdmin);
    PersonaManager.addPersona(ritaCitizen);

    console.log('🎬 Starting Media Module Story Documentation Generation...');
  });

  afterAll(async () => {
    await cleanupDatabase();
    await generateStoryDocumentation();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase();
    await setupTestEnvironment();
  });

  const cleanupDatabase = async () => {
    try {
      const tables = [
        'media_album_media',
        'media',
        'media_albums',
        'user_sessions',
        'login_attempts',
        'audit_logs',
        'users',
      ];

      for (const table of tables) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      }
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
  };

  const setupTestEnvironment = async () => {
    try {
      // Create test users for all personas
      await createTestUser(priyaPhotographer);
      await createTestUser(arjunMediaAdmin);
      
      console.log('✅ Test environment setup completed');
    } catch (error) {
      console.error('❌ Test environment setup failed:', error.message);
    }
  };

  const createTestUser = async (persona: any) => {
    try {
      const response = await request(httpServer)
        .post('/api/v1/auth/register')
        .send({
          email: persona.email,
          password: persona.password,
          confirmPassword: persona.password,
          firstName: persona.name.split(' ')[0],
          lastName: persona.name.split(' ')[1] || 'User',
          role: persona.role,
        });

      if (response.status === 201) {
        console.log(`👤 Created test user: ${persona.name} (${persona.role})`);
        return response.body.data;
      } else {
        console.warn(`⚠️  Failed to create user ${persona.name}:`, response.body);
      }
    } catch (error) {
      console.error(`❌ Error creating user ${persona.name}:`, error.message);
    }
  };

  const generateStoryDocumentation = async () => {
    try {
      const outputDir = path.join(__dirname, '../../story-docs/output/media');
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Generate individual story documents
      for (const storyResult of storyResults) {
        if (storyResult.story) {
          const markdown = await markdownGenerator.generateStoryDocumentation(storyResult.story);
          const fileName = `${storyResult.story.id}.md`;
          const filePath = path.join(outputDir, fileName);
          
          fs.writeFileSync(filePath, markdown);
          console.log(`📄 Generated story documentation: ${fileName}`);
        }
      }

      // Generate overview document
      const overview = generateMediaOverview();
      fs.writeFileSync(path.join(outputDir, 'README.md'), overview);
      
      console.log('📚 Media story documentation generation completed!');
      console.log(`📁 Documentation available at: ${outputDir}`);
    } catch (error) {
      console.error('❌ Error generating documentation:', error.message);
    }
  };

  const generateMediaOverview = (): string => {
    const successfulStories = storyResults.filter(r => r.success);
    const failedStories = storyResults.filter(r => !r.success);
    
    return `# Media Module Story Documentation

## 📊 Test Summary

- **Total Stories**: ${storyResults.length}
- **Successful**: ${successfulStories.length}
- **Failed**: ${failedStories.length}
- **Success Rate**: ${((successfulStories.length / storyResults.length) * 100).toFixed(1)}%

## 🎭 Featured Personas

### 📷 Priya Gurung - Government Event Photographer
**Role**: EDITOR | **Technical Level**: INTERMEDIATE

Priya is responsible for documenting government events and managing visual content. She uploads photos, creates albums, and ensures proper metadata for content discovery.

### 🎬 Arjun Pandey - Media Systems Administrator  
**Role**: ADMIN | **Technical Level**: ADVANCED

Arjun manages the entire media infrastructure, performs bulk operations, and ensures optimal system performance for media management.

### 👩🏽‍💼 Rita Tamang - Local Business Owner
**Role**: VIEWER | **Technical Level**: BASIC

Rita accesses government media content as a citizen, browsing photo galleries and staying informed about community activities.

## 📚 Story Collection

${storyResults.map(result => {
  const status = result.success ? '✅' : '❌';
  const persona = result.story?.persona?.name || 'Unknown';
  const title = result.story?.title || result.story?.scenario?.title || 'Untitled Story';
  
  return `### ${status} ${title}
**Persona**: ${persona}  
**Scenario**: ${result.story?.scenario?.category || 'Unknown'}  
**Duration**: ${result.story?.metadata?.duration ? (result.story.metadata.duration / 1000).toFixed(2) + 's' : 'N/A'}`;
}).join('\n\n')}

## 🔧 Technical Coverage

### Media Management Operations
- File upload with multilingual metadata
- Media type detection and processing
- Album creation and organization
- Search and discovery functionality
- Bulk operations for efficiency
- Public access and sharing

### API Endpoints Tested
- \`POST /api/v1/admin/media/upload\` - Media file upload
- \`GET /api/v1/media\` - Public media browsing
- \`POST /api/v1/albums\` - Album creation
- \`GET /api/v1/media/search\` - Content search
- \`POST /api/v1/admin/media/bulk-create\` - Bulk operations
- \`GET /api/v1/admin/media/statistics\` - System metrics

### Data Scenarios
- Multilingual content (English/Nepali)
- Multiple media types (IMAGE, VIDEO, DOCUMENT)
- Public and authenticated access
- Role-based permissions (ADMIN, EDITOR, VIEWER)
- Search and filtering operations

---

*This documentation was automatically generated from real API interactions and user scenarios.*

Generated on: ${new Date().toISOString()}
`;
  };

  describe('🎬 Media Upload and Organization Stories', () => {
    it('📷 Priya uploads event photos and creates organized albums', async () => {
      console.log('\n🎬 Running Story: Priya Media Upload Journey');
      
      const storyContext = {
        request: request(httpServer),
        testData: {},
        previousSteps: [],
        currentStep: 0
      };

      try {
        const storyResult = await createPriyaMediaUploadStory({ 
          getHttpServer: () => httpServer,
          request: storyContext.request 
        });
        
        storyResults.push(storyResult);
        
        expect(storyResult.success).toBe(true);
        expect(storyResult.story).toBeDefined();
        expect(storyResult.story.persona.name).toBe('Priya Gurung');
        
        console.log(`✅ Priya's story completed successfully in ${(storyResult.story.metadata.duration / 1000).toFixed(2)}s`);
      } catch (error) {
        console.error('❌ Priya\'s story failed:', error.message);
        storyResults.push({ success: false, errors: [error.message] });
        throw error;
      }
    }, 60000);

    it('🎬 Arjun performs bulk media operations and system management', async () => {
      console.log('\n🎬 Running Story: Arjun Bulk Operations Journey');
      
      const storyContext = {
        request: request(httpServer),
        testData: {},
        previousSteps: [],
        currentStep: 0
      };

      try {
        const storyResult = await createArjunBulkOperationsStory({ 
          getHttpServer: () => httpServer,
          request: storyContext.request 
        });
        
        storyResults.push(storyResult);
        
        expect(storyResult.success).toBe(true);
        expect(storyResult.story).toBeDefined();
        expect(storyResult.story.persona.name).toBe('Arjun Pandey');
        
        console.log(`✅ Arjun's story completed successfully in ${(storyResult.story.metadata.duration / 1000).toFixed(2)}s`);
      } catch (error) {
        console.error('❌ Arjun\'s story failed:', error.message);
        storyResults.push({ success: false, errors: [error.message] });
        throw error;
      }
    }, 60000);
  });

  describe('🌐 Public Media Access Stories', () => {
    it('👩🏽‍💼 Rita browses public media content as a citizen', async () => {
      console.log('\n🎬 Running Story: Rita Public Access Journey');
      
      // First, ensure there's some media content for Rita to view
      await setupPublicMediaContent();
      
      const storyContext = {
        request: request(httpServer),
        testData: {},
        previousSteps: [],
        currentStep: 0
      };

      try {
        const storyResult = await createRitaPublicAccessStory({ 
          getHttpServer: () => httpServer,
          request: storyContext.request 
        });
        
        storyResults.push(storyResult);
        
        expect(storyResult.success).toBe(true);
        expect(storyResult.story).toBeDefined();
        expect(storyResult.story.persona.name).toBe('Rita Tamang');
        
        console.log(`✅ Rita's story completed successfully in ${(storyResult.story.metadata.duration / 1000).toFixed(2)}s`);
      } catch (error) {
        console.error('❌ Rita\'s story failed:', error.message);
        storyResults.push({ success: false, errors: [error.message] });
        throw error;
      }
    }, 60000);
  });

  const setupPublicMediaContent = async () => {
    try {
      // Create an admin user for setup
      const adminUser = await createTestUser(arjunMediaAdmin);
      
      if (adminUser) {
        // Login as admin
        const loginResponse = await request(httpServer)
          .post('/api/v1/auth/login')
          .send({
            email: arjunMediaAdmin.email,
            password: arjunMediaAdmin.password
          });

        const token = loginResponse.body.data?.accessToken;
        
        if (token) {
          // Create a public album
          const albumResponse = await request(httpServer)
            .post('/api/v1/albums')
            .set('Authorization', `Bearer ${token}`)
            .send({
              name: {
                en: 'Public Government Events',
                ne: 'सार्वजनिक सरकारी कार्यक्रमहरू'
              },
              description: {
                en: 'Photos from public government events and programs',
                ne: 'सार्वजनिक सरकारी कार्यक्रम र कार्यक्रमहरूका तस्बिरहरू'
              },
              isActive: true
            });

          console.log('📁 Created public album for Rita\'s story');
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not setup public media content:', error.message);
    }
  };
}); 