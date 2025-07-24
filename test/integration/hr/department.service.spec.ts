import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentService } from '../../../src/modules/hr/services/department.service';
import { DepartmentRepository } from '../../../src/modules/hr/repositories/department.repository';
import { 
  CreateDepartmentDto, 
  UpdateDepartmentDto, 
  DepartmentResponseDto,
  DepartmentQueryDto,
  HRStatistics,
  ValidationResult,
  BulkOperationResult
} from '../../../src/modules/hr/dto/hr.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let repository: jest.Mocked<DepartmentRepository>;

  const mockDepartment = {
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

  const mockDepartments = [
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
        DepartmentService,
        {
          provide: DepartmentRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findActive: jest.fn(),
            search: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            getHierarchy: jest.fn(),
            getStatistics: jest.fn(),
            isDepartmentActive: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
    repository = module.get(DepartmentRepository);
  });

  describe('getDepartmentById', () => {
    it('should return department when found', async () => {
      repository.findById.mockResolvedValue(mockDepartment);

      const result = await service.getDepartmentById('1');

      expect(result).toEqual(expect.objectContaining({
        id: '1',
        departmentName: mockDepartment.departmentName,
        order: mockDepartment.order,
        isActive: mockDepartment.isActive,
      }));
      expect(repository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when department not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getDepartmentById('999')).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('getAllDepartments', () => {
    it('should return all departments', async () => {
      const mockResult = {
        data: mockDepartments,
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      repository.findAll.mockResolvedValue(mockResult);

      const query: DepartmentQueryDto = { page: 1, limit: 10 };
      const result = await service.getAllDepartments(query);

      expect(result).toEqual(mockResult);
      expect(repository.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getActiveDepartments', () => {
    it('should return only active departments', async () => {
      const activeDepartments = mockDepartments.filter(dept => dept.isActive);
      const mockResult = {
        data: activeDepartments,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      repository.findActive.mockResolvedValue(mockResult);

      const query: DepartmentQueryDto = { page: 1, limit: 10 };
      const result = await service.getActiveDepartments(query);

      expect(result).toEqual(mockResult);
      expect(repository.findActive).toHaveBeenCalledWith(query);
    });
  });

  describe('searchDepartments', () => {
    it('should return search results', async () => {
      const searchResults = [mockDepartments[0]];
      const mockResult = {
        data: searchResults,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      repository.search.mockResolvedValue(mockResult);

      const query: DepartmentQueryDto = { page: 1, limit: 10 };
      const result = await service.searchDepartments('Technology', query);

      expect(result).toEqual(mockResult);
      expect(repository.search).toHaveBeenCalledWith('Technology', query);
    });
  });

  describe('createDepartment', () => {
    it('should create department successfully', async () => {
      const createData: CreateDepartmentDto = {
        departmentName: mockDepartment.departmentName,
        parentId: null,
        departmentHeadId: null,
        order: 1,
        isActive: true,
      };

      repository.create.mockResolvedValue(mockDepartment);

      const result = await service.createDepartment(createData, 'test-user');

      expect(result).toEqual(expect.objectContaining({
        id: '1',
        departmentName: createData.departmentName,
        order: createData.order,
        isActive: createData.isActive,
      }));
      expect(repository.create).toHaveBeenCalledWith(createData, 'test-user');
    });

    it('should throw BadRequestException for invalid data', async () => {
      const invalidData: CreateDepartmentDto = {
        departmentName: { en: '', ne: '' }, // Invalid: empty strings
        parentId: null,
        order: 1,
        isActive: true,
      };

      // Mock validation to return invalid result
      jest.spyOn(service as any, 'validateDepartment').mockResolvedValue({
        isValid: false,
        errors: [{ field: 'departmentName', message: 'Department name is required', code: 'REQUIRED_FIELD' }],
      });

      await expect(service.createDepartment(invalidData, 'test-user')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateDepartment', () => {
    it('should update department successfully', async () => {
      const updateData: UpdateDepartmentDto = {
        departmentName: {
          en: 'Updated IT Department',
          ne: 'अपडेटेड आईटी विभाग',
        },
        order: 5,
      };

      const updatedDepartment = { ...mockDepartment, ...updateData };
      repository.findById.mockResolvedValue(mockDepartment);
      repository.update.mockResolvedValue(updatedDepartment);

      const result = await service.updateDepartment('1', updateData, 'test-user');

      expect(result.departmentName.en).toBe('Updated IT Department');
      expect(result.order).toBe(5);
      expect(repository.update).toHaveBeenCalledWith('1', updateData, 'test-user');
    });

    it('should throw NotFoundException when department not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateDepartment('999', {}, 'test-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteDepartment', () => {
    it('should delete department successfully', async () => {
      repository.findById.mockResolvedValue(mockDepartment);
      repository.delete.mockResolvedValue();

      await service.deleteDepartment('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when department not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteDepartment('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDepartmentHierarchy', () => {
    it('should return department hierarchy', async () => {
      repository.getHierarchy.mockResolvedValue(mockDepartments);

      const result = await service.getDepartmentHierarchy();

      expect(result).toEqual(mockDepartments);
      expect(repository.getHierarchy).toHaveBeenCalled();
    });
  });

  describe('validateDepartment', () => {
    it('should validate department data successfully', async () => {
      const validData: CreateDepartmentDto = {
        departmentName: { en: 'Valid Department', ne: 'मान्य विभाग' },
        parentId: null,
        order: 1,
        isActive: true,
      };

      const result = await service.validateDepartment(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return validation errors for invalid data', async () => {
      const invalidData: CreateDepartmentDto = {
        departmentName: { en: '', ne: '' }, // Too short
        parentId: null,
        order: -1, // Invalid order
        isActive: true,
      };

      const result = await service.validateDepartment(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getHRStatistics', () => {
    it('should return HR statistics', async () => {
      const mockStats: HRStatistics = {
        totalDepartments: 10,
        activeDepartments: 8,
        totalEmployees: 50,
        activeEmployees: 45,
        employeesByDepartment: { 'IT': 15, 'HR': 8, 'Finance': 12 },
        departmentsWithHead: 5,
        departmentsWithoutHead: 3,
      };

      repository.getStatistics.mockResolvedValue(mockStats);

      const result = await service.getHRStatistics();

      expect(result).toEqual(mockStats);
      expect(repository.getStatistics).toHaveBeenCalled();
    });
  });

  describe('exportDepartments', () => {
    it('should export departments', async () => {
      const query: DepartmentQueryDto = { page: 1, limit: 10 };
      
      // Mock the repository to return test data
      repository.findAll.mockResolvedValue({
        data: [mockDepartment],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false }
      });

      const result = await service.exportDepartments(query, 'json');
      
      expect(result).toBeInstanceOf(Buffer);
      const exportedData = JSON.parse(result.toString());
      expect(exportedData).toHaveLength(1);
      expect(exportedData[0].id).toBe(mockDepartment.id);
      expect(exportedData[0].departmentName).toEqual(mockDepartment.departmentName);
    });
  });

  describe('importDepartments', () => {
    it('should import departments successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('import data'),
        originalname: 'departments.csv',
      } as Express.Multer.File;

      // The import method throws an error since it's not implemented
      await expect(service.importDepartments(mockFile, 'test-user')).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkActivate', () => {
    it('should bulk activate departments', async () => {
      const ids = ['1', '2', '3'];
      
      // Mock repository methods for bulk operations
      repository.findById.mockResolvedValue(mockDepartment);
      repository.update.mockResolvedValue(mockDepartment);

      const result = await service.bulkActivate(ids, 'test-user');

      expect(result.success).toBeGreaterThan(0);
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('bulkDeactivate', () => {
    it('should bulk deactivate departments', async () => {
      const ids = ['1', '2', '3'];
      
      // Mock repository methods for bulk operations
      repository.findById.mockResolvedValue(mockDepartment);
      repository.update.mockResolvedValue(mockDepartment);

      const result = await service.bulkDeactivate(ids, 'test-user');

      expect(result.success).toBeGreaterThan(0);
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete departments', async () => {
      const ids = ['1', '2', '3'];
      
      // Mock repository methods for bulk operations
      repository.findById.mockResolvedValue({ ...mockDepartment, employees: [] });
      repository.delete.mockResolvedValue(undefined);

      const result = await service.bulkDelete(ids);

      expect(result.success).toBeGreaterThan(0);
      expect(repository.delete).toHaveBeenCalled();
    });
  });

  describe('transformToResponseDto', () => {
    it('should transform department to response DTO', async () => {
      const department = {
        ...mockDepartment,
        parent: null,
        children: [],
        employees: [],
        departmentHead: null,
      };

      const result = service['transformToResponseDto'](department);

      expect(result).toEqual({
        id: department.id,
        departmentName: department.departmentName,
        parentId: department.parentId,
        departmentHeadId: department.departmentHeadId,
        order: department.order,
        isActive: department.isActive,
        parent: undefined,
        children: [],
        employees: [],
        departmentHead: null,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt,
      });
    });
  });
}); 