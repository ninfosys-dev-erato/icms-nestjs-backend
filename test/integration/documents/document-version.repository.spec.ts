import { Test, TestingModule } from '@nestjs/testing';
import { DocumentVersionRepository } from '../../../src/modules/documents/repositories/document-version.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { DocumentVersion } from '../../../src/modules/documents/entities/document-version.entity';
import { CreateDocumentVersionDto } from '../../../src/modules/documents/dto/documents.dto';

describe('DocumentVersionRepository', () => {
  let repository: DocumentVersionRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockVersion: DocumentVersion = {
    id: '1',
    documentId: 'doc-1',
    version: 'v1.0',
    fileName: 'document_v1.pdf',
    filePath: 'uploads/documents/document_v1.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    changeLog: { en: 'Initial version', ne: 'प्रारम्भिक संस्करण' },
    createdAt: new Date()
  };

  const mockVersions: DocumentVersion[] = [
    mockVersion,
    {
      ...mockVersion,
      id: '2',
      version: 'v1.1',
      fileName: 'document_v1.1.pdf',
      changeLog: { en: 'Bug fixes', ne: 'बग फिक्सहरू' }
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentVersionRepository,
        {
          provide: PrismaService,
          useValue: {
            documentVersion: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              deleteMany: jest.fn(),
              count: jest.fn()
            }
          }
        }
      ],
    }).compile();

    repository = module.get<DocumentVersionRepository>(DocumentVersionRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a document version', async () => {
      const createData: CreateDocumentVersionDto = {
        documentId: 'doc-1',
        version: 'v1.0',
        fileName: 'document_v1.pdf',
        filePath: 'uploads/documents/document_v1.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        changeLog: { en: 'Initial version', ne: 'प्रारम्भिक संस्करण' }
      };

      (prismaService.documentVersion.create as jest.Mock).mockResolvedValue(mockVersion);

      const result = await repository.create(createData);

      expect(prismaService.documentVersion.create).toHaveBeenCalledWith({
        data: {
          documentId: createData.documentId,
          version: createData.version,
          fileName: createData.fileName,
          filePath: createData.filePath,
          fileSize: createData.fileSize,
          mimeType: createData.mimeType,
          changeLog: createData.changeLog,
          createdAt: expect.any(Date)
        },
        include: {
          document: true
        }
      });
      expect(result).toEqual(mockVersion);
    });

    it('should create a document version without change log', async () => {
      const createData: CreateDocumentVersionDto = {
        documentId: 'doc-1',
        version: 'v1.0',
        fileName: 'document_v1.pdf',
        filePath: 'uploads/documents/document_v1.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf'
      };

      const versionWithoutChangeLog = { ...mockVersion, changeLog: undefined };
      (prismaService.documentVersion.create as jest.Mock).mockResolvedValue(versionWithoutChangeLog);

      const result = await repository.create(createData);

      expect(prismaService.documentVersion.create).toHaveBeenCalledWith({
        data: {
          documentId: createData.documentId,
          version: createData.version,
          fileName: createData.fileName,
          filePath: createData.filePath,
          fileSize: createData.fileSize,
          mimeType: createData.mimeType,
          changeLog: undefined,
          createdAt: expect.any(Date)
        },
        include: {
          document: true
        }
      });
      expect(result).toEqual(versionWithoutChangeLog);
    });
  });

  describe('findByDocumentId', () => {
    it('should find versions by document ID', async () => {
      const documentId = 'doc-1';

      (prismaService.documentVersion.findMany as jest.Mock).mockResolvedValue(mockVersions);

      const result = await repository.findByDocumentId(documentId);

      expect(prismaService.documentVersion.findMany).toHaveBeenCalledWith({
        where: { documentId },
        include: {
          document: true
        },
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockVersions);
    });

    it('should return empty array when no versions found', async () => {
      const documentId = 'doc-1';

      (prismaService.documentVersion.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.findByDocumentId(documentId);

      expect(result).toEqual([]);
    });
  });

  describe('findByVersion', () => {
    it('should find version by document ID and version number', async () => {
      const documentId = 'doc-1';
      const version = 'v1.0';

      (prismaService.documentVersion.findFirst as jest.Mock).mockResolvedValue(mockVersion);

      const result = await repository.findByVersion(documentId, version);

      expect(prismaService.documentVersion.findFirst).toHaveBeenCalledWith({
        where: { documentId, version },
        include: {
          document: true
        }
      });
      expect(result).toEqual(mockVersion);
    });

    it('should return null when version not found', async () => {
      const documentId = 'doc-1';
      const version = 'v2.0';

      (prismaService.documentVersion.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByVersion(documentId, version);

      expect(result).toBeNull();
    });
  });

  describe('findLatestVersion', () => {
    it('should find latest version by document ID', async () => {
      const documentId = 'doc-1';

      (prismaService.documentVersion.findFirst as jest.Mock).mockResolvedValue(mockVersion);

      const result = await repository.findLatestVersion(documentId);

      expect(prismaService.documentVersion.findFirst).toHaveBeenCalledWith({
        where: { documentId },
        include: {
          document: true
        },
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockVersion);
    });

    it('should return null when no versions found', async () => {
      const documentId = 'doc-1';

      (prismaService.documentVersion.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findLatestVersion(documentId);

      expect(result).toBeNull();
    });
  });

  describe('deleteByDocumentId', () => {
    it('should delete all versions for a document', async () => {
      const documentId = 'doc-1';

      (prismaService.documentVersion.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      await repository.deleteByDocumentId(documentId);

      expect(prismaService.documentVersion.deleteMany).toHaveBeenCalledWith({
        where: { documentId }
      });
    });

    it('should handle deletion when no versions exist', async () => {
      const documentId = 'doc-1';

      (prismaService.documentVersion.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      await repository.deleteByDocumentId(documentId);

      expect(prismaService.documentVersion.deleteMany).toHaveBeenCalledWith({
        where: { documentId }
      });
    });
  });

  describe('deleteByVersion', () => {
    it('should delete specific version', async () => {
      const documentId = 'doc-1';
      const version = 'v1.0';

      (prismaService.documentVersion.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      await repository.deleteByVersion(documentId, version);

      expect(prismaService.documentVersion.deleteMany).toHaveBeenCalledWith({
        where: { documentId, version }
      });
    });

    it('should handle deletion when version not found', async () => {
      const documentId = 'doc-1';
      const version = 'v2.0';

      (prismaService.documentVersion.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      await repository.deleteByVersion(documentId, version);

      expect(prismaService.documentVersion.deleteMany).toHaveBeenCalledWith({
        where: { documentId, version }
      });
    });
  });

  describe('getVersionHistory', () => {
    it('should get version history for a document', async () => {
      const documentId = 'doc-1';

      (prismaService.documentVersion.findMany as jest.Mock).mockResolvedValue(mockVersions);

      const result = await repository.getVersionHistory(documentId);

      expect(prismaService.documentVersion.findMany).toHaveBeenCalledWith({
        where: { documentId },
        include: {
          document: true
        },
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual(mockVersions);
    });

    it('should return empty array when no version history', async () => {
      const documentId = 'doc-1';

      (prismaService.documentVersion.findMany as jest.Mock).mockResolvedValue([]);

      const result = await repository.getVersionHistory(documentId);

      expect(result).toEqual([]);
    });
  });

  describe('getVersionCount', () => {
    it('should get version count for a document', async () => {
      const documentId = 'doc-1';
      const expectedCount = 5;

      (prismaService.documentVersion.count as jest.Mock).mockResolvedValue(expectedCount);

      const result = await repository.getVersionCount(documentId);

      expect(prismaService.documentVersion.count).toHaveBeenCalledWith({
        where: { documentId }
      });
      expect(result).toBe(expectedCount);
    });

    it('should return zero when no versions exist', async () => {
      const documentId = 'doc-1';

      (prismaService.documentVersion.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.getVersionCount(documentId);

      expect(result).toBe(0);
    });
  });
}); 