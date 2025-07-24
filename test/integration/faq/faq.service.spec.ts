import { Test, TestingModule } from '@nestjs/testing';
import { FAQService } from '../../../src/modules/faq/services/faq.service';
import { FAQRepository } from '../../../src/modules/faq/repositories/faq.repository';
import { 
  CreateFAQDto, 
  UpdateFAQDto, 
  FAQResponseDto,
  FAQQueryDto,
  BulkCreateFAQDto,
  BulkUpdateFAQDto,
  ReorderFAQDto,
  FAQStatistics,
  FAQSearchResult
} from '../../../src/modules/faq/dto/faq.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('FAQService', () => {
  let service: FAQService;
  let repository: jest.Mocked<FAQRepository>;

  const mockFAQ = {
    id: '1',
    question: {
      en: 'What are the office hours?',
      ne: 'कार्यालयको समय के हो?',
    },
    answer: {
      en: 'Our office is open from 9 AM to 5 PM Monday to Friday.',
      ne: 'हाम्रो कार्यालय सोमबार देखि शुक्रबार सम्म बिहान ९ बजे देखि बेलुका ५ बजेसम्म खुला हुन्छ।',
    },
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFAQs = [
    mockFAQ,
    {
      ...mockFAQ,
      id: '2',
      question: {
        en: 'How do I contact support?',
        ne: 'म कसरी समर्थनमा सम्पर्क गर्न सक्छु?',
      },
      answer: {
        en: 'You can contact support via email or phone.',
        ne: 'तपाईं इमेल वा फोन मार्फत समर्थनमा सम्पर्क गर्न सक्नुहुन्छ।',
      },
      order: 2,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FAQService,
        {
          provide: FAQRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findWithPagination: jest.fn(),
            search: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            reorder: jest.fn(),
            bulkCreate: jest.fn(),
            bulkUpdate: jest.fn(),
            getStatistics: jest.fn(),
            getRandomFAQs: jest.fn(),
            getPopularFAQs: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FAQService>(FAQService);
    repository = module.get(FAQRepository);
  });

  describe('getFAQ', () => {
    it('should return FAQ when found', async () => {
      repository.findById.mockResolvedValue(mockFAQ);

      const result = await service.getFAQ('1');

      expect(result).toEqual(expect.objectContaining({
        id: '1',
        question: mockFAQ.question,
        answer: mockFAQ.answer,
      }));
      expect(repository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when FAQ not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getFAQ('999')).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('getAllFAQs', () => {
    it('should return all FAQs', async () => {
      repository.findAll.mockResolvedValue(mockFAQs);

      const result = await service.getAllFAQs();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        id: '1',
        question: mockFAQ.question,
      }));
      expect(repository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return filtered FAQs', async () => {
      const query: FAQQueryDto = { isActive: true };
      repository.findAll.mockResolvedValue([mockFAQ]);

      const result = await service.getAllFAQs(query);

      expect(result).toHaveLength(1);
      expect(repository.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('getFAQsWithPagination', () => {
    it('should return paginated FAQs', async () => {
      const paginationResult = {
        data: mockFAQs,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      repository.findWithPagination.mockResolvedValue(paginationResult);

      const result = await service.getFAQsWithPagination(1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe('searchFAQs', () => {
    it('should return search results', async () => {
      repository.search.mockResolvedValue(mockFAQs);

      const result = await service.searchFAQs('office hours');

      expect(result.data).toHaveLength(2);
      expect(result.searchTerm).toBe('office hours');
      expect(result.total).toBe(2);
      expect(result.relevanceScore).toBeGreaterThan(0);
    });
  });

  describe('createFAQ', () => {
    it('should create FAQ successfully', async () => {
      const createData: CreateFAQDto = {
        question: mockFAQ.question,
        answer: mockFAQ.answer,
        order: 1,
        isActive: true,
      };

      repository.create.mockResolvedValue(mockFAQ);

      const result = await service.createFAQ(createData);

      expect(result).toEqual(expect.objectContaining({
        id: '1',
        question: createData.question,
        answer: createData.answer,
      }));
      expect(repository.create).toHaveBeenCalledWith(createData);
    });

    it('should throw BadRequestException for invalid data', async () => {
      const invalidData: CreateFAQDto = {
        question: { en: '', ne: '' }, // Invalid: empty strings
        answer: { en: 'Valid answer', ne: 'मान्य उत्तर' },
      };

      await expect(service.createFAQ(invalidData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateFAQ', () => {
    it('should update FAQ successfully', async () => {
      const updateData: UpdateFAQDto = {
        question: {
          en: 'Updated Question',
          ne: 'अपडेट प्रश्न',
        },
        order: 5,
      };

      const updatedFAQ = { ...mockFAQ, ...updateData };
      repository.update.mockResolvedValue(updatedFAQ);

      const result = await service.updateFAQ('1', updateData);

      expect(result.question.en).toBe('Updated Question');
      expect(result.order).toBe(5);
      expect(repository.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should throw NotFoundException when FAQ not found', async () => {
      repository.update.mockRejectedValue(new Error('not found'));

      await expect(service.updateFAQ('999', {})).rejects.toThrow();
    });
  });

  describe('deleteFAQ', () => {
    it('should delete FAQ successfully', async () => {
      repository.findById.mockResolvedValue(mockFAQ);
      repository.delete.mockResolvedValue();

      await service.deleteFAQ('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when FAQ not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteFAQ('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('reorderFAQs', () => {
    it('should reorder FAQs successfully', async () => {
      const reorderData: ReorderFAQDto = {
        orders: [
          { id: '1', order: 3 },
          { id: '2', order: 1 },
        ],
      };

      repository.reorder.mockResolvedValue();

      await service.reorderFAQs(reorderData);

      expect(repository.reorder).toHaveBeenCalledWith(reorderData.orders);
    });
  });

  describe('bulkCreateFAQs', () => {
    it('should bulk create FAQs successfully', async () => {
      const bulkData: BulkCreateFAQDto = {
        faqs: [
          {
            question: { en: 'Bulk FAQ 1', ne: 'बल्क प्रश्न १' },
            answer: { en: 'Bulk Answer 1', ne: 'बल्क उत्तर १' },
          },
          {
            question: { en: 'Bulk FAQ 2', ne: 'बल्क प्रश्न २' },
            answer: { en: 'Bulk Answer 2', ne: 'बल्क उत्तर २' },
          },
        ],
      };

      repository.bulkCreate.mockResolvedValue(mockFAQs);

      const result = await service.bulkCreateFAQs(bulkData);

      expect(result).toHaveLength(2);
      expect(repository.bulkCreate).toHaveBeenCalledWith(bulkData.faqs);
    });

    it('should throw BadRequestException for invalid data', async () => {
      const invalidBulkData: BulkCreateFAQDto = {
        faqs: [
          {
            question: { en: '', ne: '' }, // Invalid
            answer: { en: 'Valid', ne: 'मान्य' },
          },
        ],
      };

      await expect(service.bulkCreateFAQs(invalidBulkData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('bulkUpdateFAQs', () => {
    it('should bulk update FAQs successfully', async () => {
      const bulkUpdateData: BulkUpdateFAQDto = {
        faqs: [
          {
            id: '1',
            question: { en: 'Updated question with sufficient length for validation', ne: 'अपडेट प्रश्न पर्याप्त लम्बाई सँग validation को लागि' },
          },
          {
            id: '2',
            answer: { en: 'Updated Answer 2 with sufficient length for validation requirements', ne: 'अपडेट उत्तर २ पर्याप्त लम्बाई सँग validation requirements को लागि' },
          },
        ],
      };

      // Mock the validateFAQ method to return valid
      jest.spyOn(service as any, 'validateFAQ').mockResolvedValue({
        isValid: true,
        errors: [],
      });

      repository.bulkUpdate.mockResolvedValue(mockFAQs);

      const result = await service.bulkUpdateFAQs(bulkUpdateData);

      expect(result).toHaveLength(2);
    });
  });

  describe('getFAQStatistics', () => {
    it('should return FAQ statistics', async () => {
      const stats = {
        total: 10,
        active: 8,
        inactive: 2,
        lastUpdated: new Date(),
      };

      repository.getStatistics.mockResolvedValue(stats);

      const result = await service.getFAQStatistics();

      expect(result.total).toBe(10);
      expect(result.active).toBe(8);
      expect(result.inactive).toBe(2);
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('getRandomFAQs', () => {
    it('should return random FAQs', async () => {
      repository.getRandomFAQs.mockResolvedValue([mockFAQ]);

      const result = await service.getRandomFAQs(3, 'en');

      expect(result).toHaveLength(1);
      expect(repository.getRandomFAQs).toHaveBeenCalledWith(3, true);
    });
  });

  describe('getPopularFAQs', () => {
    it('should return popular FAQs', async () => {
      repository.getPopularFAQs.mockResolvedValue([mockFAQ]);

      const result = await service.getPopularFAQs(5, 'en');

      expect(result).toHaveLength(1);
      expect(repository.getPopularFAQs).toHaveBeenCalledWith(5, true);
    });
  });

  describe('validateFAQ', () => {
    it('should validate FAQ data successfully', async () => {
      const validData: CreateFAQDto = {
        question: { en: 'Valid question', ne: 'मान्य प्रश्न' },
        answer: { en: 'Valid answer with sufficient length', ne: 'मान्य उत्तर पर्याप्त लम्बाई सँग' },
      };

      const result = await service.validateFAQ(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return validation errors for invalid data', async () => {
      const invalidData: CreateFAQDto = {
        question: { en: '', ne: '' }, // Too short
        answer: { en: 'Short', ne: 'छोटो' }, // Too short
      };

      const result = await service.validateFAQ(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('importFAQs', () => {
    it('should import FAQs successfully', async () => {
      const importData = [
        {
          question: { en: 'Import FAQ 1', ne: 'आयात प्रश्न १' },
          answer: { en: 'Import Answer 1', ne: 'आयात उत्तर १' },
        },
      ];

      repository.create.mockResolvedValue(mockFAQ);

      const result = await service.importFAQs(importData);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle import errors', async () => {
      const invalidImportData = [
        {
          question: { en: '', ne: '' }, // Invalid
          answer: { en: 'Valid', ne: 'मान्य' },
        },
      ];

      const result = await service.importFAQs(invalidImportData);

      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('exportFAQs', () => {
    it('should export all FAQs', async () => {
      repository.findAll.mockResolvedValue(mockFAQs);

      const result = await service.exportFAQs();

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.exportedAt).toBeInstanceOf(Date);
    });
  });
}); 