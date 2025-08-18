import { Controller, Get, Query, Param, Res, Req, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DocumentService } from '../services/document.service';
import { DocumentQueryDto, DocumentResponseDto, DocumentType, DocumentCategory } from '../dto/documents.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Documents')
@Controller('documents')
export class PublicDocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all public documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'documentType', required: false, enum: DocumentType })
  @ApiQuery({ name: 'category', required: false, enum: DocumentCategory })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async getAllDocuments(
    @Res() response: Response,
    @Query() query?: DocumentQueryDto
  ): Promise<void> {
    try {
      const result = await this.documentService.getActiveDocuments(query);
      
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

  @Get('type/:type')
  @ApiOperation({ summary: 'Get documents by type' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiParam({ name: 'type', enum: DocumentType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
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
  @ApiOperation({ summary: 'Get documents by category' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiParam({ name: 'category', enum: DocumentCategory })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
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

  @Get('search')
  @ApiOperation({ summary: 'Search documents' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
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

  @Get('pdfs')
  @ApiOperation({ summary: 'Get all PDF documents' })
  @ApiResponse({ status: 200, description: 'PDF documents retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getPdfDocuments(
    @Res() response: Response,
    @Query() query?: DocumentQueryDto
  ): Promise<void> {
    try {
      const result = await this.documentService.getDocumentsByType(DocumentType.PDF, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'PDF_DOCUMENTS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('forms')
  @ApiOperation({ summary: 'Get all form documents' })
  @ApiResponse({ status: 200, description: 'Form documents retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getFormDocuments(
    @Res() response: Response,
    @Query() query?: DocumentQueryDto
  ): Promise<void> {
    try {
      const result = await this.documentService.getDocumentsByCategory(DocumentCategory.FORM, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'FORM_DOCUMENTS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('policies')
  @ApiOperation({ summary: 'Get all policy documents' })
  @ApiResponse({ status: 200, description: 'Policy documents retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getPolicyDocuments(
    @Res() response: Response,
    @Query() query?: DocumentQueryDto
  ): Promise<void> {
    try {
      const result = await this.documentService.getDocumentsByCategory(DocumentCategory.POLICY, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'POLICY_DOCUMENTS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all report documents' })
  @ApiResponse({ status: 200, description: 'Report documents retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getReportDocuments(
    @Res() response: Response,
    @Query() query?: DocumentQueryDto
  ): Promise<void> {
    try {
      const result = await this.documentService.getDocumentsByCategory(DocumentCategory.REPORT, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'REPORT_DOCUMENTS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
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

  @Get(':id/download')
  @ApiOperation({ summary: 'Download document' })
  @ApiResponse({ status: 200, description: 'Document download URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  async downloadDocument(
    @Res() response: Response,
    @Req() request: Request,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const userId = (request as any).user?.id;
      const ipAddress = request.ip || request.connection.remoteAddress || '';
      const userAgent = request.headers['user-agent'] || '';

      const downloadUrl = await this.documentService.downloadDocument(
        id, 
        userId, 
        ipAddress, 
        userAgent
      );
      
      const apiResponse = ApiResponseBuilder.success({ downloadUrl });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_DOWNLOAD_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get document URL' })
  @ApiResponse({ status: 200, description: 'Document URL retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  async getDocumentUrl(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const document = await this.documentService.getDocumentById(id);
      
      const apiResponse = ApiResponseBuilder.success({ 
        url: document.downloadUrl,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType
      });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'DOCUMENT_URL_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get presigned download URL for document' })
  @ApiResponse({ status: 200, description: 'Download URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  async getDocumentDownloadUrl(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('expires') expires?: number
  ): Promise<void> {
    const downloadUrl = await this.documentService.generateDownloadUrl(id, expires);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success({ downloadUrl }));
  }

  @Get(':id/preview-url')
  @ApiOperation({ summary: 'Get preview URL for document (for browser viewing)' })
  @ApiResponse({ status: 200, description: 'Preview URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiQuery({ name: 'expires', required: false, type: Number, description: 'Expiration time in seconds (default: 3600)' })
  async getDocumentPreviewUrl(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('expires') expires?: number
  ): Promise<void> {
    const previewUrl = await this.documentService.generatePreviewUrl(id, expires);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success({ previewUrl }));
  }
} 