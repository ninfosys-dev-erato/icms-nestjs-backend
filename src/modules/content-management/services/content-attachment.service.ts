import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { ContentAttachmentRepository } from '../repositories/content-attachment.repository';
import { ContentRepository } from '../repositories/content.repository';
import { FileStorageService } from '../../../common/services/file-storage/interfaces/file-storage.interface';
import {
  CreateAttachmentDto,
  UpdateAttachmentDto,
  ContentAttachmentResponseDto,
  AttachmentStatistics,
  ValidationResult,
  DownloadResult,
  ReorderItemDto,
} from '../dto/content-management.dto';

@Injectable()
export class ContentAttachmentService {
  constructor(
    private readonly attachmentRepository: ContentAttachmentRepository,
    private readonly contentRepository: ContentRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async getAttachmentById(id: string): Promise<ContentAttachmentResponseDto> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return this.transformToResponseDto(attachment);
  }

  async getAttachmentsByContent(contentId: string): Promise<ContentAttachmentResponseDto[]> {
    // Validate content exists
    const content = await this.contentRepository.findById(contentId);
    if (!content) {
      throw new NotFoundException('Content not found');
    }
    
    const attachments = await this.attachmentRepository.getAttachmentsWithDownloadUrls(contentId);
    
    // Transform attachments to response DTOs
    const transformedAttachments = await Promise.all(
      attachments.map(attachment => this.transformToResponseDto(attachment))
    );
    
    return transformedAttachments;
  }

  async getAttachmentsWithPresignedUrls(contentId: string, expiresIn?: number): Promise<ContentAttachmentResponseDto[]> {
    console.log('🔍 ContentAttachmentService: Getting attachments with presigned URLs');
    console.log('  Content ID:', contentId);
    console.log('  Expires In:', expiresIn);
    
    // Validate content exists
    const content = await this.contentRepository.findById(contentId);
    if (!content) {
      console.log('❌ Content not found:', contentId);
      throw new NotFoundException('Content not found');
    }
    
    console.log('✅ Content found:', content.id);
    
    const attachments = await this.attachmentRepository.getAttachmentsWithPresignedUrls(contentId, expiresIn);
    
    console.log('📎 Attachments retrieved:', attachments.length);
    console.log('  Attachments:', attachments);
    
    // Transform attachments to response DTOs with presigned URLs
    const attachmentsWithPresignedUrls = await Promise.all(
      attachments.map(attachment => this.transformToResponseDto(attachment, expiresIn))
    );
    
    console.log('✅ Final attachments with presigned URLs:', attachmentsWithPresignedUrls.length);
    
    // Ensure we always return an array, even if empty
    return attachmentsWithPresignedUrls || [];
  }

  async getAttachmentWithPresignedUrl(id: string, expiresIn?: number): Promise<ContentAttachmentResponseDto> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return this.transformToResponseDto(attachment, expiresIn);
  }

  private async transformToResponseDto(attachment: any, expiresIn?: number): Promise<ContentAttachmentResponseDto> {
    // Generate presigned URL for the attachment file
    let downloadUrl: string;
    try {
      downloadUrl = await this.fileStorageService.generatePresignedUrl(
        attachment.filePath,
        'get',
        expiresIn
      );
      
      console.log('🔗 Generated presigned URL for attachment:', attachment.id);
      console.log('  File path:', attachment.filePath);
      console.log('  Presigned URL length:', downloadUrl?.length || 0);
    } catch (error) {
      console.error('❌ Failed to generate presigned URL for attachment:', attachment.id, error.message);
      // Fallback to original download URL if presigned URL generation fails
      downloadUrl = `/api/v1/attachments/${attachment.id}/download`;
    }

    return {
      id: attachment.id,
      contentId: attachment.contentId,
      fileName: attachment.fileName,
      filePath: attachment.filePath,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      order: attachment.order,
      createdAt: attachment.createdAt,
      downloadUrl,
    };
  }

  async uploadAttachment(contentId: string, file: Express.Multer.File): Promise<ContentAttachmentResponseDto> {
    // Validate file
    const validation = await this.validateFile(file);
    if (!validation.isValid) {
      throw new BadRequestException('File validation failed', { cause: validation.errors });
    }

    // Validate content exists
    const content = await this.contentRepository.findById(contentId);
    if (!content) {
      throw new NotFoundException('Content not found');
    }

    // Generate storage key
    const storageKey = this.fileStorageService.generateKey(
      'content-attachments',
      file.originalname,
      contentId
    );

    // Upload file using storage service
    const uploadResult = await this.fileStorageService.upload(
      storageKey,
      file.buffer,
      file.mimetype,
      {
        contentId,
        originalName: file.originalname,
      }
    );

    const attachment = await this.attachmentRepository.create({
      contentId,
      fileName: file.originalname,
      filePath: uploadResult.key,
      fileSize: uploadResult.size,
      mimeType: file.mimetype,
    });

    return this.transformToResponseDto(attachment);
  }

  async updateAttachment(id: string, data: UpdateAttachmentDto): Promise<ContentAttachmentResponseDto> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const updatedAttachment = await this.attachmentRepository.update(id, data);
    return this.transformToResponseDto(updatedAttachment);
  }

  async deleteAttachment(id: string): Promise<void> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Delete file from storage
    await this.fileStorageService.delete(attachment.filePath);

    await this.attachmentRepository.delete(id);
  }

  async reorderAttachments(contentId: string, orders: ReorderItemDto[]): Promise<void> {
    if (!orders || orders.length === 0) {
      throw new BadRequestException('Orders array is required');
    }

    // Validate that all attachments belong to the content
    for (const order of orders) {
      const attachment = await this.attachmentRepository.findById(order.id);
      if (!attachment || attachment.contentId !== contentId) {
        throw new NotFoundException(`Attachment with ID ${order.id} not found or does not belong to content`);
      }
    }

    await this.attachmentRepository.reorder(contentId, orders);
  }

  async validateFile(file: Express.Multer.File): Promise<ValidationResult> {
    const errors: any[] = [];

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        message: 'File size exceeds 10MB limit',
        code: 'FILE_TOO_LARGE',
      });
    }

    // Check file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push({
        field: 'file',
        message: 'File type not allowed',
        code: 'INVALID_FILE_TYPE',
      });
    }

    // Check file name
    if (!file.originalname || file.originalname.length > 255) {
      errors.push({
        field: 'file',
        message: 'Invalid file name',
        code: 'INVALID_FILE_NAME',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getAttachmentStatistics(): Promise<AttachmentStatistics> {
    return this.attachmentRepository.getStatistics();
  }

  async downloadAttachment(id: string): Promise<DownloadResult> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    try {
      const downloadResult = await this.fileStorageService.download(attachment.filePath);
      return {
        buffer: downloadResult.buffer,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
      };
    } catch (error) {
      throw new NotFoundException('File not found in storage');
    }
  }
} 