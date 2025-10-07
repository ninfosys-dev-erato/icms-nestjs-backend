import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
  UsePipes,
  ValidationPipe,
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DocumentService } from '../services/document.service';
import { 
  CreateDocumentDto, 
  UpdateDocumentDto, 
  DocumentQueryDto, 
  DocumentResponseDto,
  DocumentStatistics,
  DocumentAnalytics,
  BulkOperationResult,
  BulkOperationDto,
  BulkUpdateDto,
  BulkUpdateRequestDto,
  DocumentType,
  DocumentCategory,
  DocumentStatus
} from '../dto/documents.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@Injectable()
export class NoValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return value;
  }
}

@ApiTags('Admin Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/documents')
export class AdminDocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all documents (Admin)' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'documentType', required: false, enum: DocumentType })
  @ApiQuery({ name: 'category', required: false, enum: DocumentCategory })
  @ApiQuery({ name: 'status', required: false, enum: DocumentStatus })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async getAllDocuments(
    @Res() response: Response,
    @Query() query?: DocumentQueryDto
  ): Promise<void> {
    try {
      const result = await this.documentService.getAllDocuments(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENTS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get document statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getDocumentStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const statistics = await this.documentService.getDocumentStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search documents (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async searchDocuments(
    @Res() response: Response,
    @Query('q') searchTerm: string,
    @Query() query?: DocumentQueryDto
  ): Promise<void> {
    try {
      const result = await this.documentService.searchDocuments(searchTerm, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_SEARCH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get documents by type (Admin)' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiParam({ name: 'type', enum: DocumentType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN', 'EDITOR')
  async getDocumentsByType(
    @Res() response: Response,
    @Param('type') type: DocumentType,
    @Query() query?: DocumentQueryDto
  ): Promise<void> {
    try {
      const result = await this.documentService.getDocumentsByType(type, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_TYPE_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get documents by category (Admin)' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiParam({ name: 'category', enum: DocumentCategory })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN', 'EDITOR')
  async getDocumentsByCategory(
    @Res() response: Response,
    @Param('category') category: DocumentCategory,
    @Query() query?: DocumentQueryDto
  ): Promise<void> {
    try {
      const result = await this.documentService.getDocumentsByCategory(category, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_CATEGORY_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }



  @Post('upload')
  @ApiOperation({ summary: 'Upload document (Admin)' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Upload failed' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('ADMIN', 'EDITOR')
  async uploadDocument(
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata?: any
  ): Promise<void> {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Transform form data to proper types
      const transformedMetadata: Partial<CreateDocumentDto> = {
        ...metadata,
        title: metadata.title || (metadata['title[en]'] || metadata['title[ne]'] ? {
          en: metadata['title[en]'] || metadata.title?.en || '',
          ne: metadata['title[ne]'] || metadata.title?.ne || ''
        } : undefined),
        description: metadata.description || (metadata['description[en]'] || metadata['description[ne]'] ? {
          en: metadata['description[en]'] || metadata.description?.en || '',
          ne: metadata['description[ne]'] || metadata.description?.ne || ''
        } : undefined),
        isPublic: metadata.isPublic !== undefined ? (metadata.isPublic === 'true' || metadata.isPublic === true) : undefined,
        requiresAuth: metadata.requiresAuth !== undefined ? (metadata.requiresAuth === 'true' || metadata.requiresAuth === true) : undefined,
        isActive: metadata.isActive !== undefined ? (metadata.isActive === 'true' || metadata.isActive === true) : undefined,
        order: metadata.order ? parseInt(metadata.order) : undefined,
        fileSize: metadata.fileSize ? parseInt(metadata.fileSize) : undefined,
      };

      // Remove the bracket notation fields from metadata to avoid conflicts
      delete transformedMetadata['title[en]'];
      delete transformedMetadata['title[ne]'];
      delete transformedMetadata['description[en]'];
      delete transformedMetadata['description[ne]'];

      const document = await this.documentService.uploadDocument(file, transformedMetadata);
      
      const apiResponse = ApiResponseBuilder.success(document);

      response.status(201).json(apiResponse);
    } catch (error) {
      console.log('Upload error:', error.message);
      console.log('Upload error details:', error);
      
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_UPLOAD_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Put('bulk-update')
  @ApiOperation({ summary: 'Bulk update documents (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk update completed' })
  @ApiResponse({ status: 400, description: 'Update failed' })
  @Roles('ADMIN', 'EDITOR')
  @UsePipes(NoValidationPipe)
  async bulkUpdate(
    @Res() response: Response,
    @Body() data: any
  ): Promise<void> {
    try {
      const result = await this.documentService.bulkUpdate(data.ids, data.updates);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_BULK_UPDATE_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document (Admin)' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @Roles('ADMIN', 'EDITOR')
  async updateDocument(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateDocumentDto
  ): Promise<void> {
    try {
      const document = await this.documentService.updateDocument(id, data);
      
      const apiResponse = ApiResponseBuilder.success(document);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document (Admin)' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @Roles('ADMIN')
  async deleteDocument(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      await this.documentService.deleteDocument(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Document deleted successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_DELETION_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':id/versions')
  @ApiOperation({ summary: 'Create document version (Admin)' })
  @ApiResponse({ status: 201, description: 'Document version created successfully' })
  @ApiResponse({ status: 400, description: 'Version creation failed' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('ADMIN', 'EDITOR')
  async createDocumentVersion(
    @Res() response: Response,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('version') version: string,
    @Body('changeLog') changeLog?: string
  ): Promise<void> {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      if (!version) {
        throw new BadRequestException('Version is required');
      }

      const document = await this.documentService.createDocumentVersion(
        id, 
        file, 
        version, 
        changeLog ? JSON.parse(changeLog) : undefined
      );
      
      const apiResponse = ApiResponseBuilder.success(document);

      response.status(201).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_VERSION_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get document versions (Admin)' })
  @ApiResponse({ status: 200, description: 'Document versions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @Roles('ADMIN', 'EDITOR')
  async getDocumentVersions(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const versions = await this.documentService.getDocumentVersions(id);
      
      const apiResponse = ApiResponseBuilder.success(versions);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_VERSIONS_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get document analytics (Admin)' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @Roles('ADMIN', 'EDITOR')
  async getDocumentAnalytics(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const analytics = await this.documentService.getDocumentAnalytics(id);
      
      const apiResponse = ApiResponseBuilder.success(analytics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_ANALYTICS_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export documents (Admin)' })
  @ApiResponse({ status: 200, description: 'Documents exported successfully' })
  @ApiQuery({ name: 'format', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async exportDocuments(
    @Res() response: Response,
    @Query() query: DocumentQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<void> {
    try {
      const buffer = await this.documentService.exportDocuments(query, format);
      
      const contentType = format === 'json' ? 'application/json' : 'application/octet-stream';
      const filename = `documents-export.${format}`;
      
      response.setHeader('Content-Type', contentType);
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.send(buffer);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_EXPORT_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @Roles('ADMIN', 'EDITOR')
  async getDocumentById(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const document = await this.documentService.getDocumentById(id);
      
      const apiResponse = ApiResponseBuilder.success(document);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import documents (Admin)' })
  @ApiResponse({ status: 201, description: 'Documents imported successfully' })
  @ApiResponse({ status: 400, description: 'Import failed' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('ADMIN')
  async importDocuments(
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File
  ): Promise<void> {
    try {
      const result = await this.documentService.importDocuments(file);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_IMPORT_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete documents (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk deletion completed' })
  @Roles('ADMIN')
  async bulkDelete(
    @Res() response: Response,
    @Body() data: BulkOperationDto
  ): Promise<void> {
    try {
      const result = await this.documentService.bulkDelete(data.ids);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_BULK_DELETION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get presigned download URL for document (Admin)' })
  @ApiResponse({ status: 200, description: 'Download URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiQuery({ name: 'expires', required: false, type: Number, description: 'Expiration time in seconds (default: 86400)' })
  @Roles('ADMIN', 'EDITOR')
  async getDocumentDownloadUrl(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('expires') expires?: number
  ): Promise<void> {
    const downloadUrl = await this.documentService.generateAdminDownloadUrl(id, expires);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success({ downloadUrl }));
  }

  @Post('bulk-download-urls')
  @ApiOperation({ summary: 'Generate presigned download URLs for multiple documents (Admin)' })
  @ApiResponse({ status: 200, description: 'Download URLs generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiBody({ type: BulkOperationDto })
  @ApiQuery({ name: 'expires', required: false, type: Number, description: 'Expiration time in seconds (default: 86400)' })
  @Roles('ADMIN', 'EDITOR')
  async generateBulkDownloadUrls(
    @Res() response: Response,
    @Body() data: BulkOperationDto,
    @Query('expires') expires?: number
  ): Promise<void> {
    const downloadUrls = await this.documentService.generateBulkDownloadUrls(data.ids, expires);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(downloadUrls));
  }

  @Get(':id/preview-url')
  @ApiOperation({ summary: 'Get preview URL for document (Admin - for browser viewing)' })
  @ApiResponse({ status: 200, description: 'Preview URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiQuery({ name: 'expires', required: false, type: Number, description: 'Expiration time in seconds (default: 3600)' })
  @Roles('ADMIN', 'EDITOR')
  async getDocumentPreviewUrl(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('expires') expires?: number
  ): Promise<void> {
    const previewUrl = await this.documentService.generateAdminPreviewUrl(id, expires);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success({ previewUrl }));
  }

  @Post('upload-url')
  @ApiOperation({ summary: 'Generate presigned upload URL for document creation (Admin)' })
  @ApiResponse({ status: 200, description: 'Upload URL generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        fileName: { type: 'string', example: 'document.pdf' },
        contentType: { type: 'string', example: 'application/pdf' },
        expires: { type: 'number', example: 3600, description: 'Expiration time in seconds (default: 3600)' }
      },
      required: ['fileName', 'contentType']
    }
  })
  @Roles('ADMIN', 'EDITOR')
  async generateUploadUrl(
    @Res() response: Response,
    @Body() data: { fileName: string; contentType: string; expires?: number }
  ): Promise<void> {
    const uploadUrl = await this.documentService.generateUploadUrl(data.fileName, data.contentType, data.expires);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(uploadUrl));
  }


} 