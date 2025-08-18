import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentDownloadRepository } from '../repositories/document-download.repository';
import { DocumentVersionRepository } from '../repositories/document-version.repository';
import { FileStorageService } from '../../../common/services/file-storage/interfaces/file-storage.interface';
import { 
  CreateDocumentDto, 
  UpdateDocumentDto, 
  DocumentQueryDto,
  DocumentResponseDto,
  DocumentStatistics,
  DocumentAnalytics,
  ValidationResult,
  ValidationError,
  BulkOperationResult,
  DocumentType,
  DocumentStatus,
  DocumentCategory
} from '../dto/documents.dto';
import { TranslatableEntityHelper } from '../../../common/types/translatable.entity';

@Injectable()
export class DocumentService {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentDownloadRepository: DocumentDownloadRepository,
    private readonly documentVersionRepository: DocumentVersionRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async getDocumentById(id: string): Promise<DocumentResponseDto> {
    const document = await this.documentRepository.findById(id);
    
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return await this.transformToResponseDto(document);
  }

  async getAllDocuments(query?: DocumentQueryDto): Promise<{
    data: DocumentResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const result = await this.documentRepository.findAll(query);
    
    const transformedData = await Promise.all(
      result.data.map(document => this.transformToResponseDto(document))
    );
    
    return {
      data: transformedData,
      pagination: result.pagination,
    };
  }

  async getActiveDocuments(query?: DocumentQueryDto): Promise<{
    data: DocumentResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    return this.getAllDocuments({ ...query, isActive: true, isPublic: true, status: DocumentStatus.PUBLISHED });
  }

  async getDocumentsByType(documentType: DocumentType, query?: DocumentQueryDto): Promise<{
    data: DocumentResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const result = await this.documentRepository.findByType(documentType, query);
    
    const transformedData = await Promise.all(
      result.data.map(document => this.transformToResponseDto(document))
    );
    
    return {
      data: transformedData,
      pagination: result.pagination,
    };
  }

  async getDocumentsByCategory(category: DocumentCategory, query?: DocumentQueryDto): Promise<{
    data: DocumentResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const result = await this.documentRepository.findByCategory(category, query);
    
    const transformedData = await Promise.all(
      result.data.map(document => this.transformToResponseDto(document))
    );
    
    return {
      data: transformedData,
      pagination: result.pagination,
    };
  }

  async searchDocuments(searchTerm: string, query?: DocumentQueryDto): Promise<{
    data: DocumentResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const result = await this.documentRepository.search(searchTerm, query);
    
    const transformedData = await Promise.all(
      result.data.map(document => this.transformToResponseDto(document))
    );
    
    return {
      data: transformedData,
      pagination: result.pagination,
    };
  }

  async uploadDocument(file: Express.Multer.File, metadata?: Partial<CreateDocumentDto>): Promise<DocumentResponseDto> {
    const validation = await this.validateFile(file);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'File validation failed',
        errors: validation.errors,
      });
    }

    // Generate key for document storage
    const key = this.fileStorageService.generateKey('documents', file.originalname);

    // Upload to storage
    const uploadResult = await this.fileStorageService.upload(
      key,
      file.buffer,
      file.mimetype
    );

    const documentData: CreateDocumentDto = {
      title: metadata?.title || { en: file.originalname, ne: file.originalname },
      description: metadata?.description,
      fileName: uploadResult.key.split('/').pop() || file.filename,
      originalName: file.originalname,
      filePath: uploadResult.key,
      fileSize: file.size,
      mimeType: file.mimetype,
      documentType: this.determineDocumentType(file.mimetype),
      category: metadata?.category || DocumentCategory.OTHER,
      status: metadata?.status || DocumentStatus.DRAFT,
      documentNumber: metadata?.documentNumber,
      version: metadata?.version || '1.0',
      publishDate: metadata?.publishDate,
      expiryDate: metadata?.expiryDate,
      tags: metadata?.tags,
      isPublic: metadata?.isPublic ?? true,
      requiresAuth: metadata?.requiresAuth ?? false,
      order: metadata?.order ?? 0,
      isActive: metadata?.isActive ?? true,
    };

    const validationResult = await this.validateDocument(documentData);
    if (!validationResult.isValid) {
      console.log('Document validation errors:', validationResult.errors);
      throw new BadRequestException({
        message: 'Document validation failed',
        errors: validationResult.errors,
      });
    }

    const document = await this.documentRepository.create(documentData);
    return await this.transformToResponseDto(document);
  }

  async updateDocument(id: string, data: UpdateDocumentDto): Promise<DocumentResponseDto> {
    const validation = await this.validateDocument(data);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Document validation failed',
        errors: validation.errors,
      });
    }

    const document = await this.documentRepository.update(id, data);
    return await this.transformToResponseDto(document);
  }

  async deleteDocument(id: string): Promise<void> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Delete from storage
    try {
      await this.fileStorageService.delete(document.filePath);
    } catch (error) {
      // Log error but continue with deletion
      console.error('Failed to delete file from storage:', error);
    }

    // Delete related data
    await this.documentDownloadRepository.deleteByDocumentId(id);
    await this.documentVersionRepository.deleteByDocumentId(id);
    
    await this.documentRepository.delete(id);
  }

  async downloadDocument(id: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<string> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.isPublic && !userId) {
      throw new BadRequestException('Authentication required to download this document');
    }

    // Record download
    if (ipAddress && userAgent) {
      await this.documentDownloadRepository.create({
        documentId: id,
        userId,
        ipAddress,
        userAgent,
      });
    }

    // Increment download count
    await this.documentRepository.incrementDownloadCount(id);

    // Generate download URL
    return this.fileStorageService.generatePresignedUrl(document.filePath, 'get', 86400); // 24 hours expiry
  }

  async createDocumentVersion(documentId: string, file: Express.Multer.File, version: string, changeLog?: any): Promise<DocumentResponseDto> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Generate key for document version storage
    const key = this.fileStorageService.generateKey('documents', file.originalname);

    // Upload new version to storage
    const uploadResult = await this.fileStorageService.upload(
      key,
      file.buffer,
      file.mimetype
    );

    // Create version record
    await this.documentVersionRepository.create({
      documentId,
      version,
      fileName: uploadResult.key.split('/').pop() || file.filename,
      filePath: uploadResult.key,
      fileSize: file.size,
      mimeType: file.mimetype,
      changeLog,
    });

    // Update document with new version
    const updatedDocument = await this.documentRepository.update(documentId, {
      version,
    });

    return await this.transformToResponseDto(updatedDocument);
  }

  async getDocumentVersions(documentId: string): Promise<any[]> {
    const versions = await this.documentVersionRepository.findByDocumentId(documentId);
    return versions.map(version => ({
      id: version.id,
      version: version.version,
      fileName: version.fileName,
      fileSize: version.fileSize,
      mimeType: version.mimeType,
      changeLog: version.changeLog,
      createdAt: version.createdAt,
    }));
  }

  async getDocumentAnalytics(documentId: string): Promise<DocumentAnalytics> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const downloadStats = await this.documentDownloadRepository.getDownloadStatistics(documentId);

    return {
      documentId,
      documentTitle: document.title.en,
      totalDownloads: downloadStats.totalDownloads,
      downloadsByDate: downloadStats.downloadsByDate,
      downloadsByBrowser: downloadStats.downloadsByBrowser,
      downloadsByDevice: downloadStats.downloadsByDevice,
      topDownloaders: downloadStats.topDownloaders,
    };
  }

  async validateDocument(data: CreateDocumentDto | UpdateDocumentDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate title if provided
    if ('title' in data && data.title) {
      const titleErrors = TranslatableEntityHelper.validate(data.title, {
        en: { required: true, minLength: 1, maxLength: 255 },
        ne: { required: true, minLength: 1, maxLength: 255 },
      });
      titleErrors.forEach(error => {
        errors.push({
          field: 'title',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    // Validate description if provided
    if ('description' in data && data.description) {
      const descriptionErrors = TranslatableEntityHelper.validate(data.description, {
        en: { required: false, minLength: 1, maxLength: 1000 },
        ne: { required: false, minLength: 1, maxLength: 1000 },
      });
      descriptionErrors.forEach(error => {
        errors.push({
          field: 'description',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    // Validate file size
    if ('fileSize' in data && data.fileSize) {
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (data.fileSize > maxSize) {
        errors.push({
          field: 'fileSize',
          message: 'File size exceeds maximum limit of 100MB',
          code: 'FILE_SIZE_EXCEEDED',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async validateFile(file: Express.Multer.File): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Check file size
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        message: 'File size exceeds maximum limit of 100MB',
        code: 'FILE_SIZE_EXCEEDED',
      });
    }

    // Check file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/rtf',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push({
        field: 'file',
        message: 'File type not allowed',
        code: 'INVALID_FILE_TYPE',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getDocumentStatistics(): Promise<DocumentStatistics> {
    return this.documentRepository.getStatistics();
  }

  async exportDocuments(query: DocumentQueryDto, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Buffer> {
    const result = await this.getAllDocuments({ ...query, limit: 1000 });
    
    if (format === 'json') {
      return Buffer.from(JSON.stringify(result.data, null, 2));
    } else {
      // TODO: Implement CSV and PDF export
      throw new Error(`${format.toUpperCase()} export not implemented yet`);
    }
  }

  async importDocuments(file: Express.Multer.File): Promise<any> {
    // TODO: Implement document import functionality
    throw new Error('Document import not implemented yet');
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const id of ids) {
      try {
        await this.deleteDocument(id);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to delete document ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkUpdate(ids: string[], data: Partial<UpdateDocumentDto>): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Validate required fields
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('IDs array is required and must not be empty');
    }

    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      throw new BadRequestException('Updates object is required and must not be empty');
    }

    for (const id of ids) {
      try {
        await this.updateDocument(id, data);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to update document ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async generateDownloadUrl(id: string, expiresInSeconds?: number): Promise<string> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.isPublic) {
      throw new BadRequestException('Document is not publicly accessible');
    }

    const expirationTime = expiresInSeconds || 86400; // Default 24 hours
    
    try {
      return await this.fileStorageService.generatePresignedUrl(
        document.filePath,
        'get',
        expirationTime
      );
    } catch (error) {
      console.error('Failed to generate presigned URL for document:', id, error);
      // Fallback to regular URL if presigned URL generation fails
      return await this.fileStorageService.getUrl(document.filePath);
    }
  }

  async generateAdminDownloadUrl(id: string, expiresInSeconds?: number): Promise<string> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const expirationTime = expiresInSeconds || 86400; // Default 24 hours
    
    try {
      return await this.fileStorageService.generatePresignedUrl(
        document.filePath,
        'get',
        expirationTime
      );
    } catch (error) {
      console.error('Failed to generate presigned URL for document:', id, error);
      // Fallback to regular URL if presigned URL generation fails
      return await this.fileStorageService.getUrl(document.filePath);
    }
  }

  async generateBulkDownloadUrls(ids: string[], expiresInSeconds?: number): Promise<Record<string, string>> {
    const documents = await this.documentRepository.findByIds(ids);
    const downloadUrls: Record<string, string> = {};
    const expirationTime = expiresInSeconds || 86400; // Default 24 hours

    for (const document of documents) {
      try {
        const presignedUrl = await this.fileStorageService.generatePresignedUrl(
          document.filePath,
          'get',
          expirationTime
        );
        downloadUrls[document.id] = presignedUrl;
      } catch (error) {
        console.error('Failed to generate presigned URL for document:', document.id, error);
        // Fallback to regular URL if presigned URL generation fails
        try {
          const regularUrl = await this.fileStorageService.getUrl(document.filePath);
          downloadUrls[document.id] = regularUrl;
        } catch (fallbackError) {
          console.error('Failed to get fallback URL for document:', document.id, fallbackError);
          downloadUrls[document.id] = 'URL generation failed';
        }
      }
    }

    return downloadUrls;
  }

  async generatePreviewUrl(id: string, expiresInSeconds?: number): Promise<string> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.isPublic) {
      throw new BadRequestException('Document is not publicly accessible');
    }

    const expirationTime = expiresInSeconds || 3600; // Default 1 hour for preview
    
    try {
      return await this.fileStorageService.generatePresignedUrl(
        document.filePath,
        'get',
        expirationTime
      );
    } catch (error) {
      console.error('Failed to generate preview URL for document:', id, error);
      // Fallback to regular URL if presigned URL generation fails
      return await this.fileStorageService.getUrl(document.filePath);
    }
  }

  async generateAdminPreviewUrl(id: string, expiresInSeconds?: number): Promise<string> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const expirationTime = expiresInSeconds || 3600; // Default 1 hour for preview
    
    try {
      return await this.fileStorageService.generatePresignedUrl(
        document.filePath,
        'get',
        expirationTime
      );
    } catch (error) {
      console.error('Failed to generate preview URL for document:', id, error);
      // Fallback to regular URL if presigned URL generation fails
      return await this.fileStorageService.getUrl(document.filePath);
    }
  }

  async generateUploadUrl(fileName: string, contentType: string, expiresInSeconds?: number): Promise<{
    uploadUrl: string;
    key: string;
    expiresAt: Date;
  }> {
    // Generate a unique key for the document
    const key = this.fileStorageService.generateKey('documents', fileName);
    const expirationTime = expiresInSeconds || 3600; // Default 1 hour for upload
    
    try {
      const uploadUrl = await this.fileStorageService.generatePresignedUrl(
        key,
        'put',
        expirationTime
      );

      const expiresAt = new Date(Date.now() + expirationTime * 1000);

      return {
        uploadUrl,
        key,
        expiresAt
      };
    } catch (error) {
      console.error('Failed to generate upload URL for document:', fileName, error);
      throw new BadRequestException('Failed to generate upload URL: ' + error.message);
    }
  }

  private determineDocumentType(mimeType: string): DocumentType {
    switch (mimeType) {
      case 'application/pdf':
        return DocumentType.PDF;
      case 'application/msword':
        return DocumentType.DOC;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return DocumentType.DOCX;
      case 'application/vnd.ms-excel':
        return DocumentType.XLS;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return DocumentType.XLSX;
      case 'application/vnd.ms-powerpoint':
        return DocumentType.PPT;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return DocumentType.PPTX;
      case 'text/plain':
        return DocumentType.TXT;
      case 'application/rtf':
        return DocumentType.RTF;
      case 'text/csv':
        return DocumentType.CSV;
      case 'application/zip':
        return DocumentType.ZIP;
      case 'application/x-rar-compressed':
        return DocumentType.RAR;
      default:
        return DocumentType.OTHER;
    }
  }

  private async transformToResponseDto(document: any): Promise<DocumentResponseDto> {
    // Generate presigned URL for the document
    let presignedDownloadUrl = '';
    try {
      presignedDownloadUrl = await this.fileStorageService.generatePresignedUrl(
        document.filePath,
        'get',
        86400 // 24 hours expiration
      );
    } catch (error) {
      console.warn('Failed to generate presigned URL for document:', document.id, error.message);
      // Fallback to regular URL if presigned URL generation fails
      presignedDownloadUrl = await this.fileStorageService.getUrl(document.filePath);
    }

    return {
      id: document.id,
      title: document.title,
      description: document.description,
      fileName: document.fileName,
      originalName: document.originalName,
      filePath: document.filePath,
      fileSize: document.fileSize,
      mimeType: document.mimetype,
      documentType: document.documentType,
      category: document.category,
      status: document.status,
      documentNumber: document.documentNumber,
      version: document.version,
      publishDate: document.publishDate,
      expiryDate: document.expiryDate,
      tags: document.tags,
      isPublic: document.isPublic,
      requiresAuth: document.requiresAuth,
      order: document.order,
      isActive: document.isActive,
      downloadCount: document.downloadCount,
      downloadUrl: await this.fileStorageService.getUrl(document.filePath),
      presignedDownloadUrl,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
} 