import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';
import { TestUtils, TestUser } from '../../test-utils';
import { StoryBuilder } from '../../story-docs/framework/story-builder';
import { PersonaManager } from '../../story-docs/framework/persona-manager';
import { MarkdownGenerator } from '../../story-docs/framework/markdown-generator';
import { headerConfigurationScenarios } from '../../story-docs/stories/header/header-scenarios';
import { HeaderAlignment } from '@/modules/header/dto/header.dto';

// Import personas
import { rameshAdmin } from '../../story-docs/personas/ramesh-admin';
import { mayaContentManager } from '../../story-docs/personas/maya-content-manager';
import { touristViewer } from '../../story-docs/personas/tourist-viewer';

describe('Header Configuration Stories (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let storyBuilder: StoryBuilder;
  let markdownGenerator: MarkdownGenerator;
  let storyResults: any[] = [];

  beforeAll(async () => {
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

    storyBuilder = StoryBuilder.create(app);
    markdownGenerator = new MarkdownGenerator();
    
    // Register personas
    PersonaManager.addPersona(rameshAdmin);
    PersonaManager.addPersona(mayaContentManager);
    PersonaManager.addPersona(touristViewer);

    console.log('🏗️ Starting Header Module Story Documentation Generation...');
  });

  afterAll(async () => {
    await TestUtils.cleanupDatabase(prisma);
    await generateStoryDocumentation();
    await app.close();
  });

  beforeEach(async () => {
    await TestUtils.cleanupDatabase(prisma);
  });

  const generateStoryDocumentation = async () => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const outputDir = path.join(__dirname, '../../story-docs/output/header');
      
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
      const overview = generateHeaderModuleDocumentation();
      fs.writeFileSync(path.join(outputDir, 'README.md'), overview);
      
      console.log('\n📚 Header Module Story Documentation Generated!');
      console.log(`📁 Location: ${outputDir}/README.md`);
      
    } catch (error) {
      console.error('❌ Error generating documentation:', error.message);
    }
  };

  const generateHeaderModuleDocumentation = () => {
    const totalStories = storyResults.length;
    const successfulStories = storyResults.filter(result => result.success).length;
    const failedStories = totalStories - successfulStories;

    return `# Header Module Stories Documentation

## 📋 Overview

This documentation covers comprehensive user stories for the Header Module of the Government Content Management System. These stories demonstrate real-world scenarios involving header configuration, branding setup, logo management, and public header display.

## 👥 Personas Involved

### 🏛️ Ramesh Shrestha - System Administrator
**Role**: ADMIN | **Technical Level**: ADVANCED | **Age**: 42

Experienced system administrator responsible for website configuration, header branding, and visual identity management for government websites.

## 🎬 Story Execution Results

### Summary
- **Total Stories**: ${totalStories}
- **Successful**: ${successfulStories}
- **Failed**: ${failedStories}
- **Success Rate**: ${totalStories > 0 ? ((successfulStories / totalStories) * 100).toFixed(1) : 0}%

---

*This documentation was automatically generated from real API interactions and user scenarios.*

Generated on: ${new Date().toISOString()}
`;
  };

  describe('Header Management Stories', () => {
    it('should tell the story: Set Up Basic Header Configuration', async () => {
      const persona = PersonaManager.getPersona('ramesh-admin');
      const scenario = headerConfigurationScenarios.headerBasicSetup;

      const result = await storyBuilder
        .withPersona(persona)
        .withScenario(scenario)
        .withNarrative(`
          ${persona.name} arrives at the office on Monday morning with a clear task: 
          the government website needs a professional header configuration. The 
          website currently has a basic default header, but the office director 
          has requested a more polished look that reflects the government's branding.
          
          As the senior administrator, ${persona.name} knows that a well-designed 
          header is crucial for public trust and professional appearance. He 
          prepares to configure typography, layout, and basic branding elements.
        `)
        .withTestData({
          headerName: 'Official Government Header',
          fontFamily: 'Arial, sans-serif',
          fontSize: 18,
          backgroundColor: '#003366',
          textColor: '#ffffff'
        })
        
        .step('get-auth-token', async (persona, context) => {
          const testUser = await TestUtils.createTestUser(prisma, {
            email: persona.email,
            password: persona.password,
            firstName: 'Ramesh',
            lastName: 'Kumar',
            role: 'ADMIN',
          });

          context.testData.authToken = testUser.accessToken;
          context.testData.userId = testUser.id;

          return {
            narrative: `${persona.name} logs into the header management system`,
            expectation: 'System should authenticate and provide access to header configuration',
            response: { status: 200, body: { success: true, token: testUser.accessToken } },
            explanation: 'Authentication successful, admin can now manage header configurations'
          };
        })

        .step('create-basic-header', async (persona, context) => {
          const headerData = {
            name: {
              en: context.testData.headerName,
              ne: 'आधिकारिक सरकारी हेडर',
            },
            order: 1,
            isActive: true,
            isPublished: false,
            typography: {
              fontFamily: context.testData.fontFamily,
              fontSize: context.testData.fontSize,
              fontWeight: 'normal',
              color: context.testData.textColor,
              lineHeight: 1.5,
              letterSpacing: 0.5,
            },
            alignment: HeaderAlignment.LEFT,
            logo: {
              leftLogo: null,
              rightLogo: null,
              logoAlignment: 'left',
              logoSpacing: 20,
            },
            layout: {
              headerHeight: 80,
              backgroundColor: context.testData.backgroundColor,
              borderColor: '#e0e0e0',
              borderWidth: 1,
              padding: { top: 10, right: 20, bottom: 10, left: 20 },
              margin: { top: 0, right: 0, bottom: 0, left: 0 },
            },
          };

          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/header-configs')
            .set('Authorization', `Bearer ${context.testData.authToken}`)
            .send(headerData);

          context.testData.headerId = response.body.data?.id;

          return {
            narrative: `${persona.name} creates a basic header configuration with government branding`,
            expectation: 'Header configuration should be created successfully with proper typography and colors',
            response: response,
            explanation: 'Header configuration created with official government styling including proper colors and typography'
          };
        })

        .step('verify-header-creation', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get(`/api/v1/admin/header-configs/${context.testData.headerId}`)
            .set('Authorization', `Bearer ${context.testData.authToken}`);

          return {
            narrative: `${persona.name} verifies the header configuration was saved correctly`,
            expectation: 'System should return the header configuration with all the specified settings',
            response: response,
            explanation: 'Header configuration verification confirms all settings were saved properly'
          };
        })

        .step('preview-header-css', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get(`/api/v1/admin/header-configs/${context.testData.headerId}/css`)
            .set('Authorization', `Bearer ${context.testData.authToken}`);

          return {
            narrative: `${persona.name} generates CSS preview to see how the header will look`,
            expectation: 'System should generate valid CSS with the configured typography and layout',
            response: response,
            explanation: 'CSS generation shows proper styling rules for the header configuration'
          };
        })

        .run();

      storyResults.push(result);
      
      expect(result.success).toBe(true);
      console.log(`✅ Basic header configuration story completed successfully`);
    });

    it('should tell the story: Manage Header Logos and Branding', async () => {
      const persona = PersonaManager.getPersona('maya-content-manager');
      const scenario = headerConfigurationScenarios.logoManagement;

      const result = await storyBuilder
        .withPersona(persona)
        .withScenario(scenario)
        .withNarrative(`
          ${persona.name} has been tasked with adding the official government logos 
          to the website header. The ministry has provided both the national emblem 
          and the department logo that need to be positioned correctly in the header.
          
          As an experienced content manager, she understands the importance of 
          proper logo placement and alignment for official government websites. 
          The logos must be positioned according to government branding guidelines.
        `)
        .withTestData({
          leftLogoUrl: 'https://example.gov.np/logos/national-emblem.png',
          rightLogoUrl: 'https://example.gov.np/logos/department-logo.png',
          logoSpacing: 25
        })

        .step('setup-authentication', async (persona, context) => {
          const testUser = await TestUtils.createTestUser(prisma, {
            email: persona.email,
            password: persona.password,
            firstName: 'Maya',
            lastName: 'Adhikari',
            role: 'ADMIN',
          });

          context.testData.authToken = testUser.accessToken;
          context.testData.userId = testUser.id;

          return {
            narrative: `${persona.name} accesses the header management system`,
            expectation: 'System should authenticate the content manager successfully',
            response: { status: 200, body: { success: true, token: testUser.accessToken } },
            explanation: 'Content manager authenticated with proper administrative access'
          };
        })

        .step('create-header-for-logos', async (persona, context) => {
          const headerData = {
            name: {
              en: 'Government Header with Logos',
              ne: 'लोगो सहित सरकारी हेडर',
            },
            order: 1,
            isActive: true,
            isPublished: false,
            typography: {
              fontFamily: 'Arial, sans-serif',
              fontSize: 16,
              fontWeight: 'normal',
              color: '#333333',
              lineHeight: 1.5,
              letterSpacing: 0.5,
            },
            alignment: HeaderAlignment.CENTER,
            logo: {
              leftLogo: {
                mediaId: 'media_national_emblem_123',
                altText: {
                  en: 'National Emblem',
                  ne: 'राष्ट्रिय चिन्ह'
                },
                width: 60,
                height: 60
              },
              rightLogo: {
                mediaId: 'media_department_logo_456',
                altText: {
                  en: 'Department Logo',
                  ne: 'विभागको लोगो'
                },
                width: 80,
                height: 40
              },
              logoAlignment: 'center',
              logoSpacing: context.testData.logoSpacing,
            },
            layout: {
              headerHeight: 100,
              backgroundColor: '#ffffff',
              borderColor: '#cccccc',
              borderWidth: 2,
              padding: { top: 15, right: 25, bottom: 15, left: 25 },
              margin: { top: 0, right: 0, bottom: 0, left: 0 },
            },
          };

          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/header-configs')
            .set('Authorization', `Bearer ${context.testData.authToken}`)
            .send(headerData);

          context.testData.headerId = response.body.data?.id;

          return {
            narrative: `${persona.name} creates a header configuration with both government logos`,
            expectation: 'Header should be created with properly configured left and right logos',
            response: response,
            explanation: 'Header configuration created with official government logos positioned according to branding guidelines'
          };
        })

        .step('verify-logo-configuration', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get(`/api/v1/admin/header-configs/${context.testData.headerId}`)
            .set('Authorization', `Bearer ${context.testData.authToken}`);

          return {
            narrative: `${persona.name} verifies the logo configuration is correct`,
            expectation: 'System should show both logos with proper URLs, dimensions, and positioning',
            response: response,
            explanation: 'Logo configuration verification confirms proper placement and settings for both government logos'
          };
        })

        .step('generate-logo-css', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get(`/api/v1/admin/header-configs/${context.testData.headerId}/css`)
            .set('Authorization', `Bearer ${context.testData.authToken}`);

          return {
            narrative: `${persona.name} generates CSS to see how the logos will be positioned`,
            expectation: 'CSS should include proper logo positioning and spacing rules',
            response: response,
            explanation: 'Generated CSS includes proper logo positioning rules for both left and right logos'
          };
        })

        .run();

      storyResults.push(result);
      
      expect(result.success).toBe(true);
      console.log(`✅ Header logos and branding story completed successfully`);
    });

    it('should tell the story: Complete Header Publishing Workflow', async () => {
      const persona = PersonaManager.getPersona('ramesh-admin');
      const scenario = headerConfigurationScenarios.headerPublishingWorkflow;

      const result = await storyBuilder
        .withPersona(persona)
        .withScenario(scenario)
        .withNarrative(`
          ${persona.name} has completed the header configuration and now needs to 
          take it through the full publishing workflow. The header has been designed, 
          logos have been added, and typography has been perfected. 
          
          Now it's time to test everything, get approval, and make it live for 
          citizens to see. This is a critical moment as the header will represent 
          the government's digital presence.
        `)

        .step('setup-admin-access', async (persona, context) => {
          const testUser = await TestUtils.createTestUser(prisma, {
            email: persona.email,
            password: persona.password,
            firstName: 'Ramesh',
            lastName: 'Kumar',
            role: 'ADMIN',
          });

          context.testData.authToken = testUser.accessToken;
          context.testData.userId = testUser.id;

          return {
            narrative: `${persona.name} logs in to begin the header publishing workflow`,
            expectation: 'Administrative access should be granted for publishing operations',
            response: { status: 200, body: { success: true, token: testUser.accessToken } },
            explanation: 'Admin authentication successful for publishing workflow'
          };
        })

        .step('create-complete-header', async (persona, context) => {
          const headerData = {
            name: {
              en: 'Final Government Header',
              ne: 'अन्तिम सरकारी हेडर',
            },
            order: 1,
            isActive: true,
            isPublished: false, // Start unpublished
            typography: {
              fontFamily: 'Arial, sans-serif',
              fontSize: 18,
              fontWeight: 'bold',
              color: '#ffffff',
              lineHeight: 1.4,
              letterSpacing: 0.3,
            },
            alignment: HeaderAlignment.CENTER,
            logo: {
              leftLogo: {
                mediaId: 'media_government_emblem_789',
                altText: {
                  en: 'Government Emblem',
                  ne: 'सरकारी प्रतीक'
                },
                width: 50,
                height: 50
              },
              rightLogo: {
                mediaId: 'media_ministry_logo_101',
                altText: {
                  en: 'Ministry Logo',
                  ne: 'मन्त्रालयको लोगो'
                },
                width: 70,
                height: 35
              },
              logoAlignment: 'center',
              logoSpacing: 30,
            },
            layout: {
              headerHeight: 90,
              backgroundColor: '#1a365d',
              borderColor: '#2d5a87',
              borderWidth: 2,
              padding: { top: 12, right: 25, bottom: 12, left: 25 },
              margin: { top: 0, right: 0, bottom: 0, left: 0 },
            },
          };

          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/header-configs')
            .set('Authorization', `Bearer ${context.testData.authToken}`)
            .send(headerData);

          context.testData.headerId = response.body.data?.id;

          return {
            narrative: `${persona.name} creates the final header configuration ready for publishing`,
            expectation: 'Complete header configuration should be created in draft mode',
            response: response,
            explanation: 'Final header configuration created with all elements - typography, logos, and layout'
          };
        })

        .step('preview-before-publishing', async (persona, context) => {
          const previewData = {
            name: {
              en: 'Final Government Header',
              ne: 'अन्तिम सरकारी हेडर',
            },
            typography: {
              fontFamily: 'Arial, sans-serif',
              fontSize: 18,
              fontWeight: 'bold',
              color: '#ffffff',
              lineHeight: 1.4,
              letterSpacing: 0.3,
            },
            alignment: HeaderAlignment.CENTER,
            logo: {
              leftLogo: {
                mediaId: 'media_government_emblem_789',
                altText: {
                  en: 'Government Emblem',
                  ne: 'सरकारी प्रतीक'
                },
                width: 50,
                height: 50
              },
              rightLogo: {
                mediaId: 'media_ministry_logo_101',
                altText: {
                  en: 'Ministry Logo',
                  ne: 'मन्त्रालयको लोगो'
                },
                width: 70,
                height: 35
              },
              logoAlignment: 'center',
              logoSpacing: 30,
            },
            layout: {
              headerHeight: 90,
              backgroundColor: '#1a365d',
              borderColor: '#2d5a87',
              borderWidth: 2,
              padding: { top: 12, right: 25, bottom: 12, left: 25 },
              margin: { top: 0, right: 0, bottom: 0, left: 0 },
            },
          };

          const response = await request(app.getHttpServer())
            .post('/api/v1/header-configs/preview')
            .send(previewData);

          return {
            narrative: `${persona.name} previews the header to ensure everything looks perfect`,
            expectation: 'Preview should generate proper HTML and CSS for review',
            response: response,
            explanation: 'Header preview generated successfully showing final appearance with all styling'
          };
        })

        .step('publish-header', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .post(`/api/v1/admin/header-configs/${context.testData.headerId}/publish`)
            .set('Authorization', `Bearer ${context.testData.authToken}`);

          return {
            narrative: `${persona.name} publishes the header configuration to make it live`,
            expectation: 'Header should be successfully published and available to the public',
            response: response,
            explanation: 'Header configuration published successfully and is now live for all website visitors'
          };
        })

        .step('verify-public-access', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/header-configs/display/active');

          return {
            narrative: `${persona.name} verifies the header is now visible to the public`,
            expectation: 'Public endpoint should return the active published header configuration',
            response: response,
            explanation: 'Public verification confirms the header is live and accessible to all website visitors'
          };
        })

        .run();

      expect(result.success).toBe(true);
      console.log('\n📝 Story Documentation Generated:');
      console.log(result.generatedDocs.markdown);
    });
  });

  describe('Public Access Stories', () => {
    it('should tell the story: View Published Header on Public Website', async () => {
      const persona = PersonaManager.getPersona('tourist-viewer');
      const scenario = headerConfigurationScenarios.publicHeaderDisplay;

      const result = await storyBuilder
        .withPersona(persona)
        .withScenario(scenario)
        .withNarrative(`
          ${persona.name} is planning his trek to Nepal and needs to access the 
          government website for permit information. As he opens the website, 
          the first thing he notices is the professional header with government 
          logos and clean typography.
          
          The header's design immediately conveys credibility and professionalism, 
          making him confident that this is an official government resource. 
          The clear layout helps him navigate the site effectively.
        `)

        .step('setup-published-header', async (persona, context) => {
          // Create admin user to set up the header
          const adminUser = await TestUtils.createTestUser(prisma, {
            email: 'admin@icms.gov.np',
            password: 'AdminPass123!',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
          });

          // Create and publish a header configuration
          const headerData = {
            name: {
              en: 'Official Government Portal Header',
              ne: 'आधिकारिक सरकारी पोर्टल हेडर',
            },
            order: 1,
            isActive: true,
            isPublished: true,
            typography: {
              fontFamily: 'Arial, sans-serif',
              fontSize: 16,
              fontWeight: 'normal',
              color: '#ffffff',
              lineHeight: 1.5,
              letterSpacing: 0.3,
            },
            alignment: HeaderAlignment.CENTER,
            logo: {
              leftLogo: {
                mediaId: 'media_nepal_emblem_555',
                altText: {
                  en: 'Nepal Government Emblem',
                  ne: 'नेपाल सरकारको प्रतीक'
                },
                width: 45,
                height: 45
              },
              rightLogo: null,
              logoAlignment: 'left',
              logoSpacing: 20,
            },
            layout: {
              headerHeight: 80,
              backgroundColor: '#2c5282',
              borderColor: '#4a90b8',
              borderWidth: 1,
              padding: { top: 10, right: 20, bottom: 10, left: 20 },
              margin: { top: 0, right: 0, bottom: 0, left: 0 },
            },
          };

          const createResponse = await request(app.getHttpServer())
            .post('/api/v1/admin/header-configs')
            .set('Authorization', `Bearer ${adminUser.accessToken}`)
            .send(headerData);

          context.testData.headerId = createResponse.body.data?.id;

          return {
            narrative: 'Administrative setup: A published header configuration is prepared for public viewing',
            expectation: 'Header configuration should be created and published successfully',
            response: createResponse,
            explanation: 'Professional government header configured with official branding and typography'
          };
        })

        .step('tourist-views-public-headers', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/header-configs');

          return {
            narrative: `${persona.name} visits the government website and loads the header configurations`,
            expectation: 'Website should display the published header configurations for public viewing',
            response: response,
            explanation: 'Tourist successfully accesses the government website header information'
          };
        })

        .step('tourist-sees-active-header', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/header-configs/display/active');

          return {
            narrative: `${persona.name} sees the active header with government branding and logos`,
            expectation: 'The active header should display with professional government styling',
            response: response,
            explanation: 'The active government header displays properly with official branding, instilling confidence'
          };
        })

        .step('tourist-gets-header-styling', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get(`/api/v1/header-configs/${context.testData.headerId}/css`);

          return {
            narrative: `${persona.name}'s browser loads the header CSS styling for proper display`,
            expectation: 'CSS should load properly to render the header with correct styling',
            response: response,
            explanation: 'Header CSS loads successfully, ensuring the website displays with professional government styling'
          };
        })

        .run();

      storyResults.push(result);
      
      expect(result.success).toBe(true);
      console.log(`✅ Public header display story completed successfully`);
    });
  });

  describe('Management and Analytics Stories', () => {
    it('should tell the story: Analyze Header Configuration Statistics', async () => {
      const persona = PersonaManager.getPersona('maya-content-manager');
      const scenario = headerConfigurationScenarios.headerAnalyticsAndStatistics;

      const result = await storyBuilder
        .withPersona(persona)
        .withScenario(scenario)
        .withNarrative(`
          ${persona.name} needs to prepare a monthly report on the website's 
          header configurations. The ministry wants to understand how many 
          header configurations exist, which ones are active, and overall 
          usage patterns.
          
          As the content manager, she regularly reviews these statistics to 
          ensure the website maintains consistent branding and to identify 
          any configurations that need updates or cleanup.
        `)

        .step('authenticate-content-manager', async (persona, context) => {
          const testUser = await TestUtils.createTestUser(prisma, {
            email: persona.email,
            password: persona.password,
            firstName: 'Maya',
            lastName: 'Adhikari',
            role: 'ADMIN',
          });

          context.testData.authToken = testUser.accessToken;
          context.testData.userId = testUser.id;

          return {
            narrative: `${persona.name} logs in to access header configuration analytics`,
            expectation: 'System should authenticate and provide access to administrative statistics',
            response: { status: 200, body: { success: true, token: testUser.accessToken } },
            explanation: 'Content manager authenticated successfully with analytics access'
          };
        })

        .step('create-sample-headers', async (persona, context) => {
          // Create multiple header configurations for analytics
          const headers = [
            {
              name: { en: 'Main Header', ne: 'मुख्य हेडर' },
              isActive: true,
              isPublished: true,
              alignment: HeaderAlignment.LEFT
            },
            {
              name: { en: 'Event Header', ne: 'घटना हेडर' },
              isActive: true,
              isPublished: false,
              alignment: HeaderAlignment.CENTER
            },
            {
              name: { en: 'Archive Header', ne: 'संग्रह हेडर' },
              isActive: false,
              isPublished: false,
              alignment: HeaderAlignment.RIGHT
            }
          ];

          for (const headerConfig of headers) {
            const headerData = {
              name: headerConfig.name,
              order: 1,
              isActive: headerConfig.isActive,
              isPublished: headerConfig.isPublished,
              typography: {
                fontFamily: 'Arial, sans-serif',
                fontSize: 16,
                fontWeight: 'normal',
                color: '#333333',
                lineHeight: 1.5,
                letterSpacing: 0.5,
              },
              alignment: headerConfig.alignment,
              logo: {
                leftLogo: null,
                rightLogo: null,
                logoAlignment: 'left',
                logoSpacing: 20,
              },
              layout: {
                headerHeight: 80,
                backgroundColor: '#ffffff',
                padding: { top: 10, right: 20, bottom: 10, left: 20 },
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
              },
            };

            await request(app.getHttpServer())
              .post('/api/v1/admin/header-configs')
              .set('Authorization', `Bearer ${context.testData.authToken}`)
              .send(headerData);
          }

          return {
            narrative: `${persona.name} reviews the existing header configurations in the system`,
            expectation: 'Multiple header configurations should exist for statistical analysis',
            response: { status: 200, body: { message: 'Sample headers created' } },
            explanation: 'Sample header configurations created to demonstrate analytics capabilities'
          };
        })

        .step('view-header-statistics', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/header-configs/statistics')
            .set('Authorization', `Bearer ${context.testData.authToken}`);

          return {
            narrative: `${persona.name} accesses the header configuration statistics dashboard`,
            expectation: 'System should provide comprehensive statistics about header configurations',
            response: response,
            explanation: 'Statistics show total configurations, active/inactive breakdown, and usage patterns'
          };
        })

        .step('view-all-headers', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/header-configs')
            .set('Authorization', `Bearer ${context.testData.authToken}`);

          return {
            narrative: `${persona.name} reviews the complete list of header configurations`,
            expectation: 'All header configurations should be listed with their current status',
            response: response,
            explanation: 'Complete header configuration list shows status, alignment, and configuration details'
          };
        })

        .step('search-headers', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/header-configs/search?q=Main')
            .set('Authorization', `Bearer ${context.testData.authToken}`);

          return {
            narrative: `${persona.name} searches for specific header configurations`,
            expectation: 'Search should return relevant header configurations based on name',
            response: response,
            explanation: 'Search functionality helps content manager find specific header configurations efficiently'
          };
        })

        .run();

      storyResults.push(result);
      
      expect(result.success).toBe(true);
      console.log(`✅ Header analytics and statistics story completed successfully`);
    });
  });
}); 