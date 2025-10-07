import { Test, TestingModule } from '@nestjs/testing';
import { ImportantLinksRepository } from '../../../src/modules/important-links/repositories/important-links.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { ImportantLink } from '../../../src/modules/important-links/entities/important-links.entity';
import { 
  CreateImportantLinkDto, 
  UpdateImportantLinkDto, 
  ImportantLinksQueryDto 
} from '../../../src/modules/important-links/dto/important-links.dto';

describe('ImportantLinksRepository', () => {
  let repository: ImportantLinksRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockImportantLink: ImportantLink = {
    id: '1',
    linkTitle: {
      en: 'Government Portal',
      ne: 'सरकारी पोर्टल',
    },
    linkUrl: 'https://www.gov.np',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockImportantLinks: ImportantLink[] = [
    mockImportantLink,
    {
      ...mockImportantLink,
      id: '2',
      linkTitle: {
        en: 'Ministry of Education',
        ne: 'शिक्षा मन्त्रालय',
      },
      linkUrl: 'https://moe.gov.np',
      order: 2,
    },
    {
      ...mockImportantLink,
      id: '3',
      linkTitle: {
        en: 'National Portal',
        ne: 'राष्ट्रिय पोर्टल',
      },
      linkUrl: 'https://nepal.gov.np',
      order: 3,
      isActive: false,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportantLinksRepository,
        {
          provide: PrismaService,
          useValue: {
            importantLink: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              createMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              updateMany: jest.fn(),
              aggregate: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<ImportantLinksRepository>(ImportantLinksRepository);
    prismaService = module.get(PrismaService);
  });

  describe('findById', () => {
    it('should return important link when found', async () => {
      const prismaImportantLink = {
        id: '1',
        linkTitle: mockImportantLink.linkTitle,
        linkUrl: mockImportantLink.linkUrl,
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.importantLink.findUnique as jest.Mock).mockResolvedValue(prismaImportantLink);

      const result = await repository.findById('1');

      expect(result).toEqual(expect.objectContaining({
        id: mockImportantLink.id,
        linkTitle: mockImportantLink.linkTitle,
        linkUrl: mockImportantLink.linkUrl,
        order: mockImportantLink.order,
        isActive: mockImportantLink.isActive,
      }));
      expect(prismaService.importantLink.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null when important link not found', async () => {
      (prismaService.importantLink.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all important links when no filter provided', async () => {
      const prismaImportantLinks = mockImportantLinks.map(link => ({
        id: link.id,
        linkTitle: link.linkTitle,
        linkUrl: link.linkUrl,
        order: link.order,
        isActive: link.isActive,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
      }));

      (prismaService.importantLink.findMany as jest.Mock).mockResolvedValue(prismaImportantLinks);

      const result = await repository.findAll();

      expect(result).toEqual(mockImportantLinks);
      expect(prismaService.importantLink.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { order: 'asc' },
      });
    });

    it('should return filtered important links when isActive filter provided', async () => {
      const activeImportantLinks = mockImportantLinks.filter(link => link.isActive);
      const prismaImportantLinks = activeImportantLinks.map(link => ({
        id: link.id,
        linkTitle: link.linkTitle,
        linkUrl: link.linkUrl,
        order: link.order,
        isActive: link.isActive,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
      }));

      (prismaService.importantLink.findMany as jest.Mock).mockResolvedValue(prismaImportantLinks);

      const result = await repository.findAll(true);

      expect(result).toEqual(activeImportantLinks);
      expect(prismaService.importantLink.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findWithPagination', () => {
    it('should return paginated important links', async () => {
      const prismaImportantLinks = mockImportantLinks.map(link => ({
        id: link.id,
        linkTitle: link.linkTitle,
        linkUrl: link.linkUrl,
        order: link.order,
        isActive: link.isActive,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
      }));

      (prismaService.importantLink.findMany as jest.Mock).mockResolvedValue(prismaImportantLinks);
      (prismaService.importantLink.count as jest.Mock).mockResolvedValue(3);

      const result = await repository.findWithPagination(1, 10);

      expect(result.data).toEqual(mockImportantLinks);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(prismaService.importantLink.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });

    it('should apply isActive filter to pagination', async () => {
      const activeImportantLinks = mockImportantLinks.filter(link => link.isActive);
      const prismaImportantLinks = activeImportantLinks.map(link => ({
        id: link.id,
        linkTitle: link.linkTitle,
        linkUrl: link.linkUrl,
        order: link.order,
        isActive: link.isActive,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
      }));

      (prismaService.importantLink.findMany as jest.Mock).mockResolvedValue(prismaImportantLinks);
      (prismaService.importantLink.count as jest.Mock).mockResolvedValue(2);

      const result = await repository.findWithPagination(1, 10, true);

      expect(result.data).toEqual(activeImportantLinks);
      expect(prismaService.importantLink.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        skip: 0,
        take: 10,
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create new important link', async () => {
      const createData: CreateImportantLinkDto = {
        linkTitle: mockImportantLink.linkTitle,
        linkUrl: mockImportantLink.linkUrl,
        order: 1,
        isActive: true,
      };

      const prismaImportantLink = {
        id: '1',
        linkTitle: createData.linkTitle,
        linkUrl: createData.linkUrl,
        order: createData.order,
        isActive: createData.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.importantLink.create as jest.Mock).mockResolvedValue(prismaImportantLink);

      const result = await repository.create(createData);

      expect(result).toEqual(expect.objectContaining({
        id: mockImportantLink.id,
        linkTitle: mockImportantLink.linkTitle,
        linkUrl: mockImportantLink.linkUrl,
        order: mockImportantLink.order,
        isActive: mockImportantLink.isActive,
      }));
      expect(prismaService.importantLink.create).toHaveBeenCalledWith({
        data: {
          linkTitle: createData.linkTitle,
          linkUrl: createData.linkUrl,
          order: createData.order,
          isActive: createData.isActive,
        },
      });
    });
  });

  describe('update', () => {
    it('should update existing important link', async () => {
      const updateData: UpdateImportantLinkDto = {
        linkTitle: {
          en: 'Updated Government Portal',
          ne: 'अपडेटेड सरकारी पोर्टल',
        },
        linkUrl: 'https://updated.gov.np',
        order: 5,
      };

      const prismaImportantLink = {
        id: '1',
        linkTitle: updateData.linkTitle,
        linkUrl: updateData.linkUrl,
        order: updateData.order,
        isActive: mockImportantLink.isActive,
        createdAt: mockImportantLink.createdAt,
        updatedAt: new Date(),
      };

      (prismaService.importantLink.update as jest.Mock).mockResolvedValue(prismaImportantLink);

      const result = await repository.update('1', updateData);

      expect(result.linkTitle).toEqual(updateData.linkTitle);
      expect(result.linkUrl).toBe(updateData.linkUrl);
      expect(result.order).toBe(updateData.order);
      expect(prismaService.importantLink.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      });
    });
  });

  describe('delete', () => {
    it('should delete important link', async () => {
      (prismaService.importantLink.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('1');

      expect(prismaService.importantLink.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('reorder', () => {
    it('should reorder important links', async () => {
      const orders = [
        { id: '1', order: 3 },
        { id: '2', order: 1 },
        { id: '3', order: 2 },
      ];

      (prismaService.importantLink.update as jest.Mock).mockResolvedValue({});

      await repository.reorder(orders);

      expect(prismaService.importantLink.update).toHaveBeenCalledTimes(3);
      expect(prismaService.importantLink.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { order: 3 },
      });
      expect(prismaService.importantLink.update).toHaveBeenCalledWith({
        where: { id: '2' },
        data: { order: 1 },
      });
      expect(prismaService.importantLink.update).toHaveBeenCalledWith({
        where: { id: '3' },
        data: { order: 2 },
      });
    });
  });

  describe('getStatistics', () => {
    it('should return important links statistics', async () => {
      const mockStats = {
        total: 10,
        active: 8,
        inactive: 2,
        lastUpdated: new Date(),
      };

      (prismaService.importantLink.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8)  // active
        .mockResolvedValueOnce(2); // inactive

      (prismaService.importantLink.findFirst as jest.Mock).mockResolvedValue({
        updatedAt: new Date(),
      });

      const result = await repository.getStatistics();

      expect(result).toEqual(expect.objectContaining({
        total: 10,
        active: 8,
        inactive: 2,
      }));
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create important links', async () => {
      const createData: CreateImportantLinkDto[] = [
        {
          linkTitle: { en: 'Link 1', ne: 'लिङ्क १' },
          linkUrl: 'https://link1.com',
          order: 1,
          isActive: true,
        },
        {
          linkTitle: { en: 'Link 2', ne: 'लिङ्क २' },
          linkUrl: 'https://link2.com',
          order: 2,
          isActive: true,
        },
      ];

      const prismaImportantLinks = createData.map((data, index) => ({
        id: (index + 1).toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      (prismaService.importantLink.createMany as jest.Mock).mockResolvedValue({ count: 2 });
      (prismaService.importantLink.findMany as jest.Mock).mockResolvedValue(prismaImportantLinks);

      const result = await repository.bulkCreate(createData);

      expect(result).toHaveLength(2);
      expect(prismaService.importantLink.createMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('bulkUpdate', () => {
    it('should bulk update important links', async () => {
      const updates = [
        { id: '1', data: { order: 5 } },
        { id: '2', data: { isActive: false } },
      ];

      const updatedImportantLinks = updates.map((update, index) => ({
        id: update.id,
        linkTitle: mockImportantLinks[index].linkTitle,
        linkUrl: mockImportantLinks[index].linkUrl,
        order: update.data.order || mockImportantLinks[index].order,
        isActive: update.data.isActive !== undefined ? update.data.isActive : mockImportantLinks[index].isActive,
        createdAt: mockImportantLinks[index].createdAt,
        updatedAt: new Date(),
      }));

      (prismaService.importantLink.update as jest.Mock)
        .mockResolvedValueOnce(updatedImportantLinks[0])
        .mockResolvedValueOnce(updatedImportantLinks[1]);
      (prismaService.importantLink.findMany as jest.Mock).mockResolvedValue(updatedImportantLinks);

      const result = await repository.bulkUpdate(updates);

      expect(result).toHaveLength(2);
      expect(prismaService.importantLink.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('getFooterLinks', () => {
    it('should return footer links by category', async () => {
      // The actual implementation uses slice() to categorize links
      // quickLinks: slice(0, 5), governmentLinks: slice(5, 10), etc.
      const mockFooterLinks = {
        quickLinks: mockImportantLinks.slice(0, 5),
        governmentLinks: mockImportantLinks.slice(5, 10),
        socialMediaLinks: mockImportantLinks.slice(10, 15),
        contactLinks: mockImportantLinks.slice(15, 20),
      };

      (prismaService.importantLink.findMany as jest.Mock).mockResolvedValue(mockImportantLinks);

      const result = await repository.getFooterLinks();

      expect(result).toEqual(mockFooterLinks);
      expect(prismaService.importantLink.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByUrl', () => {
    it('should find important link by URL', async () => {
      const prismaImportantLink = {
        id: '1',
        linkTitle: mockImportantLink.linkTitle,
        linkUrl: 'https://www.gov.np',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.importantLink.findFirst as jest.Mock).mockResolvedValue(prismaImportantLink);

      const result = await repository.findByUrl('https://www.gov.np');

      expect(result).toEqual(expect.objectContaining({
        id: '1',
        linkUrl: 'https://www.gov.np',
      }));
      expect(prismaService.importantLink.findFirst).toHaveBeenCalledWith({
        where: { linkUrl: 'https://www.gov.np' },
      });
    });

    it('should return null when URL not found', async () => {
      (prismaService.importantLink.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByUrl('https://nonexistent.com');

      expect(result).toBeNull();
    });
  });

  describe('existsByUrl', () => {
    it('should return true when URL exists', async () => {
      (prismaService.importantLink.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.existsByUrl('https://www.gov.np');

      expect(result).toBe(true);
      expect(prismaService.importantLink.count).toHaveBeenCalledWith({
        where: { linkUrl: 'https://www.gov.np' },
      });
    });

    it('should return false when URL does not exist', async () => {
      (prismaService.importantLink.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.existsByUrl('https://nonexistent.com');

      expect(result).toBe(false);
    });

    it('should exclude specified ID when checking URL existence', async () => {
      (prismaService.importantLink.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.existsByUrl('https://www.gov.np', '2');

      expect(result).toBe(false);
      expect(prismaService.importantLink.count).toHaveBeenCalledWith({
        where: { 
          linkUrl: 'https://www.gov.np',
          id: { not: '2' },
        },
      });
    });
  });
}); 