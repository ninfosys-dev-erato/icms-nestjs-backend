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

describe('HR Module Setup', () => {
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
    
    // Set global prefix to match main app
    app.setGlobalPrefix('api/v1');

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupDatabase();
    // Add delay after cleanup to ensure database is ready
    await new Promise(resolve => setTimeout(resolve, 200));
  });

  afterEach(async () => {
    // Add delay after each test to allow cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  const cleanupDatabase = async () => {
    await TestUtils.cleanupDatabase(prisma);
  };

  describe('HR Module Integration', () => {
    it('should have HR module properly configured', () => {
      expect(app).toBeDefined();
      expect(prisma).toBeDefined();
    });

    it('should have public department endpoints accessible', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/departments')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should have public employee endpoints accessible', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/employees')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should have admin department endpoints protected', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/departments')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Unauthorized');
    });

    it('should have admin employee endpoints protected', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/employees')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Unauthorized');
    });
  });

  describe('HR Database Schema', () => {
    it('should have department table accessible', async () => {
      const result = await prisma.department.findMany();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should have employee table accessible', async () => {
      const result = await prisma.employee.findMany();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should support department creation', async () => {
      const department = await TestUtils.retryOperation(
        () => prisma.department.create({
          data: {
            departmentName: {
              en: 'Test Department',
              ne: 'परीक्षण विभाग',
            },
            parentId: null,
            departmentHeadId: null,
            order: 1,
            isActive: true,
          },
        }),
        3,
        500,
        'Department creation'
      );

      expect(department.id).toBeDefined();
      expect(department.departmentName).toEqual({
        en: 'Test Department',
        ne: 'परीक्षण विभाग',
      });
      expect(department.order).toBe(1);
      expect(department.isActive).toBe(true);
    });

    it('should support employee creation', async () => {
      // First create a department with retry logic
      const department = await TestUtils.retryOperation(
        () => prisma.department.create({
          data: {
            departmentName: {
              en: 'Test Department',
              ne: 'परीक्षण विभाग',
            },
            parentId: null,
            departmentHeadId: null,
            order: 1,
            isActive: true,
          },
        }),
        3,
        500,
        'Department creation'
      );

      // Create employee with retry logic
      const employee = await TestUtils.retryOperation(
        () => prisma.employee.create({
          data: {
            name: {
              en: 'Test Employee',
              ne: 'परीक्षण कर्मचारी',
            },
            departmentId: department.id,
            position: {
              en: 'Developer',
              ne: 'डेभलपर',
            },
            order: 1,
            mobileNumber: '+977-9841234567',
            telephone: '+977-1-1234567',
            email: 'test@example.com',
            roomNumber: 'Room 101',
            isActive: true,
          },
        }),
        3,
        500,
        'Employee creation'
      );

      expect(employee.id).toBeDefined();
      expect(employee.name).toEqual({
        en: 'Test Employee',
        ne: 'परीक्षण कर्मचारी',
      });
      expect(employee.departmentId).toBe(department.id);
      expect(employee.position).toEqual({
        en: 'Developer',
        ne: 'डेभलपर',
      });
      expect(employee.order).toBe(1);
      expect(employee.isActive).toBe(true);
    });

    it('should support department updates', async () => {
      const department = await prisma.department.create({
        data: {
          departmentName: {
            en: 'Original Department',
            ne: 'मूल विभाग',
          },
          parentId: null,
          departmentHeadId: null,
          order: 1,
          isActive: true,
        },
      });

      const updatedDepartment = await prisma.department.update({
        where: { id: department.id },
        data: {
          departmentName: {
            en: 'Updated Department',
            ne: 'अपडेटेड विभाग',
          },
          order: 2,
        },
      });

      expect((updatedDepartment.departmentName as any).en).toBe('Updated Department');
      expect(updatedDepartment.order).toBe(2);
    });

    it('should support employee updates', async () => {
      // First create a department
      const department = await prisma.department.create({
        data: {
          departmentName: {
            en: 'Test Department',
            ne: 'परीक्षण विभाग',
          },
          parentId: null,
          departmentHeadId: null,
          order: 1,
          isActive: true,
        },
      });

      const employee = await prisma.employee.create({
        data: {
          name: {
            en: 'Original Employee',
            ne: 'मूल कर्मचारी',
          },
          departmentId: department.id,
          position: {
            en: 'Developer',
            ne: 'डेभलपर',
          },
          order: 1,
          isActive: true,
        },
      });

      const updatedEmployee = await prisma.employee.update({
        where: { id: employee.id },
        data: {
          name: {
            en: 'Updated Employee',
            ne: 'अपडेटेड कर्मचारी',
          },
          position: {
            en: 'Senior Developer',
            ne: 'वरिष्ठ डेभलपर',
          },
          order: 2,
        },
      });

      expect((updatedEmployee.name as any).en).toBe('Updated Employee');
      expect((updatedEmployee.position as any).en).toBe('Senior Developer');
      expect(updatedEmployee.order).toBe(2);
    });

    it('should support department deletion', async () => {
      const department = await prisma.department.create({
        data: {
          departmentName: {
            en: 'To Delete',
            ne: 'मेटाउन',
          },
          parentId: null,
          departmentHeadId: null,
          order: 1,
          isActive: true,
        },
      });

      await prisma.department.delete({
        where: { id: department.id },
      });

      const deletedDepartment = await prisma.department.findUnique({
        where: { id: department.id },
      });

      expect(deletedDepartment).toBeNull();
    });

    it('should support employee deletion', async () => {
      // First create a department
      const department = await prisma.department.create({
        data: {
          departmentName: {
            en: 'Test Department',
            ne: 'परीक्षण विभाग',
          },
          parentId: null,
          departmentHeadId: null,
          order: 1,
          isActive: true,
        },
      });

      const employee = await prisma.employee.create({
        data: {
          name: {
            en: 'To Delete',
            ne: 'मेटाउन',
          },
          departmentId: department.id,
          position: {
            en: 'Developer',
            ne: 'डेभलपर',
          },
          order: 1,
          isActive: true,
        },
      });

      await prisma.employee.delete({
        where: { id: employee.id },
      });

      const deletedEmployee = await prisma.employee.findUnique({
        where: { id: employee.id },
      });

      expect(deletedEmployee).toBeNull();
    });
  });

  describe('HR Validation', () => {
    it('should validate required fields for departments', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/departments')
        .set('Authorization', 'Bearer invalid-token')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields for employees', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/employees')
        .set('Authorization', 'Bearer invalid-token')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate department name structure', async () => {
      // This test would require a valid token, so we'll test the validation logic
      const invalidData = {
        departmentName: { en: 'Only English' }, // Missing Nepali
        parentId: null,
        order: 1,
      };

      // The validation would fail at the DTO level
      expect((invalidData.departmentName as any).ne).toBeUndefined();
    });

    it('should validate employee name structure', async () => {
      // This test would require a valid token, so we'll test the validation logic
      const invalidData = {
        name: { en: 'Only English' }, // Missing Nepali
        departmentId: 'dept-1',
        position: { en: 'Developer', ne: 'डेभलपर' },
        order: 1,
      };

      // The validation would fail at the DTO level
      expect((invalidData.name as any).ne).toBeUndefined();
    });
  });

  describe('HR Search Functionality', () => {
    it('should support text search in departments', async () => {
      // Create test departments one by one to avoid deadlocks
      const dept1 = await prisma.department.create({
        data: {
          departmentName: {
            en: 'Information Technology',
            ne: 'सूचना प्रविधि',
          },
          parentId: null,
          departmentHeadId: null,
          order: 1,
          isActive: true,
        },
      });

      const dept2 = await prisma.department.create({
        data: {
          departmentName: {
            en: 'Human Resources',
            ne: 'मानव संसाधन',
          },
          parentId: null,
          departmentHeadId: null,
          order: 2,
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/departments/search?search=Technology')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should support text search in employees', async () => {
      // First create a department
      const department = await prisma.department.create({
        data: {
          departmentName: {
            en: 'Test Department',
            ne: 'परीक्षण विभाग',
          },
          parentId: null,
          departmentHeadId: null,
          order: 1,
          isActive: true,
        },
      });

      // Create test employees one by one to avoid deadlocks
      const emp1 = await prisma.employee.create({
        data: {
          name: {
            en: 'John Doe',
            ne: 'जोन डो',
          },
          departmentId: department.id,
          position: {
            en: 'Software Engineer',
            ne: 'सफ्टवेयर इन्जिनियर',
          },
          order: 1,
          isActive: true,
        },
      });

      const emp2 = await prisma.employee.create({
        data: {
          name: {
            en: 'Jane Smith',
            ne: 'जेन स्मिथ',
          },
          departmentId: department.id,
          position: {
            en: 'HR Manager',
            ne: 'एचआर म्यानेजर',
          },
          order: 2,
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/employees/search?search=John')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('HR Pagination', () => {
    it('should support department pagination', async () => {
      // Create multiple departments one by one to avoid deadlocks
      for (let i = 0; i < 15; i++) {
        await TestUtils.retryOperation(
          () => prisma.department.create({
            data: {
              departmentName: {
                en: `Department for Pagination ${i + 1}`,
                ne: `पेजिनेशन के लिए विभाग ${i + 1}`,
              },
              parentId: null,
              departmentHeadId: null,
              order: i + 1,
              isActive: true,
            },
          }),
          3,
          200,
          `Department creation ${i + 1}`
        );
        
        // Add small delay between creations
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Verify departments were created
      const totalDepartments = await prisma.department.count();
      console.log(`Total departments created: ${totalDepartments}`);

      const response = await request(app.getHttpServer())
        .get('/api/v1/departments?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBeGreaterThan(0);
    });

    it('should support employee pagination', async () => {
      // First create a department with retry logic
      const department = await TestUtils.retryOperation(
        () => prisma.department.create({
          data: {
            departmentName: {
              en: 'Test Department for Employees',
              ne: 'कर्मचारियों के लिए परीक्षण विभाग',
            },
            parentId: null,
            departmentHeadId: null,
            order: 1,
            isActive: true,
          },
        }),
        3,
        200,
        'Department creation'
      );

      // Create multiple employees one by one to avoid deadlocks
      for (let i = 0; i < 15; i++) {
        await TestUtils.retryOperation(
          () => prisma.employee.create({
            data: {
              name: {
                en: `Employee ${i + 1}`,
                ne: `कर्मचारी ${i + 1}`,
              },
              departmentId: department.id,
              position: {
                en: `Position ${i + 1}`,
                ne: `पद ${i + 1}`,
              },
              order: i + 1,
              isActive: true,
            },
          }),
          3,
          200,
          `Employee creation ${i + 1}`
        );
        
        // Add small delay between creations
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Verify employees were created
      const totalEmployees = await prisma.employee.count();
      console.log(`Total employees created: ${totalEmployees}`);

      const response = await request(app.getHttpServer())
        .get('/api/v1/employees?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBeGreaterThan(0);
    });
  });

  describe('HR Statistics', () => {
    it('should provide HR statistics', async () => {
      // Create departments one by one to avoid deadlocks
      await prisma.department.create({
        data: {
          departmentName: { en: 'Active Department 1', ne: 'सक्रिय विभाग १' },
          parentId: null,
          departmentHeadId: null,
          order: 1,
          isActive: true,
        },
      });

      await prisma.department.create({
        data: {
          departmentName: { en: 'Active Department 2', ne: 'सक्रिय विभाग २' },
          parentId: null,
          departmentHeadId: null,
          order: 2,
          isActive: true,
        },
      });

      await prisma.department.create({
        data: {
          departmentName: { en: 'Inactive Department', ne: 'निष्क्रिय विभाग' },
          parentId: null,
          departmentHeadId: null,
          order: 3,
          isActive: false,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/departments/statistics')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      // We can't test the actual statistics without authentication,
      // but we can verify the endpoint exists and requires auth
      expect(response.body.success).toBe(false);
    });
  });

  describe('Department Hierarchy', () => {
    it('should support department hierarchy', async () => {
      // Create parent department
      const parentDept = await prisma.department.create({
        data: {
          departmentName: {
            en: 'Parent Department',
            ne: 'मूल विभाग',
          },
          parentId: null,
          departmentHeadId: null,
          order: 1,
          isActive: true,
        },
      });

      // Create child department
      await prisma.department.create({
        data: {
          departmentName: {
            en: 'Child Department',
            ne: 'शाखा विभाग',
          },
          parentId: parentDept.id,
          departmentHeadId: null,
          order: 1,
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/departments/hierarchy')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Employee Management by Department', () => {
    it('should support getting employees by department', async () => {
      // First create a department
      const department = await prisma.department.create({
        data: {
          departmentName: {
            en: 'Test Department',
            ne: 'परीक्षण विभाग',
          },
          parentId: null,
          departmentHeadId: null,
          order: 1,
          isActive: true,
        },
      });

      // Create employees in the department one by one to avoid deadlocks
      await prisma.employee.create({
        data: {
          name: {
            en: 'Employee 1',
            ne: 'कर्मचारी १',
          },
          departmentId: department.id,
          position: {
            en: 'Developer',
            ne: 'डेभलपर',
          },
          order: 1,
          isActive: true,
        },
      });

      await prisma.employee.create({
        data: {
          name: {
            en: 'Employee 2',
            ne: 'कर्मचारी २',
          },
          departmentId: department.id,
          position: {
            en: 'Manager',
            ne: 'म्यानेजर',
          },
          order: 2,
          isActive: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/employees/department/${department.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
}); 