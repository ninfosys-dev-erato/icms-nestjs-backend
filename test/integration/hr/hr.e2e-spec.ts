import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';

import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';
import { TestUtils } from '../../test-utils';

describe('HR Management (e2e)', () => {
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
    
    // Set global prefix to match main app
    app.setGlobalPrefix('api/v1');

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await TestUtils.cleanupDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await TestUtils.cleanupDatabase(prisma);
    await createTestData();
  });

  const createTestData = async () => {
    try {
      // Create test departments using sequential creation to avoid deadlocks
      const departmentData = [
        {
          departmentName: {
            en: 'Information Technology',
            ne: 'सूचना प्रविधि',
          },
          parentId: null,
          departmentHeadId: null,
          order: 1,
          isActive: true,
        },
        {
          departmentName: {
            en: 'Human Resources',
            ne: 'मानव संसाधन',
          },
          parentId: null,
          departmentHeadId: null,
          order: 2,
          isActive: true,
        },
        {
          departmentName: {
            en: 'Software Development',
            ne: 'सफ्टवेयर विकास',
          },
          parentId: null,
          departmentHeadId: null,
          order: 3,
          isActive: false,
        },
      ];

      const departments = await TestUtils.createSequentialData(
        prisma,
        departmentData,
        (data) => prisma.department.create({ data })
      );

      const itDept = departments[0];
      const hrDept = departments[1];
      const softwareDept = departments[2];

      // Update software dept to have IT as parent
      await prisma.department.update({
        where: { id: softwareDept.id },
        data: { parentId: itDept.id },
      });

      // Create test employees using sequential creation
      const employeeData = [
        {
          name: {
            en: 'John Doe',
            ne: 'जोन डो',
          },
          departmentId: itDept.id,
          position: {
            en: 'Software Engineer',
            ne: 'सफ्टवेयर इन्जिनियर',
          },
          order: 1,
          mobileNumber: '+977-9841234567',
          telephone: '+977-1-1234567',
          email: 'john.doe@example.com',
          roomNumber: 'Room 101',
          isActive: true,
        },
        {
          name: {
            en: 'Jane Smith',
            ne: 'जेन स्मिथ',
          },
          departmentId: hrDept.id,
          position: {
            en: 'HR Manager',
            ne: 'एचआर म्यानेजर',
          },
          order: 1,
          mobileNumber: '+977-9841234568',
          telephone: '+977-1-1234568',
          email: 'jane.smith@example.com',
          roomNumber: 'Room 102',
          isActive: true,
        },
        {
          name: {
            en: 'Bob Johnson',
            ne: 'बब जोन्सन',
          },
          departmentId: softwareDept.id,
          position: {
            en: 'Senior Developer',
            ne: 'वरिष्ठ डेभलपर',
          },
          order: 1,
          mobileNumber: '+977-9841234569',
          telephone: '+977-1-1234569',
          email: 'bob.johnson@example.com',
          roomNumber: 'Room 103',
          isActive: false,
        },
      ];

      await TestUtils.createSequentialData(
        prisma,
        employeeData,
        (data) => prisma.employee.create({ data })
      );
    } catch (error) {
      console.warn('Test data creation error:', error.message);
      throw error;
    }
  };

  const getAuthToken = async (): Promise<string> => {
    return TestUtils.createAuthToken(prisma);
  };

  describe('GET /api/v1/departments', () => {
    it('should get all active departments', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/departments')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Should only return active departments
      const activeDepartments = response.body.data.filter((dept: any) => dept.isActive);
      expect(activeDepartments.length).toBe(2);
    });

    it('should get all departments including inactive', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/departments?isActive=false')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by parent department', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/departments?parentId=null')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/departments/hierarchy', () => {
    it('should get department hierarchy', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/departments/hierarchy')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/departments/search', () => {
    it('should search departments by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/departments/search?q=Technology')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search with active filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/departments/search?q=Human&isActive=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return empty array for non-matching search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/departments/search?q=nonexistentdepartment')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/departments/:id', () => {
    it('should get department by ID', async () => {
      // First get a list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/departments')
        .expect(200);

      const firstDept = listResponse.body.data[0];
      const deptId = firstDept.id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/departments/${deptId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(deptId);
      expect(response.body.data.departmentName).toBeDefined();
    });

    it('should return 404 for non-existent department', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/departments/nonexistent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/employees', () => {
    it('should get all active employees', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/employees')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Should only return active employees
      const activeEmployees = response.body.data.filter((emp: any) => emp.isActive);
      expect(activeEmployees.length).toBe(2);
    });

    it('should get all employees including inactive', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/employees?isActive=false')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by department', async () => {
      // First get a department ID
      const deptResponse = await request(app.getHttpServer())
        .get('/api/v1/departments')
        .expect(200);

      const deptId = deptResponse.body.data[0].id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/employees?departmentId=${deptId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/employees/search', () => {
    it('should search employees by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/employees/search?q=John')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search with active filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/employees/search?q=Jane&isActive=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return empty array for non-matching search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/employees/search?q=nonexistentemployee')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/employees/department/:departmentId', () => {
    it('should get employees by department', async () => {
      // First get a department ID
      const deptResponse = await request(app.getHttpServer())
        .get('/api/v1/departments')
        .expect(200);

      const deptId = deptResponse.body.data[0].id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/employees/department/${deptId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent department', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/employees/department/nonexistent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/employees/position/:position', () => {
    it('should get employees by position', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/employees/position/Software Engineer')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return empty array for non-existent position', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/employees/position/nonexistentposition')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/employees/:id', () => {
    it('should get employee by ID', async () => {
      // First get a list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/employees')
        .expect(200);

      const firstEmp = listResponse.body.data[0];
      const empId = firstEmp.id;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/employees/${empId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(empId);
      expect(response.body.data.name).toBeDefined();
      expect(response.body.data.position).toBeDefined();
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/employees/nonexistent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Admin Department Endpoints', () => {
    let authToken: string;

    beforeEach(async () => {
      authToken = await getAuthToken();
    });

    describe('POST /api/v1/admin/departments', () => {
      it('should create new department', async () => {
        const departmentData = {
          departmentName: {
            en: 'Finance Department',
            ne: 'वित्त विभाग',
          },
          parentId: null,
          departmentHeadId: null,
          order: 4,
          isActive: true,
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/departments')
          .set('Authorization', `Bearer ${authToken}`)
          .send(departmentData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.departmentName).toEqual(departmentData.departmentName);
      });

      it('should validate required fields', async () => {
        const invalidData = {
          // Missing departmentName
          parentId: null,
          order: 1,
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/departments')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('PUT /api/v1/admin/departments/:id', () => {
      it('should update existing department', async () => {
        // First create a department
        const deptResponse = await request(app.getHttpServer())
          .get('/api/v1/departments')
          .expect(200);

        const deptId = deptResponse.body.data[0].id;

        const updateData = {
          departmentName: {
            en: 'Updated IT Department',
            ne: 'अपडेटेड आईटी विभाग',
          },
          order: 5,
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/departments/${deptId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.departmentName).toEqual(updateData.departmentName);
        expect(response.body.data.order).toBe(updateData.order);
      });
    });

    describe('DELETE /api/v1/admin/departments/:id', () => {
      it('should delete department', async () => {
        // Create a standalone department specifically for deletion
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/admin/departments')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            departmentName: {
              en: 'Test Department for Deletion',
              ne: 'मेटाउनका लागि परीक्षण विभाग',
            },
            parentId: null,
            departmentHeadId: null,
            order: 999,
            isActive: true,
          })
          .expect(201);

        const deptId = createResponse.body.data.id;

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/admin/departments/${deptId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /api/v1/admin/hr/statistics', () => {
      it('should get HR statistics', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/hr/statistics')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.totalDepartments).toBeGreaterThan(0);
        expect(response.body.data.totalEmployees).toBeGreaterThan(0);
      });
    });
  });

  describe('Admin Employee Endpoints', () => {
    let authToken: string;

    beforeEach(async () => {
      authToken = await getAuthToken();
    });

    describe('POST /api/v1/admin/employees', () => {
      it('should create new employee', async () => {
        // First get a department ID
        const deptResponse = await request(app.getHttpServer())
          .get('/api/v1/departments')
          .expect(200);

        const deptId = deptResponse.body.data[0].id;

        const employeeData = {
          name: {
            en: 'Alice Johnson',
            ne: 'एलिस जोन्सन',
          },
          departmentId: deptId,
          position: {
            en: 'Project Manager',
            ne: 'प्रोजेक्ट म्यानेजर',
          },
          order: 2,
          mobileNumber: '+977-9841234570',
          telephone: '+977-1-1234570',
          email: 'alice.johnson@example.com',
          roomNumber: 'Room 104',
          isActive: true,
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/employees')
          .set('Authorization', `Bearer ${authToken}`)
          .send(employeeData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.name).toEqual(employeeData.name);
        expect(response.body.data.departmentId).toBe(deptId);
      });

      it('should validate required fields', async () => {
        const invalidData = {
          // Missing name and departmentId
          position: {
            en: 'Developer',
            ne: 'डेभलपर',
          },
          order: 1,
        };

        const response = await request(app.getHttpServer())
          .post('/api/v1/admin/employees')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('PUT /api/v1/admin/employees/:id', () => {
      it('should update existing employee', async () => {
        // First get an employee
        const empResponse = await request(app.getHttpServer())
          .get('/api/v1/employees')
          .expect(200);

        const empId = empResponse.body.data[0].id;

        const updateData = {
          name: {
            en: 'Updated John Doe',
            ne: 'अपडेटेड जोन डो',
          },
          position: {
            en: 'Senior Software Engineer',
            ne: 'वरिष्ठ सफ्टवेयर इन्जिनियर',
          },
          order: 2,
        };

        const response = await request(app.getHttpServer())
          .put(`/api/v1/admin/employees/${empId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toEqual(updateData.name);
        expect(response.body.data.position).toEqual(updateData.position);
      });
    });

    describe('DELETE /api/v1/admin/employees/:id', () => {
      it('should delete employee', async () => {
        // First get an employee
        const empResponse = await request(app.getHttpServer())
          .get('/api/v1/employees')
          .expect(200);

        const empId = empResponse.body.data[0].id;

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/admin/employees/${empId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Bulk Operations', () => {
    let authToken: string;

    beforeEach(async () => {
      authToken = await getAuthToken();
    });

    describe('POST /api/v1/admin/departments/bulk-activate', () => {
      it('should bulk activate departments', async () => {
        // Get inactive departments
        const deptResponse = await request(app.getHttpServer())
          .get('/api/v1/departments?isActive=false')
          .expect(200);

        const deptIds = deptResponse.body.data.map((dept: any) => dept.id);

        if (deptIds.length > 0) {
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/departments/bulk-activate')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ ids: deptIds })
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.data).toBeDefined();
        }
      });
    });

    describe('POST /api/v1/admin/employees/bulk-activate', () => {
      it('should bulk activate employees', async () => {
        // Get inactive employees
        const empResponse = await request(app.getHttpServer())
          .get('/api/v1/employees?isActive=false')
          .expect(200);

        const empIds = empResponse.body.data.map((emp: any) => emp.id);

        if (empIds.length > 0) {
          const response = await request(app.getHttpServer())
            .post('/api/v1/admin/employees/bulk-activate')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ ids: empIds })
            .expect(200);

          expect(response.body.success).toBe(true);
          expect(response.body.data).toBeDefined();
        }
      });
    });
  });

  describe('Error handling', () => {
    it('should handle invalid pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/departments?page=-1&limit=0')
        .expect(200); // Should still return 200 but with default values

      expect(response.body.success).toBe(true);
    });

    it('should handle missing search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/departments/search')
        .expect(400); // Should return 400 for missing required query parameter

      expect(response.body.success).toBe(false);
    });

    it('should handle unauthorized access to admin endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/departments')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Unauthorized');
    });
  });
}); 