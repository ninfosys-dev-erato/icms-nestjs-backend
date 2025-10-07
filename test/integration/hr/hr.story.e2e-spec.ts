import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';
import { TestUtils } from '../../test-utils';

// Import story framework
import { Story, StoryStep, StoryResult, Persona, Scenario } from '../../story-docs/framework/types';
import { MarkdownGenerator } from '../../story-docs/framework/markdown-generator';
import { mayaHRManager } from '../../story-docs/personas/maya-hr-manager';
import { deepakDepartmentHead } from '../../story-docs/personas/deepak-department-head';
import { sarahEmployee } from '../../story-docs/personas/sarah-employee';
import { hrManagementScenarios } from '../../story-docs/stories/hr/hr-scenarios';

describe('HR Management Stories (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
    markdownGenerator = new MarkdownGenerator();
    await app.init();

    console.log('🏢 Starting HR Module Story Documentation Generation...');
  });

  afterAll(async () => {
    await TestUtils.cleanupDatabase(prisma);
    await generateStoryDocumentation();
    await app.close();
  });

  beforeEach(async () => {
    await TestUtils.cleanupDatabase(prisma);
  });

  const getAuthToken = async (persona: Persona): Promise<string> => {
    return TestUtils.createAuthToken(prisma);
  };

  const executeStoryStep = async (
    step: StoryStep,
    persona: Persona,
    context: Record<string, any> = {}
  ): Promise<any> => {
    let authToken = '';
    if (persona.role !== 'VIEWER') {
      authToken = await getAuthToken(persona);
    }

    const apiCall = step.apiCall;
    
    // Replace context variables in the payload and endpoint
    let endpoint = apiCall.endpoint;
    let payload = apiCall.payload;
    
    Object.keys(context).forEach(key => {
      const placeholder = `{{${key}}}`;
      if (endpoint.includes(placeholder)) {
        endpoint = endpoint.replace(placeholder, context[key]);
      }
      if (payload && typeof payload === 'object') {
        payload = JSON.parse(JSON.stringify(payload).replace(new RegExp(`{{${key}}}`, 'g'), context[key]));
      }
    });

    let requestBuilder = request(app.getHttpServer())[apiCall.method.toLowerCase()](endpoint);
    
    if (authToken) {
      requestBuilder = requestBuilder.set('Authorization', `Bearer ${authToken}`);
    }

    if (apiCall.query) {
      requestBuilder = requestBuilder.query(apiCall.query);
    }

    if (payload) {
      requestBuilder = requestBuilder.send(payload);
    }

    const startTime = Date.now();
    const response = await requestBuilder;
    const timing = Date.now() - startTime;

    step.response = {
      status: response.status,
      body: response.body,
      timing
    };

    return response;
  };

  const generateStoryDocumentation = async () => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const outputDir = path.join(__dirname, '../../story-docs/output/hr');
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // HR module uses custom executeStoryStep pattern, so we generate a summary overview
      const overview = generateHRModuleDocumentation();
      fs.writeFileSync(path.join(outputDir, 'README.md'), overview);
      
      console.log('\n📚 HR Module Story Documentation Generated!');
      console.log(`📁 Location: ${outputDir}/README.md`);
      console.log('📄 Generated HR overview documentation (custom pattern)');
      
    } catch (error) {
      console.error('❌ Error generating documentation:', error.message);
    }
  };

  const generateHRModuleDocumentation = () => {
    const totalStories = storyResults.length;
    const successfulStories = storyResults.filter(result => result.success).length;
    const failedStories = totalStories - successfulStories;

    return `# HR Module Stories Documentation

## 📋 Overview

This documentation covers comprehensive user stories for the HR Module of the Government Content Management System. These stories demonstrate real-world scenarios involving department management, employee onboarding, organizational structure management, and HR analytics.

## 👥 Personas Involved

### 🏛️ Maya Shrestha - Human Resources Manager
**Role**: ADMIN | **Technical Level**: ADVANCED | **Age**: 38

Experienced HR manager responsible for comprehensive human resources operations, department management, employee lifecycle management, and organizational analytics.

### 👨‍💼 Deepak Gurung - Department Head  
**Role**: EDITOR | **Technical Level**: INTERMEDIATE | **Age**: 45

Department head who manages team structure, employee assignments, and coordinates with HR for departmental operations and employee management.

### 👩‍💻 Sarah Thapa - Government Employee
**Role**: VIEWER | **Technical Level**: BASIC | **Age**: 29

Regular government employee who uses the system to access employee directory, view organizational information, and understand reporting structures.

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

  describe('Story: Maya HR Manager - Department Creation and Management', () => {
    it('should complete department creation workflow', async () => {
      const persona = mayaHRManager;
      const scenario = hrManagementScenarios.departmentCreation;
      const context: Record<string, any> = {};

      console.log(`\n📖 Story: ${scenario.title}`);
      console.log(`👤 Persona: ${persona.name} (${persona.occupation})`);
      console.log(`📝 Scenario: ${scenario.description}\n`);

      // Step 1: Maya logs in and accesses the HR dashboard
      const step1: StoryStep = {
        id: 'access-hr-dashboard',
        narrative: 'Maya opens her browser and navigates to the HR management section',
        expectation: 'She should see the HR dashboard with department management options',
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/admin/departments'
        },
        explanation: 'Maya accesses the department management interface to begin creating a new department'
      };

      console.log(`📍 Step 1: ${step1.narrative}`);
      const response1 = await executeStoryStep(step1, persona, context);
      expect(response1.status).toBe(200);
      expect(response1.body.success).toBe(true);
      console.log(`✅ Maya successfully accessed the HR dashboard`);

      // Step 2: Maya creates a new department
      const departmentData = {
        departmentName: {
          en: 'Digital Innovation Department',
          ne: 'डिजिटल नवाचार विभाग'
        },
        parentId: null,
        departmentHeadId: null,
        order: 1,
        isActive: true
      };

      const step2: StoryStep = {
        id: 'create-department',
        narrative: 'Maya fills out the department creation form with proper bilingual names and organizational details',
        expectation: 'The new department should be created successfully with proper validation',
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/admin/departments',
          payload: departmentData
        },
        explanation: 'Maya creates a new department with both English and Nepali names following government standards'
      };

      console.log(`📍 Step 2: ${step2.narrative}`);
      const response2 = await executeStoryStep(step2, persona, context);
      expect(response2.status).toBe(201);
      expect(response2.body.success).toBe(true);
      expect(response2.body.data.departmentName.en).toBe('Digital Innovation Department');
      context.departmentId = response2.body.data.id;
      console.log(`✅ Maya successfully created the Digital Innovation Department`);

      // Step 3: Maya verifies the department appears in the hierarchy
      const step3: StoryStep = {
        id: 'verify-department-hierarchy',
        narrative: 'Maya checks the department hierarchy to ensure the new department is properly positioned',
        expectation: 'The new department should appear in the organizational hierarchy',
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/departments/hierarchy'
        },
        explanation: 'Maya confirms the department structure is correctly maintained and visible to all users'
      };

      console.log(`📍 Step 3: ${step3.narrative}`);
      const response3 = await executeStoryStep(step3, persona, context);
      expect(response3.status).toBe(200);
      expect(response3.body.success).toBe(true);
      const departments = response3.body.data;
      const newDepartment = departments.find((dept: any) => dept.id === context.departmentId);
      expect(newDepartment).toBeDefined();
      console.log(`✅ Maya confirmed the department appears correctly in the hierarchy`);

      console.log(`\n🎉 Story completed successfully! Maya has created and verified the new department.\n`);
    });

    it('should complete employee onboarding workflow', async () => {
      const persona = mayaHRManager;
      const scenario = hrManagementScenarios.employeeOnboarding;
      const context: Record<string, any> = {};

      console.log(`\n📖 Story: ${scenario.title}`);
      console.log(`👤 Persona: ${persona.name} (${persona.occupation})`);
      console.log(`📝 Scenario: ${scenario.description}\n`);

      // Step 1: Maya creates a department first
      const departmentData = {
        departmentName: {
          en: 'Software Engineering Department',
          ne: 'सफ्टवेयर इन्जिनियरिङ विभाग'
        },
        parentId: null,
        departmentHeadId: null,
        order: 1,
        isActive: true
      };

      console.log(`📍 Setup: Maya creates a department for the new employee`);
      const deptResponse = await executeStoryStep({
        id: 'setup-department',
        narrative: 'Maya creates a department to house the new employee',
        expectation: 'Department should be created successfully',
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/admin/departments',
          payload: departmentData
        },
        explanation: 'Setting up the organizational structure for employee onboarding'
      }, persona, context);
      
      expect(deptResponse.status).toBe(201);
      context.departmentId = deptResponse.body.data.id;
      console.log(`✅ Department created for employee onboarding`);

      // Step 2: Maya adds a new employee
      const employeeData = {
        name: {
          en: 'Raj Sharma',
          ne: 'राज शर्मा'
        },
        departmentId: '{{departmentId}}',
        position: {
          en: 'Senior Software Engineer',
          ne: 'वरिष्ठ सफ्टवेयर इन्जिनियर'
        },
        order: 1,
        mobileNumber: '+977-9841234567',
        telephone: '+977-1-1234567',
        email: 'raj.sharma@icms.gov.np',
        roomNumber: 'Room 301',
        isActive: true
      };

      const step2: StoryStep = {
        id: 'create-employee',
        narrative: 'Maya fills out the comprehensive employee onboarding form with personal and professional details',
        expectation: 'The new employee should be successfully added to the system with all required information',
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/admin/employees',
          payload: employeeData
        },
        explanation: 'Maya completes the employee onboarding process ensuring all mandatory fields are properly filled'
      };

      console.log(`📍 Step 1: ${step2.narrative}`);
      const response2 = await executeStoryStep(step2, persona, context);
      expect(response2.status).toBe(201);
      expect(response2.body.success).toBe(true);
      expect(response2.body.data.name.en).toBe('Raj Sharma');
      expect(response2.body.data.departmentId).toBe(context.departmentId);
      context.employeeId = response2.body.data.id;
      console.log(`✅ Maya successfully onboarded Raj Sharma`);

      // Step 3: Maya verifies the employee appears in the department
      const step3: StoryStep = {
        id: 'verify-employee-in-department',
        narrative: 'Maya checks that the new employee appears in the department employee list',
        expectation: 'The employee should be visible in the department roster',
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/employees/department/{{departmentId}}'
        },
        explanation: 'Maya confirms the employee is properly associated with their assigned department'
      };

      console.log(`📍 Step 2: ${step3.narrative}`);
      const response3 = await executeStoryStep(step3, persona, context);
      expect(response3.status).toBe(200);
      expect(response3.body.success).toBe(true);
      const employees = response3.body.data;
      const newEmployee = employees.find((emp: any) => emp.id === context.employeeId);
      expect(newEmployee).toBeDefined();
      expect(newEmployee.name.en).toBe('Raj Sharma');
      console.log(`✅ Maya confirmed Raj appears in the department roster`);

      console.log(`\n🎉 Story completed successfully! Maya has onboarded a new employee.\n`);
    });
  });

  describe('Story: Deepak Department Head - Team Management', () => {
    it('should complete department reorganization workflow', async () => {
      const persona = deepakDepartmentHead;
      const scenario = hrManagementScenarios.departmentReorganization;
      const context: Record<string, any> = {};

      console.log(`\n📖 Story: ${scenario.title}`);
      console.log(`👤 Persona: ${persona.name} (${persona.occupation})`);
      console.log(`📝 Scenario: ${scenario.description}\n`);

      // Setup: Create departments and employees
      console.log(`📍 Setup: Creating organizational structure for reorganization`);
      
      // Create main IT department
      const itDeptData = {
        departmentName: {
          en: 'Information Technology',
          ne: 'सूचना प्रविधि'
        },
        parentId: null,
        departmentHeadId: null,
        order: 1,
        isActive: true
      };

      const itDeptResponse = await executeStoryStep({
        id: 'create-it-dept',
        narrative: 'Setup main IT department',
        expectation: 'IT department created',
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/admin/departments',
          payload: itDeptData
        },
        explanation: 'Creating the main IT department structure'
      }, persona, context);

      context.itDepartmentId = itDeptResponse.body.data.id;

      // Create sub-department
      const devDeptData = {
        departmentName: {
          en: 'Software Development',
          ne: 'सफ्टवेयर विकास'
        },
        parentId: '{{itDepartmentId}}',
        departmentHeadId: null,
        order: 1,
        isActive: true
      };

      const devDeptResponse = await executeStoryStep({
        id: 'create-dev-dept',
        narrative: 'Setup development sub-department',
        expectation: 'Development department created',
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/admin/departments',
          payload: devDeptData
        },
        explanation: 'Creating a sub-department under IT'
      }, persona, context);

      context.devDepartmentId = devDeptResponse.body.data.id;

      // Add employees to departments
      const employees = [
        {
          name: { en: 'John Developer', ne: 'जोन डेभलपर' },
          departmentId: '{{devDepartmentId}}',
          position: { en: 'Software Engineer', ne: 'सफ्टवेयर इन्जिनियर' },
          order: 1,
          email: 'john.dev@icms.gov.np',
          isActive: true
        },
        {
          name: { en: 'Jane Analyst', ne: 'जेन एनालिस्ट' },
          departmentId: '{{itDepartmentId}}',
          position: { en: 'Systems Analyst', ne: 'सिस्टम एनालिस्ट' },
          order: 1,
          email: 'jane.analyst@icms.gov.np',
          isActive: true
        }
      ];

      for (let i = 0; i < employees.length; i++) {
        const empResponse = await executeStoryStep({
          id: `create-employee-${i}`,
          narrative: `Setup employee ${i + 1}`,
          expectation: 'Employee created',
          apiCall: {
            method: 'POST',
            endpoint: '/api/v1/admin/employees',
            payload: employees[i]
          },
          explanation: 'Adding employees to departments'
        }, persona, context);
        
        context[`employee${i + 1}Id`] = empResponse.body.data.id;
      }

      console.log(`✅ Setup completed - departments and employees created`);

      // Step 1: Deepak reviews current department structure
      const step1: StoryStep = {
        id: 'review-current-structure',
        narrative: 'Deepak reviews the current departmental hierarchy to plan the reorganization',
        expectation: 'He should see the complete organizational structure with all departments and employees',
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/departments/hierarchy'
        },
        explanation: 'Deepak analyzes the current structure before making organizational changes'
      };

      console.log(`📍 Step 1: ${step1.narrative}`);
      const response1 = await executeStoryStep(step1, persona, context);
      expect(response1.status).toBe(200);
      expect(response1.body.success).toBe(true);
      const hierarchy = response1.body.data;
      expect(hierarchy.length).toBeGreaterThan(0);
      console.log(`✅ Deepak reviewed the current departmental structure`);

      // Step 2: Deepak transfers an employee between departments
      const transferData = {
        departmentId: '{{itDepartmentId}}',
        position: {
          en: 'Senior Software Engineer',
          ne: 'वरिष्ठ सफ्टवेयर इन्जिनियर'
        }
      };

      const step2: StoryStep = {
        id: 'transfer-employee',
        narrative: 'Deepak transfers John from the Development sub-department to the main IT department with a promotion',
        expectation: 'The employee should be successfully transferred with updated position',
        apiCall: {
          method: 'PUT',
          endpoint: '/api/v1/admin/employees/{{employee1Id}}',
          payload: transferData
        },
        explanation: 'Deepak executes the organizational change by moving employees between departments'
      };

      console.log(`📍 Step 2: ${step2.narrative}`);
      const response2 = await executeStoryStep(step2, persona, context);
      expect(response2.status).toBe(200);
      expect(response2.body.success).toBe(true);
      expect(response2.body.data.departmentId).toBe(context.itDepartmentId);
      expect(response2.body.data.position.en).toBe('Senior Software Engineer');
      console.log(`✅ Deepak successfully transferred and promoted John`);

      // Step 3: Deepak verifies the reorganization
      const step3: StoryStep = {
        id: 'verify-reorganization',
        narrative: 'Deepak checks that the employee now appears in the correct department with updated role',
        expectation: 'The transferred employee should appear in the new department roster',
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/employees/department/{{itDepartmentId}}'
        },
        explanation: 'Deepak confirms the organizational changes have been properly implemented'
      };

      console.log(`📍 Step 3: ${step3.narrative}`);
      const response3 = await executeStoryStep(step3, persona, context);
      expect(response3.status).toBe(200);
      expect(response3.body.success).toBe(true);
      const itEmployees = response3.body.data;
      const transferredEmployee = itEmployees.find((emp: any) => emp.id === context.employee1Id);
      expect(transferredEmployee).toBeDefined();
      expect(transferredEmployee.position.en).toBe('Senior Software Engineer');
      console.log(`✅ Deepak confirmed the reorganization was successful`);

      console.log(`\n🎉 Story completed successfully! Deepak has reorganized his department structure.\n`);
    });
  });

  describe('Story: Sarah Employee - Directory Access and Information Lookup', () => {
    it('should complete employee directory exploration workflow', async () => {
      const persona = sarahEmployee;
      const scenario = hrManagementScenarios.employeeDirectoryAccess;
      const context: Record<string, any> = {};

      console.log(`\n📖 Story: ${scenario.title}`);
      console.log(`👤 Persona: ${persona.name} (${persona.occupation})`);
      console.log(`📝 Scenario: ${scenario.description}\n`);

      // Setup: Create some test data for Sarah to explore
      console.log(`📍 Setup: Creating organizational data for Sarah to explore`);
      
      // Create HR admin persona for setup
      const setupPersona = mayaHRManager;
      
      // Create department
      const deptResponse = await executeStoryStep({
        id: 'setup-dept',
        narrative: 'Setup department for directory exploration',
        expectation: 'Department created',
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/admin/departments',
          payload: {
            departmentName: {
              en: 'Human Resources',
              ne: 'मानव संसाधन'
            },
            parentId: null,
            order: 1,
            isActive: true
          }
        },
        explanation: 'Creating department structure for exploration'
      }, setupPersona, context);

      context.hrDepartmentId = deptResponse.body.data.id;

      // Create employee
      await executeStoryStep({
        id: 'setup-employee',
        narrative: 'Setup employee for directory exploration',
        expectation: 'Employee created',
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/admin/employees',
          payload: {
            name: {
              en: 'Maya HR Manager',
              ne: 'माया एचआर म्यानेजर'
            },
            departmentId: '{{hrDepartmentId}}',
            position: {
              en: 'HR Manager',
              ne: 'एचआर म्यानेजर'
            },
            order: 1,
            email: 'maya.hr@icms.gov.np',
            mobileNumber: '+977-9841234568',
            telephone: '+977-1-1234568',
            roomNumber: 'Room 201',
            isActive: true
          }
        },
        explanation: 'Adding employees to the directory'
      }, setupPersona, context);

      console.log(`✅ Setup completed - organizational data created`);

      // Step 1: Sarah explores the department structure
      const step1: StoryStep = {
        id: 'explore-departments',
        narrative: 'Sarah opens the employee portal and browses the department structure to understand the organization',
        expectation: 'She should see a list of all active departments in the organization',
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/departments'
        },
        explanation: 'Sarah familiarizes herself with the organizational structure as a new employee'
      };

      console.log(`📍 Step 1: ${step1.narrative}`);
      const response1 = await executeStoryStep(step1, persona, context);
      expect(response1.status).toBe(200);
      expect(response1.body.success).toBe(true);
      expect(response1.body.data).toBeDefined();
      expect(Array.isArray(response1.body.data)).toBe(true);
      console.log(`✅ Sarah successfully viewed the department structure`);

      // Step 2: Sarah searches for HR employees
      const step2: StoryStep = {
        id: 'search-hr-employees',
        narrative: 'Sarah searches for "HR" to find Human Resources department employees and their contact information',
        expectation: 'She should find relevant HR employees with their contact details',
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/employees/search',
          query: { q: 'HR' }
        },
        explanation: 'Sarah uses the search functionality to find specific employees she needs to contact'
      };

      console.log(`📍 Step 2: ${step2.narrative}`);
      const response2 = await executeStoryStep(step2, persona, context);
      expect(response2.status).toBe(200);
      expect(response2.body.success).toBe(true);
      const searchResults = response2.body.data;
      expect(Array.isArray(searchResults)).toBe(true);
      console.log(`✅ Sarah found HR employees through search`);

      // Step 3: Sarah views employees in HR department
      const step3: StoryStep = {
        id: 'view-hr-department-employees',
        narrative: 'Sarah clicks on the HR department to see all employees and their roles within that department',
        expectation: 'She should see a complete list of HR department employees with their positions and contact information',
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/employees/department/{{hrDepartmentId}}'
        },
        explanation: 'Sarah explores the departmental structure to understand reporting relationships and find the right contacts'
      };

      console.log(`📍 Step 3: ${step3.narrative}`);
      const response3 = await executeStoryStep(step3, persona, context);
      expect(response3.status).toBe(200);
      expect(response3.body.success).toBe(true);
      const hrEmployees = response3.body.data;
      expect(Array.isArray(hrEmployees)).toBe(true);
      console.log(`✅ Sarah successfully viewed the HR department employee roster`);

      // Step 4: Sarah views the organizational hierarchy
      const step4: StoryStep = {
        id: 'view-organizational-hierarchy',
        narrative: 'Sarah explores the complete organizational hierarchy to understand how departments relate to each other',
        expectation: 'She should see a structured view of all departments and their relationships',
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/departments/hierarchy'
        },
        explanation: 'Sarah gains a comprehensive understanding of the organizational structure for better workplace navigation'
      };

      console.log(`📍 Step 4: ${step4.narrative}`);
      const response4 = await executeStoryStep(step4, persona, context);
      expect(response4.status).toBe(200);
      expect(response4.body.success).toBe(true);
      expect(response4.body.data).toBeDefined();
      console.log(`✅ Sarah successfully explored the organizational hierarchy`);

      console.log(`\n🎉 Story completed successfully! Sarah has explored the employee directory and understands the organization.\n`);
    });
  });

  describe('Story: Maya HR Manager - Bulk Operations and Analytics', () => {
    it('should complete HR analytics and reporting workflow', async () => {
      const persona = mayaHRManager;
      const scenario = hrManagementScenarios.hrReportsGeneration;
      const context: Record<string, any> = {};

      console.log(`\n📖 Story: ${scenario.title}`);
      console.log(`👤 Persona: ${persona.name} (${persona.occupation})`);
      console.log(`📝 Scenario: ${scenario.description}\n`);

      // Setup: Create comprehensive test data
      console.log(`📍 Setup: Creating comprehensive HR data for analytics`);
      
      // Create multiple departments
      const departments = [
        { name: { en: 'IT Department', ne: 'आईटी विभाग' }, order: 1 },
        { name: { en: 'HR Department', ne: 'एचआर विभाग' }, order: 2 },
        { name: { en: 'Finance Department', ne: 'वित्त विभाग' }, order: 3 }
      ];

      for (let i = 0; i < departments.length; i++) {
        const deptResponse = await executeStoryStep({
          id: `setup-dept-${i}`,
          narrative: `Setup department ${i + 1}`,
          expectation: 'Department created',
          apiCall: {
            method: 'POST',
            endpoint: '/api/v1/admin/departments',
            payload: {
              departmentName: departments[i].name,
              parentId: null,
              order: departments[i].order,
              isActive: true
            }
          },
          explanation: 'Creating multiple departments for analytics'
        }, persona, context);
        
        context[`dept${i + 1}Id`] = deptResponse.body.data.id;
      }

      // Create employees in different departments
      const employees = [
        { name: { en: 'Alice IT', ne: 'एलिस आईटी' }, deptKey: 'dept1Id', position: { en: 'Developer', ne: 'डेभलपर' } },
        { name: { en: 'Bob IT', ne: 'बब आईटी' }, deptKey: 'dept1Id', position: { en: 'Analyst', ne: 'एनालिस्ट' } },
        { name: { en: 'Carol HR', ne: 'क्यारोल एचआर' }, deptKey: 'dept2Id', position: { en: 'Coordinator', ne: 'संयोजक' } },
        { name: { en: 'David Finance', ne: 'डेभिड वित्त' }, deptKey: 'dept3Id', position: { en: 'Accountant', ne: 'लेखापाल' } }
      ];

      for (let i = 0; i < employees.length; i++) {
        await executeStoryStep({
          id: `setup-emp-${i}`,
          narrative: `Setup employee ${i + 1}`,
          expectation: 'Employee created',
          apiCall: {
            method: 'POST',
            endpoint: '/api/v1/admin/employees',
            payload: {
              name: employees[i].name,
              departmentId: `{{${employees[i].deptKey}}}`,
              position: employees[i].position,
              order: 1,
              email: `employee${i + 1}@icms.gov.np`,
              isActive: true
            }
          },
          explanation: 'Adding employees across departments for comprehensive analytics'
        }, persona, context);
      }

      console.log(`✅ Setup completed - comprehensive HR data created`);

      // Step 1: Maya generates HR statistics
      const step1: StoryStep = {
        id: 'generate-hr-statistics',
        narrative: 'Maya accesses the HR analytics dashboard to generate comprehensive organizational statistics',
        expectation: 'She should receive detailed metrics about departments, employees, and organizational structure',
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/admin/hr/statistics'
        },
        explanation: 'Maya reviews organizational metrics to prepare reports for management'
      };

      console.log(`📍 Step 1: ${step1.narrative}`);
      const response1 = await executeStoryStep(step1, persona, context);
      expect(response1.status).toBe(200);
      expect(response1.body.success).toBe(true);
      const statistics = response1.body.data;
      expect(statistics.totalDepartments).toBeGreaterThan(0);
      expect(statistics.totalEmployees).toBeGreaterThan(0);
      console.log(`✅ Maya successfully generated HR statistics`);

      // Step 2: Maya performs bulk activation of employees
      const employeeIds = [context.employee1Id, context.employee2Id].filter(Boolean);
      
      if (employeeIds.length > 0) {
        const step2: StoryStep = {
          id: 'bulk-activate-employees',
          narrative: 'Maya performs bulk operations to activate multiple employees simultaneously',
          expectation: 'All selected employees should be successfully activated',
          apiCall: {
            method: 'POST',
            endpoint: '/api/v1/admin/employees/bulk-activate',
            payload: { ids: employeeIds }
          },
          explanation: 'Maya uses bulk operations to efficiently manage multiple employee records'
        };

        console.log(`📍 Step 2: ${step2.narrative}`);
        const response2 = await executeStoryStep(step2, persona, context);
        expect(response2.status).toBe(200);
        expect(response2.body.success).toBe(true);
        console.log(`✅ Maya successfully performed bulk employee activation`);
      }

      // Step 3: Maya exports department data
      const step3: StoryStep = {
        id: 'export-department-data',
        narrative: 'Maya exports department data for external reporting and compliance requirements',
        expectation: 'She should receive a properly formatted export of all department information',
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/admin/departments/export',
          query: { format: 'json' }
        },
        explanation: 'Maya prepares departmental data for external stakeholders and compliance reporting'
      };

      console.log(`📍 Step 3: ${step3.narrative}`);
      const response3 = await executeStoryStep(step3, persona, context);
      expect(response3.status).toBe(200);
      console.log(`✅ Maya successfully exported department data`);

      console.log(`\n🎉 Story completed successfully! Maya has generated analytics and performed bulk operations.\n`);
    });
  });
}); 