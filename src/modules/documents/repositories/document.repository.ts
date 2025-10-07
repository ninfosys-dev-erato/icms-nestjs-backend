import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Document, DocumentType, DocumentStatus, DocumentCategory } from '../entities/document.entity';
import { 
  CreateDocumentDto, 
  UpdateDocumentDto, 
  DocumentQueryDto,
  DocumentStatistics
} from '../dto/documents.dto';

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Document | null> {
    return this.prisma.document.findUnique({
      where: { id },
      include: {
        downloads: true,
        versions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    }) as any;
  }

  async findAll(query: DocumentQueryDto): Promise<{
    data: Document[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      documentType, 
      category, 
      status, 
      isPublic, 
      isActive, 
      sort = 'createdAt', 
      order = 'desc',
      dateFrom,
      dateTo,
      tags
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { path: ['en'], string_contains: search } },
        { title: { path: ['ne'], string_contains: search } },
        { description: { path: ['en'], string_contains: search } },
        { description: { path: ['ne'], string_contains: search } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (documentType) {
      where.documentType = documentType;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
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
      }),
      this.prisma.document.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as any,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findActive(): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { 
        isActive: true,
        status: DocumentStatus.PUBLISHED
      },
      include: {
        downloads: {
          take: 1,
          orderBy: { downloadedAt: 'desc' }
        }
      }
    }) as any;
  }

  async findByType(documentType: DocumentType, query: DocumentQueryDto): Promise<{
    data: Document[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    return this.findAll({ ...query, documentType });
  }

  async findByCategory(category: DocumentCategory, query: DocumentQueryDto): Promise<{
    data: Document[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    return this.findAll({ ...query, category });
  }

  async findByStatus(status: DocumentStatus, query: DocumentQueryDto): Promise<{
    data: Document[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    return this.findAll({ ...query, status });
  }

  async search(searchTerm: string, query: DocumentQueryDto): Promise<{
    data: Document[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    return this.findAll({ ...query, search: searchTerm });
  }

  async create(data: CreateDocumentDto): Promise<Document> {
    return this.prisma.document.create({
      data: {
        title: data.title as any,
        description: data.description as any,
        fileName: data.fileName,
        originalName: data.originalName,
        filePath: data.filePath,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        documentType: data.documentType,
        category: data.category,
        status: data.status,
        documentNumber: data.documentNumber,
        version: data.version,
        publishDate: data.publishDate,
        expiryDate: data.expiryDate,
        tags: data.tags,
        isPublic: data.isPublic ?? true,
        requiresAuth: data.requiresAuth ?? false,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
        downloadCount: 0,
      },
      include: {
        downloads: true,
        versions: true
      }
    }) as any;
  }

  async update(id: string, data: UpdateDocumentDto): Promise<Document> {
    return this.prisma.document.update({
      where: { id },
      data: {
        title: data.title as any,
        description: data.description as any,
        category: data.category,
        status: data.status,
        documentNumber: data.documentNumber,
        version: data.version,
        publishDate: data.publishDate,
        expiryDate: data.expiryDate,
        tags: data.tags,
        isPublic: data.isPublic,
        requiresAuth: data.requiresAuth,
        order: data.order,
        isActive: data.isActive,
      },
      include: {
        downloads: true,
        versions: true
      }
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({
      where: { id }
    });
  }

  async findByFilePath(filePath: string): Promise<Document | null> {
    return this.prisma.document.findFirst({
      where: { filePath },
      include: {
        downloads: true,
        versions: true
      }
    }) as any;
  }

  async findByIds(ids: string[]): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { id: { in: ids } },
      include: {
        downloads: true,
        versions: true
      }
    }) as any;
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.prisma.document.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });
  }

  async getStatistics(): Promise<DocumentStatistics> {
    const [
      total,
      published,
      draft,
      archived,
      byType,
      byCategory,
      totalDownloads,
      totalSize,
      averageSize
    ] = await Promise.all([
      this.prisma.document.count(),
      this.prisma.document.count({ where: { status: DocumentStatus.PUBLISHED } }),
      this.prisma.document.count({ where: { status: DocumentStatus.DRAFT } }),
      this.prisma.document.count({ where: { status: DocumentStatus.ARCHIVED } }),
      this.prisma.document.groupBy({
        by: ['documentType'],
        _count: { documentType: true }
      }),
      this.prisma.document.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      this.prisma.document.aggregate({
        _sum: { downloadCount: true }
      }),
      this.prisma.document.aggregate({
        _sum: { fileSize: true }
      }),
      this.prisma.document.aggregate({
        _avg: { fileSize: true }
      })
    ]);

    const byTypeRecord: Record<DocumentType, number> = {
      [DocumentType.PDF]: 0,
      [DocumentType.DOC]: 0,
      [DocumentType.DOCX]: 0,
      [DocumentType.XLS]: 0,
      [DocumentType.XLSX]: 0,
      [DocumentType.PPT]: 0,
      [DocumentType.PPTX]: 0,
      [DocumentType.TXT]: 0,
      [DocumentType.RTF]: 0,
      [DocumentType.CSV]: 0,
      [DocumentType.ZIP]: 0,
      [DocumentType.RAR]: 0,
      [DocumentType.OTHER]: 0,
    };

    const byCategoryRecord: Record<DocumentCategory, number> = {
      [DocumentCategory.OFFICIAL]: 0,
      [DocumentCategory.REPORT]: 0,
      [DocumentCategory.FORM]: 0,
      [DocumentCategory.POLICY]: 0,
      [DocumentCategory.PROCEDURE]: 0,
      [DocumentCategory.GUIDELINE]: 0,
      [DocumentCategory.NOTICE]: 0,
      [DocumentCategory.CIRCULAR]: 0,
      [DocumentCategory.OTHER]: 0,
    };

    byType.forEach(item => {
      byTypeRecord[item.documentType as DocumentType] = item._count.documentType;
    });

    byCategory.forEach(item => {
      byCategoryRecord[item.category as DocumentCategory] = item._count.category;
    });

    return {
      total,
      published,
      draft,
      archived,
      byType: byTypeRecord,
      byCategory: byCategoryRecord,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      averageDownloadsPerDocument: total > 0 ? (totalDownloads._sum.downloadCount || 0) / total : 0,
      totalSize: totalSize._sum.fileSize || 0,
      averageSize: Math.round(averageSize._avg.fileSize || 0),
    };
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.prisma.document.deleteMany({
      where: { id: { in: ids } }
    });
  }

  async bulkUpdate(ids: string[], data: Partial<UpdateDocumentDto>): Promise<Document[]> {
    return this.prisma.$transaction(async (tx) => {
      const updates = ids.map(id => 
        tx.document.update({
          where: { id },
          data: {
            title: data.title as any,
            description: data.description as any,
            category: data.category,
            status: data.status,
            documentNumber: data.documentNumber,
            version: data.version,
            publishDate: data.publishDate,
            expiryDate: data.expiryDate,
            tags: data.tags,
            isPublic: data.isPublic,
            requiresAuth: data.requiresAuth,
            order: data.order,
            isActive: data.isActive,
          },
          include: {
            downloads: true,
            versions: true
          }
        })
      );

      return Promise.all(updates) as any;
    });
  }

  async findExpiredDocuments(): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: {
        expiryDate: {
          lt: new Date()
        },
        status: DocumentStatus.PUBLISHED
      }
    }) as any;
  }

  async findDocumentsByTags(tags: string[]): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: {
        tags: {
          hasSome: tags
        }
      },
      include: {
        downloads: true,
        versions: true
      }
    }) as any;
  }
} 