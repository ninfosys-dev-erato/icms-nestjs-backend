import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DocumentVersion } from '../entities/document-version.entity';
import { CreateDocumentVersionDto } from '../dto/documents.dto';

@Injectable()
export class DocumentVersionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDocumentVersionDto): Promise<DocumentVersion> {
    return this.prisma.documentVersion.create({
      data: {
        documentId: data.documentId,
        version: data.version,
        fileName: data.fileName,
        filePath: data.filePath,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        changeLog: data.changeLog as any,
        createdAt: new Date(),
      },
      include: {
        document: true
      }
    }) as any;
  }

  async findByDocumentId(documentId: string): Promise<DocumentVersion[]> {
    return this.prisma.documentVersion.findMany({
      where: { documentId },
      include: {
        document: true
      },
      orderBy: { createdAt: 'desc' }
    }) as any;
  }

  async findByVersion(documentId: string, version: string): Promise<DocumentVersion | null> {
    return this.prisma.documentVersion.findFirst({
      where: { 
        documentId,
        version 
      },
      include: {
        document: true
      }
    }) as any;
  }

  async findLatestVersion(documentId: string): Promise<DocumentVersion | null> {
    return this.prisma.documentVersion.findFirst({
      where: { documentId },
      include: {
        document: true
      },
      orderBy: { createdAt: 'desc' }
    }) as any;
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.prisma.documentVersion.deleteMany({
      where: { documentId }
    });
  }

  async deleteByVersion(documentId: string, version: string): Promise<void> {
    await this.prisma.documentVersion.deleteMany({
      where: { 
        documentId,
        version 
      }
    });
  }

  async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    return this.prisma.documentVersion.findMany({
      where: { documentId },
      include: {
        document: true
      },
      orderBy: { createdAt: 'desc' }
    }) as any;
  }

  async getVersionCount(documentId: string): Promise<number> {
    return this.prisma.documentVersion.count({
      where: { documentId }
    });
  }
} 