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
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam,
  ApiConsumes
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DepartmentService } from '../services/department.service';
import { 
  CreateDepartmentDto, 
  UpdateDepartmentDto, 
  DepartmentQueryDto, 
  DepartmentResponseDto,
  HRStatistics,
  BulkOperationResult
} from '../dto/hr.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Admin Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/departments')
export class AdminDepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments (Admin)' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'parentId', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async getAllDepartments(
    @Res() response: Response,
    @Query() query?: DepartmentQueryDto
  ): Promise<void> {
    try {
      const result = await this.departmentService.getAllDepartments(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENTS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get HR statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getHRStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const statistics = await this.departmentService.getHRStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HR_STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get department hierarchy (Admin)' })
  @ApiResponse({ status: 200, description: 'Hierarchy retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getDepartmentHierarchy(
    @Res() response: Response
  ): Promise<void> {
    try {
      const hierarchy = await this.departmentService.getDepartmentHierarchy();
      
      const apiResponse = ApiResponseBuilder.success(hierarchy);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_HIERARCHY_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search departments (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'search', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async searchDepartments(
    @Res() response: Response,
    @Query() query: DepartmentQueryDto
  ): Promise<void> {
    try {
      if (!query.search) {
        const apiResponse = ApiResponseBuilder.error(
          'DEPARTMENT_SEARCH_ERROR',
          'Search term is required'
        );
        response.status(400).json(apiResponse);
        return;
      }

      const result = await this.departmentService.searchDepartments(query.search, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_SEARCH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Department retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @Roles('ADMIN', 'EDITOR')
  async getDepartmentById(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const department = await this.departmentService.getDepartmentById(id);
      
      const apiResponse = ApiResponseBuilder.success(department);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create department (Admin)' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Roles('ADMIN', 'EDITOR')
  async createDepartment(
    @Res() response: Response,
    @Body() data: CreateDepartmentDto,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const department = await this.departmentService.createDepartment(data, user.id);
      
      const apiResponse = ApiResponseBuilder.success(department);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_CREATION_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department (Admin)' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @Roles('ADMIN', 'EDITOR')
  async updateDepartment(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateDepartmentDto,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const department = await this.departmentService.updateDepartment(id, data, user.id);
      
      const apiResponse = ApiResponseBuilder.success(department);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department (Admin)' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @Roles('ADMIN')
  async deleteDepartment(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      await this.departmentService.deleteDepartment(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Department deleted successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_DELETION_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export departments (Admin)' })
  @ApiResponse({ status: 200, description: 'Departments exported successfully' })
  @ApiQuery({ name: 'format', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async exportDepartments(
    @Res() response: Response,
    @Query() query: DepartmentQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<void> {
    try {
      const buffer = await this.departmentService.exportDepartments(query, format);
      
      const contentType = format === 'json' ? 'application/json' : 'application/octet-stream';
      const filename = `departments-export.${format}`;
      
      response.setHeader('Content-Type', contentType);
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.send(buffer);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_EXPORT_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import departments (Admin)' })
  @ApiResponse({ status: 201, description: 'Departments imported successfully' })
  @ApiResponse({ status: 400, description: 'Import failed' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('ADMIN')
  async importDepartments(
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.departmentService.importDepartments(file, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_IMPORT_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Post('bulk-activate')
  @ApiOperation({ summary: 'Bulk activate departments (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk activation completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkActivate(
    @Res() response: Response,
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.departmentService.bulkActivate(data.ids, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_BULK_ACTIVATION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('bulk-deactivate')
  @ApiOperation({ summary: 'Bulk deactivate departments (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk deactivation completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkDeactivate(
    @Res() response: Response,
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.departmentService.bulkDeactivate(data.ids, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_BULK_DEACTIVATION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete departments (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk deletion completed' })
  @Roles('ADMIN')
  async bulkDelete(
    @Res() response: Response,
    @Body() data: { ids: string[] }
  ): Promise<void> {
    try {
      const result = await this.departmentService.bulkDelete(data.ids);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_BULK_DELETION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }
} 