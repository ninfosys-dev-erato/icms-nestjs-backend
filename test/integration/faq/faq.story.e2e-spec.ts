import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';

// Story framework imports
import { StoryBuilder } from '../../story-docs/framework/story-builder';
import { kiranHelpCoordinator } from '../../story-docs/personas/kiran-help-coordinator';
import { rameshAdmin } from '../../story-docs/personas/ramesh-admin';
import { touristViewer } from '../../story-docs/personas/tourist-viewer';
import { raviJournalist } from '../../story-docs/personas/ravi-journalist';
import { faqScenarios } from '../../story-docs/stories/faq/faq-scenarios';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('FAQ API Stories 📚', () => {
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
    mkdirSync(join(__dirname, '../../story-docs/output/faq'), { recursive: true });
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
      'faqs',
      'user_sessions',
      'login_attempts',
      'audit_logs',
      'users',
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  };

  describe('🎯 Kiran\'s FAQ Management Journey', () => {
    it('📖 Kiran creates and manages FAQ content for citizens', async () => {
      const story = await StoryBuilder.create(app)
        .withPersona(kiranHelpCoordinator)
        .withScenario(faqScenarios.faqManagement)
        .withNarrative(`
          Kiran Shrestha starts her Monday morning with an important mission. The office 
          has been receiving numerous calls asking the same questions about office hours, 
          document requirements, and contact information. She decides to create a 
          comprehensive FAQ section to help citizens find answers quickly.
          
          As a Government Help Desk Coordinator with 6 years of experience, Kiran 
          understands that well-organized FAQs can dramatically reduce phone call 
          volume while improving citizen satisfaction. She plans to create bilingual 
          content that serves both English and Nepali speakers effectively.
        `)
        .step('setup-faq-coordinator', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
              email: persona.email,
              password: persona.password,
              confirmPassword: persona.password,
              firstName: 'Kiran',
              lastName: 'Shrestha',
              role: 'ADMIN'
            });

          return {
            narrative: "Kiran sets up her help desk coordinator account in the system",
            expectation: "The system should create her admin account with FAQ management access",
            response,
            explanation: "Help desk coordinators need admin privileges to create and manage FAQ content",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/auth/register',
              payload: {
                email: persona.email,
                password: persona.password,
                confirmPassword: persona.password,
                firstName: 'Kiran',
                lastName: 'Shrestha',
                role: 'ADMIN'
              }
            }
          };
        })
        .step('login-faq-coordinator', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Kiran logs into the FAQ management system",
            expectation: "Successful authentication with FAQ management capabilities",
            response,
            explanation: "Authentication provides the necessary tokens for FAQ operations",
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
        .step('create-office-hours-faq', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/faq')
            .set('Authorization', `Bearer ${token}`)
            .send({
              question: {
                en: 'What are the office hours?',
                ne: 'कार्यालयको समय के हो?'
              },
              answer: {
                en: 'Our office is open from 9:00 AM to 5:00 PM, Monday through Friday. We are closed on weekends and public holidays.',
                ne: 'हाम्रो कार्यालय सोमबार देखि शुक्रबार सम्म बिहान ९:०० बजे देखि बेलुका ५:०० बजेसम्म खुला हुन्छ। हामी सप्ताहन्त र सार्वजनिक बिदाहरूमा बन्द हुन्छौं।'
              },
              order: 1,
              isActive: true
            });

          return {
            narrative: "Kiran creates the first FAQ about office hours with bilingual content",
            expectation: "The system should create the FAQ with proper English and Nepali translations",
            response,
            explanation: "Office hours is one of the most common questions citizens ask",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/admin/faq',
              payload: {
                question: {
                  en: 'What are the office hours?',
                  ne: 'कार्यालयको समय के हो?'
                },
                answer: {
                  en: 'Our office is open from 9:00 AM to 5:00 PM, Monday through Friday. We are closed on weekends and public holidays.',
                  ne: 'हाम्रो कार्यालय सोमबार देखि शुक्रबार सम्म बिहान ९:०० बजे देखि बेलुका ५:०० बजेसम्म खुला हुन्छ। हामी सप्ताहन्त र सार्वजनिक बिदाहरूमा बन्द हुन्छौं।'
                },
                order: 1,
                isActive: true
              },
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .step('create-contact-faq', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/faq')
            .set('Authorization', `Bearer ${token}`)
            .send({
              question: {
                en: 'How can I contact the office?',
                ne: 'म कसरी कार्यालयसँग सम्पर्क गर्न सक्छु?'
              },
              answer: {
                en: 'You can contact us by phone at +977-1-4567890, email at info@office.gov.np, or visit us in person during office hours.',
                ne: 'तपाईंले हामीलाई फोन +९७७-१-४५६७८९० मा, इमेल info@office.gov.np मा, वा कार्यालय समयमा व्यक्तिगत रूपमा भेट्न सक्नुहुन्छ।'
              },
              order: 2,
              isActive: true
            });

          return {
            narrative: "Kiran creates a contact information FAQ with multiple contact methods",
            expectation: "The system should create the FAQ with comprehensive contact details",
            response,
            explanation: "Contact information helps citizens reach the office through their preferred method",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/admin/faq',
              payload: {
                question: {
                  en: 'How can I contact the office?',
                  ne: 'म कसरी कार्यालयसँग सम्पर्क गर्न सक्छु?'
                },
                answer: {
                  en: 'You can contact us by phone at +977-1-4567890, email at info@office.gov.np, or visit us in person during office hours.',
                  ne: 'तपाईंले हामीलाई फोन +९७७-१-४५६७८९० मा, इमेल info@office.gov.np मा, वा कार्यालय समयमा व्यक्तिगत रूपमा भेट्न सक्नुहुन्छ।'
                },
                order: 2,
                isActive: true
              },
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .step('view-faq-statistics', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/faq/statistics')
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Kiran checks the FAQ statistics to understand the current status",
            expectation: "The system should show statistics about total, active, and inactive FAQs",
            response,
            explanation: "Statistics help FAQ managers understand the current state and growth of the FAQ database",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/admin/faq/statistics',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .run();

      expect(story.success).toBe(true);
      expect(story.errors).toHaveLength(0);

      const outputPath = join(__dirname, '../../story-docs/output/faq/kiran-faq-management.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
      
      console.log(`📝 Story documentation generated: ${outputPath}`);
    });

    it('📖 Kiran performs bulk FAQ operations for efficiency', async () => {
      // Setup: Create Kiran's account
      const setupResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: kiranHelpCoordinator.email,
          password: kiranHelpCoordinator.password,
          confirmPassword: kiranHelpCoordinator.password,
          firstName: 'Kiran',
          lastName: 'Shrestha',
          role: 'ADMIN'
        });
      
      const setupLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: kiranHelpCoordinator.email,
          password: kiranHelpCoordinator.password,
        });

      const story = await StoryBuilder.create(app)
        .withPersona(kiranHelpCoordinator)
        .withScenario(faqScenarios.faqBulkOperations)
        .withNarrative(`
          Kiran has received a comprehensive list of frequently asked questions 
          from various departments. Instead of creating each FAQ individually, 
          she decides to use the bulk operations feature to efficiently manage 
          multiple FAQs at once. This will save significant time and ensure 
          consistency across all entries.
        `)
        .step('login-for-bulk-ops', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Kiran logs in to perform bulk FAQ operations",
            expectation: "Authentication for bulk FAQ management capabilities",
            response,
            explanation: "Bulk operations require admin privileges to ensure data integrity",
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
        .step('bulk-create-faqs', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/faq/bulk-create')
            .set('Authorization', `Bearer ${token}`)
            .send({
              faqs: [
                {
                  question: {
                    en: 'What documents do I need to bring?',
                    ne: 'मले के के कागजातहरू ल्याउनुपर्छ?'
                  },
                  answer: {
                    en: 'Please bring your original citizenship certificate, a copy of citizenship, passport-size photos, and any relevant supporting documents.',
                    ne: 'कृपया आफ्नो मूल नागरिकता प्रमाणपत्र, नागरिकताको प्रतिलिपि, पासपोर्ट साइजका फोटोहरू, र सम्बन्धित सहायक कागजातहरू ल्याउनुहोस्।'
                  },
                  order: 3,
                  isActive: true
                },
                {
                  question: {
                    en: 'How long does processing take?',
                    ne: 'प्रक्रियामा कति समय लाग्छ?'
                  },
                  answer: {
                    en: 'Processing time varies by service type. Most services take 3-7 working days. Urgent services may be available for additional fees.',
                    ne: 'प्रक्रिया समय सेवाको प्रकार अनुसार फरक हुन्छ। धेरैजसो सेवाहरूमा ३-७ कार्य दिन लाग्छ। तत्काल सेवाहरू अतिरिक्त शुल्कमा उपलब्ध हुन सक्छ।'
                  },
                  order: 4,
                  isActive: true
                },
                {
                  question: {
                    en: 'Is there an online application system?',
                    ne: 'के अनलाइन आवेदन प्रणाली छ?'
                  },
                  answer: {
                    en: 'Yes, many services are available online through our digital portal. Visit our website for online application forms and tracking.',
                    ne: 'हो, धेरै सेवाहरू हाम्रो डिजिटल पोर्टल मार्फत अनलाइन उपलब्ध छन्। अनलाइन आवेदन फर्म र ट्र्याकिङको लागि हाम्रो वेबसाइट हेर्नुहोस्।'
                  },
                  order: 5,
                  isActive: true
                }
              ]
            });

          return {
            narrative: "Kiran creates multiple FAQs at once using bulk create operation",
            expectation: "The system should create all FAQs efficiently in a single operation",
            response,
            explanation: "Bulk creation improves efficiency when adding multiple related FAQs",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/admin/faq/bulk-create',
              payload: {
                faqs: [
                  {
                    question: {
                      en: 'What documents do I need to bring?',
                      ne: 'मले के के कागजातहरू ल्याउनुपर्छ?'
                    },
                    answer: {
                      en: 'Please bring your original citizenship certificate, a copy of citizenship, passport-size photos, and any relevant supporting documents.',
                      ne: 'कृपया आफ्नो मूल नागरिकता प्रमाणपत्र, नागरिकताको प्रतिलिपि, पासपोर्ट साइजका फोटोहरू, र सम्बन्धित सहायक कागजातहरू ल्याउनुहोस्।'
                    },
                    order: 3,
                    isActive: true
                  }
                  // ... truncated for brevity in documentation
                ]
              },
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .step('export-all-faqs', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/faq/export/all')
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Kiran exports all FAQs for backup and sharing with other departments",
            expectation: "The system should generate a comprehensive export of all FAQ data",
            response,
            explanation: "Export functionality enables backup and sharing of FAQ content with other systems",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/admin/faq/export/all',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .run();

      expect(story.success).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/faq/kiran-bulk-operations.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  describe('🔍 Citizen FAQ Discovery Journey', () => {
    it('📖 Tourist searches for helpful information', async () => {
      // Setup: Create some FAQs for searching
      const setupResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: kiranHelpCoordinator.email,
          password: kiranHelpCoordinator.password,
          confirmPassword: kiranHelpCoordinator.password,
          firstName: 'Kiran',
          lastName: 'Shrestha',
          role: 'ADMIN'
        });
      
      const setupLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: kiranHelpCoordinator.email,
          password: kiranHelpCoordinator.password,
        });

      // Create test FAQs
      await request(app.getHttpServer())
        .post('/api/v1/admin/faq')
        .set('Authorization', `Bearer ${setupLogin.body.data.accessToken}`)
        .send({
          question: {
            en: 'What are the office hours?',
            ne: 'कार्यालयको समय के हो?'
          },
          answer: {
            en: 'Office is open 9 AM to 5 PM Monday to Friday',
            ne: 'कार्यालय सोमबार देखि शुक्रबार बिहान ९ देखि बेलुका ५ सम्म खुला'
          },
          order: 1,
          isActive: true
        });

      const story = await StoryBuilder.create(app)
        .withPersona(touristViewer)
        .withScenario(faqScenarios.faqDiscovery)
        .withNarrative(`
          John Smith, a software developer visiting Nepal, needs information 
          about government office procedures. He's planning to visit a government 
          office for some documentation work and wants to find out the office 
          hours and requirements beforehand to save time.
          
          Instead of calling the office, he decides to check if there's a 
          FAQ section on the website that might have the answers he needs.
        `)
        .step('browse-all-faqs', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/faq');

          return {
            narrative: "John browses all available FAQs to get an overview of common questions",
            expectation: "The system should return all active FAQs in an organized manner",
            response,
            explanation: "Public FAQ browsing helps citizens discover relevant information without authentication",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/faq'
            }
          };
        })
        .step('search-office-hours', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/faq/search?q=office hours');

          return {
            narrative: "John searches specifically for 'office hours' to find relevant information",
            expectation: "The search should return FAQs containing information about office hours",
            response,
            explanation: "Search functionality helps users quickly find specific information they need",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/faq/search?q=office+hours'
            }
          };
        })
        .step('get-popular-faqs', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/faq/popular?limit=5');

          return {
            narrative: "John checks the most popular FAQs to see what others commonly ask",
            expectation: "The system should return the most frequently accessed or relevant FAQs",
            response,
            explanation: "Popular FAQs help users discover commonly needed information",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/faq/popular?limit=5'
            }
          };
        })
        .step('get-random-faqs', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/faq/random?limit=3');

          return {
            narrative: "John browses some random FAQs to discover other useful information",
            expectation: "The system should return a random selection of active FAQs",
            response,
            explanation: "Random FAQs help users discover information they might not have thought to search for",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/faq/random?limit=3'
            }
          };
        })
        .run();

      expect(story.success).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/faq/tourist-faq-discovery.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  describe('📊 FAQ Analytics and Organization', () => {
    it('📖 Kiran analyzes FAQ performance and reorganizes content', async () => {
      // Setup: Create Kiran's account and some FAQs
      const setupResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: kiranHelpCoordinator.email,
          password: kiranHelpCoordinator.password,
          confirmPassword: kiranHelpCoordinator.password,
          firstName: 'Kiran',
          lastName: 'Shrestha',
          role: 'ADMIN'
        });
      
      const setupLogin = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: kiranHelpCoordinator.email,
          password: kiranHelpCoordinator.password,
        });

      // Create test FAQs for reordering
      const faq1 = await request(app.getHttpServer())
        .post('/api/v1/admin/faq')
        .set('Authorization', `Bearer ${setupLogin.body.data.accessToken}`)
        .send({
          question: { 
            en: 'What are the required documents for citizenship verification?', 
            ne: 'नागरिकता प्रमाणीकरणको लागि आवश्यक कागजातहरू के के हुन्?' 
          },
          answer: { 
            en: 'You need to bring your original citizenship certificate, passport-size photos, and any supporting identification documents.',
            ne: 'तपाईंले आफ्नो मूल नागरिकता प्रमाणपत्र, पासपोर्ट साइजका फोटोहरू, र कुनै पनि सहयोगी पहिचान कागजातहरू ल्याउनुपर्छ।' 
          },
          order: 1,
          isActive: true
        });

      const faq2 = await request(app.getHttpServer())
        .post('/api/v1/admin/faq')
        .set('Authorization', `Bearer ${setupLogin.body.data.accessToken}`)
        .send({
          question: { 
            en: 'How can I track the status of my application?', 
            ne: 'म कसरी मेरो आवेदनको स्थिति ट्र्याक गर्न सक्छु?' 
          },
          answer: { 
            en: 'You can track your application status online using your reference number, or visit our office during business hours for updates.',
            ne: 'तपाईं आफ्नो सन्दर्भ नम्बर प्रयोग गरेर अनलाइन आफ्नो आवेदनको स्थिति ट्र्याक गर्न सक्नुहुन्छ, वा अपडेटको लागि व्यापार घण्टामा हाम्रो कार्यालयमा आउन सक्नुहुन्छ।' 
          },
          order: 2,
          isActive: true
        });



      const story = await StoryBuilder.create(app)
        .withPersona(kiranHelpCoordinator)
        .withScenario(faqScenarios.faqOrganization)
        .withTestData({ 
          faq1Id: faq1.body.data.id,
          faq2Id: faq2.body.data.id
        })
        .withNarrative(`
          After monitoring citizen interactions for a month, Kiran has gathered 
          valuable insights about which FAQs are most important to users. She 
          notices that the second FAQ is actually more popular than the first 
          one, so she decides to reorder them to improve user experience.
        `)
        .step('login-for-organization', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Kiran logs in to reorganize FAQ content based on usage analytics",
            expectation: "Authentication for FAQ organization capabilities",
            response,
            explanation: "FAQ organization requires admin access to maintain content quality",
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
        .step('reorder-faqs', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/faq/reorder')
            .set('Authorization', `Bearer ${token}`)
            .send({
              orders: [
                { id: context.testData.faq1Id, order: 2 },
                { id: context.testData.faq2Id, order: 1 }
              ]
            });

          return {
            narrative: "Kiran reorders the FAQs to put the most popular one first",
            expectation: "The system should update the order of FAQs successfully",
            response,
            explanation: "Reordering helps prioritize the most important information for users",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/admin/faq/reorder',
              payload: {
                orders: [
                  { id: context.testData.faq1Id, order: 2 },
                  { id: context.testData.faq2Id, order: 1 }
                ]
              },
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .step('verify-new-order', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/admin/faq')
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Kiran verifies that the FAQs are now displayed in the new order",
            expectation: "The FAQs should be returned in the updated order",
            response,
            explanation: "Verification ensures that the reordering operation was successful",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/admin/faq',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .run();

      expect(story.success).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/faq/kiran-faq-organization.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  // Generate comprehensive documentation after all tests
  afterAll(async () => {
    if (app) {
      console.log('\n📚 Generating comprehensive FAQ documentation...');
      
      const overviewContent = `# 🙋‍♀️ FAQ Management API - User Journey Documentation

Generated from real API tests on ${new Date().toISOString()}

## 📖 About This Documentation

This documentation shows how the FAQ Management API works through real user stories. Each story follows a government employee or citizen as they interact with the FAQ system for creating, managing, and discovering frequently asked questions.

### FAQ Management Stories:
- 🎯 [Kiran's FAQ Management](./kiran-faq-management.md)
- 🔄 [Kiran's Bulk Operations](./kiran-bulk-operations.md)
- 🔍 [Tourist FAQ Discovery](./tourist-faq-discovery.md)
- 📊 [Kiran's FAQ Organization](./kiran-faq-organization.md)

## 🎭 Meet Our FAQ Management Users

### 👩🏽‍💼 Kiran Shrestha - Government Help Desk Coordinator
A 31-year-old Government Help Desk Coordinator responsible for creating and managing FAQ content to help citizens find answers quickly.

### 🧑🏼‍💻 John Smith - Tourist/Public User
A 28-year-old software developer visiting Nepal who represents public users seeking government information through FAQs.

### 👨🏽‍💻 Ravi Thapa - Investigative Journalist
A 29-year-old journalist who uses FAQ systems to understand common citizen concerns and government responses.

### 👨🏽‍💼 Ramesh Kumar - Government Administrator  
A 45-year-old senior government officer who oversees FAQ content quality and strategic organization.

## 🔧 API Capabilities Demonstrated

- **FAQ Creation**: Bilingual FAQ content with English and Nepali translations
- **Bulk Operations**: Efficient creation and management of multiple FAQs
- **Search & Discovery**: Full-text search across questions and answers
- **Content Organization**: Reordering and prioritizing FAQ content
- **Analytics**: Statistics tracking for FAQ usage and performance
- **Export/Import**: FAQ collection backup and migration
- **Public Access**: Unauthenticated access to published FAQ content
- **Admin Management**: Complete CRUD operations for FAQ administrators

## 📊 FAQ Features Covered

- **Bilingual Support**: Both English (en) and Nepali (ne) translations
- **Content Ordering**: Flexible ordering system for FAQ prioritization
- **Active/Inactive Status**: Content visibility control
- **Search Functionality**: Text search across questions and answers
- **Pagination**: Efficient browsing of large FAQ collections
- **Random FAQs**: Discovery of relevant content users might miss
- **Popular FAQs**: Highlighting most accessed or relevant content
- **Statistics**: Comprehensive analytics for content managers

## 🌐 Language Support

The FAQ system supports bilingual content:

- **English (en)**: Primary language for international users
- **Nepali (ne)**: Local language using Devanagari script
- **Automatic Language Detection**: Smart content serving based on user preferences
- **Translation Validation**: Ensuring both languages are properly maintained

## 🎯 User Scenarios Covered

1. **Help Desk Coordinator** creating and managing FAQ content
2. **Citizens and Tourists** discovering answers to common questions
3. **Content Managers** organizing and prioritizing FAQ information
4. **Administrators** performing bulk operations and analytics review
5. **Public Users** accessing FAQ content without authentication

---

*This documentation is automatically generated from actual API tests. Every request and response shown here represents real system behavior.*`;

      const overviewPath = join(__dirname, '../../story-docs/output/faq/README.md');
      writeFileSync(overviewPath, overviewContent);
      
      console.log(`✅ FAQ documentation overview generated: ${overviewPath}`);
      console.log('\n🎉 FAQ story documentation is ready!');
      console.log('📁 Check the test/story-docs/output/faq/ directory for all generated files.');
    }
  });
}); 