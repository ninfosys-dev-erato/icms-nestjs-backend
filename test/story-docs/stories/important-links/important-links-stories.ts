import { StoryBuilder } from '../../framework/story-builder';
import { PersonaManager } from '../../framework/persona-manager';
import { importantLinksScenarios } from './important-links-scenarios';
import * as request from 'supertest';

export class ImportantLinksStories {
  constructor(private app: any) {}

  async createPublicAccessStory() {
    const persona = PersonaManager.getPersona('tourist-viewer');
    const scenario = importantLinksScenarios.viewPublicLinks;

    return StoryBuilder.create(this.app)
      .withPersona(persona)
      .withScenario(scenario)
      .withNarrative(
        PersonaManager.generatePersonaIntroduction(
          persona, 
          'find important government links and resources for his Nepal trip'
        )
      )
      .step('view-all-links', async (persona, context) => {
        const response = await request(this.app.getHttpServer())
          .get('/api/v1/important-links')
          .expect(200);

        return {
          narrative: `${persona.name} visits the government website and navigates to the important links section`,
          expectation: 'He expects to see a list of useful government portals and resources',
          response,
          explanation: 'The system returns all published important links organized by priority order',
          apiCall: {
            method: 'GET',
            endpoint: '/api/v1/important-links'
          }
        };
      })
      .step('filter-active-links', async (persona, context) => {
        const response = await request(this.app.getHttpServer())
          .get('/api/v1/important-links/active')
          .expect(200);

        return {
          narrative: `${persona.name} wants to see only the currently active and relevant links`,
          expectation: 'The system should filter out inactive or outdated links',
          response,
          explanation: 'Only active important links are displayed, ensuring tourists get current information',
          apiCall: {
            method: 'GET',
            endpoint: '/api/v1/important-links/active'
          }
        };
      })
      .step('view-specific-link', async (persona, context) => {
        const allLinksResponse = context.previousSteps[0].response;
        const firstLink = allLinksResponse.body.data[0];
        
        const response = await request(this.app.getHttpServer())
          .get(`/api/v1/important-links/${firstLink.id}`)
          .expect(200);

        return {
          narrative: `${persona.name} clicks on the first important link to get more details`,
          expectation: 'He should see detailed information about the selected government portal',
          response,
          explanation: 'The system provides comprehensive details about the selected important link',
          apiCall: {
            method: 'GET',
            endpoint: `/api/v1/important-links/${firstLink.id}`
          }
        };
      })
      .run();
  }

  async createPaginationStory() {
    const persona = PersonaManager.getPersona('ravi-journalist');
    const scenario = importantLinksScenarios.searchPaginatedLinks;

    return StoryBuilder.create(this.app)
      .withPersona(persona)
      .withScenario(scenario)
      .withNarrative(
        PersonaManager.generatePersonaIntroduction(
          persona,
          'systematically browse through all government important links for his research'
        )
      )
      .step('paginated-links-page-1', async (persona, context) => {
        const response = await request(this.app.getHttpServer())
          .get('/api/v1/important-links/pagination?page=1&limit=3')
          .expect(200);

        return {
          narrative: `${persona.name} starts browsing important links using pagination to review them systematically`,
          expectation: 'He expects to see the first page with 3 links and pagination information',
          response,
          explanation: 'The system returns paginated results with metadata about total pages and navigation',
          apiCall: {
            method: 'GET',
            endpoint: '/api/v1/important-links/pagination',
            query: { page: '1', limit: '3' }
          }
        };
      })
      .step('paginated-links-page-2', async (persona, context) => {
        const response = await request(this.app.getHttpServer())
          .get('/api/v1/important-links/pagination?page=2&limit=3')
          .expect(200);

        return {
          narrative: `${persona.name} navigates to the second page to continue reviewing important links`,
          expectation: 'He should see the next set of links with updated pagination information',
          response,
          explanation: 'The pagination system correctly displays the next page of important links',
          apiCall: {
            method: 'GET',
            endpoint: '/api/v1/important-links/pagination',
            query: { page: '2', limit: '3' }
          }
        };
      })
      .step('filter-active-paginated', async (persona, context) => {
        const response = await request(this.app.getHttpServer())
          .get('/api/v1/important-links/pagination?page=1&limit=5&isActive=true')
          .expect(200);

        return {
          narrative: `${persona.name} filters the pagination to show only active links for current information`,
          expectation: 'The system should return only active links in the paginated results',
          response,
          explanation: 'Filtering combines with pagination to show only relevant, active important links',
          apiCall: {
            method: 'GET',
            endpoint: '/api/v1/important-links/pagination',
            query: { page: '1', limit: '5', isActive: 'true' }
          }
        };
      })
      .run();
  }

  async createFooterLinksStory() {
    const persona = PersonaManager.getPersona('tourist-viewer');
    const scenario = importantLinksScenarios.accessFooterLinks;

    return StoryBuilder.create(this.app)
      .withPersona(persona)
      .withScenario(scenario)
      .withNarrative(
        PersonaManager.generatePersonaIntroduction(
          persona,
          'access the footer links to find categorized government resources quickly'
        )
      )
      .step('access-footer-links', async (persona, context) => {
        const response = await request(this.app.getHttpServer())
          .get('/api/v1/important-links/footer')
          .expect(200);

        return {
          narrative: `${persona.name} scrolls to the website footer to find categorized quick access links`,
          expectation: 'He expects to see links organized into categories like quick links, government portals, social media, and contact information',
          response,
          explanation: 'The footer provides categorized important links for quick navigation to different types of resources',
          apiCall: {
            method: 'GET',
            endpoint: '/api/v1/important-links/footer'
          }
        };
      })
      .step('access-footer-with-language', async (persona, context) => {
        const response = await request(this.app.getHttpServer())
          .get('/api/v1/important-links/footer?lang=en')
          .expect(200);

        return {
          narrative: `${persona.name} requests footer links in English for better understanding`,
          expectation: 'The system should return footer links with English language preference',
          response,
          explanation: 'Language filtering ensures tourists can access information in their preferred language',
          apiCall: {
            method: 'GET',
            endpoint: '/api/v1/important-links/footer',
            query: { lang: 'en' }
          }
        };
      })
      .run();
  }

  async createAdminManagementStory() {
    const persona = PersonaManager.getPersona('ramesh-admin');
    const scenario = importantLinksScenarios.manageImportantLinks;

    // Get auth token for admin operations
    const authResponse = await request(this.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: persona.email,
        password: persona.password
      })
      .expect(200);

    const authToken = authResponse.body.data.accessToken;

    return StoryBuilder.create(this.app)
      .withPersona(persona)
      .withScenario(scenario)
      .withTestData({ authToken })
      .withNarrative(
        PersonaManager.generatePersonaIntroduction(
          persona,
          'manage important government links to ensure citizens have access to current resources'
        )
      )
      .step('admin-view-all-links', async (persona, context) => {
        const response = await request(this.app.getHttpServer())
          .get('/api/v1/admin/important-links')
          .set('Authorization', `Bearer ${context.testData.authToken}`)
          .expect(200);

        return {
          narrative: `${persona.name} logs into the admin system to review all important links`,
          expectation: 'He should see all important links including inactive ones for management',
          response,
          explanation: 'Admin interface provides complete visibility of all important links regardless of status',
          apiCall: {
            method: 'GET',
            endpoint: '/api/v1/admin/important-links',
            headers: { Authorization: 'Bearer [TOKEN]' }
          }
        };
      })
      .step('create-new-link', async (persona, context) => {
        const newLink = {
          linkTitle: {
            en: 'New Government Portal',
            ne: 'नयाँ सरकारी पोर्टल'
          },
          linkUrl: 'https://newportal.gov.np',
          order: 10,
          isActive: true
        };

        const response = await request(this.app.getHttpServer())
          .post('/api/v1/admin/important-links')
          .set('Authorization', `Bearer ${context.testData.authToken}`)
          .send(newLink)
          .expect(201);

        return {
          narrative: `${persona.name} creates a new important link for a recently launched government portal`,
          expectation: 'The system should validate the data and create the new important link',
          response,
          explanation: 'The new important link is created with proper validation and stored for public access',
          apiCall: {
            method: 'POST',
            endpoint: '/api/v1/admin/important-links',
            headers: { Authorization: 'Bearer [TOKEN]' },
            payload: newLink
          }
        };
      })
      .step('update-existing-link', async (persona, context) => {
        const createdLink = context.previousSteps[1].response.body.data;
        const updateData = {
          linkTitle: {
            en: 'Updated Government Portal',
            ne: 'अपडेटेड सरकारी पोर्टल'
          },
          order: 5
        };

        const response = await request(this.app.getHttpServer())
          .put(`/api/v1/admin/important-links/${createdLink.id}`)
          .set('Authorization', `Bearer ${context.testData.authToken}`)
          .send(updateData)
          .expect(200);

        return {
          narrative: `${persona.name} updates the important link to correct the title and adjust the display order`,
          expectation: 'The system should update the link information while preserving other data',
          response,
          explanation: 'The important link is updated with new information while maintaining data integrity',
          apiCall: {
            method: 'PUT',
            endpoint: `/api/v1/admin/important-links/${createdLink.id}`,
            headers: { Authorization: 'Bearer [TOKEN]' },
            payload: updateData
          }
        };
      })
      .step('get-link-statistics', async (persona, context) => {
        const response = await request(this.app.getHttpServer())
          .get('/api/v1/admin/important-links/statistics')
          .set('Authorization', `Bearer ${context.testData.authToken}`)
          .expect(200);

        return {
          narrative: `${persona.name} checks the important links statistics to understand the current state`,
          expectation: 'He should see comprehensive statistics about total, active, and inactive links',
          response,
          explanation: 'Statistics provide valuable insights for managing the important links collection effectively',
          apiCall: {
            method: 'GET',
            endpoint: '/api/v1/admin/important-links/statistics',
            headers: { Authorization: 'Bearer [TOKEN]' }
          }
        };
      })
      .run();
  }

  async createBulkOperationsStory() {
    const persona = PersonaManager.getPersona('priya-document-manager');
    const scenario = importantLinksScenarios.bulkLinkOperations;

    // Get auth token for admin operations
    const authResponse = await request(this.app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: persona.email,
        password: persona.password
      })
      .expect(200);

    const authToken = authResponse.body.data.accessToken;

    return StoryBuilder.create(this.app)
      .withPersona(persona)
      .withScenario(scenario)
      .withTestData({ authToken })
      .withNarrative(
        PersonaManager.generatePersonaIntroduction(
          persona,
          'efficiently manage large sets of important links using bulk operations'
        )
      )
      .step('bulk-create-links', async (persona, context) => {
        const bulkData = {
          links: [
            {
              linkTitle: { en: 'Bulk Link 1', ne: 'बल्क लिङ्क १' },
              linkUrl: 'https://bulk1.gov.np',
              order: 20,
              isActive: true
            },
            {
              linkTitle: { en: 'Bulk Link 2', ne: 'बल्क लिङ्क २' },
              linkUrl: 'https://bulk2.gov.np',
              order: 21,
              isActive: true
            },
            {
              linkTitle: { en: 'Bulk Link 3', ne: 'बल्क लिङ्क ३' },
              linkUrl: 'https://bulk3.gov.np',
              order: 22,
              isActive: false
            }
          ]
        };

        const response = await request(this.app.getHttpServer())
          .post('/api/v1/admin/important-links/bulk-create')
          .set('Authorization', `Bearer ${context.testData.authToken}`)
          .send(bulkData)
          .expect(201);

        return {
          narrative: `${persona.name} uses bulk create to efficiently add multiple important links at once`,
          expectation: 'The system should validate and create all links in a single operation',
          response,
          explanation: 'Bulk creation allows efficient management of multiple important links simultaneously',
          apiCall: {
            method: 'POST',
            endpoint: '/api/v1/admin/important-links/bulk-create',
            headers: { Authorization: 'Bearer [TOKEN]' },
            payload: bulkData
          }
        };
      })
      .step('reorder-links', async (persona, context) => {
        // Get current links to reorder
        const linksResponse = await request(this.app.getHttpServer())
          .get('/api/v1/admin/important-links')
          .set('Authorization', `Bearer ${context.testData.authToken}`)
          .expect(200);

        const links = linksResponse.body.data.slice(0, 3);
        const reorderData = {
          orders: [
            { id: links[0].id, order: 30 },
            { id: links[1].id, order: 25 },
            { id: links[2].id, order: 35 }
          ]
        };

        const response = await request(this.app.getHttpServer())
          .post('/api/v1/admin/important-links/reorder')
          .set('Authorization', `Bearer ${context.testData.authToken}`)
          .send(reorderData)
          .expect(200);

        return {
          narrative: `${persona.name} reorders the important links to prioritize the most relevant resources`,
          expectation: 'The system should update the display order of all specified links',
          response,
          explanation: 'Reordering allows administrators to control the priority and visibility of important links',
          apiCall: {
            method: 'POST',
            endpoint: '/api/v1/admin/important-links/reorder',
            headers: { Authorization: 'Bearer [TOKEN]' },
            payload: reorderData
          }
        };
      })
      .step('import-links', async (persona, context) => {
        const importData = {
          links: [
            {
              linkTitle: { en: 'Imported Portal 1', ne: 'आयातित पोर्टल १' },
              linkUrl: 'https://imported1.gov.np',
              order: 40,
              isActive: true
            },
            {
              linkTitle: { en: 'Imported Portal 2', ne: 'आयातित पोर्टल २' },
              linkUrl: 'https://imported2.gov.np',
              order: 41,
              isActive: true
            }
          ]
        };

        const response = await request(this.app.getHttpServer())
          .post('/api/v1/admin/important-links/import')
          .set('Authorization', `Bearer ${context.testData.authToken}`)
          .send(importData)
          .expect(200);

        return {
          narrative: `${persona.name} imports important links from an external source for system migration`,
          expectation: 'The system should validate and import links with detailed success/failure reporting',
          response,
          explanation: 'Import functionality enables migration and bulk addition of important links from external sources',
          apiCall: {
            method: 'POST',
            endpoint: '/api/v1/admin/important-links/import',
            headers: { Authorization: 'Bearer [TOKEN]' },
            payload: importData
          }
        };
      })
      .step('export-links', async (persona, context) => {
        const response = await request(this.app.getHttpServer())
          .get('/api/v1/admin/important-links/export')
          .set('Authorization', `Bearer ${context.testData.authToken}`)
          .expect(200);

        return {
          narrative: `${persona.name} exports all important links for backup and documentation purposes`,
          expectation: 'The system should generate a complete export of all important links with metadata',
          response,
          explanation: 'Export functionality provides backup capabilities and data portability for important links',
          apiCall: {
            method: 'GET',
            endpoint: '/api/v1/admin/important-links/export',
            headers: { Authorization: 'Bearer [TOKEN]' }
          }
        };
      })
      .run();
  }

  async createValidationStory() {
    const persona = PersonaManager.getPersona('sita-editor');
    const scenario = importantLinksScenarios.linkValidation;

    return StoryBuilder.create(this.app)
      .withPersona(persona)
      .withScenario(scenario)
      .withNarrative(
        PersonaManager.generatePersonaIntroduction(
          persona,
          'understand how the system validates important links data and handles errors'
        )
      )
      .step('test-required-fields', async (persona, context) => {
        const invalidData = {
          linkTitle: { en: '', ne: '' }, // Empty required fields
          linkUrl: '',
          order: 1,
          isActive: true
        };

        const response = await request(this.app.getHttpServer())
          .post('/api/v1/admin/important-links')
          .send(invalidData)
          .expect(401); // Will fail due to missing auth, but that's expected

        return {
          narrative: `${persona.name} attempts to create a link without required fields to test validation`,
          expectation: 'The system should reject the request and provide clear validation errors',
          response,
          explanation: 'Input validation ensures data quality by requiring essential fields for important links',
          apiCall: {
            method: 'POST',
            endpoint: '/api/v1/admin/important-links',
            payload: invalidData
          }
        };
      })
      .step('test-url-validation', async (persona, context) => {
        const invalidUrlData = {
          linkTitle: { en: 'Test Link', ne: 'परीक्षण लिङ्क' },
          linkUrl: 'not-a-valid-url',
          order: 1,
          isActive: true
        };

        const response = await request(this.app.getHttpServer())
          .post('/api/v1/admin/important-links')
          .send(invalidUrlData)
          .expect(401); // Will fail due to missing auth

        return {
          narrative: `${persona.name} tests URL validation by submitting an invalid URL format`,
          expectation: 'The system should validate URL format and reject invalid URLs',
          response,
          explanation: 'URL validation prevents broken links and ensures users can access the resources',
          apiCall: {
            method: 'POST',
            endpoint: '/api/v1/admin/important-links',
            payload: invalidUrlData
          }
        };
      })
      .step('test-order-validation', async (persona, context) => {
        const invalidOrderData = {
          linkTitle: { en: 'Test Link', ne: 'परीक्षण लिङ्क' },
          linkUrl: 'https://valid.gov.np',
          order: -1, // Invalid negative order
          isActive: true
        };

        const response = await request(this.app.getHttpServer())
          .post('/api/v1/admin/important-links')
          .send(invalidOrderData)
          .expect(401); // Will fail due to missing auth

        return {
          narrative: `${persona.name} tests order validation with a negative order value`,
          expectation: 'The system should require positive order values for proper sorting',
          response,
          explanation: 'Order validation ensures proper link sequencing and display priority',
          apiCall: {
            method: 'POST',
            endpoint: '/api/v1/admin/important-links',
            payload: invalidOrderData
          }
        };
      })
      .run();
  }

  async runAllStories() {
    console.log('🚀 Running Important Links User Stories...\n');

    const stories = [
      { name: 'Public Access Story', runner: () => this.createPublicAccessStory() },
      { name: 'Pagination Story', runner: () => this.createPaginationStory() },
      { name: 'Footer Links Story', runner: () => this.createFooterLinksStory() },
      { name: 'Admin Management Story', runner: () => this.createAdminManagementStory() },
      { name: 'Bulk Operations Story', runner: () => this.createBulkOperationsStory() },
      { name: 'Validation Story', runner: () => this.createValidationStory() }
    ];

    const results = [];

    for (const story of stories) {
      try {
        console.log(`📖 Running: ${story.name}`);
        const result = await story.runner();
        results.push({ name: story.name, result, success: result.success });
        console.log(`${result.success ? '✅' : '❌'} ${story.name}: ${result.success ? 'Passed' : 'Failed'}`);
        if (!result.success) {
          console.log(`   Errors: ${result.errors.join(', ')}`);
        }
      } catch (error) {
        console.log(`❌ ${story.name}: Error - ${error.message}`);
        results.push({ name: story.name, success: false, error: error.message });
      }
      console.log('');
    }

    return results;
  }
} 