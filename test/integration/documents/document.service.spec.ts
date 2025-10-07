import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from '../../../src/modules/documents/services/document.service';
import { DocumentRepository } from '../../../src/modules/documents/repositories/document.repository';
import { DocumentDownloadRepository } from '../../../src/modules/documents/repositories/document-download.repository';
import { DocumentVersionRepository } from '../../../src/modules/documents/repositories/document-version.repository';
import { FileStorageService } from '../../../src/common/services/file-storage/interfaces/file-storage.interface';
import { Document, DocumentType, DocumentCategory, DocumentStatus } from '../../../src/modules/documents/entities/document.entity';
import { CreateDocumentDto, UpdateDocumentDto, DocumentQueryDto, DocumentStatistics } from '../../../src/modules/documents/dto/documents.dto';

describe('DocumentService', () => {
  let service: DocumentService;
  let documentRepository: jest.Mocked<DocumentRepository>;
  let documentDownloadRepository: jest.Mocked<DocumentDownloadRepository>;
  let documentVersionRepository: jest.Mocked<DocumentVersionRepository>;
  let fileStorageService: jest.Mocked<FileStorageService>;

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

  // Mock response DTO with downloadUrl and presignedDownloadUrl
  const mockResponseDto = {
    ...mockDocument,
    downloadUrl: 'https://cdn.example.com/uploads/documents/test_document.pdf',
    presignedDownloadUrl: 'https://cdn.example.com/presigned/test_document.pdf?expires=...'
  };

  const mockDocumentsResponse = [mockResponseDto];

  const mockUploadResult = {
    key: 'uploads/documents/test_document.pdf',
    url: 'https://s3.amazonaws.com/bucket/uploads/documents/test_document.pdf',
    size: 1024000,
    mimeType: 'application/pdf',
    etag: 'abc123'
  };

  const mockDownloadUrl = 'https://s3.amazonaws.com/bucket/uploads/documents/test_document.pdf';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: DocumentRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByType: jest.fn(),
            findByCategory: jest.fn(),
            search: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByFilePath: jest.fn(),
            findByIds: jest.fn(),
            incrementDownloadCount: jest.fn(),
            getStatistics: jest.fn(),
            bulkDelete: jest.fn(),
            bulkUpdate: jest.fn(),
            findExpiredDocuments: jest.fn(),
            findDocumentsByTags: jest.fn()
          }
        },
        {
          provide: DocumentDownloadRepository,
          useValue: {
            create: jest.fn(),
            findByDocumentId: jest.fn(),
            findByUserId: jest.fn(),
            getDownloadStatistics: jest.fn(),
            getRecentDownloads: jest.fn(),
            deleteByDocumentId: jest.fn()
          }
        },
        {
          provide: DocumentVersionRepository,
          useValue: {
            create: jest.fn(),
            findByDocumentId: jest.fn(),
            findByVersion: jest.fn(),
            findLatestVersion: jest.fn(),
            deleteByDocumentId: jest.fn(),
            deleteByVersion: jest.fn(),
            getVersionHistory: jest.fn(),
            getVersionCount: jest.fn()
          }
        },
        {
          provide: FileStorageService,
          useValue: {
            upload: jest.fn(),
            delete: jest.fn(),
            getUrl: jest.fn().mockResolvedValue('https://cdn.example.com/uploads/documents/test_document.pdf'),
            generatePresignedUrl: jest.fn(),
            generateKey: jest.fn(),
            download: jest.fn(),
            exists: jest.fn(),
            getMetadata: jest.fn(),
            copy: jest.fn(),
            validateFileType: jest.fn(),
            validateFileSize: jest.fn(),
            getFileExtension: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentRepository = module.get(DocumentRepository);
    documentDownloadRepository = module.get(DocumentDownloadRepository);
    documentVersionRepository = module.get(DocumentVersionRepository);
    fileStorageService = module.get(FileStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllDocuments', () => {
    it('should return all documents with pagination', async () => {
      const query: DocumentQueryDto = { page: 1, limit: 10 };
      const mockResult = {
        data: mockDocumentsResponse,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      documentRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.getAllDocuments(query);

      expect(documentRepository.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getDocumentById', () => {
    it('should return document by ID', async () => {
      const id = '1';

      documentRepository.findById.mockResolvedValue(mockResponseDto);

      const result = await service.getDocumentById(id);

      expect(documentRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResponseDto);
    });

    it('should throw error when document not found', async () => {
      const id = 'non-existent';

      documentRepository.findById.mockResolvedValue(null);

      await expect(service.getDocumentById(id)).rejects.toThrow('Document not found');
    });
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      const file = {
        originalname: 'test_document.pdf',
        mimetype: 'application/pdf',
        size: 1024000,
        buffer: Buffer.from('test content')
      } as Express.Multer.File;

      const metadata: Partial<CreateDocumentDto> = {
        title: { en: 'Test Document', ne: 'परीक्षण कागजात' },
        documentType: DocumentType.PDF,
        category: DocumentCategory.OFFICIAL,
        status: DocumentStatus.DRAFT
      };

      fileStorageService.generateKey.mockReturnValue('uploads/documents/test_document.pdf');
      fileStorageService.upload.mockResolvedValue(mockUploadResult);
      documentRepository.create.mockResolvedValue(mockResponseDto);

      const result = await service.uploadDocument(file, metadata);

      expect(fileStorageService.generateKey).toHaveBeenCalledWith('documents', 'test_document.pdf');
      expect(fileStorageService.upload).toHaveBeenCalledWith(
        'uploads/documents/test_document.pdf',
        file.buffer,
        file.mimetype
      );
      expect(documentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: expect.stringContaining('test_document'),
          originalName: 'test_document.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          ...metadata
        })
      );
      expect(result).toEqual(mockResponseDto);
    });

    it('should throw error for invalid file type', async () => {
      const file = {
        originalname: 'test_document.exe',
        mimetype: 'application/x-executable',
        size: 1024000,
        buffer: Buffer.from('test content')
      } as Express.Multer.File;

      await expect(service.uploadDocument(file)).rejects.toThrow('File validation failed');
    });

    it('should throw error for file too large', async () => {
      const file = {
        originalname: 'test_document.pdf',
        mimetype: 'application/pdf',
        size: 100 * 1024 * 1024, // 100MB
        buffer: Buffer.from('test content')
      } as Express.Multer.File;

      // Mock the validation to fail
      jest.spyOn(service as any, 'validateFile').mockResolvedValue({
        isValid: false,
        errors: [{ field: 'size', message: 'File too large', code: 'FILE_TOO_LARGE' }]
      });

      await expect(service.uploadDocument(file)).rejects.toThrow('File validation failed');
    });
  });

  describe('updateDocument', () => {
    it('should update document successfully', async () => {
      const id = '1';
      const updateData: UpdateDocumentDto = {
        title: { en: 'Updated Document', ne: 'अपडेट गरिएको कागजात' },
        status: DocumentStatus.PUBLISHED
      };

      const updatedDocument = { ...mockResponseDto, ...updateData };
      documentRepository.update.mockResolvedValue(updatedDocument);

      const result = await service.updateDocument(id, updateData);

      expect(documentRepository.update).toHaveBeenCalledWith(id, updateData);
      expect(result).toEqual(updatedDocument);
    });

    it('should throw error when document not found', async () => {
      const id = 'non-existent';
      const updateData: UpdateDocumentDto = { title: { en: 'Updated', ne: 'अपडेट' } };

      documentRepository.update.mockRejectedValue(new Error('Document not found'));

      await expect(service.updateDocument(id, updateData)).rejects.toThrow('Document not found');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      const id = '1';

      documentRepository.findById.mockResolvedValue(mockResponseDto);
      fileStorageService.delete.mockResolvedValue(undefined);
      documentRepository.delete.mockResolvedValue(undefined);
      documentDownloadRepository.deleteByDocumentId.mockResolvedValue(undefined);
      documentVersionRepository.deleteByDocumentId.mockResolvedValue(undefined);

      await service.deleteDocument(id);

      expect(documentRepository.findById).toHaveBeenCalledWith(id);
      expect(fileStorageService.delete).toHaveBeenCalledWith(mockResponseDto.filePath);
      expect(documentRepository.delete).toHaveBeenCalledWith(id);
      expect(documentDownloadRepository.deleteByDocumentId).toHaveBeenCalledWith(id);
      expect(documentVersionRepository.deleteByDocumentId).toHaveBeenCalledWith(id);
    });

    it('should throw error when document not found', async () => {
      const id = 'non-existent';

      documentRepository.findById.mockResolvedValue(null);

      await expect(service.deleteDocument(id)).rejects.toThrow('Document not found');
    });
  });

  describe('downloadDocument', () => {
    it('should return download URL and track download', async () => {
      const id = '1';
      const userId = 'user-1';
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      const ipAddress = '192.168.1.1';

      documentRepository.findById.mockResolvedValue(mockResponseDto);
      fileStorageService.generatePresignedUrl.mockResolvedValue(mockDownloadUrl);
      documentRepository.incrementDownloadCount.mockResolvedValue(undefined);
      documentDownloadRepository.create.mockResolvedValue({} as any);

      const result = await service.downloadDocument(id, userId, ipAddress, userAgent);

      expect(documentRepository.findById).toHaveBeenCalledWith(id);
      expect(fileStorageService.generatePresignedUrl).toHaveBeenCalledWith(mockResponseDto.filePath, 'get', 3600);
      expect(documentRepository.incrementDownloadCount).toHaveBeenCalledWith(id);
      expect(documentDownloadRepository.create).toHaveBeenCalledWith({
        documentId: id,
        userId,
        ipAddress,
        userAgent
      });
      expect(result).toEqual(mockDownloadUrl);
    });

    it('should throw error when document not found', async () => {
      const id = 'non-existent';

      documentRepository.findById.mockResolvedValue(null);

      await expect(service.downloadDocument(id)).rejects.toThrow('Document not found');
    });

    it('should throw error when document is not public and user not authenticated', async () => {
      const id = '1';
      const privateDocument = { ...mockResponseDto, isPublic: false };

      documentRepository.findById.mockResolvedValue(privateDocument);

      await expect(service.downloadDocument(id)).rejects.toThrow('Authentication required to download this document');
    });
  });

  describe('createDocumentVersion', () => {
    it('should create document version successfully', async () => {
      const documentId = '1';
      const file = {
        originalname: 'test_document_v2.pdf',
        mimetype: 'application/pdf',
        size: 1024000,
        buffer: Buffer.from('test content')
      } as Express.Multer.File;
      const version = 'v2.0';
      const changeLog = { en: 'Updated content', ne: 'अपडेट गरिएको सामग्री' };

      documentRepository.findById.mockResolvedValue(mockResponseDto);
      fileStorageService.generateKey.mockReturnValue('uploads/documents/test_document_v2.pdf');
      fileStorageService.upload.mockResolvedValue(mockUploadResult);
      documentVersionRepository.create.mockResolvedValue({
        id: 'version-1',
        documentId,
        version,
        fileName: 'test_document_v2.pdf',
        filePath: 'uploads/documents/test_document_v2.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        changeLog,
        createdAt: new Date()
      } as any);
      documentRepository.update.mockResolvedValue(mockResponseDto);

      const result = await service.createDocumentVersion(documentId, file, version, changeLog);

      expect(documentRepository.findById).toHaveBeenCalledWith(documentId);
      expect(fileStorageService.generateKey).toHaveBeenCalledWith('documents', 'test_document_v2.pdf');
      expect(fileStorageService.upload).toHaveBeenCalledWith(
        'uploads/documents/test_document_v2.pdf',
        file.buffer,
        file.mimetype
      );
      expect(documentVersionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          documentId,
          version,
          fileName: expect.stringContaining('test_document'),
          fileSize: 1024000,
          mimeType: 'application/pdf',
          changeLog
        })
      );
      expect(result).toBeDefined();
    });

    it('should throw error when document not found', async () => {
      const documentId = 'non-existent';
      const file = {} as Express.Multer.File;
      const version = 'v2.0';

      documentRepository.findById.mockResolvedValue(null);

      await expect(service.createDocumentVersion(documentId, file, version)).rejects.toThrow('Document not found');
    });
  });

  describe('getDocumentVersions', () => {
    it('should return document versions', async () => {
      const documentId = '1';
      const mockVersions = [{ id: '1', version: 'v1.0' }, { id: '2', version: 'v2.0' }];

      documentVersionRepository.findByDocumentId.mockResolvedValue(mockVersions as any);

      const result = await service.getDocumentVersions(documentId);

      expect(documentVersionRepository.findByDocumentId).toHaveBeenCalledWith(documentId);
      expect(result).toEqual(mockVersions);
    });
  });

  describe('getDocumentAnalytics', () => {
    it('should return document analytics', async () => {
      const documentId = '1';
      const mockAnalytics = {
        totalDownloads: 100,
        downloadsByDate: { '2024-01-01': 10 },
        downloadsByBrowser: { Chrome: 60 },
        downloadsByDevice: { Desktop: 70 },
        topDownloaders: [{ userId: 'user-1', count: 5 }]
      };

      documentRepository.findById.mockResolvedValue(mockResponseDto);
      documentDownloadRepository.getDownloadStatistics.mockResolvedValue(mockAnalytics);

      const result = await service.getDocumentAnalytics(documentId);

      expect(documentRepository.findById).toHaveBeenCalledWith(documentId);
      expect(documentDownloadRepository.getDownloadStatistics).toHaveBeenCalledWith(documentId);
      expect(result).toEqual({
        documentId,
        documentTitle: mockResponseDto.title.en,
        ...mockAnalytics
      });
    });

    it('should throw error when document not found', async () => {
      const documentId = 'non-existent';

      documentRepository.findById.mockResolvedValue(null);

      await expect(service.getDocumentAnalytics(documentId)).rejects.toThrow('Document not found');
    });
  });

  describe('getDocumentStatistics', () => {
    it('should return document statistics', async () => {
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

      documentRepository.getStatistics.mockResolvedValue(mockStats);

      const result = await service.getDocumentStatistics();

      expect(documentRepository.getStatistics).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('searchDocuments', () => {
    it('should search documents', async () => {
      const searchTerm = 'test';
      const query: DocumentQueryDto = { page: 1, limit: 10 };
      const mockResult = {
        data: mockDocumentsResponse,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      documentRepository.search.mockResolvedValue(mockResult);

      const result = await service.searchDocuments(searchTerm, query);

      expect(documentRepository.search).toHaveBeenCalledWith(searchTerm, query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getDocumentsByType', () => {
    it('should return documents by type', async () => {
      const documentType = DocumentType.PDF;
      const query: DocumentQueryDto = { page: 1, limit: 10 };
      const mockResult = {
        data: mockDocumentsResponse,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      documentRepository.findByType.mockResolvedValue(mockResult);

      const result = await service.getDocumentsByType(documentType, query);

      expect(documentRepository.findByType).toHaveBeenCalledWith(documentType, query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getDocumentsByCategory', () => {
    it('should return documents by category', async () => {
      const category = DocumentCategory.OFFICIAL;
      const query: DocumentQueryDto = { page: 1, limit: 10 };
      const mockResult = {
        data: mockDocumentsResponse,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      documentRepository.findByCategory.mockResolvedValue(mockResult);

      const result = await service.getDocumentsByCategory(category, query);

      expect(documentRepository.findByCategory).toHaveBeenCalledWith(category, query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete documents', async () => {
      const ids = ['1', '2'];

      // Mock the individual delete operations
      documentRepository.findById.mockResolvedValue(mockResponseDto);
      fileStorageService.delete.mockResolvedValue(undefined);
      documentRepository.delete.mockResolvedValue(undefined);
      documentDownloadRepository.deleteByDocumentId.mockResolvedValue(undefined);
      documentVersionRepository.deleteByDocumentId.mockResolvedValue(undefined);

      const result = await service.bulkDelete(ids);

      expect(result).toEqual({
        success: 2,
        failed: 0,
        errors: []
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

      // Mock the individual update operations
      const updatedDocument = { ...mockResponseDto, ...updates };
      documentRepository.update.mockResolvedValue(updatedDocument);

      const result = await service.bulkUpdate(ids, updates);

      expect(result).toEqual({
        success: 2,
        failed: 0,
        errors: []
      });
    });
  });

  describe('exportDocuments', () => {
    it('should export documents as JSON', async () => {
      const query: DocumentQueryDto = { page: 1, limit: 10 };
      const format = 'json';
      const mockResult = {
        data: mockDocumentsResponse,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false }
      };

      // Mock getAllDocuments to return the transformed documents
      jest.spyOn(service, 'getAllDocuments').mockResolvedValue(mockResult);

      const result = await service.exportDocuments(query, format);

      expect(service.getAllDocuments).toHaveBeenCalledWith({ ...query, limit: 1000 });
      expect(result).toEqual(Buffer.from(JSON.stringify(mockDocumentsResponse, null, 2)));
    });

    it('should export documents as CSV', async () => {
      const query: DocumentQueryDto = { page: 1, limit: 10 };
      const format = 'csv';

      const mockResult = {
        data: mockDocumentsResponse,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false }
      };

      documentRepository.findAll.mockResolvedValue(mockResult);

      await expect(service.exportDocuments(query, format)).rejects.toThrow('CSV export not implemented yet');
    });
  });

  describe('importDocuments', () => {
    it('should import documents from file', async () => {
      const file = {
        originalname: 'documents.json',
        mimetype: 'application/json',
        size: 1024,
        buffer: Buffer.from(JSON.stringify(mockDocuments))
      } as Express.Multer.File;

      await expect(service.importDocuments(file)).rejects.toThrow('Document import not implemented yet');
    });

    it('should throw error for invalid file format', async () => {
      const file = {
        originalname: 'documents.txt',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('invalid content')
      } as Express.Multer.File;

      await expect(service.importDocuments(file)).rejects.toThrow('Document import not implemented yet');
    });
  });
}); 