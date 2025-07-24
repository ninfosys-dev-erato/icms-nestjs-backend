import { Test, TestingModule } from '@nestjs/testing';
import { FAQRepository } from '../../../src/modules/faq/repositories/faq.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { FAQ } from '../../../src/modules/faq/entities/faq.entity';
import { CreateFAQDto, UpdateFAQDto } from '../../../src/modules/faq/dto/faq.dto';

describe('FAQRepository', () => {
  let repository: FAQRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockFAQ: FAQ = {
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

  const mockFAQs: FAQ[] = [
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
        FAQRepository,
        {
          provide: PrismaService,
          useValue: {
            fAQ: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              createMany: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<FAQRepository>(FAQRepository);
    prismaService = module.get(PrismaService);
  });

  describe('findById', () => {
    it('should return FAQ when found', async () => {
      const prismaFAQ = {
        id: '1',
        question: mockFAQ.question,
        answer: mockFAQ.answer,
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.fAQ.findUnique as jest.Mock).mockResolvedValue(prismaFAQ);

      const result = await repository.findById('1');

      expect(result).toEqual(expect.objectContaining({
        id: mockFAQ.id,
        question: mockFAQ.question,
        answer: mockFAQ.answer,
        order: mockFAQ.order,
        isActive: mockFAQ.isActive,
      }));
      expect(prismaService.fAQ.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null when FAQ not found', async () => {
      (prismaService.fAQ.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all FAQs when no filter provided', async () => {
      const prismaFAQs = mockFAQs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
      }));

      (prismaService.fAQ.findMany as jest.Mock).mockResolvedValue(prismaFAQs);

      const result = await repository.findAll();

      expect(result).toEqual(mockFAQs);
      expect(prismaService.fAQ.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { order: 'asc' },
      });
    });

    it('should return filtered FAQs when isActive filter provided', async () => {
      const activeFAQs = mockFAQs.filter(faq => faq.isActive);
      const prismaFAQs = activeFAQs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
      }));

      (prismaService.fAQ.findMany as jest.Mock).mockResolvedValue(prismaFAQs);

      const result = await repository.findAll(true);

      expect(result).toEqual(activeFAQs);
      expect(prismaService.fAQ.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated FAQs', async () => {
      const prismaFAQs = mockFAQs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
      }));

      (prismaService.fAQ.findMany as jest.Mock).mockResolvedValue(prismaFAQs);
      (prismaService.fAQ.count as jest.Mock).mockResolvedValue(2);

      const result = await repository.findWithPagination(1, 10);

      expect(result.data).toEqual(mockFAQs);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should handle pagination with filters', async () => {
      const prismaFAQs = [mockFAQs[0]];
      (prismaService.fAQ.findMany as jest.Mock).mockResolvedValue(prismaFAQs);
      (prismaService.fAQ.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findWithPagination(1, 5, true);

      expect(result.data).toEqual([mockFAQs[0]]);
      expect(prismaService.fAQ.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        skip: 0,
        take: 5,
      });
    });
  });

  describe('search', () => {
    it('should search FAQs by term', async () => {
      const prismaFAQs = [mockFAQs[0]];
      (prismaService.fAQ.findMany as jest.Mock).mockResolvedValue(prismaFAQs);

      const result = await repository.search('office hours');

      expect(result).toEqual([mockFAQs[0]]);
      expect(prismaService.fAQ.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              question: {
                path: ['en'],
                string_contains: 'office hours',
              },
            },
            {
              question: {
                path: ['ne'],
                string_contains: 'office hours',
              },
            },
            {
              answer: {
                path: ['en'],
                string_contains: 'office hours',
              },
            },
            {
              answer: {
                path: ['ne'],
                string_contains: 'office hours',
              },
            },
          ],
        },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create new FAQ', async () => {
      const createData: CreateFAQDto = {
        question: mockFAQ.question,
        answer: mockFAQ.answer,
        order: 1,
        isActive: true,
      };

      const prismaFAQ = {
        id: '1',
        question: createData.question,
        answer: createData.answer,
        order: createData.order,
        isActive: createData.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.fAQ.create as jest.Mock).mockResolvedValue(prismaFAQ);

      const result = await repository.create(createData);

      expect(result).toEqual(expect.objectContaining({
        id: mockFAQ.id,
        question: mockFAQ.question,
        answer: mockFAQ.answer,
        order: mockFAQ.order,
        isActive: mockFAQ.isActive,
      }));
      expect(prismaService.fAQ.create).toHaveBeenCalledWith({
        data: {
          question: createData.question,
          answer: createData.answer,
          order: createData.order,
          isActive: createData.isActive,
        },
      });
    });
  });

  describe('update', () => {
    it('should update existing FAQ', async () => {
      const updateData: UpdateFAQDto = {
        question: {
          en: 'Updated Question',
          ne: 'अपडेट प्रश्न',
        },
        order: 5,
      };

      const prismaFAQ = {
        id: '1',
        question: updateData.question,
        answer: mockFAQ.answer,
        order: updateData.order,
        isActive: mockFAQ.isActive,
        createdAt: mockFAQ.createdAt,
        updatedAt: new Date(),
      };

      (prismaService.fAQ.update as jest.Mock).mockResolvedValue(prismaFAQ);

      const result = await repository.update('1', updateData);

      expect(result.question).toEqual(updateData.question);
      expect(result.order).toBe(updateData.order);
      expect(prismaService.fAQ.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          question: updateData.question,
          order: updateData.order,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete FAQ', async () => {
      (prismaService.fAQ.delete as jest.Mock).mockResolvedValue(mockFAQ);

      await repository.delete('1');

      expect(prismaService.fAQ.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('reorder', () => {
    it('should reorder FAQs', async () => {
      const orders = [
        { id: '1', order: 3 },
        { id: '2', order: 1 },
      ];

      (prismaService.fAQ.update as jest.Mock).mockResolvedValue(mockFAQ);

      await repository.reorder(orders);

      expect(prismaService.fAQ.update).toHaveBeenCalledTimes(2);
      expect(prismaService.fAQ.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { order: 3 },
      });
      expect(prismaService.fAQ.update).toHaveBeenCalledWith({
        where: { id: '2' },
        data: { order: 1 },
      });
    });
  });

  describe('getStatistics', () => {
    it('should return FAQ statistics', async () => {
      (prismaService.fAQ.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8); // active
      (prismaService.fAQ.findFirst as jest.Mock).mockResolvedValue({
        updatedAt: new Date(),
      });

      const result = await repository.getStatistics();

      expect(result.total).toBe(10);
      expect(result.active).toBe(8);
      expect(result.inactive).toBe(2);
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create FAQs', async () => {
      const createData: CreateFAQDto[] = [
        {
          question: { en: 'FAQ 1', ne: 'प्रश्न १' },
          answer: { en: 'Answer 1', ne: 'उत्तर १' },
        },
        {
          question: { en: 'FAQ 2', ne: 'प्रश्न २' },
          answer: { en: 'Answer 2', ne: 'उत्तर २' },
        },
      ];

      (prismaService.fAQ.createMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prismaService.fAQ.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.bulkCreate(createData);

      expect(prismaService.fAQ.createMany).toHaveBeenCalledWith({
        data: createData.map(faq => ({
          question: faq.question,
          answer: faq.answer,
          order: faq.order || 0,
          isActive: faq.isActive !== undefined ? faq.isActive : true,
        })),
      });
    });
  });

  describe('bulkUpdate', () => {
    it('should bulk update FAQs', async () => {
      const updates = [
        {
          id: '1',
          data: {
            question: { en: 'Updated 1', ne: 'अपडेट १' },
          },
        },
        {
          id: '2',
          data: {
            answer: { en: 'Updated Answer 2', ne: 'अपडेट उत्तर २' },
          },
        },
      ];

      (prismaService.fAQ.update as jest.Mock).mockResolvedValue(mockFAQ);
      (prismaService.fAQ.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.bulkUpdate(updates);

      expect(prismaService.fAQ.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRandomFAQs', () => {
    it('should return random FAQs', async () => {
      const prismaFAQs = [mockFAQs[0]];
      (prismaService.fAQ.findMany as jest.Mock).mockResolvedValue(prismaFAQs);

      const result = await repository.getRandomFAQs(3, true);

      expect(result).toEqual([mockFAQs[0]]);
      expect(prismaService.fAQ.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        take: 3,
      });
    });
  });

  describe('getPopularFAQs', () => {
    it('should return popular FAQs', async () => {
      const prismaFAQs = [mockFAQs[0]];
      (prismaService.fAQ.findMany as jest.Mock).mockResolvedValue(prismaFAQs);

      const result = await repository.getPopularFAQs(5, true);

      expect(result).toEqual([mockFAQs[0]]);
      expect(prismaService.fAQ.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });
    });
  });
}); 