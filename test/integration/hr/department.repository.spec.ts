import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentRepository } from '../../../src/modules/hr/repositories/department.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { Department } from '../../../src/modules/hr/entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto, DepartmentQueryDto } from '../../../src/modules/hr/dto/hr.dto';

describe('DepartmentRepository', () => {
  let repository: DepartmentRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockDepartment: Department = {
    id: '1',
    departmentName: {
      en: 'Information Technology',
      ne: 'सूचना प्रविधि',
    },
    parentId: null,
    departmentHeadId: null,
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDepartments: Department[] = [
    mockDepartment,
    {
      ...mockDepartment,
      id: '2',
      departmentName: {
        en: 'Human Resources',
        ne: 'मानव संसाधन',
      },
      order: 2,
    },
    {
      ...mockDepartment,
      id: '3',
      departmentName: {
        en: 'Software Development',
        ne: 'सफ्टवेयर विकास',
      },
      parentId: '1',
      order: 3,
      isActive: false,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentRepository,
        {
          provide: PrismaService,
          useValue: {
            department: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              groupBy: jest.fn(),
              aggregate: jest.fn(),
            },
            employee: {
              count: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<DepartmentRepository>(DepartmentRepository);
    prismaService = module.get(PrismaService);
  });

  describe('findById', () => {
    it('should return department when found', async () => {
      const prismaDepartment = {
        id: '1',
        departmentName: mockDepartment.departmentName,
        parentId: null,
        departmentHeadId: null,
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.department.findUnique as jest.Mock).mockResolvedValue(prismaDepartment);

      const result = await repository.findById('1');

      expect(result).toEqual(expect.objectContaining({
        id: mockDepartment.id,
        departmentName: mockDepartment.departmentName,
        order: mockDepartment.order,
        isActive: mockDepartment.isActive,
      }));
      expect(prismaService.department.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          parent: true,
          children: true,
          employees: true,
          departmentHead: true,
        },
      });
    });

    it('should return null when department not found', async () => {
      (prismaService.department.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all departments when no filter provided', async () => {
      const prismaDepartments = mockDepartments.map(dept => ({
        id: dept.id,
        departmentName: dept.departmentName,
        parentId: dept.parentId,
        departmentHeadId: dept.departmentHeadId,
        order: dept.order,
        isActive: dept.isActive,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
      }));

      (prismaService.department.findMany as jest.Mock).mockResolvedValue(prismaDepartments);
      (prismaService.department.count as jest.Mock).mockResolvedValue(3);

      const query: DepartmentQueryDto = { page: 1, limit: 10 };
      const result = await repository.findAll(query);

      expect(result.data).toEqual(mockDepartments);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should return filtered departments when isActive filter provided', async () => {
      const activeDepartments = mockDepartments.filter(dept => dept.isActive);
      const prismaDepartments = activeDepartments.map(dept => ({
        id: dept.id,
        departmentName: dept.departmentName,
        parentId: dept.parentId,
        departmentHeadId: dept.departmentHeadId,
        order: dept.order,
        isActive: dept.isActive,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
      }));

      (prismaService.department.findMany as jest.Mock).mockResolvedValue(prismaDepartments);
      (prismaService.department.count as jest.Mock).mockResolvedValue(2);

      const query: DepartmentQueryDto = { isActive: true, page: 1, limit: 10 };
      const result = await repository.findAll(query);

      expect(result.data).toEqual(activeDepartments);
      expect(prismaService.department.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          parent: true,
          children: true,
          employees: true,
          departmentHead: true,
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });

    it('should apply search filter correctly', async () => {
      const searchResults = [mockDepartments[0]];
      const prismaDepartments = searchResults.map(dept => ({
        id: dept.id,
        departmentName: dept.departmentName,
        parentId: dept.parentId,
        departmentHeadId: dept.departmentHeadId,
        order: dept.order,
        isActive: dept.isActive,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
      }));

      (prismaService.department.findMany as jest.Mock).mockResolvedValue(prismaDepartments);
      (prismaService.department.count as jest.Mock).mockResolvedValue(1);

      const query: DepartmentQueryDto = { page: 1, limit: 10 };
      const result = await repository.findAll(query);

      expect(result.data).toEqual(searchResults);
      expect(prismaService.department.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          parent: true,
          children: true,
          employees: true,
          departmentHead: true,
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findActive', () => {
    it('should return only active departments', async () => {
      const activeDepartments = mockDepartments.filter(dept => dept.isActive);
      const prismaDepartments = activeDepartments.map(dept => ({
        id: dept.id,
        departmentName: dept.departmentName,
        parentId: dept.parentId,
        departmentHeadId: dept.departmentHeadId,
        order: dept.order,
        isActive: dept.isActive,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
      }));

      (prismaService.department.findMany as jest.Mock).mockResolvedValue(prismaDepartments);
      (prismaService.department.count as jest.Mock).mockResolvedValue(2);

      const query: DepartmentQueryDto = { page: 1, limit: 10 };
      const result = await repository.findActive(query);

      expect(result.data).toEqual(activeDepartments);
      expect(prismaService.department.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          parent: true,
          children: true,
          employees: true,
          departmentHead: true,
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('search', () => {
    it('should search departments by name', async () => {
      const searchResults = [mockDepartments[0]];
      const prismaDepartments = searchResults.map(dept => ({
        id: dept.id,
        departmentName: dept.departmentName,
        parentId: dept.parentId,
        departmentHeadId: dept.departmentHeadId,
        order: dept.order,
        isActive: dept.isActive,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
      }));

      (prismaService.department.findMany as jest.Mock).mockResolvedValue(prismaDepartments);
      (prismaService.department.count as jest.Mock).mockResolvedValue(1);

      const query: DepartmentQueryDto = { page: 1, limit: 10 };
      const result = await repository.search('Technology', query);

      expect(result.data).toEqual(searchResults);
      expect(prismaService.department.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              departmentName: {
                path: ['en'],
                string_contains: 'Technology',
              },
            },
            {
              departmentName: {
                path: ['ne'],
                string_contains: 'Technology',
              },
            },
          ],
        },
        include: {
          parent: true,
          children: true,
          employees: true,
          departmentHead: true,
        },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create new department', async () => {
      const createData: CreateDepartmentDto = {
        departmentName: mockDepartment.departmentName,
        parentId: null,
        departmentHeadId: null,
        order: 1,
        isActive: true,
      };

      const prismaDepartment = {
        id: '1',
        departmentName: createData.departmentName,
        parentId: createData.parentId,
        departmentHeadId: createData.departmentHeadId,
        order: createData.order,
        isActive: createData.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.department.create as jest.Mock).mockResolvedValue(prismaDepartment);

      const result = await repository.create(createData, 'test-user');

      expect(result).toEqual(expect.objectContaining({
        id: mockDepartment.id,
        departmentName: mockDepartment.departmentName,
        order: mockDepartment.order,
        isActive: mockDepartment.isActive,
      }));
      expect(prismaService.department.create).toHaveBeenCalledWith({
        data: {
          departmentName: createData.departmentName,
          parentId: createData.parentId,
          departmentHeadId: createData.departmentHeadId,
          order: createData.order,
          isActive: createData.isActive,
        },
        include: {
          parent: true,
          children: true,
          employees: true,
          departmentHead: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update existing department', async () => {
      const updateData: UpdateDepartmentDto = {
        departmentName: {
          en: 'Updated IT Department',
          ne: 'अपडेटेड आईटी विभाग',
        },
        order: 5,
      };

      const prismaDepartment = {
        id: '1',
        departmentName: updateData.departmentName,
        parentId: mockDepartment.parentId,
        departmentHeadId: mockDepartment.departmentHeadId,
        order: updateData.order,
        isActive: mockDepartment.isActive,
        createdAt: mockDepartment.createdAt,
        updatedAt: new Date(),
      };

      (prismaService.department.update as jest.Mock).mockResolvedValue(prismaDepartment);

      const result = await repository.update('1', updateData, 'test-user');

      expect(result.departmentName).toEqual(updateData.departmentName);
      expect(result.order).toBe(updateData.order);
      expect(prismaService.department.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          departmentName: updateData.departmentName,
          order: updateData.order,
        },
        include: {
          parent: true,
          children: true,
          employees: true,
          departmentHead: true,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete department', async () => {
      (prismaService.department.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('1');

      expect(prismaService.department.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('getHierarchy', () => {
    it('should return department hierarchy', async () => {
      const prismaDepartments = mockDepartments.map(dept => ({
        id: dept.id,
        departmentName: dept.departmentName,
        parentId: dept.parentId,
        departmentHeadId: dept.departmentHeadId,
        order: dept.order,
        isActive: dept.isActive,
        createdAt: dept.createdAt,
        updatedAt: dept.updatedAt,
      }));

      (prismaService.department.findMany as jest.Mock).mockResolvedValue(prismaDepartments);

      const result = await repository.getHierarchy();

      expect(result).toEqual(mockDepartments);
      expect(prismaService.department.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          parent: true,
          children: true,
          employees: true,
          departmentHead: true,
        },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('getStatistics', () => {
    it('should return department statistics', async () => {
      const mockStats = {
        totalDepartments: 10,
        activeDepartments: 8,
        totalEmployees: 50,
        activeEmployees: 45,
        employeesByDepartment: { 'IT': 15, 'HR': 8, 'Finance': 12 },
        departmentsWithHead: 5,
        departmentsWithoutHead: 3,
      };

      (prismaService.department.count as jest.Mock)
        .mockResolvedValueOnce(10) // totalDepartments
        .mockResolvedValueOnce(8)  // activeDepartments
        .mockResolvedValueOnce(5)  // departmentsWithHead
        .mockResolvedValueOnce(3); // departmentsWithoutHead

      (prismaService.employee.count as jest.Mock)
        .mockResolvedValueOnce(50) // totalEmployees
        .mockResolvedValueOnce(45); // activeEmployees

      (prismaService.employee.groupBy as jest.Mock).mockResolvedValue([
        { departmentId: 'IT', _count: { departmentId: 15 } },
        { departmentId: 'HR', _count: { departmentId: 8 } },
        { departmentId: 'Finance', _count: { departmentId: 12 } },
      ]);

      const result = await repository.getStatistics();

      expect(result).toEqual(mockStats);
    });
  });

  describe('isDepartmentActive', () => {
    it('should return true for active department', async () => {
      (prismaService.department.findUnique as jest.Mock).mockResolvedValue({
        isActive: true,
      });

      const result = await repository.isDepartmentActive('1');

      expect(result).toBe(true);
      expect(prismaService.department.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { isActive: true },
      });
    });

    it('should return false for inactive department', async () => {
      (prismaService.department.findUnique as jest.Mock).mockResolvedValue({
        isActive: false,
      });

      const result = await repository.isDepartmentActive('1');

      expect(result).toBe(false);
    });

    it('should return false for non-existent department', async () => {
      (prismaService.department.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.isDepartmentActive('999');

      expect(result).toBe(false);
    });
  });
}); 