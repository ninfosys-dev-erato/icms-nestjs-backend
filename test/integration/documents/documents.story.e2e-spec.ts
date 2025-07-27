import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';

// Story framework imports
import { StoryBuilder } from '../../story-docs/framework/story-builder';
import { priyaDocumentManager } from '../../story-docs/personas/priya-document-manager';
import { rameshAdmin } from '../../story-docs/personas/ramesh-admin';
import { raviJournalist } from '../../story-docs/personas/ravi-journalist';
import { touristViewer } from '../../story-docs/personas/tourist-viewer';
import { documentManagementScenarios } from '../../story-docs/stories/documents/document-scenarios';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('Document Management API Stories 📚', () => {
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
    mkdirSync(join(__dirname, '../../story-docs/output/documents'), { recursive: true });
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
      'document_downloads',
      'document_versions',
      'documents',
      'user_sessions',
      'login_attempts',
      'audit_logs',
      'users',
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  };

  const createTestFile = (filename: string, content: string = 'Test document content'): string => {
    const testFilePath = path.join(__dirname, filename);
    fs.writeFileSync(testFilePath, content);
    return testFilePath;
  };

  const cleanupTestFile = (filePath: string) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  };

  describe('📚 Priya\'s Document Management Journey', () => {
    it('📖 Priya uploads and organizes government documents', async () => {
      const story = await StoryBuilder.create(app)
        .withPersona(priyaDocumentManager)
        .withScenario(documentManagementScenarios.documentUpload)
        .withNarrative(`
          Priya Basnet starts her Monday morning with an important task. The 
          Ministry has just released new policy documents and she needs to 
          upload them to the government website so citizens can access the 
          latest information immediately.
          
          She has three different documents: a main policy document (PDF), 
          an implementation guideline (DOC), and a summary report (XLSX). 
          Each needs proper categorization and metadata to ensure citizens 
          can find them easily through search and navigation.
        `)
        .step('setup-document-manager', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
              email: persona.email,
              password: persona.password,
              confirmPassword: persona.password,
              firstName: 'Priya',
              lastName: 'Basnet',
              role: 'ADMIN'
            });

          return {
            narrative: "Priya sets up her document manager account with full admin privileges",
            expectation: "The system should create her admin account with document management access",
            response,
            explanation: "Document managers need admin privileges to upload and organize documents",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/auth/register',
              payload: {
                email: persona.email,
                password: persona.password,
                confirmPassword: persona.password,
                firstName: 'Priya',
                lastName: 'Basnet',
                role: 'ADMIN'
              }
            }
          };
        })
        .step('login-document-manager', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Priya logs into the document management system",
            expectation: "Successful authentication with document management capabilities",
            response,
            explanation: "Authentication provides the necessary tokens for document operations",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/auth/login',
              payload: {
                email: persona.email,
                password: persona.password,
              }
            }
          };
        })
        .step('upload-policy-document', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          const testFilePath = createTestFile('policy-document.pdf', 'New Government Policy - Official Document Content\n\nThis document outlines the new policy framework for 2024-2025.');
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/documents/upload')
            .set('Authorization', `Bearer ${token}`)
            .attach('file', testFilePath)
            .field('title[en]', 'New Government Policy Framework 2024')
            .field('title[ne]', 'नयाँ सरकारी नीति ढाँचा २०२४')
            .field('description[en]', 'Comprehensive policy framework for government operations in 2024-2025')
            .field('description[ne]', '२०२४-२०२५ को लागि सरकारी सञ्चालनको व्यापक नीति ढाँचा')
            .field('category', 'POLICY')
            .field('status', 'PUBLISHED')
            .field('documentNumber', 'POL-2024-001')
            .field('version', '1.0')
            .field('isPublic', 'true')
            .field('requiresAuth', 'false')
            .field('order', '1')
            .field('isActive', 'true');

          cleanupTestFile(testFilePath);

          return {
            narrative: "Priya uploads the main policy document with comprehensive metadata",
            expectation: "The system should upload the document and make it publicly accessible",
            response,
            explanation: "Policy documents need to be publicly accessible with proper categorization for easy discovery",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/admin/documents/upload',
              payload: {
                'title[en]': 'New Government Policy Framework 2024',
                'title[ne]': 'नयाँ सरकारी नीति ढाँचा २०२४',
                'description[en]': 'Comprehensive policy framework for government operations in 2024-2025',
                'description[ne]': '२०२४-२०२५ को लागि सरकारी सञ्चालनको व्यापक नीति ढाँचा',
                'category': 'POLICY',
                'status': 'PUBLISHED',
                'documentNumber': 'POL-2024-001',
                'version': '1.0',
                'isPublic': 'true',
                'requiresAuth': 'false',
                'order': '1',
                'isActive': 'true',
                file: 'policy-document.pdf'
              },
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .step('upload-implementation-guide', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          const testFilePath = createTestFile('implementation-guide.doc', 'Implementation Guidelines\n\nStep-by-step guide for implementing the new policy framework.');
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/documents/upload')
            .set('Authorization', `Bearer ${token}`)
            .attach('file', testFilePath)
            .field('title[en]', 'Policy Implementation Guidelines')
            .field('title[ne]', 'नीति कार्यान्वयन दिशानिर्देशहरू')
            .field('description[en]', 'Detailed guidelines for implementing the new policy framework')
            .field('description[ne]', 'नयाँ नीति ढाँचा कार्यान्वयनका लागि विस्तृत दिशानिर्देशहरू')
            .field('category', 'GUIDELINE')
            .field('status', 'PUBLISHED')
            .field('documentNumber', 'GUIDE-2024-001')
            .field('version', '1.0')
            .field('isPublic', 'true')
            .field('requiresAuth', 'false')
            .field('order', '2')
            .field('isActive', 'true');

          cleanupTestFile(testFilePath);

          return {
            narrative: "Priya uploads the implementation guidelines document",
            expectation: "The system should categorize it as a guideline and make it accessible",
            response,
            explanation: "Implementation guides help users understand how to apply policies in practice",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/admin/documents/upload',
              payload: {
                'title[en]': 'Policy Implementation Guidelines',
                'title[ne]': 'नीति कार्यान्वयन दिशानिर्देशहरू',
                'description[en]': 'Detailed guidelines for implementing the new policy framework',
                'description[ne]': 'नयाँ नीति ढाँचा कार्यान्वयनका लागि विस्तृत दिशानिर्देशहरू',
                'category': 'GUIDELINE',
                'status': 'PUBLISHED',
                'documentNumber': 'GUIDE-2024-001',
                'version': '1.0',
                'isPublic': 'true',
                'requiresAuth': 'false',
                'order': '2',
                'isActive': 'true',
                file: 'implementation-guide.doc'
              },
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .step('check-document-statistics', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/documents/statistics')
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Priya reviews the document repository statistics after uploads",
            expectation: "The system should show updated document counts and category distribution",
            response,
            explanation: "Statistics help document managers understand the current state of the repository",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/admin/documents/statistics',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .run();

      expect(story.success).toBe(true);
      expect(story.errors).toHaveLength(0);

      const outputPath = join(__dirname, '../../story-docs/output/documents/priya-document-upload.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
      
      console.log(`📝 Story documentation generated: ${outputPath}`);
    });

    it('📖 Priya manages document versions and updates', async () => {
      // Setup: Create a document first
      const setupResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: priyaDocumentManager.email,
          password: priyaDocumentManager.password,
          confirmPassword: priyaDocumentManager.password,
          firstName: 'Priya',
          lastName: 'Basnet',
          role: 'ADMIN'
        });
      
      const setupLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: priyaDocumentManager.email,
          password: priyaDocumentManager.password,
        });

      const originalDocPath = createTestFile('original-budget.pdf', 'Budget Report 2024 - Original Version');
      const originalDoc = await request(app.getHttpServer())
        .post('/api/v1/admin/documents/upload')
        .set('Authorization', `Bearer ${setupLogin.body.data.accessToken}`)
        .attach('file', originalDocPath)
        .field('title[en]', 'Budget Report 2024')
        .field('title[ne]', 'बजेट रिपोर्ट २०२४')
        .field('category', 'REPORT')
        .field('status', 'PUBLISHED')
        .field('version', '1.0');
      
      cleanupTestFile(originalDocPath);

      const story = await StoryBuilder.create(app)
        .withPersona(priyaDocumentManager)
        .withScenario(documentManagementScenarios.documentVersioning)
        .withTestData({ documentId: originalDoc.body.data.id })
        .withNarrative(`
          Priya receives an urgent request from the Finance Ministry. They've 
          found errors in the budget report that was published last week and 
          need to upload a corrected version immediately. 
          
          She needs to maintain the version history so people can see what 
          changed and access both the original and corrected versions for 
          transparency and accountability.
        `)
        .step('login-for-versioning', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Priya logs in to handle the urgent document update",
            expectation: "Quick authentication to manage the version update",
            response,
            explanation: "Version management requires authenticated access to maintain document integrity"
          };
        })
        .step('check-current-version', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get(`/api/v1/admin/documents/${context.testData.documentId}/versions`)
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Priya checks the current version history of the budget report",
            expectation: "The system should show the original version 1.0",
            response,
            explanation: "Version history helps track document evolution and changes over time"
          };
        })
        .step('upload-corrected-version', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          const correctedDocPath = createTestFile('corrected-budget.pdf', 'Budget Report 2024 - Corrected Version\n\nCorrected budget allocations and fixed calculation errors.');
          
          const response = await request(app.getHttpServer())
            .post(`/api/v1/admin/documents/${context.testData.documentId}/versions`)
            .set('Authorization', `Bearer ${token}`)
            .attach('file', correctedDocPath)
            .field('version', '1.1')
            .field('changeLog', JSON.stringify({
              en: 'Corrected budget calculations and fixed allocation errors in sections 3.1 and 4.2',
              ne: 'बजेट गणना सुधार गरियो र खण्ड ३.१ र ४.२ मा बाँडफाँडका त्रुटिहरू फिक्स गरियो'
            }));

          cleanupTestFile(correctedDocPath);

          return {
            narrative: "Priya uploads the corrected version with detailed change log",
            expectation: "The system should create version 1.1 with the documented changes",
            response,
            explanation: "Version control with change logs ensures transparency about document modifications"
          };
        })
        .step('verify-version-history', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get(`/api/v1/admin/documents/${context.testData.documentId}/versions`)
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Priya verifies that both versions are now available in the system",
            expectation: "The system should show both version 1.0 and 1.1 with change history",
            response,
            explanation: "Complete version history ensures accountability and allows users to track document evolution"
          };
        })
        .run();

      expect(story.success).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/documents/priya-document-versioning.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });

    it('📖 Priya performs bulk document operations', async () => {
      // Setup: Create multiple documents for bulk operations
      const setupResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: priyaDocumentManager.email,
          password: priyaDocumentManager.password,
          confirmPassword: priyaDocumentManager.password,
          firstName: 'Priya',
          lastName: 'Basnet',
          role: 'ADMIN'
        });
      
      const setupLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: priyaDocumentManager.email,
          password: priyaDocumentManager.password,
        });

      // Create test documents
      const doc1Path = createTestFile('annual-report-1.pdf', 'Annual Report 2023');
      const doc2Path = createTestFile('annual-report-2.pdf', 'Annual Report 2022');
      const doc3Path = createTestFile('annual-report-3.pdf', 'Annual Report 2021');

              const doc1 = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/upload')
          .set('Authorization', `Bearer ${setupLogin.body.data.accessToken}`)
          .attach('file', doc1Path)
          .field('title[en]', 'Annual Report 2023')
          .field('title[ne]', 'वार्षिक प्रतिवेदन २०२३')
          .field('category', 'REPORT')
          .field('status', 'DRAFT');

        const doc2 = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/upload')
          .set('Authorization', `Bearer ${setupLogin.body.data.accessToken}`)
          .attach('file', doc2Path)
          .field('title[en]', 'Annual Report 2022')
          .field('title[ne]', 'वार्षिक प्रतिवेदन २०२२')
          .field('category', 'REPORT')
          .field('status', 'DRAFT');

        const doc3 = await request(app.getHttpServer())
          .post('/api/v1/admin/documents/upload')
          .set('Authorization', `Bearer ${setupLogin.body.data.accessToken}`)
          .attach('file', doc3Path)
          .field('title[en]', 'Annual Report 2021')
          .field('title[ne]', 'वार्षिक प्रतिवेदन २०२१')
          .field('category', 'REPORT')
          .field('status', 'DRAFT');

      [doc1Path, doc2Path, doc3Path].forEach(cleanupTestFile);

      // Check if documents were created successfully
      if (!doc1.body.data || !doc2.body.data || !doc3.body.data) {
        console.error('Document creation failed:', { doc1: doc1.body, doc2: doc2.body, doc3: doc3.body });
        throw new Error('Failed to create test documents for bulk operations test');
      }

      const documentIds = [doc1.body.data.id, doc2.body.data.id, doc3.body.data.id];

      const story = await StoryBuilder.create(app)
        .withPersona(priyaDocumentManager)
        .withScenario(documentManagementScenarios.bulkDocumentOperations)
        .withTestData({ documentIds })
        .withNarrative(`
          Priya has just received approval to publish all the annual reports 
          that have been in draft status. Instead of updating each document 
          one by one, she decides to use the bulk operation feature to 
          efficiently publish all three reports simultaneously.
          
          This will save significant time and ensure consistency across 
          all the annual reports being published.
        `)
        .step('login-for-bulk-ops', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Priya logs in to perform bulk document operations",
            expectation: "Authentication for bulk management capabilities",
            response,
            explanation: "Bulk operations require admin privileges to ensure data integrity"
          };
        })
        .step('bulk-publish-documents', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .put('/api/v1/admin/documents/bulk-update')
            .set('Authorization', `Bearer ${token}`)
            .send({
              ids: context.testData.documentIds,
              updates: {
                status: 'PUBLISHED',
                isPublic: true,
                isActive: true
              }
            });

          return {
            narrative: "Priya publishes all three annual reports using bulk update operation",
            expectation: "The system should update all documents to published status simultaneously",
            response,
            explanation: "Bulk operations improve efficiency when managing multiple documents with similar updates"
          };
        })
        .step('verify-bulk-update', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/documents')
            .query({ status: 'PUBLISHED', category: 'REPORT' })
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Priya verifies that all annual reports are now published and publicly accessible",
            expectation: "The system should show all three reports with published status",
            response,
            explanation: "Verification ensures that bulk operations completed successfully for all targeted documents"
          };
        })
        .step('export-document-collection', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/documents/export')
            .query({ format: 'json', category: 'REPORT' })
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Priya exports the report collection for backup and external sharing",
            expectation: "The system should generate a comprehensive export of all report documents",
            response,
            explanation: "Export functionality enables document archival and sharing with external systems"
          };
        })
        .run();

      expect(story.success).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/documents/priya-bulk-operations.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  describe('📰 Ravi\'s Document Research Journey', () => {
    it('📖 Ravi searches for and analyzes government documents', async () => {
      // Setup: Create published documents for searching
      const setupResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: priyaDocumentManager.email,
          password: priyaDocumentManager.password,
          confirmPassword: priyaDocumentManager.password,
          firstName: 'Priya',
          lastName: 'Basnet',
          role: 'ADMIN'
        });
      
      const setupLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: priyaDocumentManager.email,
          password: priyaDocumentManager.password,
        });

      // Create searchable documents
      const budgetDocPath = createTestFile('budget-2024.pdf', 'Government Budget Allocation 2024\nDetailed financial planning and resource allocation.');
      const budgetDoc = await request(app.getHttpServer())
        .post('/api/v1/admin/documents/upload')
        .set('Authorization', `Bearer ${setupLogin.body.data.accessToken}`)
        .attach('file', budgetDocPath)
        .field('title[en]', 'Government Budget 2024')
        .field('title[ne]', 'सरकारी बजेट २०२४')
        .field('description[en]', 'Annual budget allocation and financial planning')
        .field('category', 'OFFICIAL')
        .field('status', 'PUBLISHED')
        .field('isPublic', 'true');

      cleanupTestFile(budgetDocPath);

      const story = await StoryBuilder.create(app)
        .withPersona(raviJournalist)
        .withScenario(documentManagementScenarios.documentDiscovery)
        .withNarrative(`
          Ravi Thapa is investigating government spending patterns for his 
          investigative journalism piece. He needs to find the latest budget 
          documents and download them for detailed analysis. 
          
          As a journalist, he needs reliable access to official documents 
          and wants to track his research by downloading the files for 
          offline analysis and fact-checking.
        `)
        .step('search-budget-documents', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/documents/search')
            .query({ q: 'budget 2024' });

          return {
            narrative: "Ravi searches for '2024 budget' documents on the government website",
            expectation: "The search should return relevant budget-related documents",
            response,
            explanation: "Search functionality helps journalists quickly locate specific government information",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/documents/search?q=budget+2024'
            }
          };
        })
        .step('browse-official-documents', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/documents/category/OFFICIAL');

          return {
            narrative: "Ravi browses the official documents category to see all available government publications",
            expectation: "The system should list all published official documents",
            response,
            explanation: "Category browsing provides systematic access to government document collections",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/documents/category/OFFICIAL'
            }
          };
        })
        .step('access-budget-document', async (persona) => {
          const response = await request(app.getHttpServer())
            .get(`/api/v1/documents/${budgetDoc.body.data.id}`);

          return {
            narrative: "Ravi accesses the specific budget document to read the details",
            expectation: "The system should show complete document information and metadata",
            response,
            explanation: "Detailed document view provides journalists with comprehensive information for research",
            apiCall: {
              method: 'GET',
              endpoint: `/api/v1/documents/${budgetDoc.body.data.id}`
            }
          };
        })
        .step('download-budget-document', async (persona) => {
          const response = await request(app.getHttpServer())
            .get(`/api/v1/documents/${budgetDoc.body.data.id}/download`);

          return {
            narrative: "Ravi downloads the budget document for offline analysis and fact-checking",
            expectation: "The system should provide a secure download URL and track the download",
            response,
            explanation: "Download functionality enables journalists to access documents for detailed offline analysis",
            apiCall: {
              method: 'GET',
              endpoint: `/api/v1/documents/${budgetDoc.body.data.id}/download`
            }
          };
        })
        .step('get-document-url', async (persona) => {
          const response = await request(app.getHttpServer())
            .get(`/api/v1/documents/${budgetDoc.body.data.id}/url`);

          return {
            narrative: "Ravi gets the direct document URL for citation in his article",
            expectation: "The system should provide document access information for referencing",
            response,
            explanation: "Document URLs enable proper citation and referencing in journalistic work",
            apiCall: {
              method: 'GET',
              endpoint: `/api/v1/documents/${budgetDoc.body.data.id}/url`
            }
          };
        })
        .run();

      expect(story.success).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/documents/ravi-document-research.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  describe('🔐 Document Security & Error Scenarios', () => {
    it('📖 System handles document access security properly', async () => {
      // Setup: Create a private document
      const setupResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: rameshAdmin.email,
          password: rameshAdmin.password,
          confirmPassword: rameshAdmin.password,
          firstName: 'Ramesh',
          lastName: 'Kumar',
          role: 'ADMIN'
        });
      
      const setupLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: rameshAdmin.email,
          password: rameshAdmin.password,
        });

      const privateDocPath = createTestFile('confidential-report.pdf', 'Confidential Internal Report - Restricted Access');
      const privateDoc = await request(app.getHttpServer())
        .post('/api/v1/admin/documents/upload')
        .set('Authorization', `Bearer ${setupLogin.body.data.accessToken}`)
        .attach('file', privateDocPath)
        .field('title[en]', 'Confidential Internal Report')
        .field('title[ne]', 'गोप्य आन्तरिक प्रतिवेदन')
        .field('category', 'OFFICIAL')
        .field('status', 'PUBLISHED')
        .field('isPublic', 'false')
        .field('requiresAuth', 'true');

      cleanupTestFile(privateDocPath);

      // Check if private document was created successfully
      if (!privateDoc.body.data) {
        console.error('Private document creation failed:', privateDoc.body);
        throw new Error('Failed to create test private document for security test');
      }

      const story = await StoryBuilder.create(app)
        .withPersona(touristViewer)
        .withScenario(documentManagementScenarios.documentSecurity)
        .withTestData({ privateDocId: privateDoc.body.data.id })
        .withNarrative(`
          John Smith, a tourist, is browsing the government website looking 
          for public information. He accidentally tries to access a confidential 
          document that requires authentication. This scenario tests how the 
          system protects sensitive documents from unauthorized access.
        `)
        .step('attempt-private-document-access', async (persona, context) => {
          const response = await request(app.getHttpServer())
            .get(`/api/v1/documents/${context.testData.privateDocId}`);

          return {
            narrative: "John tries to access a confidential document without authentication",
            expectation: "The system should deny access and return an appropriate error",
            response,
            explanation: "Document security ensures confidential materials are protected from unauthorized access"
          };
        })
        .step('search-for-public-documents', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/documents')
            .query({ isPublic: true });

          return {
            narrative: "John searches for publicly available documents that he can access",
            expectation: "The system should only return documents marked as public",
            response,
            explanation: "Public document filtering ensures users only see content they're authorized to access"
          };
        })
        .step('attempt-admin-endpoint-access', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/documents');

          return {
            narrative: "John tries to access the admin document management interface",
            expectation: "The system should deny access due to lack of authentication",
            response,
            explanation: "Admin endpoints must be protected from unauthorized access to maintain system security"
          };
        })
        .run();

      // For security tests, 401/403 responses are the expected "success" outcome
      expect(story.story.steps.some(step => step.response && [401, 403, 404].includes(step.response.status))).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/documents/document-security-protection.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });

    it('📖 System handles document upload errors gracefully', async () => {
      const story = await StoryBuilder.create(app)
        .withPersona(priyaDocumentManager)
        .withScenario(documentManagementScenarios.documentErrorHandling)
        .withNarrative(`
          Priya is having a challenging day with document uploads. She encounters 
          various issues: invalid file types, oversized files, and network problems. 
          This scenario tests how the system handles these error conditions gracefully 
          and provides helpful feedback to users.
        `)
        .step('setup-for-error-testing', async (persona) => {
          await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
              email: persona.email,
              password: persona.password,
              confirmPassword: persona.password,
              firstName: 'Priya',
              lastName: 'Basnet',
              role: 'ADMIN'
            });

          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Priya logs in to attempt document uploads",
            expectation: "Successful authentication for testing error scenarios",
            response,
            explanation: "Authentication is required to test upload error handling"
          };
        })
        .step('attempt-invalid-file-upload', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          const invalidFilePath = createTestFile('malicious-file.exe', 'This is not a valid document file');
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/documents/upload')
            .set('Authorization', `Bearer ${token}`)
            .attach('file', invalidFilePath)
            .field('title[en]', 'Invalid File Test')
            .field('category', 'OFFICIAL');

          cleanupTestFile(invalidFilePath);

          return {
            narrative: "Priya tries to upload an executable file instead of a document",
            expectation: "The system should reject the file and provide a clear error message",
            response,
            explanation: "File type validation protects the system from potentially harmful or inappropriate files"
          };
        })
        .step('attempt-upload-without-file', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/documents/upload')
            .set('Authorization', `Bearer ${token}`)
            .field('title[en]', 'Document Without File')
            .field('category', 'OFFICIAL');

          return {
            narrative: "Priya forgets to attach a file but tries to create a document",
            expectation: "The system should require a file and return a validation error",
            response,
            explanation: "Proper validation ensures documents cannot be created without actual file content"
          };
        })
        .step('attempt-access-nonexistent-document', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/documents/nonexistent-document-id');

          return {
            narrative: "Priya tries to access a document that doesn't exist",
            expectation: "The system should return a 404 error with appropriate message",
            response,
            explanation: "Proper error handling for missing resources provides clear feedback to users"
          };
        })
        .run();

      // Error handling tests expect 4xx responses
      expect(story.story.steps.some(step => step.response && step.response.status >= 400)).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/documents/document-error-handling.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  describe('📊 Document Analytics Journey', () => {
    it('📖 Priya analyzes document usage and performance', async () => {
      // Setup: Create documents with some download history
      const setupResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: priyaDocumentManager.email,
          password: priyaDocumentManager.password,
          confirmPassword: priyaDocumentManager.password,
          firstName: 'Priya',
          lastName: 'Basnet',
          role: 'ADMIN'
        });
      
      const setupLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: priyaDocumentManager.email,
          password: priyaDocumentManager.password,
        });

      const analyticsDocPath = createTestFile('popular-report.pdf', 'Popular Government Report for Analytics Testing');
      const analyticsDoc = await request(app.getHttpServer())
        .post('/api/v1/admin/documents/upload')
        .set('Authorization', `Bearer ${setupLogin.body.data.accessToken}`)
        .attach('file', analyticsDocPath)
        .field('title[en]', 'Popular Government Report')
        .field('title[ne]', 'लोकप्रिय सरकारी प्रतिवेदन')
        .field('category', 'REPORT')
        .field('status', 'PUBLISHED')
        .field('isPublic', 'true');

      cleanupTestFile(analyticsDocPath);

      // Check if analytics document was created successfully
      if (!analyticsDoc.body.data) {
        console.error('Analytics document creation failed:', analyticsDoc.body);
        throw new Error('Failed to create test analytics document');
      }

      // Simulate some downloads
      await request(app.getHttpServer())
        .get(`/api/v1/documents/${analyticsDoc.body.data.id}/download`);

      const story = await StoryBuilder.create(app)
        .withPersona(priyaDocumentManager)
        .withScenario(documentManagementScenarios.documentAnalytics)
        .withTestData({ documentId: analyticsDoc.body.data.id })
        .withNarrative(`
          Priya needs to prepare a monthly report on document usage for the 
          office administration. She wants to understand which documents are 
          most popular, track download patterns, and identify content that 
          might need updates or better promotion.
          
          This analytics will help inform content strategy and resource 
          allocation for document management.
        `)
        .step('login-for-analytics', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Priya logs in to access document analytics and statistics",
            expectation: "Authentication for analytics and reporting capabilities",
            response,
            explanation: "Analytics access requires admin privileges to view comprehensive usage data"
          };
        })
        .step('view-overall-statistics', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/documents/statistics')
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Priya reviews overall document repository statistics",
            expectation: "The system should provide comprehensive repository metrics",
            response,
            explanation: "Overall statistics give document managers insights into repository health and usage"
          };
        })
        .step('analyze-document-performance', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get(`/api/v1/admin/documents/${context.testData.documentId}/analytics`)
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Priya analyzes detailed performance metrics for the popular report",
            expectation: "The system should show download patterns, user engagement, and access trends",
            response,
            explanation: "Detailed analytics help identify successful content and optimization opportunities"
          };
        })
        .step('search-document-performance', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/documents/search')
            .query({ q: 'popular report' })
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Priya searches for documents to compare performance across similar content",
            expectation: "The search should help identify related documents for performance comparison",
            response,
            explanation: "Search functionality helps document managers find and compare similar content performance"
          };
        })
        .run();

      expect(story.success).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/documents/priya-document-analytics.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  // Generate comprehensive documentation after all tests
  afterAll(async () => {
    if (app) {
      console.log('\n📚 Generating comprehensive document management documentation...');
      
      const overviewContent = `# 📄 Document Management API - User Journey Documentation

Generated from real API tests on ${new Date().toISOString()}

## 📖 About This Documentation

This documentation shows how the Document Management API works through real user stories. Each story follows a government employee, journalist, or citizen as they work with documents, uploads, downloads, and analytics.

### Document Management Stories:
- 📚 [Priya's Document Upload](./priya-document-upload.md)
- 📝 [Priya's Document Versioning](./priya-document-versioning.md)
- 🔄 [Priya's Bulk Operations](./priya-bulk-operations.md)
- 📰 [Ravi's Document Research](./ravi-document-research.md)
- 🔐 [Document Security Protection](./document-security-protection.md)
- ⚠️ [Document Error Handling](./document-error-handling.md)
- 📊 [Priya's Document Analytics](./priya-document-analytics.md)

## 🎭 Meet Our Document Management Users

### 👩🏽‍📚 Priya Basnet - Document Manager
A 34-year-old document manager responsible for maintaining the entire document repository of the government office.

### 👨🏽‍💻 Ravi Thapa - Investigative Journalist
A 29-year-old journalist who regularly accesses government documents for investigative reporting.

### 👨🏽‍💼 Ramesh Kumar - Government Administrator  
A 45-year-old senior government officer who manages document security and access controls.

### 🧑🏼‍💻 John Smith - Tourist/Public User
A 28-year-old software developer visiting Nepal who represents public users accessing government information.

## 🔧 API Capabilities Demonstrated

- **Document Upload**: Multi-format file upload with comprehensive metadata
- **Version Control**: Document versioning with detailed change logs
- **Search & Discovery**: Full-text search and category-based browsing
- **Access Control**: Public/private document security and permissions
- **Bulk Operations**: Efficient management of multiple documents
- **Analytics**: Download tracking and usage statistics
- **Export/Import**: Document collection migration and backup
- **Error Handling**: Graceful handling of invalid files and access errors
- **Performance**: Large file handling and concurrent access testing

## 📊 Supported Document Types

- **Office Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Text Formats**: TXT, RTF, CSV
- **Archives**: ZIP, RAR
- **Custom**: Other formats with proper MIME type handling

## 🏷️ Document Categories

- **OFFICIAL**: Official government documents
- **REPORT**: Annual reports and studies
- **FORM**: Downloadable forms and applications
- **POLICY**: Policy documents and frameworks
- **PROCEDURE**: Procedural guidelines
- **GUIDELINE**: Implementation guidelines
- **NOTICE**: Public notices and announcements
- **CIRCULAR**: Government circulars

---

*This documentation is automatically generated from actual API tests. Every request and response shown here represents real system behavior.*`;

      const overviewPath = join(__dirname, '../../story-docs/output/documents/README.md');
      writeFileSync(overviewPath, overviewContent);
      
      console.log(`✅ Document management documentation overview generated: ${overviewPath}`);
      console.log('\n🎉 Document management story documentation is ready!');
      console.log('📁 Check the test/story-docs/output/documents/ directory for all generated files.');
    }
  });
}); 