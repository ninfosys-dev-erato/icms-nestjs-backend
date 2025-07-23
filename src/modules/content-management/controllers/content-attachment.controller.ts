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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

import { ContentAttachmentService } from '../services/content-attachment.service';
import { 
  CreateAttachmentDto, 
  UpdateAttachmentDto,
  ReorderDto
} from '../dto/content-management.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiResponseBuilder } from '../../../common/types/api-response';

class ReorderData {
  orders: Array<{ id: string; order: number }>;
}

// Simple DTO with validation decorators
class SimpleReorderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimpleReorderItemDto)
  orders: SimpleReorderItemDto[];
}

class SimpleReorderItemDto {
  @IsString()
  id: string;

  @IsNumber()
  order: number;
}

// Custom pipe that doesn't validate
class NoValidationPipe extends ValidationPipe {
  transform(value: any, metadata: any) {
    return value;
  }
}

@ApiTags('Content Attachments')
@Controller('api/v1/attachments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiBearerAuth()
export class ContentAttachmentController {
  constructor(private readonly attachmentService: ContentAttachmentService) {}

  @Get('content/:contentId/attachments')
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
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENTS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get attachment statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Res() response: Response): Promise<void> {
    try {
      const statistics = await this.attachmentService.getAttachmentStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'STATISTICS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
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
      const attachment = await this.attachmentService.getAttachmentById(id);
      
      const apiResponse = ApiResponseBuilder.success(attachment);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_NOT_FOUND',
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
  @ApiResponse({ status: 400, description: 'File validation error' })
  async uploadAttachment(
    @Body() data: CreateAttachmentDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const attachment = await this.attachmentService.uploadAttachment(data.contentId, file);
      
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
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async updateAttachment(
    @Param('id') id: string,
    @Body() data: UpdateAttachmentDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const attachment = await this.attachmentService.updateAttachment(id, data);
      
      const apiResponse = ApiResponseBuilder.success(attachment);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.status || 500;
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

  @Get(':id/download')
  @ApiOperation({ summary: 'Download attachment' })
  @ApiResponse({ status: 200, description: 'Attachment downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async downloadAttachment(
    @Param('id') id: string,
    @Res({ passthrough: false }) response: Response,
  ): Promise<void> {
    try {
      const result = await this.attachmentService.downloadAttachment(id);
      
      // Set headers and send buffer directly, bypassing the interceptor
      response.setHeader('Content-Type', result.mimeType);
      response.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      response.end(result.buffer);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_DOWNLOAD_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder attachments' })
  @ApiResponse({ status: 200, description: 'Attachments reordered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async reorderAttachments(
    @Body() data: ReorderDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      // Validate that orders array is not empty
      if (!data.orders || data.orders.length === 0) {
        throw new BadRequestException('Orders array is required and must not be empty');
      }

      // Validate that all attachments exist and belong to the same content
      let contentId: string | null = null;
      for (const order of data.orders) {
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
      const status = error.status || 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_REORDER_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }
}