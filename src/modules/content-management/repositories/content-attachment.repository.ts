import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateAttachmentDto,
  UpdateAttachmentDto,
  ContentAttachmentResponseDto,
  AttachmentStatistics,
  ReorderItemDto,
} from '../dto/content-management.dto';

type ContentAttachment = any;

@Injectable()
export class ContentAttachmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ContentAttachment | null> {
    return (this.prisma as any).contentAttachment.findUnique({
      where: { id },
      include: {
        content: true,
      },
    });
  }

  async findByContent(contentId: string): Promise<ContentAttachment[]> {
    return (this.prisma as any).contentAttachment.findMany({
      where: { contentId },
      orderBy: { order: 'asc' },
      include: {
        content: true,
      },
    });
  }

  async create(data: CreateAttachmentDto): Promise<ContentAttachment> {
    return (this.prisma as any).contentAttachment.create({
      data: {
        contentId: data.contentId,
        fileName: data.fileName,
        filePath: data.filePath,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        order: data.order || 0,
      },
      include: {
        content: true,
      },
    });
  }

  async update(id: string, data: UpdateAttachmentDto): Promise<ContentAttachment> {
    return (this.prisma as any).contentAttachment.update({
      where: { id },
      data,
      include: {
        content: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).contentAttachment.delete({
      where: { id },
    });
  }

  async reorder(contentId: string, orders: ReorderItemDto[]): Promise<void> {
    for (const item of orders) {
      await (this.prisma as any).contentAttachment.update({
        where: { 
          id: item.id,
          contentId, // Ensure the attachment belongs to the content
        },
        data: { order: item.order },
      });
    }
  }

  async getStatistics(): Promise<AttachmentStatistics> {
    const [
      total,
      totalSize,
      byType,
    ] = await Promise.all([
      (this.prisma as any).contentAttachment.count(),
      (this.prisma as any).contentAttachment.aggregate({
        _sum: { fileSize: true },
      }),
      (this.prisma as any).contentAttachment.groupBy({
        by: ['mimeType'],
        _count: { mimeType: true },
      }),
    ]);

    const typeCounts = byType.reduce((acc, item) => {
      acc[item.mimeType] = item._count.mimeType;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      totalSize: totalSize._sum.fileSize || 0,
      byType: typeCounts,
    };
  }

  async getAttachmentWithDownloadUrl(id: string): Promise<ContentAttachmentResponseDto | null> {
    const attachment = await this.findById(id);
    if (!attachment) {
      return null;
    }

    return {
      ...attachment,
      downloadUrl: `/api/v1/attachments/${id}/download`,
    };
  }

  async getAttachmentsWithDownloadUrls(contentId: string): Promise<ContentAttachmentResponseDto[]> {
    const attachments = await this.findByContent(contentId);
    
    return attachments.map(attachment => ({
      ...attachment,
      downloadUrl: `/api/v1/attachments/${attachment.id}/download`,
    }));
  }
} 