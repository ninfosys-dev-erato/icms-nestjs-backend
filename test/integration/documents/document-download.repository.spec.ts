import { Test, TestingModule } from '@nestjs/testing';
import { DocumentDownloadRepository } from '../../../src/modules/documents/repositories/document-download.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { DocumentDownload } from '../../../src/modules/documents/entities/document-download.entity';
import { CreateDocumentDownloadDto } from '../../../src/modules/documents/dto/documents.dto';

describe('DocumentDownloadRepository', () => {
  let repository: DocumentDownloadRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockDownload: DocumentDownload = {
    id: '1',
    documentId: 'doc-1',
    userId: 'user-1',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    downloadedAt: new Date(),
    document: {
      id: 'doc-1',
      title: { en: 'Test Document', ne: 'परीक्षण कागजात' }
    },
    user: {
      id: 'user-1',
      email: 'test@example.com'
    }
  };

  const mockDownloads: DocumentDownload[] = [
    mockDownload,
    {
      ...mockDownload,
      id: '2',
      userId: 'user-2',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentDownloadRepository,
        {
          provide: PrismaService,
          useValue: {
            documentDownload: {
              create: jest.fn(),
              findMany: jest.fn(),
              deleteMany: jest.fn()
            }
          }
        }
      ],
    }).compile();

    repository = module.get<DocumentDownloadRepository>(DocumentDownloadRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a document download record', async () => {
      const createData: CreateDocumentDownloadDto = {
        documentId: 'doc-1',
        userId: 'user-1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.1'
      };

      (prismaService.documentDownload.create as jest.Mock).mockResolvedValue(mockDownload);

      const result = await repository.create(createData);

      expect(prismaService.documentDownload.create).toHaveBeenCalledWith({
        data: {
          documentId: createData.documentId,
          userId: createData.userId,
          ipAddress: createData.ipAddress,
          userAgent: createData.userAgent,
          downloadedAt: expect.any(Date)
        },
        include: {
          document: true,
          user: true
        }
      });
      expect(result).toEqual(mockDownload);
    });

    it('should create a document download record without user', async () => {
      const createData: CreateDocumentDownloadDto = {
        documentId: 'doc-1',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        ipAddress: '192.168.1.1'
      };

      const downloadWithoutUser = { ...mockDownload, userId: undefined, user: undefined };
      (prismaService.documentDownload.create as jest.Mock).mockResolvedValue(downloadWithoutUser);

      const result = await repository.create(createData);

      expect(prismaService.documentDownload.create).toHaveBeenCalledWith({
        data: {
          documentId: createData.documentId,
          userId: undefined,
          ipAddress: createData.ipAddress,
          userAgent: createData.userAgent,
          downloadedAt: expect.any(Date)
        },
        include: {
          document: true,
          user: true
        }
      });
      expect(result).toEqual(downloadWithoutUser);
    });
  });

  describe('findByDocumentId', () => {
    it('should find downloads by document ID', async () => {
      const documentId = 'doc-1';

      (prismaService.documentDownload.findMany as jest.Mock).mockResolvedValue(mockDownloads);

      const result = await repository.findByDocumentId(documentId);

      expect(prismaService.documentDownload.findMany).toHaveBeenCalledWith({
        where: { documentId },
        include: {
          document: true,
          user: true
        },
        orderBy: { downloadedAt: 'desc' }
      });
      expect(result).toEqual(mockDownloads);
    });

    it('should return empty array when no downloads found', async () => {
      const documentId = 'doc-1';

      (prismaService.documentDownload.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByDocumentId(documentId);

      expect(result).toEqual([]);
    });
  });

  describe('findByUserId', () => {
    it('should find downloads by user ID', async () => {
      const userId = 'user-1';

      (prismaService.documentDownload.findMany as jest.Mock).mockResolvedValue(mockDownloads);

      const result = await repository.findByUserId(userId);

      expect(prismaService.documentDownload.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          document: true,
          user: true
        },
        orderBy: { downloadedAt: 'desc' }
      });
      expect(result).toEqual(mockDownloads);
    });
  });

  describe('getDownloadStatistics', () => {
    it('should get download statistics for a document', async () => {
      const documentId = 'doc-1';

      jest.spyOn(repository, 'findByDocumentId').mockResolvedValue(mockDownloads);

      const result = await repository.getDownloadStatistics(documentId);

      expect(repository.findByDocumentId).toHaveBeenCalledWith(documentId);

      expect(result).toEqual({
        totalDownloads: 2,
        downloadsByDate: expect.any(Object),
        downloadsByBrowser: expect.any(Object),
        downloadsByDevice: expect.any(Object),
        topDownloaders: expect.any(Array)
      });
    });

    it('should handle downloads without user ID', async () => {
      const documentId = 'doc-1';
      const downloadsWithoutUser = [
        { ...mockDownload, userId: undefined },
        { ...mockDownload, id: '2', userId: undefined }
      ];

      jest.spyOn(repository, 'findByDocumentId').mockResolvedValue(downloadsWithoutUser);

      const result = await repository.getDownloadStatistics(documentId);

      expect(result.totalDownloads).toBe(2);
      expect(result.topDownloaders).toHaveLength(0);
    });
  });

  describe('getRecentDownloads', () => {
    it('should get recent downloads with default limit', async () => {
      (prismaService.documentDownload.findMany as jest.Mock).mockResolvedValue(mockDownloads);

      const result = await repository.getRecentDownloads();

      expect(prismaService.documentDownload.findMany).toHaveBeenCalledWith({
        take: 10,
        include: {
          document: true,
          user: true
        },
        orderBy: { downloadedAt: 'desc' }
      });
      expect(result).toEqual(mockDownloads);
    });

    it('should get recent downloads with custom limit', async () => {
      const limit = 5;

      (prismaService.documentDownload.findMany as jest.Mock).mockResolvedValue(mockDownloads);

      const result = await repository.getRecentDownloads(limit);

      expect(prismaService.documentDownload.findMany).toHaveBeenCalledWith({
        take: limit,
        include: {
          document: true,
          user: true
        },
        orderBy: { downloadedAt: 'desc' }
      });
      expect(result).toEqual(mockDownloads);
    });
  });

  describe('deleteByDocumentId', () => {
    it('should delete downloads by document ID', async () => {
      const documentId = 'doc-1';

      (prismaService.documentDownload.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      await repository.deleteByDocumentId(documentId);

      expect(prismaService.documentDownload.deleteMany).toHaveBeenCalledWith({
        where: { documentId }
      });
    });

    it('should handle deletion when no downloads exist', async () => {
      const documentId = 'doc-1';

      (prismaService.documentDownload.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      await repository.deleteByDocumentId(documentId);

      expect(prismaService.documentDownload.deleteMany).toHaveBeenCalledWith({
        where: { documentId }
      });
    });
  });
}); 