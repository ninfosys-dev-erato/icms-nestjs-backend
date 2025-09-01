import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeRepository } from '../../../src/modules/hr/repositories/employee.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { Employee } from '../../../src/modules/hr/entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from '../../../src/modules/hr/dto/hr.dto';

describe('EmployeeRepository', () => {
  let repository: EmployeeRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockEmployee: Employee = {
    id: '1',
    name: {
      en: 'John Doe',
      ne: 'जोन डो',
    },
    departmentId: 'dept-1',
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
    showUpInHomepage: false,
    showDownInHomepage: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEmployees: Employee[] = [
    mockEmployee,
    {
      ...mockEmployee,
      id: '2',
      name: {
        en: 'Jane Smith',
        ne: 'जेन स्मिथ',
      },
      departmentId: 'dept-2',
      position: {
        en: 'HR Manager',
        ne: 'एचआर म्यानेजर',
      },
      order: 1,
      mobileNumber: '+977-9841234568',
      telephone: '+977-1-1234568',
      email: 'jane.smith@example.com',
      roomNumber: 'Room 102',
    },
    {
      ...mockEmployee,
      id: '3',
      name: {
        en: 'Bob Johnson',
        ne: 'बब जोन्सन',
      },
      departmentId: 'dept-1',
      position: {
        en: 'Senior Developer',
        ne: 'वरिष्ठ डेभलपर',
      },
      order: 2,
      mobileNumber: '+977-9841234569',
      telephone: '+977-1-1234569',
      email: 'bob.johnson@example.com',
      roomNumber: 'Room 103',
      isActive: false,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeRepository,
        {
          provide: PrismaService,
          useValue: {
            employee: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              groupBy: jest.fn(),
              aggregate: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<EmployeeRepository>(EmployeeRepository);
    prismaService = module.get(PrismaService);
  });

  describe('findById', () => {
    it('should return employee when found', async () => {
      const prismaEmployee = {
        id: '1',
        name: mockEmployee.name,
        departmentId: mockEmployee.departmentId,
        position: mockEmployee.position,
        order: 1,
        mobileNumber: mockEmployee.mobileNumber,
        telephone: mockEmployee.telephone,
        email: mockEmployee.email,
        roomNumber: mockEmployee.roomNumber,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.employee.findUnique as jest.Mock).mockResolvedValue(prismaEmployee);

      const result = await repository.findById('1');

      expect(result).toEqual(expect.objectContaining({
        id: mockEmployee.id,
        name: mockEmployee.name,
        departmentId: mockEmployee.departmentId,
        position: mockEmployee.position,
        order: mockEmployee.order,
        isActive: mockEmployee.isActive,
      }));
      expect(prismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          department: true,
        },
      });
    });

    it('should return null when employee not found', async () => {
      (prismaService.employee.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all employees when no filter provided', async () => {
      const prismaEmployees = mockEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        departmentId: emp.departmentId,
        position: emp.position,
        order: emp.order,
        mobileNumber: emp.mobileNumber,
        telephone: emp.telephone,
        email: emp.email,
        roomNumber: emp.roomNumber,
        isActive: emp.isActive,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
      }));

      (prismaService.employee.findMany as jest.Mock).mockResolvedValue(prismaEmployees);
      (prismaService.employee.count as jest.Mock).mockResolvedValue(3);

      const query: EmployeeQueryDto = { page: 1, limit: 10 };
      const result = await repository.findAll(query);

      expect(result.data).toEqual(mockEmployees);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should return filtered employees when isActive filter provided', async () => {
      const activeEmployees = mockEmployees.filter(emp => emp.isActive);
      const prismaEmployees = activeEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        departmentId: emp.departmentId,
        position: emp.position,
        order: emp.order,
        mobileNumber: emp.mobileNumber,
        telephone: emp.telephone,
        email: emp.email,
        roomNumber: emp.roomNumber,
        isActive: emp.isActive,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
      }));

      (prismaService.employee.findMany as jest.Mock).mockResolvedValue(prismaEmployees);
      (prismaService.employee.count as jest.Mock).mockResolvedValue(2);

      const query: EmployeeQueryDto = { isActive: true, page: 1, limit: 10 };
      const result = await repository.findAll(query);

      expect(result.data).toEqual(activeEmployees);
      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          department: true,
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });

    it('should apply department filter correctly', async () => {
      const deptEmployees = mockEmployees.filter(emp => emp.departmentId === 'dept-1');
      const prismaEmployees = deptEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        departmentId: emp.departmentId,
        position: emp.position,
        order: emp.order,
        mobileNumber: emp.mobileNumber,
        telephone: emp.telephone,
        email: emp.email,
        roomNumber: emp.roomNumber,
        isActive: emp.isActive,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
      }));

      (prismaService.employee.findMany as jest.Mock).mockResolvedValue(prismaEmployees);
      (prismaService.employee.count as jest.Mock).mockResolvedValue(2);

      const query: EmployeeQueryDto = { departmentId: 'dept-1', page: 1, limit: 10 };
      const result = await repository.findAll(query);

      expect(result.data).toEqual(deptEmployees);
      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: { departmentId: 'dept-1' },
        include: {
          department: true,
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });

    it('should apply search filter correctly', async () => {
      const searchResults = [mockEmployees[0]];
      const prismaEmployees = searchResults.map(emp => ({
        id: emp.id,
        name: emp.name,
        departmentId: emp.departmentId,
        position: emp.position,
        order: emp.order,
        mobileNumber: emp.mobileNumber,
        telephone: emp.telephone,
        email: emp.email,
        roomNumber: emp.roomNumber,
        isActive: emp.isActive,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
      }));

      (prismaService.employee.findMany as jest.Mock).mockResolvedValue(prismaEmployees);
      (prismaService.employee.count as jest.Mock).mockResolvedValue(1);

      const query: EmployeeQueryDto = { page: 1, limit: 10 };
      const result = await repository.findAll(query);

      expect(result.data).toEqual(searchResults);
      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          department: true,
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findActive', () => {
    it('should return only active employees', async () => {
      const activeEmployees = mockEmployees.filter(emp => emp.isActive);
      const prismaEmployees = activeEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        departmentId: emp.departmentId,
        position: emp.position,
        order: emp.order,
        mobileNumber: emp.mobileNumber,
        telephone: emp.telephone,
        email: emp.email,
        roomNumber: emp.roomNumber,
        isActive: emp.isActive,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
      }));

      (prismaService.employee.findMany as jest.Mock).mockResolvedValue(prismaEmployees);
      (prismaService.employee.count as jest.Mock).mockResolvedValue(2);

      const query: EmployeeQueryDto = { page: 1, limit: 10 };
      const result = await repository.findActive(query);

      expect(result.data).toEqual(activeEmployees);
      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          department: true,
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('search', () => {
    it('should search employees by name', async () => {
      const searchResults = [mockEmployees[0]];
      const prismaEmployees = searchResults.map(emp => ({
        id: emp.id,
        name: emp.name,
        departmentId: emp.departmentId,
        position: emp.position,
        order: emp.order,
        mobileNumber: emp.mobileNumber,
        telephone: emp.telephone,
        email: emp.email,
        roomNumber: emp.roomNumber,
        isActive: emp.isActive,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
      }));

      (prismaService.employee.findMany as jest.Mock).mockResolvedValue(prismaEmployees);
      (prismaService.employee.count as jest.Mock).mockResolvedValue(1);

      const query: EmployeeQueryDto = { page: 1, limit: 10 };
      const result = await repository.search('John', query);

      expect(result.data).toEqual(searchResults);
      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              name: {
                path: ['en'],
                string_contains: 'John',
              },
            },
            {
              name: {
                path: ['ne'],
                string_contains: 'John',
              },
            },
            {
              position: {
                path: ['en'],
                string_contains: 'John',
              },
            },
            {
              position: {
                path: ['ne'],
                string_contains: 'John',
              },
            },
            {
              email: {
                contains: 'John',
              },
            },
          ],
        },
        include: {
          department: true,
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create new employee', async () => {
      const createData: CreateEmployeeDto = {
        name: mockEmployee.name,
        departmentId: mockEmployee.departmentId,
        position: mockEmployee.position,
        order: 1,
        mobileNumber: mockEmployee.mobileNumber,
        telephone: mockEmployee.telephone,
        email: mockEmployee.email,
        roomNumber: mockEmployee.roomNumber,
        isActive: true,
      };

      const prismaEmployee = {
        id: '1',
        name: createData.name,
        departmentId: createData.departmentId,
        position: createData.position,
        order: createData.order,
        mobileNumber: createData.mobileNumber,
        telephone: createData.telephone,
        email: createData.email,
        roomNumber: createData.roomNumber,
        isActive: createData.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.employee.create as jest.Mock).mockResolvedValue(prismaEmployee);

      const result = await repository.create(createData, 'test-user');

      expect(result).toEqual(expect.objectContaining({
        id: mockEmployee.id,
        name: mockEmployee.name,
        departmentId: mockEmployee.departmentId,
        position: mockEmployee.position,
        order: mockEmployee.order,
        isActive: mockEmployee.isActive,
      }));
      expect(prismaService.employee.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          departmentId: createData.departmentId,
          position: createData.position,
          order: createData.order,
          mobileNumber: createData.mobileNumber,
          telephone: createData.telephone,
          email: createData.email,
          roomNumber: createData.roomNumber,
          isActive: createData.isActive,
        },
        include: {
          department: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update existing employee', async () => {
      const updateData: UpdateEmployeeDto = {
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

      const prismaEmployee = {
        id: '1',
        name: updateData.name,
        departmentId: mockEmployee.departmentId,
        position: updateData.position,
        order: updateData.order,
        mobileNumber: mockEmployee.mobileNumber,
        telephone: mockEmployee.telephone,
        email: mockEmployee.email,
        roomNumber: mockEmployee.roomNumber,
        isActive: mockEmployee.isActive,
        createdAt: mockEmployee.createdAt,
        updatedAt: new Date(),
      };

      (prismaService.employee.update as jest.Mock).mockResolvedValue(prismaEmployee);

      const result = await repository.update('1', updateData, 'test-user');

      expect(result.name).toEqual(updateData.name);
      expect(result.position).toEqual(updateData.position);
      expect(result.order).toBe(updateData.order);
      expect(prismaService.employee.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: updateData.name,
          position: updateData.position,
          order: updateData.order,
        },
        include: {
          department: true,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete employee', async () => {
      (prismaService.employee.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('1');

      expect(prismaService.employee.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('findByDepartment', () => {
    it('should return employees by department', async () => {
      const deptEmployees = mockEmployees.filter(emp => emp.departmentId === 'dept-1');
      const prismaEmployees = deptEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        departmentId: emp.departmentId,
        position: emp.position,
        order: emp.order,
        mobileNumber: emp.mobileNumber,
        telephone: emp.telephone,
        email: emp.email,
        roomNumber: emp.roomNumber,
        isActive: emp.isActive,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
      }));

      (prismaService.employee.findMany as jest.Mock).mockResolvedValue(prismaEmployees);

      const result = await repository.findByDepartment('dept-1');

      expect(result).toEqual(deptEmployees);
      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: { 
          departmentId: 'dept-1',
          isActive: true,
        },
        include: {
          department: true,
        },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findByPosition', () => {
    it('should return employees by position', async () => {
      const positionEmployees = mockEmployees.filter(emp => 
        (emp.position as any).en === 'Software Engineer'
      );
      const prismaEmployees = positionEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        departmentId: emp.departmentId,
        position: emp.position,
        order: emp.order,
        mobileNumber: emp.mobileNumber,
        telephone: emp.telephone,
        email: emp.email,
        roomNumber: emp.roomNumber,
        isActive: emp.isActive,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
      }));

      (prismaService.employee.findMany as jest.Mock).mockResolvedValue(prismaEmployees);

      const result = await repository.findByPosition('Software Engineer');

      expect(result).toEqual(positionEmployees);
      expect(prismaService.employee.findMany).toHaveBeenCalledWith({
        where: {
          position: {
            path: ['en'],
            string_contains: 'Software Engineer',
          },
          isActive: true,
        },
        include: {
          department: true,
        },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('isEmployeeActive', () => {
    it('should return true for active employee', async () => {
      (prismaService.employee.findUnique as jest.Mock).mockResolvedValue({
        isActive: true,
      });

      const result = await repository.isEmployeeActive('1');

      expect(result).toBe(true);
      expect(prismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { isActive: true },
      });
    });

    it('should return false for inactive employee', async () => {
      (prismaService.employee.findUnique as jest.Mock).mockResolvedValue({
        isActive: false,
      });

      const result = await repository.isEmployeeActive('1');

      expect(result).toBe(false);
    });

    it('should return false for non-existent employee', async () => {
      (prismaService.employee.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.isEmployeeActive('999');

      expect(result).toBe(false);
    });
  });
}); 