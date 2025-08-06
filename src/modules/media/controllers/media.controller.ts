import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Request,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService } from '../services/media.service';
import { 
  MediaQueryDto, 
  MediaSearchDto, 
  UpdateMediaDto, 
  FileUploadValidationDto,
  MediaProcessingOptionsDto,
  MediaUrlDto,
  MediaImportDto,
  MediaExportDto,
  MediaCategory,
  MediaFolder,
  FILE_TYPE_CONFIG
} from '../dto/media.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

// Custom pipe to handle FormData arrays
@Injectable()
export class FormDataArrayPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value && typeof value === 'object') {
      // Handle tags array from FormData
      if (value.tags) {
        // If tags is already an array, ensure all elements are strings and within length limit
        if (Array.isArray(value.tags)) {
          value.tags = value.tags
            .map(tag => String(tag).trim())
            .filter(tag => tag.length > 0 && tag.length <= 50);
        } else if (typeof value.tags === 'string') {
          // If tags is a string, split by comma and process
          value.tags = value.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0 && tag.length <= 50);
        }
      }
    }
    return value;
  }
}

@ApiTags('Media Management')
@Controller('media')
@UsePipes(new ValidationPipe({ 
  whitelist: true, 
  forbidNonWhitelisted: false, // Allow extra fields for file uploads
  transform: true 
}))
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        folder: {
          type: 'string',
          enum: Object.values(MediaFolder),
          description: 'Target folder for the file',
        },
        altText: {
          type: 'string',
          description: 'Alt text for accessibility',
        },
        title: {
          type: 'string',
          description: 'Media title',
        },
        description: {
          type: 'string',
          description: 'Media description',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Searchable tags',
        },
        isPublic: {
          type: 'boolean',
          description: 'Public visibility flag',
        },
      },
      required: ['file', 'folder'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      // Add logging to see what's happening during file upload
      fileFilter: (req, file, callback) => {
        console.log('🔍 DEBUG: FileInterceptor fileFilter called');
        console.log('  File object:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          size: file.size
        });
        console.log('  Request body before file processing:', req.body);
        callback(null, true);
      }
    })
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB max
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx|mp4|webm|mov|mp3|wav|ogg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body(new FormDataArrayPipe()) metadata: FileUploadValidationDto,
    @Request() req: any,
  ) {
    // DEBUG: Log everything about the request
    console.log('🔍 DEBUG: Media Upload Request Details');
    console.log('=====================================');
    
    // Log request headers
    console.log('📋 Request Headers:');
    console.log('  Content-Type:', req.headers['content-type']);
    console.log('  Content-Length:', req.headers['content-length']);
    console.log('  User-Agent:', req.headers['user-agent']);
    
    // Log file information
    console.log('📁 File Information:');
    if (file) {
      console.log('  ✅ File received:');
      console.log('    - originalname:', file.originalname);
      console.log('    - mimetype:', file.mimetype);
      console.log('    - size:', file.size);
      console.log('    - fieldname:', file.fieldname);
      console.log('    - buffer length:', file.buffer?.length);
      console.log('    - encoding:', file.encoding);
    } else {
      console.log('  ❌ No file received');
    }
    
    // Log raw request body
    console.log('📦 Raw Request Body:');
    console.log('  Body keys:', Object.keys(req.body || {}));
    console.log('  Body content:', req.body);
    
    // Log metadata
    console.log('📋 Metadata:');
    console.log('  Metadata object:', metadata);
    console.log('  Metadata type:', typeof metadata);
    console.log('  Metadata keys:', Object.keys(metadata || {}));
    
    // Log multer information
    console.log('🔧 Multer Information:');
    console.log('  Files in request:', req.files);
    console.log('  File in request:', req.file);
    
    // Log form data fields
    console.log('📝 Form Data Fields:');
    if (req.body) {
      Object.entries(req.body).forEach(([key, value]) => {
        console.log(`  ${key}:`, value, `(type: ${typeof value})`);
      });
    }
    
    console.log('=====================================');

    if (!metadata.folder) {
      throw new BadRequestException('Folder is required');
    }

    return this.mediaService.uploadMedia(file, metadata, req.user.id);
  }

  @Post('bulk-upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Files to upload',
        },
        folder: {
          type: 'string',
          enum: Object.values(MediaFolder),
          description: 'Target folder for the files',
        },
        altText: {
          type: 'string',
          description: 'Alt text for accessibility',
        },
        title: {
          type: 'string',
          description: 'Media title',
        },
        description: {
          type: 'string',
          description: 'Media description',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Searchable tags',
        },
        isPublic: {
          type: 'boolean',
          description: 'Public visibility flag',
        },
      },
      required: ['files', 'folder'],
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid files or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB max
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx|mp4|webm|mov|mp3|wav|ogg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
    @Body() metadata: FileUploadValidationDto,
    @Request() req: any,
  ) {
    if (!metadata.folder) {
      throw new BadRequestException('Folder is required');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    return this.mediaService.bulkUpload(files, metadata, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all media with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Media list retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getAllMedia(@Query() query: MediaQueryDto) {
    return this.mediaService.getAllMedia(query);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public media (no authentication required)' })
  @ApiResponse({ status: 200, description: 'Public media list retrieved successfully' })
  async getPublicMedia(@Query() query: MediaQueryDto) {
    return this.mediaService.getAllMedia({ ...query, isPublic: true, isActive: true });
  }

  @Get('library')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get media library with categories and statistics' })
  @ApiResponse({ status: 200, description: 'Media library retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getMediaLibrary() {
    return this.mediaService.getMediaLibrary();
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get media statistics' })
  @ApiResponse({ status: 200, description: 'Media statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async getMediaStatistics() {
    return this.mediaService.getMediaStatistics();
  }

  @Get('category/:category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get media by category' })
  @ApiResponse({ status: 200, description: 'Media by category retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getMediaByCategory(
    @Param('category') category: MediaCategory,
    @Query() query: MediaQueryDto,
  ) {
    return this.mediaService.getMediaByCategory(category, query);
  }

  @Get('folder/:folder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get media by folder' })
  @ApiResponse({ status: 200, description: 'Media by folder retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getMediaByFolder(
    @Param('folder') folder: string,
    @Query() query: MediaQueryDto,
  ) {
    return this.mediaService.getMediaByFolder(folder, query);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get media by user' })
  @ApiResponse({ status: 200, description: 'Media by user retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getMediaByUser(
    @Param('userId') userId: string,
    @Query() query: MediaQueryDto,
  ) {
    return this.mediaService.getMediaByUser(userId, query);
  }

  @Get('my-media')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get current user media' })
  @ApiResponse({ status: 200, description: 'User media retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getMyMedia(@Query() query: MediaQueryDto, @Request() req: any) {
    return this.mediaService.getMediaByUser(req.user.id, query);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Search media' })
  @ApiResponse({ status: 200, description: 'Media search results retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async searchMedia(@Query() searchDto: MediaSearchDto) {
    return this.mediaService.searchMedia(searchDto);
  }

  @Get('tags')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get media by tags' })
  @ApiResponse({ status: 200, description: 'Media by tags retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getMediaByTags(
    @Query('tags') tags: string,
    @Query() query: MediaQueryDto,
  ) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    return this.mediaService.getAllMedia({ ...query, tags: tagArray });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiResponse({ status: 200, description: 'Media retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getMediaById(@Param('id') id: string) {
    return this.mediaService.getMediaById(id);
  }

  @Get(':id/url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get media URL (with optional expiration)' })
  @ApiResponse({ status: 200, description: 'Media URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getMediaUrl(@Param('id') id: string, @Query() urlDto: MediaUrlDto) {
    urlDto.mediaId = id;
    const url = await this.mediaService.getMediaUrl(urlDto);
    return { url };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update media metadata' })
  @ApiResponse({ status: 200, description: 'Media updated successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async updateMedia(
    @Param('id') id: string,
    @Body() updateDto: UpdateMediaDto,
    @Request() req: any,
  ) {
    // Check if user owns the media or is admin
    const media = await this.mediaService.getMediaById(id);
    if (media.uploadedBy !== req.user.id && req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('You can only update your own media');
    }

    return this.mediaService.updateMedia(id, updateDto);
  }

  @Post(':id/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Process media (resize, optimize, etc.)' })
  @ApiResponse({ status: 200, description: 'Media processed successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 400, description: 'Processing not supported for this media type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async processMedia(
    @Param('id') id: string,
    @Body() options: MediaProcessingOptionsDto,
    @Request() req: any,
  ) {
    // Check if user owns the media or is admin
    const media = await this.mediaService.getMediaById(id);
    if (media.uploadedBy !== req.user.id && req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('You can only process your own media');
    }

    return this.mediaService.processMedia(id, options);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete media' })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async deleteMedia(@Param('id') id: string, @Request() req: any) {
    // Check if user owns the media or is admin
    const media = await this.mediaService.getMediaById(id);
    if (media.uploadedBy !== req.user.id && req.user.role !== UserRole.ADMIN) {
      throw new BadRequestException('You can only delete your own media');
    }

    await this.mediaService.deleteMedia(id);
    return { message: 'Media deleted successfully' };
  }

  @Post('bulk-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete multiple media files' })
  @ApiResponse({ status: 200, description: 'Bulk delete completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async bulkDelete(@Body() body: { ids: string[] }) {
    return this.mediaService.bulkDelete(body.ids);
  }

  @Post('bulk-update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update multiple media files' })
  @ApiResponse({ status: 200, description: 'Bulk update completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async bulkUpdate(
    @Body() body: { ids: string[]; updates: UpdateMediaDto },
  ) {
    return this.mediaService.bulkUpdate(body.ids, body.updates);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Import media from URL' })
  @ApiResponse({ status: 201, description: 'Media imported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid URL or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async importMedia(@Body() importDto: MediaImportDto, @Request() req: any) {
    return this.mediaService.importMedia(importDto, req.user.id);
  }

  @Post('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Export media data' })
  @ApiResponse({ status: 200, description: 'Media exported successfully' })
  @ApiResponse({ status: 400, description: 'Invalid export parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async exportMedia(@Body() exportDto: MediaExportDto) {
    return this.mediaService.exportMedia(exportDto);
  }

  @Post('cleanup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Clean up orphaned media files' })
  @ApiResponse({ status: 200, description: 'Cleanup completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  async cleanupOrphanedMedia() {
    return this.mediaService.cleanupOrphanedMedia();
  }

  @Get('file-types/config')
  @ApiOperation({ summary: 'Get supported file types configuration' })
  @ApiResponse({ status: 200, description: 'File types configuration retrieved successfully' })
  async getFileTypesConfig() {
    return {
      success: true,
      data: FILE_TYPE_CONFIG,
      message: 'File types configuration retrieved successfully',
    };
  }

  @Get('folders/list')
  @ApiOperation({ summary: 'Get available folders' })
  @ApiResponse({ status: 200, description: 'Folders list retrieved successfully' })
  async getFoldersList() {
    return {
      success: true,
      data: Object.values(MediaFolder),
      message: 'Folders list retrieved successfully',
    };
  }

  @Get('categories/list')
  @ApiOperation({ summary: 'Get available categories' })
  @ApiResponse({ status: 200, description: 'Categories list retrieved successfully' })
  async getCategoriesList() {
    return {
      success: true,
      data: Object.values(MediaCategory),
      message: 'Categories list retrieved successfully',
    };
  }
} 