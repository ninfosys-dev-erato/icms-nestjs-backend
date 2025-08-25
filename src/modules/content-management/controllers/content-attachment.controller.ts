import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Res,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ValidationPipe,
  UsePipes,
  HttpCode,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Observable } from 'rxjs';

import { ContentAttachmentService } from '../services/content-attachment.service';
import { 
  CreateAttachmentDto, 
  UpdateAttachmentDto,
  ReorderDto
} from '../dto/content-management.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiResponseBuilder } from '@/common/types/api-response';

// Custom pipe that doesn't validate
class NoValidationPipe extends ValidationPipe {
  transform(value: any) {
    return value;
  }
}

// Custom interceptor that bypasses the API response interceptor
@Injectable()
class DownloadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle();
  }
}

@ApiTags('Content Attachments')
@Controller(['attachments', 'content/attachments', 'admin/contents'])
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiBearerAuth()
export class ContentAttachmentController {
  constructor(private readonly attachmentService: ContentAttachmentService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for content attachments' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck(): Promise<any> {
    return {
      success: true,
      message: 'Content Attachment Service is healthy',
      timestamp: new Date().toISOString(),
      service: 'ContentAttachmentController'
    };
  }

  @Get(['content/:contentId/attachments', ':contentId/attachments'])
  @ApiOperation({ summary: 'Get attachments by content ID' })
  @ApiResponse({ status: 200, description: 'Attachments retrieved successfully' })
  async getAttachmentsByContent(
    @Param('contentId') contentId: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const attachments = await this.attachmentService.getAttachmentsByContent(contentId);
      
      const apiResponse = ApiResponseBuilder.success(attachments);
      
      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_RETRIEVAL_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get(['content/:contentId/attachments/with-presigned-urls', ':contentId/attachments/with-presigned-urls'])
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @ApiOperation({ summary: 'Get attachments by content ID with presigned URLs' })
  @ApiResponse({ status: 200, description: 'Attachments with presigned URLs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getAttachmentsWithPresignedUrls(
    @Param('contentId') contentId: string,
    @Res() response: Response,
    @Query('expiresIn') expiresIn?: number,
  ): Promise<void> {
    console.log('🔍 ContentAttachmentController: getAttachmentsWithPresignedUrls called');
    console.log('  Content ID:', contentId);
    console.log('  Expires In:', expiresIn);
    console.log('  User:', response.locals?.user || 'No user info');
    
    try {
      const attachments = await this.attachmentService.getAttachmentsWithPresignedUrls(contentId, expiresIn);
      
      console.log('✅ Attachments retrieved successfully:', attachments.length);
      
      // Log each attachment's presigned URL
      attachments.forEach((attachment, index) => {
        console.log(`📎 Attachment ${index + 1}:`, {
          id: attachment.id,
          fileName: attachment.fileName,
          presignedUrl: attachment.presignedUrl ? 'Generated' : 'Failed/Null',
          presignedUrlLength: attachment.presignedUrl?.length || 0
        });
      });
      
      const apiResponse = ApiResponseBuilder.success(attachments);
      
      console.log('📤 Sending API response structure:', {
        success: apiResponse.success,
        dataLength: Array.isArray(apiResponse.data) ? apiResponse.data.length : 'Not array',
        hasData: !!apiResponse.data
      });

      response.status(200).json(apiResponse);
    } catch (error) {
      console.error('❌ Error in getAttachmentsWithPresignedUrls:', error);
      console.error('  Error message:', error.message);
      console.error('  Error stack:', error.stack);
      
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_RETRIEVAL_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get attachment statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getAttachmentStatistics(
    @Res() response: Response,
  ): Promise<void> {
    try {
      const statistics = await this.attachmentService.getAttachmentStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Put('reorder')
  @UsePipes(new NoValidationPipe())
  @ApiOperation({ summary: 'Reorder attachments' })
  @ApiResponse({ status: 200, description: 'Attachments reordered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async reorderAttachments(
    @Body() data: any,
    @Res() response: Response,
  ): Promise<void> {
    try {
      // Manual validation
      if (!data || !data.orders || !Array.isArray(data.orders) || data.orders.length === 0) {
        throw new BadRequestException('Orders array is required and must not be empty');
      }

      // Validate that all attachments exist and belong to the same content
      let contentId: string | null = null;
      for (const order of data.orders) {
        if (!order.id || typeof order.order !== 'number') {
          throw new BadRequestException('Each order item must have id and order properties');
        }
        
        const attachment = await this.attachmentService.getAttachmentById(order.id);
        if (!attachment) {
          throw new BadRequestException(`Attachment with id ${order.id} not found`);
        }
        
        if (contentId === null) {
          contentId = attachment.contentId;
        } else if (contentId !== attachment.contentId) {
          throw new BadRequestException('All attachments must belong to the same content');
        }
      }

      if (!contentId) {
        throw new BadRequestException('No valid content ID found');
      }

      await this.attachmentService.reorderAttachments(contentId, data.orders);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Attachments reordered successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.status || (error instanceof BadRequestException ? 400 : 500);
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_REORDER_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attachment by ID' })
  @ApiResponse({ status: 200, description: 'Attachment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async getAttachmentById(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const attachment = await this.attachmentService.getAttachmentWithPresignedUrl(id);
      
      const apiResponse = ApiResponseBuilder.success(attachment);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_RETRIEVAL_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload attachment' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAttachmentDto: CreateAttachmentDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const attachment = await this.attachmentService.uploadAttachment(createAttachmentDto.contentId, file);
      
      const apiResponse = ApiResponseBuilder.success(attachment);

      response.status(201).json(apiResponse);
    } catch (error) {
      const status = error.status || 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_UPLOAD_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':contentId/attachments')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload attachment for specific content (Admin route)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async uploadAttachmentForContent(
    @Param('contentId') contentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const attachment = await this.attachmentService.uploadAttachment(contentId, file);
      
      const apiResponse = ApiResponseBuilder.success(attachment);

      response.status(201).json(apiResponse);
    } catch (error) {
      const status = error.status || 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_UPLOAD_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update attachment' })
  @ApiResponse({ status: 200, description: 'Attachment updated successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async updateAttachment(
    @Param('id') id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const attachment = await this.attachmentService.updateAttachment(id, updateAttachmentDto);
      
      const apiResponse = ApiResponseBuilder.success(attachment);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attachment' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async deleteAttachment(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      await this.attachmentService.deleteAttachment(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Attachment deleted successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_DELETE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put(':contentId/attachments/:id')
  @ApiOperation({ summary: 'Update attachment for specific content (Admin route)' })
  @ApiResponse({ status: 200, description: 'Attachment updated successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async updateAttachmentForContent(
    @Param('contentId') contentId: string,
    @Param('id') id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const attachment = await this.attachmentService.updateAttachment(id, updateAttachmentDto);
      
      const apiResponse = ApiResponseBuilder.success(attachment);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':contentId/attachments/:id')
  @ApiOperation({ summary: 'Delete attachment for specific content (Admin route)' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async deleteAttachmentForContent(
    @Param('contentId') contentId: string,
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      await this.attachmentService.deleteAttachment(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Attachment deleted successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_DELETE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get(':id/download')
  @HttpCode(200)
  @ApiOperation({ summary: 'Download attachment' })
  @ApiResponse({ status: 200, description: 'Attachment downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  @UseInterceptors(DownloadInterceptor)
  async downloadAttachment(
    @Param('id') id: string,
    @Res({ passthrough: false }) response: Response,
  ): Promise<void> {
    try {
      const result = await this.attachmentService.downloadAttachment(id);
      
      // Set headers and send buffer directly, bypassing the interceptor
      response.setHeader('Content-Type', result.mimeType);
      response.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      response.setHeader('Content-Length', result.buffer.length.toString());
      response.setHeader('Cache-Control', 'no-cache');
      response.setHeader('Pragma', 'no-cache');
      response.setHeader('Expires', '0');
      
      // Write the buffer directly to the response stream
      response.write(result.buffer);
      response.end();
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_DOWNLOAD_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get(':id/presigned-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get presigned URL for attachment viewing/preview' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getPresignedUrl(
    @Param('id') id: string,
    @Res() response: Response,
    @Query('expiresIn') expiresIn?: number,
    @Query('operation') operation: 'get' | 'put' = 'get'
  ): Promise<void> {
    try {
      const attachment = await this.attachmentService.getAttachmentWithPresignedUrl(id, expiresIn);
      
      const apiResponse = ApiResponseBuilder.success({
        presignedUrl: attachment.presignedUrl,
        expiresIn: expiresIn || 86400, // 24 hours default
        operation,
        attachmentId: id,
        fileName: attachment.fileName,
        contentType: attachment.mimeType,
        fileSize: attachment.fileSize
      });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'PRESIGNED_URL_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }
}