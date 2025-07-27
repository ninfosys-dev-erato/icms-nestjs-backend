import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';

// Story framework imports
import { StoryBuilder } from '../../story-docs/framework/story-builder';
import { mayaContentManager } from '../../story-docs/personas/maya-content-manager';
import { sitaEditor } from '../../story-docs/personas/sita-editor';
import { raviJournalist } from '../../story-docs/personas/ravi-journalist';
import { contentManagementScenarios } from '../../story-docs/stories/content-management/content-scenarios';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('Content Management API Stories 📚', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    app.setGlobalPrefix('api/v1');

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up database before tests
    await cleanupDatabase();
    
    // Create output directory for generated documentation
    mkdirSync(join(__dirname, '../../story-docs/output/content-management'), { recursive: true });
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase();
  });

  const cleanupDatabase = async () => {
    const tables = [
      'content_attachments',
      'contents',
      'categories',
      'user_sessions',
      'login_attempts',
      'audit_logs',
      'users',
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  };

  describe('🏗️ Maya\'s Content Organization Journey', () => {
    it('📖 Maya creates and manages content categories', async () => {
      const story = await StoryBuilder.create(app)
        .withPersona(mayaContentManager)
        .withScenario(contentManagementScenarios.categoryManagement)
        .withNarrative(`
          Maya Adhikari arrives at her office Monday morning with a big task ahead. 
          The government has announced new policy initiatives, and she needs to 
          reorganize the website's content structure to accommodate the new information.
          
          As the content manager, Maya knows that good categorization is the 
          foundation of an effective government website. Citizens need to find 
          information quickly, and journalists need clear organization to access 
          public documents efficiently.
        `)
        .step('register-content-manager', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
              email: persona.email,
              password: persona.password,
              confirmPassword: persona.password,
              firstName: 'Maya',
              lastName: 'Adhikari',
              role: 'ADMIN'
            });

          return {
            narrative: "Maya sets up her content manager account in the system",
            expectation: "The system should create her admin account with full content management access",
            response,
            explanation: "Content managers need admin privileges to create and organize categories"
          };
        })
        .step('login-content-manager', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Maya logs into the content management system",
            expectation: "Successful authentication with content management privileges",
            response,
            explanation: "Authentication provides the necessary tokens for content management operations"
          };
        })
        .step('create-main-category', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({
              name: {
                en: 'Policy Announcements',
                ne: 'नीति घोषणाहरू'
              },
              description: {
                en: 'Government policy announcements and updates',
                ne: 'सरकारी नीति घोषणाहरू र अद्यावधिकहरू'
              },
              slug: 'policy-announcements',
              isActive: true
            });

          return {
            narrative: "Maya creates the main 'Policy Announcements' category for the new content structure",
            expectation: "The system should create the category with bilingual support",
            response,
            explanation: "Categories form the backbone of content organization and support both English and Nepali"
          };
        })
        .step('create-subcategory', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          const parentCategoryId = context.previousSteps[2].response.body.data.id;
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({
              name: {
                en: 'Economic Policies',
                ne: 'आर्थिक नीतिहरू'
              },
              description: {
                en: 'Economic and financial policy announcements',
                ne: 'आर्थिक र वित्तीय नीति घोषणाहरू'
              },
              slug: 'economic-policies',
              parentId: parentCategoryId,
              isActive: true
            });

          return {
            narrative: "Maya creates a subcategory for 'Economic Policies' under the main category",
            expectation: "The system should create a nested category structure",
            response,
            explanation: "Hierarchical categories help organize content more granularly for better navigation"
          };
        })
        .step('check-category-statistics', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/categories/statistics')
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Maya reviews the category statistics to understand the current organization",
            expectation: "The system should show metrics about categories and their usage",
            response,
            explanation: "Statistics help content managers understand how their categorization strategy is working"
          };
        })
        .run();

      expect(story.success).toBe(true);
      expect(story.errors).toHaveLength(0);

      const outputPath = join(__dirname, '../../story-docs/output/content-management/maya-category-management.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
      
      console.log(`📝 Story documentation generated: ${outputPath}`);
    });
  });

  describe('✍️ Sita\'s Content Creation Journey', () => {
    it('📖 Sita creates content with attachments and publishes it', async () => {
      // First set up the category structure
      const setupResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: mayaContentManager.email,
          password: mayaContentManager.password,
          confirmPassword: mayaContentManager.password,
          firstName: 'Maya',
          lastName: 'Adhikari',
          role: 'ADMIN'
        });
      
      const setupLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: mayaContentManager.email,
          password: mayaContentManager.password,
        });

      const categoryResponse = await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${setupLogin.body.data.accessToken}`)
        .send({
          name: { en: 'News', ne: 'समाचार' },
          slug: 'news',
          isActive: true
        });

      const story = await StoryBuilder.create(app)
        .withPersona(sitaEditor)
        .withScenario(contentManagementScenarios.contentCreation)
        .withTestData({ categoryId: categoryResponse.body.data.id })
        .withNarrative(`
          Sita Sharma rushes into the office at 8:15 AM with urgent news to publish. 
          The Chief Minister has just announced a new infrastructure development 
          project, and she needs to get this information on the government website 
          immediately to inform the public.
          
          She has the official press release, some photos from the announcement 
          ceremony, and a detailed project document that needs to be attached 
          for public download. Time is critical - news outlets are waiting 
          for the official government statement.
        `)
        .step('editor-login', async (persona) => {
          // First register the editor
          await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
              email: persona.email,
              password: persona.password,
              confirmPassword: persona.password,
              firstName: 'Sita',
              lastName: 'Sharma',
              role: 'EDITOR'
            });

          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Sita quickly logs into the content management system",
            expectation: "Fast authentication to start publishing urgent content",
            response,
            explanation: "Editors need quick access during time-sensitive publishing situations"
          };
        })
        .step('create-content-draft', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/content')
            .set('Authorization', `Bearer ${token}`)
            .send({
              title: {
                en: 'New Infrastructure Development Project Announced',
                ne: 'नयाँ पूर्वाधार विकास परियोजना घोषणा'
              },
              content: {
                en: 'The Chief Minister announced a major infrastructure development project that will improve transportation and connectivity across the region.',
                ne: 'मुख्यमन्त्रीले एक प्रमुख पूर्वाधार विकास परियोजनाको घोषणा गर्नुभयो जसले यस क्षेत्रमा यातायात र जडानमा सुधार ल्याउनेछ।'
              },
              excerpt: {
                en: 'Major infrastructure project announced by Chief Minister',
                ne: 'मुख्यमन्त्रीद्वारा प्रमुख पूर्वाधार परियोजना घोषणा'
              },
              categoryId: context.testData.categoryId,
              status: 'DRAFT',
              slug: 'infrastructure-project-announcement'
            });

          return {
            narrative: "Sita creates a draft of the infrastructure announcement with bilingual content",
            expectation: "The system should create a draft that can be reviewed before publishing",
            response,
            explanation: "Draft status allows editors to prepare content carefully before making it public"
          };
        })
        .step('add-document-attachment', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          const contentId = context.previousSteps[1].response.body.data.id;
          const testFile = Buffer.from('Infrastructure Project Details - Official Government Document\n\nProject Timeline: 2024-2027\nBudget: NPR 50 Million\nExpected Benefits: Improved road connectivity for 10,000 residents');
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/attachments')
            .set('Authorization', `Bearer ${token}`)
            .attach('file', testFile, 'infrastructure-project-details.txt')
            .field('contentId', contentId);

          return {
            narrative: "Sita uploads the detailed project document as an attachment",
            expectation: "The document should be securely attached and available for download",
            response,
            explanation: "Attachments provide citizens with detailed information beyond the main announcement"
          };
        })
        .step('publish-content', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          const contentId = context.previousSteps[1].response.body.data.id;
          
          const response = await request(app.getHttpServer())
            .post(`/api/v1/admin/content/${contentId}/publish`)
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Sita publishes the announcement to make it immediately available to the public",
            expectation: "The content should go live with all attachments accessible",
            response,
            explanation: "Publishing makes government information immediately accessible to citizens and media"
          };
        })
        .run();

      expect(story.success).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/content-management/sita-content-creation.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  describe('📰 Ravi\'s Information Discovery Journey', () => {
    it('📖 Ravi searches for and downloads government documents', async () => {
      // Setup: Create published content with attachments
      const setupAdmin = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: mayaContentManager.email,
          password: mayaContentManager.password,
          confirmPassword: mayaContentManager.password,
          firstName: 'Maya',
          lastName: 'Adhikari',
          role: 'ADMIN'
        });
      
      const adminLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: mayaContentManager.email,
          password: mayaContentManager.password,
        });

      // Create category and content for testing
      const category = await request(app.getHttpServer())
        .post('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminLogin.body.data.accessToken}`)
        .send({
          name: { en: 'Public Documents', ne: 'सार्वजनिक कागजातहरू' },
          slug: 'public-documents',
          isActive: true
        });

      const content = await request(app.getHttpServer())
        .post('/api/v1/admin/content')
        .set('Authorization', `Bearer ${adminLogin.body.data.accessToken}`)
        .send({
          title: { en: 'Budget Allocation Report 2024', ne: 'बजेट बाँडफाँड प्रतिवेदन २०२४' },
          content: { en: 'Annual budget allocation report', ne: 'वार्षिक बजेट बाँडफाँड प्रतिवेदन' },
          categoryId: category.body.data.id,
          status: 'PUBLISHED',
          slug: 'budget-report-2024',
          featured: true
        });

      const attachment = await request(app.getHttpServer())
        .post('/api/v1/attachments')
        .set('Authorization', `Bearer ${adminLogin.body.data.accessToken}`)
        .attach('file', Buffer.from('Budget Report Content'), 'budget-report-2024.pdf')
        .field('contentId', content.body.data.id);

      const story = await StoryBuilder.create(app)
        .withPersona(raviJournalist)
        .withScenario(contentManagementScenarios.contentDiscovery)
        .withNarrative(`
          Ravi Thapa is working on an investigative story about government 
          budget allocations. He's heard about a new budget report and needs 
          to access the official document to verify the information for his article.
          
          As an investigative journalist, Ravi knows the importance of using 
          official government sources. He needs to find the budget report 
          quickly and download the detailed document to analyze the allocations 
          for his story deadline.
        `)
        .step('search-content', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/content/search?search=budget');

          return {
            narrative: "Ravi searches for 'budget' to find the latest budget-related documents",
            expectation: "The search should return relevant government budget documents",
            response,
            explanation: "Search functionality helps journalists quickly find specific government information"
          };
        })
        .step('browse-by-category', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/content/category/public-documents');

          return {
            narrative: "Ravi browses the Public Documents category to see all available official documents",
            expectation: "The category should list all published documents in that section",
            response,
            explanation: "Category browsing provides systematic access to government information"
          };
        })
        .step('access-document-details', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/content/budget-report-2024');

          return {
            narrative: "Ravi accesses the specific budget report to read the details and see available attachments",
            expectation: "The system should show the full document with download links",
            response,
            explanation: "Detailed content view provides complete information including attachments"
          };
        })
        .step('get-attachments', async (persona) => {
          const response = await request(app.getHttpServer())
            .get(`/api/v1/content/${content.body.data.id}/attachments`);

          return {
            narrative: "Ravi checks what attachments are available for download",
            expectation: "The system should list all downloadable files associated with the document",
            response,
            explanation: "Attachment listings help users understand what additional documents are available"
          };
        })
        .run();

      expect(story.success).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/content-management/ravi-content-discovery.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  // Generate comprehensive documentation after all tests
  afterAll(async () => {
    if (app) {
      console.log('\n📚 Generating comprehensive content management documentation...');
      
      const overviewContent = `# 📝 Content Management API - User Journey Documentation

Generated from real API tests on ${new Date().toISOString()}

## 📖 About This Documentation

This documentation shows how the Content Management API works through real user stories. Each story follows a government employee or citizen as they work with content, categories, and attachments.

### Content Management Stories:
- 🏗️ [Maya's Category Management](./maya-category-management.md)
- ✍️ [Sita's Content Creation](./sita-content-creation.md)
- 📰 [Ravi's Content Discovery](./ravi-content-discovery.md)

## 🎭 Meet Our Content Management Users

### 👩🏽‍💼 Maya Adhikari - Content Manager
A 38-year-old content manager responsible for organizing and structuring all government website content.

### 👩🏽‍💻 Sita Sharma - Content Editor  
A 32-year-old communications officer who creates and publishes government announcements and documents.

### 👨🏽‍💻 Ravi Thapa - Investigative Journalist
A 29-year-old journalist who regularly accesses government documents for investigative reporting.

## 🔧 API Capabilities Demonstrated

- **Category Management**: Creating hierarchical content organization
- **Content Creation**: Bilingual content with rich media support
- **Attachment Handling**: File uploads and download management
- **Publishing Workflow**: Draft to published content lifecycle
- **Search & Discovery**: Finding content through various methods
- **Access Control**: Role-based permissions for different user types

---

*This documentation is automatically generated from actual API tests. Every request and response shown here represents real system behavior.*`;

      const overviewPath = join(__dirname, '../../story-docs/output/content-management/README.md');
      writeFileSync(overviewPath, overviewContent);
      
      console.log(`✅ Content management documentation overview generated: ${overviewPath}`);
      console.log('\n🎉 Content management story documentation is ready!');
      console.log('📁 Check the test/story-docs/output/content-management/ directory for all generated files.');
    }
  });
}); 