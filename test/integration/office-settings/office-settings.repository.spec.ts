import { Test, TestingModule } from '@nestjs/testing';
import { OfficeSettingsRepository } from '../../../src/modules/office-settings/repositories/office-settings.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { OfficeSettings } from '../../../src/modules/office-settings/entities/office-settings.entity';
import { CreateOfficeSettingsDto } from '../../../src/modules/office-settings/dto/create-office-settings.dto';
import { UpdateOfficeSettingsDto } from '../../../src/modules/office-settings/dto/update-office-settings.dto';

describe('OfficeSettingsRepository', () => {
  let repository: OfficeSettingsRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficeSettingsRepository,
        {
          provide: PrismaService,
          useValue: {
            officeSettings: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<OfficeSettingsRepository>(OfficeSettingsRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find office settings by ID', async () => {
      const mockSettings = {
        id: 'test-id',
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        backgroundPhoto: 'test-photo.jpg',
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        xLink: 'https://x.com/test',
        mapIframe: '<iframe>test</iframe>',
        website: 'https://test.gov.np',
        youtube: 'https://youtube.com/test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeSettings.findUnique as jest.Mock).mockResolvedValue(mockSettings);

      const result = await repository.findById('test-id');

      expect(result).toEqual(mockSettings);
      expect(prisma.officeSettings.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should return null when office settings not found', async () => {
      (prisma.officeSettings.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findFirst', () => {
    it('should find first office settings', async () => {
      const mockSettings = {
        id: 'test-id',
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        backgroundPhoto: 'test-photo.jpg',
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        xLink: 'https://x.com/test',
        mapIframe: '<iframe>test</iframe>',
        website: 'https://test.gov.np',
        youtube: 'https://youtube.com/test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeSettings.findFirst as jest.Mock).mockResolvedValue(mockSettings);

      const result = await repository.findFirst();

      expect(result).toEqual(mockSettings);
      expect(prisma.officeSettings.findFirst).toHaveBeenCalled();
    });

    it('should return null when no office settings exist', async () => {
      (prisma.officeSettings.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findFirst();

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create office settings', async () => {
      const createData: CreateOfficeSettingsDto = {
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        backgroundPhoto: 'test-photo.jpg',
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        xLink: 'https://x.com/test',
        mapIframe: '<iframe>test</iframe>',
        website: 'https://test.gov.np',
        youtube: 'https://youtube.com/test',
      };

      const mockCreatedSettings = {
        id: 'test-id',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeSettings.create as jest.Mock).mockResolvedValue(mockCreatedSettings);

      const result = await repository.create(createData);

      expect(result).toEqual(mockCreatedSettings);
      expect(prisma.officeSettings.create).toHaveBeenCalledWith({
        data: {
          directorate: createData.directorate,
          officeName: createData.officeName,
          officeAddress: createData.officeAddress,
          backgroundPhoto: createData.backgroundPhoto,
          email: createData.email,
          phoneNumber: createData.phoneNumber,
          xLink: createData.xLink,
          mapIframe: createData.mapIframe,
          website: createData.website,
          youtube: createData.youtube,
        },
      });
    });
  });

  describe('update', () => {
    it('should update office settings', async () => {
      const updateData: UpdateOfficeSettingsDto = {
        email: 'updated@example.gov.np',
        website: 'https://updated.gov.np',
      };

      const mockUpdatedSettings = {
        id: 'test-id',
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        backgroundPhoto: 'test-photo.jpg',
        email: 'updated@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        xLink: 'https://x.com/test',
        mapIframe: '<iframe>test</iframe>',
        website: 'https://updated.gov.np',
        youtube: 'https://youtube.com/test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeSettings.update as jest.Mock).mockResolvedValue(mockUpdatedSettings);

      const result = await repository.update('test-id', updateData);

      expect(result).toEqual(mockUpdatedSettings);
      expect(prisma.officeSettings.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          email: updateData.email,
          website: updateData.website,
        },
      });
    });

    it('should update office settings with all fields', async () => {
      const updateData: UpdateOfficeSettingsDto = {
        directorate: { en: 'Updated Directorate', ne: 'अपडेटेड निर्देशनालय' },
        officeName: { en: 'Updated Office', ne: 'अपडेटेड कार्यालय' },
        officeAddress: { en: 'Updated Address', ne: 'अपडेटेड ठेगाना' },
        backgroundPhoto: 'updated-photo.jpg',
        email: 'updated@example.gov.np',
        phoneNumber: { en: '+977-987654321', ne: '+९७७-९८७६५४३२१' },
        xLink: 'https://x.com/updated',
        mapIframe: '<iframe>updated</iframe>',
        website: 'https://updated.gov.np',
        youtube: 'https://youtube.com/updated',
      };

      const mockUpdatedSettings = {
        id: 'test-id',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeSettings.update as jest.Mock).mockResolvedValue(mockUpdatedSettings);

      const result = await repository.update('test-id', updateData);

      expect(result).toEqual(mockUpdatedSettings);
      expect(prisma.officeSettings.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          directorate: updateData.directorate,
          officeName: updateData.officeName,
          officeAddress: updateData.officeAddress,
          backgroundPhoto: updateData.backgroundPhoto,
          email: updateData.email,
          phoneNumber: updateData.phoneNumber,
          xLink: updateData.xLink,
          mapIframe: updateData.mapIframe,
          website: updateData.website,
          youtube: updateData.youtube,
        },
      });
    });
  });

  describe('upsert', () => {
    it('should upsert office settings', async () => {
      const upsertData: CreateOfficeSettingsDto = {
        directorate: { en: 'Upsert Directorate', ne: 'अपसर्ट निर्देशनालय' },
        officeName: { en: 'Upsert Office', ne: 'अपसर्ट कार्यालय' },
        officeAddress: { en: 'Upsert Address', ne: 'अपसर्ट ठेगाना' },
        backgroundPhoto: 'upsert-photo.jpg',
        email: 'upsert@example.gov.np',
        phoneNumber: { en: '+977-111111111', ne: '+९७७-१११११११११' },
        xLink: 'https://x.com/upsert',
        mapIframe: '<iframe>upsert</iframe>',
        website: 'https://upsert.gov.np',
        youtube: 'https://youtube.com/upsert',
      };

      const mockUpsertedSettings = {
        id: 'default',
        ...upsertData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeSettings.upsert as jest.Mock).mockResolvedValue(mockUpsertedSettings);

      const result = await repository.upsert(upsertData);

      expect(result).toEqual(mockUpsertedSettings);
      expect(prisma.officeSettings.upsert).toHaveBeenCalledWith({
        where: { id: 'default' },
        update: {
          directorate: upsertData.directorate,
          officeName: upsertData.officeName,
          officeAddress: upsertData.officeAddress,
          backgroundPhoto: upsertData.backgroundPhoto,
          email: upsertData.email,
          phoneNumber: upsertData.phoneNumber,
          xLink: upsertData.xLink,
          mapIframe: upsertData.mapIframe,
          website: upsertData.website,
          youtube: upsertData.youtube,
        },
        create: {
          id: 'default',
          directorate: upsertData.directorate,
          officeName: upsertData.officeName,
          officeAddress: upsertData.officeAddress,
          backgroundPhoto: upsertData.backgroundPhoto,
          email: upsertData.email,
          phoneNumber: upsertData.phoneNumber,
          xLink: upsertData.xLink,
          mapIframe: upsertData.mapIframe,
          website: upsertData.website,
          youtube: upsertData.youtube,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete office settings', async () => {
      (prisma.officeSettings.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('test-id');

      expect(prisma.officeSettings.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });
  });

  describe('exists', () => {
    it('should return true when office settings exist', async () => {
      (prisma.officeSettings.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.exists();

      expect(result).toBe(true);
      expect(prisma.officeSettings.count).toHaveBeenCalled();
    });

    it('should return false when no office settings exist', async () => {
      (prisma.officeSettings.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.exists();

      expect(result).toBe(false);
    });
  });

  describe('Data Transformation', () => {
    it('should handle translatable entities correctly', async () => {
      const mockSettings = {
        id: 'test-id',
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeSettings.findFirst as jest.Mock).mockResolvedValue(mockSettings);

      const result = await repository.findFirst();

      expect(result).toEqual(mockSettings);
      expect(result.directorate).toEqual({ en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' });
      expect(result.officeName).toEqual({ en: 'Test Office', ne: 'परीक्षण कार्यालय' });
      expect(result.phoneNumber).toEqual({ en: '+977-123456789', ne: '+९७७-१२३४५६७८९' });
    });

    it('should handle optional fields correctly', async () => {
      const mockSettings = {
        id: 'test-id',
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        backgroundPhoto: null,
        xLink: null,
        mapIframe: null,
        website: null,
        youtube: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.officeSettings.findFirst as jest.Mock).mockResolvedValue(mockSettings);

      const result = await repository.findFirst();

      expect(result).toEqual(mockSettings);
      expect(result.backgroundPhoto).toBeNull();
      expect(result.xLink).toBeNull();
      expect(result.mapIframe).toBeNull();
      expect(result.website).toBeNull();
      expect(result.youtube).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      (prisma.officeSettings.findFirst as jest.Mock).mockRejectedValue(error);

      await expect(repository.findFirst()).rejects.toThrow('Database connection failed');
    });

    it('should handle update errors', async () => {
      const error = new Error('Record not found');
      (prisma.officeSettings.update as jest.Mock).mockRejectedValue(error);

      const updateData: UpdateOfficeSettingsDto = {
        email: 'updated@example.gov.np',
      };

      await expect(repository.update('non-existent-id', updateData)).rejects.toThrow('Record not found');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Record not found');
      (prisma.officeSettings.delete as jest.Mock).mockRejectedValue(error);

      await expect(repository.delete('non-existent-id')).rejects.toThrow('Record not found');
    });
  });
}); 