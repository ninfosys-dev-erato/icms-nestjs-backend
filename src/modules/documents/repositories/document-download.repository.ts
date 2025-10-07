import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DocumentDownload } from '../entities/document-download.entity';
import { CreateDocumentDownloadDto } from '../dto/documents.dto';

@Injectable()
export class DocumentDownloadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDocumentDownloadDto): Promise<DocumentDownload> {
    return this.prisma.documentDownload.create({
      data: {
        documentId: data.documentId,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        downloadedAt: new Date(),
      },
      include: {
        document: true,
        user: true
      }
    }) as any;
  }

  async findByDocumentId(documentId: string): Promise<DocumentDownload[]> {
    return this.prisma.documentDownload.findMany({
      where: { documentId },
      include: {
        document: true,
        user: true
      },
      orderBy: { downloadedAt: 'desc' }
    }) as any;
  }

  async findByUserId(userId: string): Promise<DocumentDownload[]> {
    return this.prisma.documentDownload.findMany({
      where: { userId },
      include: {
        document: true,
        user: true
      },
      orderBy: { downloadedAt: 'desc' }
    }) as any;
  }

  async getDownloadStatistics(documentId: string): Promise<{
    totalDownloads: number;
    downloadsByDate: Record<string, number>;
    downloadsByBrowser: Record<string, number>;
    downloadsByDevice: Record<string, number>;
    topDownloaders: Array<{ userId: string; count: number }>;
  }> {
    const downloads = await this.findByDocumentId(documentId);
    
    const downloadsByDate: Record<string, number> = {};
    const downloadsByBrowser: Record<string, number> = {};
    const downloadsByDevice: Record<string, number> = {};
    const userDownloads: Record<string, number> = {};

    downloads.forEach(download => {
      const date = download.downloadedAt.toISOString().split('T')[0];
      downloadsByDate[date] = (downloadsByDate[date] || 0) + 1;

      // Simple browser detection
      const userAgent = download.userAgent.toLowerCase();
      let browser = 'Other';
      if (userAgent.includes('chrome')) browser = 'Chrome';
      else if (userAgent.includes('firefox')) browser = 'Firefox';
      else if (userAgent.includes('safari')) browser = 'Safari';
      else if (userAgent.includes('edge')) browser = 'Edge';
      
      downloadsByBrowser[browser] = (downloadsByBrowser[browser] || 0) + 1;

      // Simple device detection
      let device = 'Desktop';
      if (userAgent.includes('mobile')) device = 'Mobile';
      else if (userAgent.includes('tablet')) device = 'Tablet';
      
      downloadsByDevice[device] = (downloadsByDevice[device] || 0) + 1;

      if (download.userId) {
        userDownloads[download.userId] = (userDownloads[download.userId] || 0) + 1;
      }
    });

    const topDownloaders = Object.entries(userDownloads)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalDownloads: downloads.length,
      downloadsByDate,
      downloadsByBrowser,
      downloadsByDevice,
      topDownloaders,
    };
  }

  async getRecentDownloads(limit: number = 10): Promise<DocumentDownload[]> {
    return this.prisma.documentDownload.findMany({
      take: limit,
      include: {
        document: true,
        user: true
      },
      orderBy: { downloadedAt: 'desc' }
    }) as any;
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await this.prisma.documentDownload.deleteMany({
      where: { documentId }
    });
  }
} 