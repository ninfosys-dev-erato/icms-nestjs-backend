import { Test, TestingModule } from '@nestjs/testing';
import { OfficeDescriptionRepository } from '../../../src/modules/office-description/repositories/office-description.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { OfficeDescription, OfficeDescriptionType } from '../../../src/modules/office-description/entities/office-description.entity';
import { CreateOfficeDescriptionDto, UpdateOfficeDescriptionDto } from '../../../src/modules/office-description/dto/office-description.dto';

describe('OfficeDescriptionRepository', () => {
  let repository: OfficeDescriptionRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficeDescriptionRepository,
        {
          provide: PrismaService,
          useValue: {
            officeDescription: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<OfficeDescriptionRepository>(OfficeDescriptionRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find office description by ID', async () => {
      const mockDescription = {
        id: 'test-id',
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeDescription.findUnique as jest.Mock).mockResolvedValue(mockDescription);

      const result = await repository.findById('test-id');

      expect(result).toEqual(mockDescription);
      expect(prisma.officeDescription.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should return null when office description not found', async () => {
      (prisma.officeDescription.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByType', () => {
    it('should find office description by type', async () => {
      const mockDescription = {
        id: 'test-id',
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Test Content', ne: 'परीक्षण सामग्री' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeDescription.findFirst as jest.Mock).mockResolvedValue(mockDescription);

      const result = await repository.findByType(OfficeDescriptionType.INTRODUCTION);

      expect(result).toEqual(mockDescription);
      expect(prisma.officeDescription.findFirst).toHaveBeenCalledWith({
        where: { officeDescriptionType: OfficeDescriptionType.INTRODUCTION },
      });
    });

    it('should return null when office description not found for type', async () => {
      (prisma.officeDescription.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByType(OfficeDescriptionType.OBJECTIVE);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all office descriptions', async () => {
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

      (prisma.officeDescription.findMany as jest.Mock).mockResolvedValue(mockDescriptions);

      const result = await repository.findAll();

      expect(result).toEqual(mockDescriptions);
      expect(prisma.officeDescription.findMany).toHaveBeenCalledWith({
        orderBy: { officeDescriptionType: 'asc' },
      });
    });
  });

  describe('create', () => {
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

      (prisma.officeDescription.create as jest.Mock).mockResolvedValue(mockCreatedDescription);

      const result = await repository.create(createData);

      expect(result).toEqual(mockCreatedDescription);
      expect(prisma.officeDescription.create).toHaveBeenCalledWith({
        data: {
          officeDescriptionType: createData.officeDescriptionType,
          content: createData.content,
        },
      });
    });
  });

  describe('update', () => {
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

      (prisma.officeDescription.update as jest.Mock).mockResolvedValue(mockUpdatedDescription);

      const result = await repository.update('test-id', updateData);

      expect(result).toEqual(mockUpdatedDescription);
      expect(prisma.officeDescription.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          content: updateData.content,
        },
      });
    });

    it('should update office description with type change', async () => {
      const updateData: UpdateOfficeDescriptionDto = {
        officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
        content: { en: 'Updated Content', ne: 'अपडेटेड सामग्री' },
      };

      const mockUpdatedDescription = {
        id: 'test-id',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeDescription.update as jest.Mock).mockResolvedValue(mockUpdatedDescription);

      const result = await repository.update('test-id', updateData);

      expect(result).toEqual(mockUpdatedDescription);
      expect(prisma.officeDescription.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          officeDescriptionType: updateData.officeDescriptionType,
          content: updateData.content,
        },
      });
    });
  });

  describe('upsertByType', () => {
    it('should update existing office description by type', async () => {
      const existingDescription = {
        id: 'test-id',
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'Old Content', ne: 'पुरानो सामग्री' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createData: CreateOfficeDescriptionDto = {
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'New Content', ne: 'नयाँ सामग्री' },
      };

      const mockUpdatedDescription = {
        id: 'test-id',
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: createData.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeDescription.findFirst as jest.Mock).mockResolvedValue(existingDescription);
      (prisma.officeDescription.update as jest.Mock).mockResolvedValue(mockUpdatedDescription);

      const result = await repository.upsertByType(OfficeDescriptionType.INTRODUCTION, createData);

      expect(result).toEqual(mockUpdatedDescription);
      expect(prisma.officeDescription.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { content: createData.content },
      });
    });

    it('should create new office description by type when not exists', async () => {
      const createData: CreateOfficeDescriptionDto = {
        officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
        content: { en: 'New Content', ne: 'नयाँ सामग्री' },
      };

      const mockCreatedDescription = {
        id: 'test-id',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeDescription.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.officeDescription.create as jest.Mock).mockResolvedValue(mockCreatedDescription);

      const result = await repository.upsertByType(OfficeDescriptionType.INTRODUCTION, createData);

      expect(result).toEqual(mockCreatedDescription);
      expect(prisma.officeDescription.create).toHaveBeenCalledWith({
        data: {
          officeDescriptionType: createData.officeDescriptionType,
          content: createData.content,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete office description', async () => {
      (prisma.officeDescription.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('test-id');

      expect(prisma.officeDescription.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });
  });

  describe('deleteByType', () => {
    it('should delete office description by type', async () => {
      (prisma.officeDescription.deleteMany as jest.Mock).mockResolvedValue(undefined);

      await repository.deleteByType(OfficeDescriptionType.INTRODUCTION);

      expect(prisma.officeDescription.deleteMany).toHaveBeenCalledWith({
        where: { officeDescriptionType: OfficeDescriptionType.INTRODUCTION },
      });
    });
  });

  describe('existsByType', () => {
    it('should return true when office description exists by type', async () => {
      (prisma.officeDescription.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.existsByType(OfficeDescriptionType.INTRODUCTION);

      expect(result).toBe(true);
      expect(prisma.officeDescription.count).toHaveBeenCalledWith({
        where: { officeDescriptionType: OfficeDescriptionType.INTRODUCTION },
      });
    });

    it('should return false when office description does not exist by type', async () => {
      (prisma.officeDescription.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.existsByType(OfficeDescriptionType.OBJECTIVE);

      expect(result).toBe(false);
    });
  });

  describe('getStatistics', () => {
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

      const mockGroupByResult = [
        { officeDescriptionType: OfficeDescriptionType.INTRODUCTION, _count: { officeDescriptionType: 1 } },
        { officeDescriptionType: OfficeDescriptionType.OBJECTIVE, _count: { officeDescriptionType: 1 } },
        { officeDescriptionType: OfficeDescriptionType.WORK_DETAILS, _count: { officeDescriptionType: 1 } },
        { officeDescriptionType: OfficeDescriptionType.ORGANIZATIONAL_STRUCTURE, _count: { officeDescriptionType: 1 } },
        { officeDescriptionType: OfficeDescriptionType.DIGITAL_CHARTER, _count: { officeDescriptionType: 1 } },
        { officeDescriptionType: OfficeDescriptionType.EMPLOYEE_SANCTIONS, _count: { officeDescriptionType: 1 } },
      ];

      (prisma.officeDescription.count as jest.Mock).mockResolvedValue(6);
      (prisma.officeDescription.groupBy as jest.Mock).mockResolvedValue(mockGroupByResult);
      (prisma.officeDescription.findFirst as jest.Mock).mockResolvedValue({ updatedAt: new Date() });

      const result = await repository.getStatistics();

      expect(result.total).toBe(6);
      expect(result.byType).toEqual(mockStats.byType);
      expect(result.lastUpdated).toBeDefined();
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create office descriptions', async () => {
      const descriptions: CreateOfficeDescriptionDto[] = [
        {
          officeDescriptionType: OfficeDescriptionType.INTRODUCTION,
          content: { en: 'Content 1', ne: 'सामग्री १' },
        },
        {
          officeDescriptionType: OfficeDescriptionType.OBJECTIVE,
          content: { en: 'Content 2', ne: 'सामग्री २' },
        },
      ];

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

      (prisma.officeDescription.createMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prisma.officeDescription.findMany as jest.Mock).mockResolvedValue(mockCreatedDescriptions);

      const result = await repository.bulkCreate(descriptions);

      expect(result).toEqual(mockCreatedDescriptions);
      expect(prisma.officeDescription.createMany).toHaveBeenCalledWith({
        data: descriptions.map(desc => ({
          officeDescriptionType: desc.officeDescriptionType,
          content: desc.content,
        })),
      });
    });
  });

  describe('bulkUpdate', () => {
    it('should bulk update office descriptions', async () => {
      const updates = [
        { id: 'test-id-1', content: { en: 'Updated Content 1', ne: 'अपडेटेड सामग्री १' } },
        { id: 'test-id-2', content: { en: 'Updated Content 2', ne: 'अपडेटेड सामग्री २' } },
      ];

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

      (prisma.officeDescription.update as jest.Mock)
        .mockResolvedValueOnce(mockUpdatedDescriptions[0])
        .mockResolvedValueOnce(mockUpdatedDescriptions[1]);
      (prisma.officeDescription.findMany as jest.Mock).mockResolvedValue(mockUpdatedDescriptions);

      const result = await repository.bulkUpdate(updates);

      expect(result).toEqual(mockUpdatedDescriptions);
      expect(prisma.officeDescription.update).toHaveBeenCalledTimes(2);
    });
  });
}); 