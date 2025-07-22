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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';

import { ContentAttachmentService } from '../services/content-attachment.service';
import { 
  CreateAttachmentDto, 
  UpdateAttachmentDto 
} from '../dto/content-management.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Content Attachments')
@Controller('content-attachments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
export class ContentAttachmentController {
  constructor(private readonly attachmentService: ContentAttachmentService) {}

  @Get('content/:contentId')
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
      
      const apiResponse = ApiResponseBuilder.success(null);

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
    @Res() response: Response,
  ): Promise<void> {
    try {
      const result = await this.attachmentService.downloadAttachment(id);
      
      response.setHeader('Content-Type', result.mimeType);
      response.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      response.send(result.buffer);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ATTACHMENT_DOWNLOAD_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get attachment statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getAttachmentStatistics(@Res() response: Response): Promise<void> {
    try {
      const statistics = await this.attachmentService.getAttachmentStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }
} 