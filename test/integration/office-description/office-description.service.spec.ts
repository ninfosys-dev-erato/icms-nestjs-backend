import { Test, TestingModule } from '@nestjs/testing';
import { OfficeDescriptionService } from '../../../src/modules/office-description/services/office-description.service';
import { OfficeDescriptionRepository } from '../../../src/modules/office-description/repositories/office-description.repository';
import { 
  CreateOfficeDescriptionDto, 
  UpdateOfficeDescriptionDto,
  OfficeDescriptionResponseDto,
  OfficeDescriptionQueryDto,
  OfficeDescriptionType,
  BulkCreateOfficeDescriptionDto,
  BulkUpdateOfficeDescriptionDto,
  OfficeDescriptionStatistics,
  ValidationResult,
  ImportResult,
  ExportResult
} from '../../../src/modules/office-description/dto/office-description.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OfficeDescriptionService', () => {
  let service: OfficeDescriptionService;
  let officeDescriptionRepository: OfficeDescriptionRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficeDescriptionService,
        {
          provide: OfficeDescriptionRepository,
          useValue: {
            findById: jest.fn(),
            findByType: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            upsertByType: jest.fn(),
            delete: jest.fn(),
            deleteByType: jest.fn(),
            existsByType: jest.fn(),
            getStatistics: jest.fn(),
            bulkCreate: jest.fn(),
            bulkUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OfficeDescriptionService>(OfficeDescriptionService);
    officeDescriptionRepository = module.get<OfficeDescriptionRepository>(OfficeDescriptionRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOfficeDescription', () => {
    it('should get office description by ID', async () => {
      const mockDescription = {
        id: 'test-id',
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeDescriptionRepository.findById as jest.Mock).mockResolvedValue(mockDescription);

      const result = await service.getOfficeDescription('test-id');

      expect(result).toEqual(mockDescription);
      expect(officeDescriptionRepository.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when office description not found', async () => {
      (officeDescriptionRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getOfficeDescription('non-existent-id')).rejects.toThrow('Office description not found');
    });
  });

  describe('getOfficeDescriptionByType', () => {
    it('should get office description by type', async () => {
      const mockDescription = {
        id: 'test-id',
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeDescriptionRepository.findByType as jest.Mock).mockResolvedValue(mockDescription);

      const result = await service.getOfficeDescriptionByType(OfficeDescriptionType.INTRODUCTION);

      expect(result).toEqual(mockDescription);
      expect(officeDescriptionRepository.findByType).toHaveBeenCalledWith(OfficeDescriptionType.INTRODUCTION);
    });

    it('should throw error when office description not found for type', async () => {
      (officeDescriptionRepository.findByType as jest.Mock).mockResolvedValue(null);

      await expect(service.getOfficeDescriptionByType(OfficeDescriptionType.OBJECTIVE)).rejects.toThrow('Office description of type OBJECTIVE not found');
    });
  });

  describe('getAllOfficeDescriptions', () => {
    it('should get all office descriptions', async () => {
      const mockDescriptions = [
        {
          id: 'test-id-1',
          officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
          content: { en: 'Test Content 1', ne: 'परीक्षण सामग्री १' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'test-id-2',
          officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
          content: { en: 'Test Content 2', ne: 'परीक्षण सामग्री २' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (officeDescriptionRepository.findAll as jest.Mock).mockResolvedValue(mockDescriptions);

      const result = await service.getAllOfficeDescriptions();

      expect(result).toEqual(mockDescriptions);
      expect(officeDescriptionRepository.findAll).toHaveBeenCalled();
    });

    it('should filter by type when query provided', async () => {
      const mockDescriptions = [
        {
          id: 'test-id-1',
          officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
          content: { en: 'Test Content 1', ne: 'परीक्षण सामग्री १' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const query: OfficeDescriptionQueryDto = { type: OfficeDescriptionType.INTRODUCTION };

      (officeDescriptionRepository.findAll as jest.Mock).mockResolvedValue(mockDescriptions);

      const result = await service.getAllOfficeDescriptions(query);

      expect(result).toEqual(mockDescriptions);
      expect(officeDescriptionRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('createOfficeDescription', () => {
    it('should create office description', async () => {
      const createData: CreateOfficeDescriptionDto = {
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
      };

      const mockCreatedDescription = {
        id: 'test-id',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeDescriptionRepository.existsByType as jest.Mock).mockResolvedValue(false);
      (officeDescriptionRepository.create as jest.Mock).mockResolvedValue(mockCreatedDescription);

      const result = await service.createOfficeDescription(createData);

      expect(result).toEqual(mockCreatedDescription);
      expect(officeDescriptionRepository.existsByType).toHaveBeenCalledWith(createData.officeDescriptionType);
      expect(officeDescriptionRepository.create).toHaveBeenCalledWith(createData);
    });

    it('should throw error when office description type already exists', async () => {
      const createData: CreateOfficeDescriptionDto = {
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
      };

      (officeDescriptionRepository.existsByType as jest.Mock).mockResolvedValue(true);

      await expect(service.createOfficeDescription(createData)).rejects.toThrow('Office description of type INTRODUCTION already exists');
    });
  });

  describe('updateOfficeDescription', () => {
    it('should update office description', async () => {
      const updateData: UpdateOfficeDescriptionDto = {
        content: { en: 'Updated Content', ne: 'अपडेटेड सामग्री' },
      };

      const mockUpdatedDescription = {
        id: 'test-id',
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeDescriptionRepository.update as jest.Mock).mockResolvedValue(mockUpdatedDescription);

      const result = await service.updateOfficeDescription('test-id', updateData);

      expect(result).toEqual(mockUpdatedDescription);
      expect(officeDescriptionRepository.update).toHaveBeenCalledWith('test-id', updateData);
    });
  });

  describe('upsertOfficeDescriptionByType', () => {
    it('should upsert office description by type', async () => {
      const createData: CreateOfficeDescriptionDto = {
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
      };

      const mockUpsertedDescription = {
        id: 'test-id',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeDescriptionRepository.upsertByType as jest.Mock).mockResolvedValue(mockUpsertedDescription);

      const result = await service.upsertOfficeDescriptionByType(OfficeDescriptionType.INTRODUCTION, createData);

      expect(result).toEqual(mockUpsertedDescription);
      expect(officeDescriptionRepository.upsertByType).toHaveBeenCalledWith(OfficeDescriptionType.INTRODUCTION, createData);
    });
  });

  describe('deleteOfficeDescription', () => {
    it('should delete office description successfully', async () => {
      const mockDescription = {
        id: 'test-id',
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeDescriptionRepository.findById as jest.Mock).mockResolvedValue(mockDescription);
      (officeDescriptionRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await service.deleteOfficeDescription('test-id');

      expect(officeDescriptionRepository.findById).toHaveBeenCalledWith('test-id');
      expect(officeDescriptionRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when office description not found', async () => {
      (officeDescriptionRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteOfficeDescription('non-existent-id')).rejects.toThrow('Office description not found');
    });
  });

  describe('deleteOfficeDescriptionByType', () => {
    it('should delete office description by type successfully', async () => {
      (officeDescriptionRepository.existsByType as jest.Mock).mockResolvedValue(true);
      (officeDescriptionRepository.deleteByType as jest.Mock).mockResolvedValue(undefined);

      await service.deleteOfficeDescriptionByType(OfficeDescriptionType.INTRODUCTION);

      expect(officeDescriptionRepository.existsByType).toHaveBeenCalledWith(OfficeDescriptionType.INTRODUCTION);
      expect(officeDescriptionRepository.deleteByType).toHaveBeenCalledWith(OfficeDescriptionType.INTRODUCTION);
    });

    it('should throw error when office description not found for type', async () => {
      (officeDescriptionRepository.existsByType as jest.Mock).mockResolvedValue(false);

      await expect(service.deleteOfficeDescriptionByType(OfficeDescriptionType.OBJECTIVE)).rejects.toThrow('Office description of type OBJECTIVE not found');
    });
  });

  describe('bulkCreateOfficeDescriptions', () => {
    it('should bulk create office descriptions', async () => {
      const bulkData: BulkCreateOfficeDescriptionDto = {
        descriptions: [
          {
            officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
            content: { en: 'Content 1', ne: 'सामग्री १' },
          },
          {
            officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
            content: { en: 'Content 2', ne: 'सामग्री २' },
          },
        ],
      };

      const mockCreatedDescriptions = [
        {
          id: 'test-id-1',
          officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
          content: { en: 'Content 1', ne: 'सामग्री १' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'test-id-2',
          officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
          content: { en: 'Content 2', ne: 'सामग्री २' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (officeDescriptionRepository.existsByType as jest.Mock).mockResolvedValue(false);
      (officeDescriptionRepository.bulkCreate as jest.Mock).mockResolvedValue(mockCreatedDescriptions);

      const result = await service.bulkCreateOfficeDescriptions(bulkData);

      expect(result).toEqual(mockCreatedDescriptions);
      expect(officeDescriptionRepository.bulkCreate).toHaveBeenCalledWith(bulkData.descriptions);
    });

    it('should throw error when duplicate types found', async () => {
      const bulkData: BulkCreateOfficeDescriptionDto = {
        descriptions: [
          {
            officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
            content: { en: 'Content 1', ne: 'सामग्री १' },
          },
          {
            officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
            content: { en: 'Content 2', ne: 'सामग्री २' },
          },
        ],
      };

      await expect(service.bulkCreateOfficeDescriptions(bulkData)).rejects.toThrow('Duplicate office description types found');
    });

    it('should throw error when type already exists', async () => {
      const bulkData: BulkCreateOfficeDescriptionDto = {
        descriptions: [
          {
            officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
            content: { en: 'Content 1', ne: 'सामग्री १' },
          },
        ],
      };

      (officeDescriptionRepository.existsByType as jest.Mock).mockResolvedValue(true);

      await expect(service.bulkCreateOfficeDescriptions(bulkData)).rejects.toThrow('Office description of type INTRODUCTION already exists');
    });
  });

  describe('bulkUpdateOfficeDescriptions', () => {
    it('should bulk update office descriptions', async () => {
      const bulkData: BulkUpdateOfficeDescriptionDto = {
        descriptions: [
          {
            id: 'test-id-1',
            content: { en: 'Updated Content 1', ne: 'अपडेटेड सामग्री १' },
          },
          {
            id: 'test-id-2',
            content: { en: 'Updated Content 2', ne: 'अपडेटेड सामग्री २' },
          },
        ],
      };

      const mockUpdatedDescriptions = [
        {
          id: 'test-id-1',
          officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
          content: { en: 'Updated Content 1', ne: 'अपडेटेड सामग्री १' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'test-id-2',
          officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
          content: { en: 'Updated Content 2', ne: 'अपडेटेड सामग्री २' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (officeDescriptionRepository.bulkUpdate as jest.Mock).mockResolvedValue(mockUpdatedDescriptions);

      const result = await service.bulkUpdateOfficeDescriptions(bulkData);

      expect(result).toEqual(mockUpdatedDescriptions);
      expect(officeDescriptionRepository.bulkUpdate).toHaveBeenCalledWith(bulkData.descriptions);
    });
  });

  describe('getOfficeDescriptionStatistics', () => {
    it('should get office description statistics', async () => {
      const mockStats = {
        total: 6,
        byType: {
          [OfficeDescriptionType.INTRODUCTION]: 1,
          [OfficeDescriptionType.OBJECTIVE]: 1,
          [OfficeDescriptionType.WORK_DETAILS]: 1,
          [OfficeDescriptionType.ORGANIZATIONAL_STRUCTURE]: 1,
          [OfficeDescriptionType.DIGITAL_CHARTER]: 1,
          [OfficeDescriptionType.EMPLOYEE_SANCTIONS]: 1,
        },
        lastUpdated: new Date(),
      };

      (officeDescriptionRepository.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      const result = await service.getOfficeDescriptionStatistics();

      expect(result).toEqual(mockStats);
      expect(officeDescriptionRepository.getStatistics).toHaveBeenCalled();
    });
  });

  describe('validateOfficeDescription', () => {
    it('should validate office description successfully', async () => {
      const descriptionData: CreateOfficeDescriptionDto = {
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
      };

      const result = await service.validateOfficeDescription(descriptionData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return validation errors for invalid content', async () => {
      const descriptionData: CreateOfficeDescriptionDto = {
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: '', ne: '' },
      };

      const result = await service.validateOfficeDescription(descriptionData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('importOfficeDescriptions', () => {
    it('should import office descriptions successfully', async () => {
      const descriptions = [
        {
          officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
          content: { en: 'Content 1', ne: 'सामग्री १' },
        },
        {
          officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
          content: { en: 'Content 2', ne: 'सामग्री २' },
        },
      ];

      const mockResult: ImportResult = {
        success: 2,
        failed: 0,
        errors: [],
      };

      (officeDescriptionRepository.existsByType as jest.Mock).mockResolvedValue(false);
      (officeDescriptionRepository.create as jest.Mock).mockResolvedValue({});

      const result = await service.importOfficeDescriptions(descriptions);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
    });

    it('should handle import errors', async () => {
      const descriptions = [
        {
          officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
          content: { en: '', ne: '' },
        },
      ];

      const result = await service.importOfficeDescriptions(descriptions);

      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('exportOfficeDescriptions', () => {
    it('should export office descriptions', async () => {
      const mockDescriptions = [
        {
          id: 'test-id-1',
          officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
          content: { en: 'Content 1', ne: 'सामग्री १' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (officeDescriptionRepository.findAll as jest.Mock).mockResolvedValue(mockDescriptions);

      const result = await service.exportOfficeDescriptions();

      expect(result.data).toEqual(mockDescriptions);
      expect(result.total).toBe(1);
      expect(result.exportedAt).toBeDefined();
    });
  });

  describe('transformToResponseDto', () => {
    it('should transform description to response DTO', async () => {
      const mockDescription = {
        id: 'test-id',
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await service.getOfficeDescription('test-id');
      (officeDescriptionRepository.findById as jest.Mock).mockResolvedValue(mockDescription);

      const response = await service.getOfficeDescription('test-id');

      expect(response).toEqual(mockDescription);
    });

    it('should transform description with language filter', async () => {
      const mockDescription = {
        id: 'test-id',
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeDescriptionRepository.findByType as jest.Mock).mockResolvedValue(mockDescription);

      const result = await service.getOfficeDescriptionByType(OfficeDescriptionType.INTRODUCTION, 'en');

      expect(result).toEqual(mockDescription);
    });
  });
}); 