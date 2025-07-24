import { Test, TestingModule } from '@nestjs/testing';
import { DocumentRepository } from '../../../src/modules/documents/repositories/document.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { Document, DocumentType, DocumentCategory, DocumentStatus } from '../../../src/modules/documents/entities/document.entity';
import { CreateDocumentDto, UpdateDocumentDto, DocumentQueryDto, DocumentStatistics } from '../../../src/modules/documents/dto/documents.dto';

describe('DocumentRepository', () => {
  let repository: DocumentRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockDocument: Document = {
    id: '1',
    title: { en: 'Test Document', ne: 'परीक्षण कागजात' },
    description: { en: 'Test description', ne: 'परीक्षण विवरण' },
    fileName: 'test_document.pdf',
    originalName: 'Test Document.pdf',
    filePath: 'uploads/documents/test_document.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    documentType: DocumentType.PDF,
    category: DocumentCategory.OFFICIAL,
    status: DocumentStatus.PUBLISHED,
    documentNumber: 'DOC-2024-001',
    version: 'v1.0',
    publishDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    tags: ['official', 'test'],
    isPublic: true,
    requiresAuth: false,
    order: 1,
    isActive: true,
    downloadCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockDocuments = [mockDocument];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentRepository,
        {
          provide: PrismaService,
          useValue: {
            document: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findFirst: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
              aggregate: jest.fn(),
              updateMany: jest.fn(),
              deleteMany: jest.fn()
            },
            $transaction: jest.fn()
          }
        }
      ],
    }).compile();

    repository = module.get<DocumentRepository>(DocumentRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find document by ID', async () => {
      const id = '1';

      (prismaService.document.findUnique as jest.Mock).mockResolvedValue(mockDocument);

      const result = await repository.findById(id);

      expect(prismaService.document.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: {
          downloads: true,
          versions: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      expect(result).toEqual(mockDocument);
    });

    it('should return null when document not found', async () => {
      const id = 'non-existent';

      (prismaService.document.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById(id);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all documents with pagination', async () => {
      const query: DocumentQueryDto = { page: 1, limit: 10 };
      const mockResult = {
        data: mockDocuments,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);
      (prismaService.document.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findAll(query);

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          downloads: {
            take: 1,
            orderBy: { downloadedAt: 'desc' }
          },
          versions: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      expect(result).toEqual(mockResult);
    });

    it('should find documents with search term', async () => {
      const query: DocumentQueryDto = { page: 1, limit: 10, search: 'test' };

      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);
      (prismaService.document.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findAll(query);

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { path: ['en'], string_contains: 'test' } },
            { title: { path: ['ne'], string_contains: 'test' } },
            { description: { path: ['en'], string_contains: 'test' } },
            { description: { path: ['ne'], string_contains: 'test' } },
            { fileName: { contains: 'test', mode: 'insensitive' } },
            { originalName: { contains: 'test', mode: 'insensitive' } },
            { documentNumber: { contains: 'test', mode: 'insensitive' } },
          ]
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          downloads: {
            take: 1,
            orderBy: { downloadedAt: 'desc' }
          },
          versions: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    });

    it('should find documents without search term', async () => {
      const query: DocumentQueryDto = { page: 1, limit: 10 };

      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);
      (prismaService.document.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findAll(query);

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          downloads: {
            take: 1,
            orderBy: { downloadedAt: 'desc' }
          },
          versions: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    });

    it('should find documents with custom sorting', async () => {
      const query: DocumentQueryDto = { page: 1, limit: 10, sort: 'title', order: 'asc' };

      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);
      (prismaService.document.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findAll(query);

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { title: 'asc' },
        include: {
          downloads: {
            take: 1,
            orderBy: { downloadedAt: 'desc' }
          },
          versions: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    });

    it('should find documents with date range filter', async () => {
      const query: DocumentQueryDto = { 
        page: 1, 
        limit: 10, 
        dateFrom: new Date('2024-01-01') as any,
        dateTo: new Date('2024-12-31') as any
      };

      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);
      (prismaService.document.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findAll(query);

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: expect.any(Date),
            lte: expect.any(Date)
          }
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          downloads: {
            take: 1,
            orderBy: { downloadedAt: 'desc' }
          },
          versions: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    });

    it('should find documents with tags filter', async () => {
      const query: DocumentQueryDto = { 
        page: 1, 
        limit: 10, 
        tags: ['official', 'test']
      };

      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);
      (prismaService.document.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findAll(query);

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: {
          tags: { hasSome: ['official', 'test'] }
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          downloads: {
            take: 1,
            orderBy: { downloadedAt: 'desc' }
          },
          versions: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    });
  });

  describe('findByType', () => {
    it('should find documents by type', async () => {
      const documentType = DocumentType.PDF;
      const query: DocumentQueryDto = { page: 1, limit: 10 };

      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);
      (prismaService.document.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findByType(documentType, query);

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: { documentType },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          downloads: {
            take: 1,
            orderBy: { downloadedAt: 'desc' }
          },
          versions: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    });
  });

  describe('findByCategory', () => {
    it('should find documents by category', async () => {
      const category = DocumentCategory.OFFICIAL;
      const query: DocumentQueryDto = { page: 1, limit: 10 };

      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);
      (prismaService.document.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findByCategory(category, query);

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: { category },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          downloads: {
            take: 1,
            orderBy: { downloadedAt: 'desc' }
          },
          versions: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    });
  });

  describe('search', () => {
    it('should search documents', async () => {
      const searchTerm = 'test';
      const query: DocumentQueryDto = { page: 1, limit: 10 };

      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);
      (prismaService.document.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.search(searchTerm, query);

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { path: ['en'], string_contains: 'test' } },
            { title: { path: ['ne'], string_contains: 'test' } },
            { description: { path: ['en'], string_contains: 'test' } },
            { description: { path: ['ne'], string_contains: 'test' } },
            { fileName: { contains: 'test', mode: 'insensitive' } },
            { originalName: { contains: 'test', mode: 'insensitive' } },
            { documentNumber: { contains: 'test', mode: 'insensitive' } },
          ]
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          downloads: {
            take: 1,
            orderBy: { downloadedAt: 'desc' }
          },
          versions: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    });
  });

  describe('create', () => {
    it('should create a document', async () => {
      const createData: CreateDocumentDto = {
        title: { en: 'New Document', ne: 'नयाँ कागजात' },
        fileName: 'new_document.pdf',
        originalName: 'New Document.pdf',
        filePath: 'uploads/documents/new_document.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        documentType: DocumentType.PDF,
        category: DocumentCategory.OFFICIAL,
        status: DocumentStatus.DRAFT
      };

      (prismaService.document.create as jest.Mock).mockResolvedValue(mockDocument);

      const result = await repository.create(createData);

      expect(prismaService.document.create).toHaveBeenCalledWith({
        data: {
          title: createData.title,
          description: createData.description,
          fileName: createData.fileName,
          originalName: createData.originalName,
          filePath: createData.filePath,
          fileSize: createData.fileSize,
          mimeType: createData.mimeType,
          documentType: createData.documentType,
          category: createData.category,
          status: createData.status,
          documentNumber: createData.documentNumber,
          version: createData.version,
          publishDate: createData.publishDate,
          expiryDate: createData.expiryDate,
          tags: createData.tags,
          isPublic: createData.isPublic ?? true,
          requiresAuth: createData.requiresAuth ?? false,
          order: createData.order ?? 0,
          isActive: createData.isActive ?? true,
          downloadCount: 0,
        },
        include: {
          downloads: true,
          versions: true
        }
      });
      expect(result).toEqual(mockDocument);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const id = '1';
      const updateData: UpdateDocumentDto = {
        title: { en: 'Updated Document', ne: 'अपडेट गरिएको कागजात' },
        status: DocumentStatus.PUBLISHED
      };

      (prismaService.document.update as jest.Mock).mockResolvedValue(mockDocument);

      const result = await repository.update(id, updateData);

      expect(prismaService.document.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          title: updateData.title,
          description: updateData.description,
          category: updateData.category,
          status: updateData.status,
          documentNumber: updateData.documentNumber,
          version: updateData.version,
          publishDate: updateData.publishDate,
          expiryDate: updateData.expiryDate,
          tags: updateData.tags,
          isPublic: updateData.isPublic,
          requiresAuth: updateData.requiresAuth,
          order: updateData.order,
          isActive: updateData.isActive,
        },
        include: {
          downloads: true,
          versions: true
        }
      });
      expect(result).toEqual(mockDocument);
    });
  });

  describe('delete', () => {
    it('should delete a document', async () => {
      const id = '1';

      (prismaService.document.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete(id);

      expect(prismaService.document.delete).toHaveBeenCalledWith({
        where: { id }
      });
    });
  });

  describe('findByFilePath', () => {
    it('should find document by file path', async () => {
      const filePath = 'uploads/documents/test_document.pdf';

      (prismaService.document.findFirst as jest.Mock).mockResolvedValue(mockDocument);

      const result = await repository.findByFilePath(filePath);

      expect(prismaService.document.findFirst).toHaveBeenCalledWith({
        where: { filePath },
        include: {
          downloads: true,
          versions: true
        }
      });
      expect(result).toEqual(mockDocument);
    });
  });

  describe('findByIds', () => {
    it('should find documents by IDs', async () => {
      const ids = ['1', '2'];

      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);

      const result = await repository.findByIds(ids);

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: { id: { in: ids } },
        include: {
          downloads: true,
          versions: true
        }
      });
      expect(result).toEqual(mockDocuments);
    });
  });

  describe('incrementDownloadCount', () => {
    it('should increment download count', async () => {
      const id = '1';

      (prismaService.document.update as jest.Mock).mockResolvedValue(undefined);

      await repository.incrementDownloadCount(id);

      expect(prismaService.document.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          downloadCount: {
            increment: 1
          }
        }
      });
    });
  });

  describe('getStatistics', () => {
    it('should get document statistics', async () => {
      const mockStats: DocumentStatistics = {
        total: 100,
        published: 80,
        draft: 15,
        archived: 5,
        byType: {
          PDF: 50,
          DOC: 10,
          DOCX: 30,
          XLS: 5,
          XLSX: 20,
          PPT: 3,
          PPTX: 2,
          TXT: 1,
          RTF: 1,
          CSV: 1,
          ZIP: 1,
          RAR: 1,
          OTHER: 1
        },
        byCategory: {
          OFFICIAL: 40,
          REPORT: 30,
          FORM: 10,
          POLICY: 20,
          PROCEDURE: 5,
          GUIDELINE: 3,
          NOTICE: 2,
          CIRCULAR: 1,
          OTHER: 10
        },
        totalDownloads: 15000,
        averageDownloadsPerDocument: 150,
        totalSize: 1024000000,
        averageSize: 10240000
      };

      (prismaService.document.count as jest.Mock)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80)  // published
        .mockResolvedValueOnce(15)  // draft
        .mockResolvedValueOnce(5);  // archived

      (prismaService.document.groupBy as jest.Mock)
        .mockResolvedValueOnce([
          { documentType: 'PDF', _count: { documentType: 50 } },
          { documentType: 'DOC', _count: { documentType: 10 } }
        ])
        .mockResolvedValueOnce([
          { category: 'OFFICIAL', _count: { category: 40 } },
          { category: 'REPORT', _count: { category: 30 } }
        ]);

      (prismaService.document.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { downloadCount: 15000 } })
        .mockResolvedValueOnce({ _sum: { fileSize: 1024000000 } })
        .mockResolvedValueOnce({ _avg: { fileSize: 10240000 } });

      const result = await repository.getStatistics();

      expect(result.total).toBe(100);
      expect(result.published).toBe(80);
      expect(result.draft).toBe(15);
      expect(result.archived).toBe(5);
      expect(result.totalDownloads).toBe(15000);
      expect(result.totalSize).toBe(1024000000);
      expect(result.averageSize).toBe(10240000);
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete documents', async () => {
      const ids = ['1', '2'];

      (prismaService.document.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      await repository.bulkDelete(ids);

      expect(prismaService.document.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ids } }
      });
    });
  });

  describe('bulkUpdate', () => {
    it('should bulk update documents', async () => {
      const ids = ['1', '2'];
      const updates: Partial<UpdateDocumentDto> = {
        status: DocumentStatus.ARCHIVED,
        isActive: false
      };

      const updatedDocument = { ...mockDocument, ...updates };
      
      // Mock the transaction to execute the callback with a mock transaction object
      (prismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const mockTx = {
          document: {
            update: jest.fn()
              .mockResolvedValueOnce(updatedDocument)
              .mockResolvedValueOnce(updatedDocument)
          }
        };
        return await callback(mockTx);
      });

      const result = await repository.bulkUpdate(ids, updates);

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual([updatedDocument, updatedDocument]);
    });
  });

  describe('findExpiredDocuments', () => {
    it('should find expired documents', async () => {
      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);

      const result = await repository.findExpiredDocuments();

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: {
          expiryDate: {
            lt: expect.any(Date)
          },
          status: DocumentStatus.PUBLISHED
        }
      });
      expect(result).toEqual(mockDocuments);
    });
  });

  describe('findDocumentsByTags', () => {
    it('should find documents by tags', async () => {
      const tags = ['official', 'test'];

      (prismaService.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);

      const result = await repository.findDocumentsByTags(tags);

      expect(prismaService.document.findMany).toHaveBeenCalledWith({
        where: {
          tags: { hasSome: tags }
        },
        include: {
          downloads: true,
          versions: true
        }
      });
      expect(result).toEqual(mockDocuments);
    });
  });
}); 