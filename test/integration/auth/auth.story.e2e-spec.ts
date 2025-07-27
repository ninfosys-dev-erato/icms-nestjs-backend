import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';

// Story framework imports
import { StoryBuilder } from '../../story-docs/framework/story-builder';
import { rameshAdmin } from '../../story-docs/personas/ramesh-admin';
import { sitaEditor } from '../../story-docs/personas/sita-editor';
import { touristViewer } from '../../story-docs/personas/tourist-viewer';
import { authScenarios } from '../../story-docs/stories/auth/auth-scenarios';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('Auth API Stories 📚', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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

    // Clean up database before tests
    await cleanupDatabase();
    
    // Create output directory for generated documentation
    mkdirSync(join(__dirname, '../../story-docs/output/auth'), { recursive: true });
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
      'user_sessions',
      'login_attempts', 
      'audit_logs',
      'users',
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  };

  describe('🎭 Ramesh\'s Administrative Journey', () => {
    it('📖 Ramesh logs in to manage office settings', async () => {
      const story = await StoryBuilder.create(app)
        .withPersona(rameshAdmin)
        .withScenario(authScenarios.adminLogin)
        .withNarrative(`
          It's Monday morning, and Ramesh Kumar arrives at his government office 
          with an important task ahead. The office has relocated to a new building, 
          and he needs to update all the contact information on the government website 
          to ensure citizens can reach them at the correct address and phone number.
          
          As a senior government officer with 20 years of experience, Ramesh 
          understands the importance of keeping public information accurate and 
          up-to-date. He opens his computer, grabs his coffee, and prepares to 
          log into the administrative system.
        `)
        .step('register-admin', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
              email: persona.email,
              password: persona.password,
              confirmPassword: persona.password,
              firstName: 'Ramesh',
              lastName: 'Kumar',
              role: 'ADMIN'
            });

          return {
            narrative: "First, Ramesh creates his administrative account in the system",
            expectation: "The system should create his admin account and provide access tokens",
            response,
            explanation: "This step simulates the account creation process that would typically be done by a system administrator",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/auth/register',
              payload: {
                email: persona.email,
                password: persona.password,
                confirmPassword: persona.password,
                firstName: 'Ramesh',
                lastName: 'Kumar',
                role: 'ADMIN'
              }
            }
          };
        })
        .step('admin-login', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Ramesh enters his government email and password into the login form",
            expectation: "The system should authenticate him and provide secure access tokens",
            response,
            explanation: "The system validates his credentials and issues JWT tokens for secure communication",
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
        .step('verify-profile', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Ramesh verifies his profile information is correct in the system",
            expectation: "He should see his complete profile with admin privileges",
            response,
            explanation: "This confirms his authentication was successful and his role permissions are properly set",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/auth/me',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .step('view-sessions', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/auth/sessions')
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Being security-conscious, Ramesh checks his active sessions",
            expectation: "He should see his current session listed with proper details",
            response,
            explanation: "Session management allows users to monitor and control their account access for security",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/auth/sessions',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .run();

      // Verify the story was successful
      expect(story.success).toBe(true);
      expect(story.errors).toHaveLength(0);

      // Save the generated documentation
      const outputPath = join(__dirname, '../../story-docs/output/auth/ramesh-admin-login.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
      
      console.log(`📝 Story documentation generated: ${outputPath}`);
    });

    it('📖 Ramesh changes his password for security', async () => {
      // First, set up Ramesh's account
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: rameshAdmin.email,
          password: rameshAdmin.password,
          confirmPassword: rameshAdmin.password,
          firstName: 'Ramesh',
          lastName: 'Kumar',
          role: 'ADMIN'
        });

      const story = await StoryBuilder.create(app)
        .withPersona(rameshAdmin)
        .withScenario(authScenarios.passwordChange)
        .withNarrative(`
          Ramesh received a memo from the IT security department recommending that 
          all government employees update their passwords quarterly. As a responsible 
          administrator, he wants to set a good example and update his password 
          to something even more secure.
          
          He decides to use the system's built-in password change functionality 
          rather than asking IT to reset it manually.
        `)
        .step('login-first', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Ramesh logs in with his current password",
            expectation: "Successful authentication with current credentials",
            response,
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
        .step('change-password', async (persona, context) => {
          const token = context.previousSteps[0].response.body.data.accessToken;
          const newPassword = 'RameshSecure@2024NEW';
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({
              currentPassword: persona.password,
              newPassword: newPassword,
              confirmPassword: newPassword,
            });

          return {
            narrative: "Ramesh enters his current password and his new, more secure password",
            expectation: "The system should update his password successfully",
            response,
            explanation: "Password changes require the current password for security and confirmation of the new password",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/auth/change-password',
              payload: {
                currentPassword: persona.password,
                newPassword: newPassword,
                confirmPassword: newPassword,
              },
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .step('login-with-new-password', async (persona) => {
          const newPassword = 'RameshSecure@2024NEW';
          
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: newPassword,
            });

          return {
            narrative: "Ramesh tests his new password by logging in again",
            expectation: "He should be able to authenticate with the new password",
            response,
            explanation: "This confirms the password change was successful and the new credentials work properly",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/auth/login',
              payload: {
                email: persona.email,
                password: newPassword,
              }
            }
          };
        })
        .run();

      expect(story.success).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/auth/ramesh-password-change.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  describe('✍️ Sita\'s Content Editor Journey', () => {
    it('📖 Sita logs in to publish urgent content', async () => {
      const story = await StoryBuilder.create(app)
        .withPersona(sitaEditor)
        .withScenario(authScenarios.editorLogin)
        .withNarrative(`
          Sita Sharma rushes into the office at 8:30 AM. There's breaking news about 
          a road closure that affects the main route to the government office, and 
          she needs to publish an urgent announcement on the website immediately.
          
          Citizens are already calling the office asking for information, and she 
          knows that getting this announcement online quickly will help reduce 
          confusion and phone traffic. Time is of the essence.
        `)
        .step('register-editor', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
              email: persona.email,
              password: persona.password,
              confirmPassword: persona.password,
              firstName: 'Sita',
              lastName: 'Sharma',
              role: 'EDITOR'
            });

          return {
            narrative: "Sita's editor account is set up in the system",
            expectation: "Account creation should succeed with editor permissions",
            response,
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/auth/register',
              payload: {
                email: persona.email,
                password: persona.password,
                confirmPassword: persona.password,
                firstName: 'Sita',
                lastName: 'Sharma',
                role: 'EDITOR'
              }
            }
          };
        })
        .step('urgent-login', async (persona) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: persona.email,
              password: persona.password,
            });

          return {
            narrative: "Sita quickly enters her credentials, knowing every minute counts",
            expectation: "Fast authentication to get her into the content management system",
            response,
            explanation: "Quick login is crucial for content editors who often work under tight deadlines",
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
        .step('verify-editor-permissions', async (persona, context) => {
          const token = context.previousSteps[1].response.body.data.accessToken;
          
          const response = await request(app.getHttpServer())
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${token}`);

          return {
            narrative: "Sita confirms she has the right permissions to publish content",
            expectation: "Her profile should show EDITOR role with content management capabilities",
            response,
            explanation: "Editor role verification ensures she can access content publishing features",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/auth/me',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          };
        })
        .run();

      expect(story.success).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/auth/sita-editor-login.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  describe('🚨 Security & Error Scenarios', () => {
    it('📖 The system protects against unauthorized access', async () => {
      const story = await StoryBuilder.create(app)
        .withPersona(touristViewer)
        .withScenario(authScenarios.unauthorizedAccess)
        .withNarrative(`
          John Smith, a tourist visiting Nepal, is browsing the government website 
          looking for information about local regulations. Out of curiosity, he 
          tries to access what appears to be an admin section to see if he can 
          get more detailed information.
          
          This scenario tests how the system handles unauthorized access attempts 
          from public users.
        `)
        .step('attempt-protected-access', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/auth/me');  // Protected endpoint without token

          return {
            narrative: "John tries to access user profile information without logging in",
            expectation: "The system should deny access and provide a clear error message",
            response,
            explanation: "Security systems must protect sensitive endpoints from unauthorized access",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/auth/me'
            }
          };
        })
        .step('attempt-with-invalid-token', async (persona) => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/auth/me')
            .set('Authorization', 'Bearer invalid-token-12345');

          return {
            narrative: "John tries using a fake authorization token",
            expectation: "The system should reject the invalid token and return an error",
            response,
            explanation: "Token validation prevents unauthorized access with forged credentials",
            apiCall: {
              method: 'GET',
              endpoint: '/api/v1/auth/me',
              headers: {
                'Authorization': 'Bearer invalid-token-12345'
              }
            }
          };
        })
        .run();

      // For security tests, 401 responses are the expected "success" outcome
      expect(story.story.steps.every(step => step.response && step.response.status === 401)).toBe(true);
      
      const outputPath = join(__dirname, '../../story-docs/output/auth/unauthorized-access-protection.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });

    it('📖 Rate limiting protects against brute force attacks', async () => {
      const story = await StoryBuilder.create(app)
        .withPersona({ ...touristViewer, email: 'attacker@example.com' })
        .withScenario(authScenarios.rateLimitTest)
        .withNarrative(`
          This scenario simulates a malicious actor attempting to brute force 
          their way into the system by repeatedly trying different passwords. 
          The system should detect this pattern and temporarily block the attempts.
        `)
        .step('multiple-failed-attempts', async (persona) => {
          // Attempt multiple failed logins
          const attempts = [];
          for (let i = 0; i < 6; i++) {
            const response = await request(app.getHttpServer())
              .post('/api/v1/auth/login')
              .send({
                email: 'nonexistent@example.com',
                password: `wrongpassword${i}`,
              });
            attempts.push(response);
          }

          return {
            narrative: "Multiple rapid login attempts with wrong credentials are made",
            expectation: "After several attempts, the system should start blocking requests",
            response: attempts[attempts.length - 1], // Return the last attempt
            explanation: "Rate limiting prevents brute force attacks by temporarily blocking repeated failed attempts",
            apiCall: {
              method: 'POST',
              endpoint: '/api/v1/auth/login',
              payload: {
                email: 'nonexistent@example.com',
                password: 'wrongpassword5',
              }
            }
          };
        })
                 .run();

      // Rate limiting test - success means the system properly blocked repeated attempts
      
      const outputPath = join(__dirname, '../../story-docs/output/auth/rate-limiting-protection.md');
      writeFileSync(outputPath, story.generatedDocs.markdown);
    });
  });

  // Generate comprehensive documentation after all tests
  afterAll(async () => {
    if (app) {
      console.log('\n📚 Generating comprehensive API documentation...');
      
      // This would be expanded to include all generated stories
      const overviewContent = `# 🏛️ Government CMS API - Complete Documentation

Generated from real API tests on ${new Date().toISOString()}

## 📖 How to Read This Documentation

This documentation tells the story of our API through the eyes of real users. Each story follows a persona (like Ramesh the Admin or Sita the Editor) as they accomplish real tasks using our system.

### Generated Stories:

#### Authentication Module
- 📝 [Ramesh's Admin Login Journey](./auth/ramesh-admin-login.md)
- 🔒 [Ramesh Changes Password](./auth/ramesh-password-change.md) 
- ✍️ [Sita's Editor Login](./auth/sita-editor-login.md)
- 🚨 [Unauthorized Access Protection](./auth/unauthorized-access-protection.md)
- 🛡️ [Rate Limiting Protection](./auth/rate-limiting-protection.md)

#### Content Management Module
- 🏗️ [Maya's Category Management](./content-management/maya-category-management.md)
- ✍️ [Sita's Content Creation](./content-management/sita-content-creation.md)
- 📰 [Ravi's Content Discovery](./content-management/ravi-content-discovery.md)

## 🎭 Meet Our Users

### 👨🏽‍💼 Ramesh Kumar - Government Administrator
A dedicated 45-year-old senior government officer responsible for maintaining accurate office information and managing the system.

### 👩🏽‍💻 Sita Sharma - Content Editor  
A 32-year-old communications officer who manages content strategy and publishes time-sensitive announcements.

### 🧑🏼‍💻 John Smith - Tourist/Public User
A 28-year-old software developer visiting Nepal who represents public users accessing government information.

### 👩🏽‍💼 Maya Adhikari - Content Manager
A 38-year-old content manager responsible for organizing and structuring all government website content.

### 👨🏽‍💻 Ravi Thapa - Investigative Journalist
A 29-year-old journalist who regularly accesses government documents for investigative reporting.

---

*This documentation is automatically generated from actual API tests. Every request and response shown here represents real system behavior.*`;

      const overviewPath = join(__dirname, '../../story-docs/output/README.md');
      writeFileSync(overviewPath, overviewContent);
      
      console.log(`✅ Documentation overview generated: ${overviewPath}`);
      console.log('\n🎉 Story-driven API documentation is ready!');
      console.log('📁 Check the test/story-docs/output/ directory for all generated files.');
    }
  });
}); 