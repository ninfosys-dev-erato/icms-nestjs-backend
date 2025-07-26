import { Test, TestingModule } from '@nestjs/testing';
import { OfficeSettingsService } from '../../../src/modules/office-settings/services/office-settings.service';
import { OfficeSettingsRepository } from '../../../src/modules/office-settings/repositories/office-settings.repository';
import { 
  CreateOfficeSettingsDto, 
  UpdateOfficeSettingsDto,
  OfficeSettingsResponseDto,
  ValidationResult,
  ValidationError,
  SEOOfficeSettings
} from '../../../src/modules/office-settings/services/office-settings.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OfficeSettingsService', () => {
  let service: OfficeSettingsService;
  let officeSettingsRepository: OfficeSettingsRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficeSettingsService,
        {
          provide: OfficeSettingsRepository,
          useValue: {
            findById: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            upsert: jest.fn(),
            delete: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OfficeSettingsService>(OfficeSettingsService);
    officeSettingsRepository = module.get<OfficeSettingsRepository>(OfficeSettingsRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOfficeSettings', () => {
    it('should get office settings', async () => {
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

      (officeSettingsRepository.findFirst as jest.Mock).mockResolvedValue(mockSettings);

      const result = await service.getOfficeSettings();

      expect(result).toEqual(mockSettings);
      expect(officeSettingsRepository.findFirst).toHaveBeenCalled();
    });

    it('should throw error when office settings not found', async () => {
      (officeSettingsRepository.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.getOfficeSettings()).rejects.toThrow('Office settings not found');
    });

    it('should get office settings with language filter', async () => {
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

      (officeSettingsRepository.findFirst as jest.Mock).mockResolvedValue(mockSettings);

      const result = await service.getOfficeSettings('en');

      expect(result).toEqual(mockSettings);
      expect(officeSettingsRepository.findFirst).toHaveBeenCalled();
    });
  });

  describe('getOfficeSettingsById', () => {
    it('should get office settings by ID', async () => {
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

      (officeSettingsRepository.findById as jest.Mock).mockResolvedValue(mockSettings);

      const result = await service.getOfficeSettingsById('test-id');

      expect(result).toEqual(mockSettings);
      expect(officeSettingsRepository.findById).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when office settings not found', async () => {
      (officeSettingsRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getOfficeSettingsById('non-existent-id')).rejects.toThrow('Office settings not found');
    });
  });

  describe('createOfficeSettings', () => {
    it('should create office settings', async () => {
      const createData: CreateOfficeSettingsDto = {
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
      };

      const mockCreatedSettings = {
        id: 'test-id',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeSettingsRepository.create as jest.Mock).mockResolvedValue(mockCreatedSettings);

      const result = await service.createOfficeSettings(createData);

      expect(result).toEqual(mockCreatedSettings);
      expect(officeSettingsRepository.create).toHaveBeenCalledWith(createData);
    });

    it('should validate office settings before creation', async () => {
      const invalidData: CreateOfficeSettingsDto = {
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        email: 'invalid-email',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
      };

      await expect(service.createOfficeSettings(invalidData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateOfficeSettings', () => {
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
        email: 'updated@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        website: 'https://updated.gov.np',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeSettingsRepository.update as jest.Mock).mockResolvedValue(mockUpdatedSettings);

      const result = await service.updateOfficeSettings('test-id', updateData);

      expect(result).toEqual(mockUpdatedSettings);
      expect(officeSettingsRepository.update).toHaveBeenCalledWith('test-id', updateData);
    });

    it('should validate update data', async () => {
      const invalidData: UpdateOfficeSettingsDto = {
        email: 'invalid-email',
      };

      await expect(service.updateOfficeSettings('test-id', invalidData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('upsertOfficeSettings', () => {
    it('should upsert office settings', async () => {
      const upsertData: CreateOfficeSettingsDto = {
        directorate: { en: 'Upsert Directorate', ne: 'अपसर्ट निर्देशनालय' },
        officeName: { en: 'Upsert Office', ne: 'अपसर्ट कार्यालय' },
        officeAddress: { en: 'Upsert Address', ne: 'अपसर्ट ठेगाना' },
        email: 'upsert@example.gov.np',
        phoneNumber: { en: '+977-111111111', ne: '+९७७-१११११११११' },
      };

      const mockUpsertedSettings = {
        id: 'default',
        ...upsertData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeSettingsRepository.upsert as jest.Mock).mockResolvedValue(mockUpsertedSettings);

      const result = await service.upsertOfficeSettings(upsertData);

      expect(result).toEqual(mockUpsertedSettings);
      expect(officeSettingsRepository.upsert).toHaveBeenCalledWith(upsertData);
    });
  });

  describe('deleteOfficeSettings', () => {
    it('should delete office settings successfully', async () => {
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

      (officeSettingsRepository.findById as jest.Mock).mockResolvedValue(mockSettings);
      (officeSettingsRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await service.deleteOfficeSettings('test-id');

      expect(officeSettingsRepository.findById).toHaveBeenCalledWith('test-id');
      expect(officeSettingsRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw error when office settings not found', async () => {
      (officeSettingsRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteOfficeSettings('non-existent-id')).rejects.toThrow('Office settings not found');
    });
  });

  describe('validateOfficeSettings', () => {
    it('should validate office settings successfully', async () => {
      const validData: CreateOfficeSettingsDto = {
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
      };

      const result = await service.validateOfficeSettings(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return validation errors for invalid email', async () => {
      const invalidData: CreateOfficeSettingsDto = {
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        email: 'invalid-email',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
      };

      const result = await service.validateOfficeSettings(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe('email');
    });

    it('should return validation errors for invalid URLs', async () => {
      const invalidData: CreateOfficeSettingsDto = {
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        website: 'invalid-url',
        xLink: 'invalid-url',
        youtube: 'invalid-url',
      };

      const result = await service.validateOfficeSettings(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.field === 'website')).toBe(true);
      expect(result.errors.some(error => error.field === 'xLink')).toBe(true);
      expect(result.errors.some(error => error.field === 'youtube')).toBe(true);
    });

    it('should return validation errors for invalid translatable fields', async () => {
      const invalidData: CreateOfficeSettingsDto = {
        directorate: { en: '', ne: 'परीक्षण निर्देशनालय' }, // Empty English
        officeName: { en: 'Test Office', ne: '' }, // Empty Nepali
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
      };

      const result = await service.validateOfficeSettings(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getOfficeSettingsForSEO', () => {
    it('should get office settings for SEO', async () => {
      const mockSettings = {
        id: 'test-id',
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        website: 'https://test.gov.np',
        xLink: 'https://x.com/test',
        youtube: 'https://youtube.com/test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeSettingsRepository.findFirst as jest.Mock).mockResolvedValue(mockSettings);

      const result = await service.getOfficeSettingsForSEO();

      expect(result).toEqual({
        name: 'Test Office',
        description: 'Official website of Test Office',
        address: 'Test Address',
        phone: '+977-123456789',
        email: 'test@example.gov.np',
        website: 'https://test.gov.np',
        socialMedia: {
          x: 'https://x.com/test',
          youtube: 'https://youtube.com/test',
        },
      });
    });

    it('should throw error when office settings not found', async () => {
      (officeSettingsRepository.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.getOfficeSettingsForSEO()).rejects.toThrow('Office settings not found');
    });
  });

  describe('updateBackgroundPhoto', () => {
    it('should update background photo', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data'),
        stream: null,
        destination: null,
        filename: 'test-image.jpg',
        path: null,
      };

      const mockUpdatedSettings = {
        id: 'test-id',
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        backgroundPhoto: 'uploads/background-photos/test-image.jpg',
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeSettingsRepository.update as jest.Mock).mockResolvedValue(mockUpdatedSettings);

      const result = await service.updateBackgroundPhoto('test-id', mockFile as any);

      expect(result).toEqual(mockUpdatedSettings);
      expect(officeSettingsRepository.update).toHaveBeenCalledWith('test-id', {
        backgroundPhoto: 'uploads/background-photos/test-image.jpg',
      });
    });

    it('should reject invalid file type', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test-file.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('fake-text-data'),
        stream: null,
        destination: null,
        filename: 'test-file.txt',
        path: null,
      };

      await expect(service.updateBackgroundPhoto('test-id', mockFile as any)).rejects.toThrow('Invalid file type');
    });

    it('should reject large files', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'large-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024, // 6MB
        buffer: Buffer.alloc(6 * 1024 * 1024),
        stream: null,
        destination: null,
        filename: 'large-image.jpg',
        path: null,
      };

      await expect(service.updateBackgroundPhoto('test-id', mockFile as any)).rejects.toThrow('File size too large');
    });

    it('should reject missing file', async () => {
      await expect(service.updateBackgroundPhoto('test-id', null as any)).rejects.toThrow('No file uploaded');
    });
  });

  describe('removeBackgroundPhoto', () => {
    it('should remove background photo', async () => {
      const mockUpdatedSettings = {
        id: 'test-id',
        directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
        backgroundPhoto: null,
        email: 'test@example.gov.np',
        phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (officeSettingsRepository.update as jest.Mock).mockResolvedValue(mockUpdatedSettings);

      const result = await service.removeBackgroundPhoto('test-id');

      expect(result).toEqual(mockUpdatedSettings);
      expect(officeSettingsRepository.update).toHaveBeenCalledWith('test-id', {
        backgroundPhoto: null,
      });
    });
  });

  describe('transformToResponseDto', () => {
    it('should transform settings to response DTO', async () => {
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

      (officeSettingsRepository.findFirst as jest.Mock).mockResolvedValue(mockSettings);

      const result = await service.getOfficeSettings();

      expect(result).toEqual(mockSettings);
      expect(result.id).toBe('test-id');
      expect(result.directorate).toEqual({ en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' });
      expect(result.email).toBe('test@example.gov.np');
    });
  });
}); 