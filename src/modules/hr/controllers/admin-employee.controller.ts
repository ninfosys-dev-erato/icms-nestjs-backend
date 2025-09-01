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
  UploadedFiles,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
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
import { EmployeeService } from '../services/employee.service';
import { 
  CreateEmployeeDto, 
  UpdateEmployeeDto, 
  EmployeeQueryDto, 
  EmployeeResponseDto,
  BulkOperationResult
} from '../dto/hr.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Admin Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/employees')
export class AdminEmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees (Admin)' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async getAllEmployees(
    @Res() response: Response,
    @Query() query?: EmployeeQueryDto
  ): Promise<void> {
    try {
      const result = await this.employeeService.getAllEmployees(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEES_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search employees (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async searchEmployees(
    @Res() response: Response,
    @Query('q') q: string,
    @Query() query: any
  ): Promise<void> {
    try {
      if (!q) {
        const apiResponse = ApiResponseBuilder.error(
          'EMPLOYEE_SEARCH_ERROR',
          'Search term is required'
        );
        response.status(400).json(apiResponse);
        return;
      }
      // Remove 'q' from query before passing to DTO
      const { q: _q, ...rest } = query;
      // Sanitize pagination
      rest.page = rest.page && rest.page > 0 ? Number(rest.page) : 1;
      rest.limit = rest.limit && rest.limit > 0 ? Number(rest.limit) : 10;
      const result = await this.employeeService.searchEmployees(q, rest);
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_SEARCH_ERROR',
        error.message
      );
      response.status(500).json(apiResponse);
    }
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get employees by department (Admin)' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeesByDepartment(
    @Res() response: Response,
    @Param('departmentId') departmentId: string
  ): Promise<void> {
    try {
      const employees = await this.employeeService.getEmployeesByDepartment(departmentId);
      
      const apiResponse = ApiResponseBuilder.success(employees);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEES_DEPARTMENT_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('position/:position')
  @ApiOperation({ summary: 'Get employees by position (Admin)' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Position name' })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeesByPosition(
    @Res() response: Response,
    @Param('position') position: string
  ): Promise<void> {
    try {
      const employees = await this.employeeService.getEmployeesByPosition(position);
      
      const apiResponse = ApiResponseBuilder.success(employees);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEES_POSITION_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('with-position')
  @ApiOperation({ summary: 'Get all employees with position information (Admin)' })
  @ApiResponse({ status: 200, description: 'Employees with position retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeesWithPosition(
    @Res() response: Response,
    @Query() query?: EmployeeQueryDto
  ): Promise<void> {
    try {
      const result = await this.employeeService.getEmployeesWithPosition(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEES_WITH_POSITION_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('position/:position/with-details')
  @ApiOperation({ summary: 'Get employees by position with detailed information (Admin)' })
  @ApiResponse({ status: 200, description: 'Employees by position retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Position name' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeesByPositionDetailed(
    @Res() response: Response,
    @Param('position') position: string,
    @Query() query?: EmployeeQueryDto
  ): Promise<void> {
    try {
      // Use the new method that includes photos and detailed information
      const result = await this.employeeService.getEmployeesByPositionWithDetailsAndPhotos(position, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEES_BY_POSITION_DETAILED_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeeById(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const employee = await this.employeeService.getEmployeeById(id);
      
      const apiResponse = ApiResponseBuilder.success(employee);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get(':id/photo')
  @ApiOperation({ summary: 'Get employee photo (Admin)' })
  @ApiResponse({ status: 200, description: 'Employee photo retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee or photo not found' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeePhoto(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const photoData = await this.employeeService.getEmployeePhoto(id);
      
      const apiResponse = ApiResponseBuilder.success(photoData);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_PHOTO_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('photos')
  @ApiOperation({ summary: 'Get all employee photos (Admin)' })
  @ApiResponse({ status: 200, description: 'Employee photos retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async getAllEmployeePhotos(
    @Res() response: Response,
    @Query() query?: EmployeeQueryDto
  ): Promise<void> {
    try {
      const result = await this.employeeService.getAllEmployeePhotos(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_PHOTOS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('photos/search')
  @ApiOperation({ summary: 'Search employee photos (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async searchEmployeePhotos(
    @Res() response: Response,
    @Query('q') q: string,
    @Query() query: any
  ): Promise<void> {
    try {
      if (!q) {
        const apiResponse = ApiResponseBuilder.error(
          'EMPLOYEE_PHOTO_SEARCH_ERROR',
          'Search term is required'
        );
        response.status(400).json(apiResponse);
        return;
      }
      // Remove 'q' from query before passing to DTO
      const { q: _q, ...rest } = query;
      // Sanitize pagination
      rest.page = rest.page && rest.page > 0 ? Number(rest.page) : 1;
      rest.limit = rest.limit && rest.limit > 0 ? Number(rest.limit) : 10;
      const result = await this.employeeService.searchEmployeePhotos(q, rest);
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_PHOTO_SEARCH_ERROR',
        error.message
      );
      response.status(500).json(apiResponse);
    }
  }

  @Get('photos/statistics')
  @ApiOperation({ summary: 'Get employee photo statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeePhotoStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const statistics = await this.employeeService.getEmployeePhotoStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_PHOTO_STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('department/:departmentId/photos')
  @ApiOperation({ summary: 'Get employee photos by department (Admin)' })
  @ApiResponse({ status: 200, description: 'Employee photos retrieved successfully' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeePhotosByDepartment(
    @Res() response: Response,
    @Param('departmentId') departmentId: string
  ): Promise<void> {
    try {
      const photos = await this.employeeService.getEmployeePhotosByDepartment(departmentId);
      
      const apiResponse = ApiResponseBuilder.success(photos);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_PHOTOS_DEPARTMENT_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('position/:position/photos')
  @ApiOperation({ summary: 'Get employee photos by position (Admin)' })
  @ApiResponse({ status: 200, description: 'Employee photos retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Position name' })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeePhotosByPosition(
    @Res() response: Response,
    @Param('position') position: string
  ): Promise<void> {
    try {
      const photos = await this.employeeService.getEmployeePhotosByPosition(position);
      
      const apiResponse = ApiResponseBuilder.success(photos);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_PHOTOS_POSITION_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('photos/export')
  @ApiOperation({ summary: 'Export employee photos (Admin)' })
  @ApiResponse({ status: 200, description: 'Employee photos exported successfully' })
  @ApiQuery({ name: 'format', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async exportEmployeePhotos(
    @Res() response: Response,
    @Query() query: EmployeeQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<void> {
    try {
      const buffer = await this.employeeService.exportEmployeePhotos(query, format);
      
      const contentType = format === 'json' ? 'application/json' : 'application/octet-stream';
      const filename = `employee-photos-export.${format}`;
      
      response.setHeader('Content-Type', contentType);
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.send(buffer);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_PHOTO_EXPORT_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create employee (Admin)' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Roles('ADMIN', 'EDITOR')
  async createEmployee(
    @Res() response: Response,
    @Body() data: CreateEmployeeDto,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const employee = await this.employeeService.createEmployee(data, user.id);
      
      const apiResponse = ApiResponseBuilder.success(employee);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_CREATION_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee (Admin)' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @Roles('ADMIN', 'EDITOR')
  async updateEmployee(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateEmployeeDto,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const employee = await this.employeeService.updateEmployee(id, data, user.id);
      
      const apiResponse = ApiResponseBuilder.success(employee);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee (Admin)' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @Roles('ADMIN')
  async deleteEmployee(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      await this.employeeService.deleteEmployee(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Employee deleted successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_DELETION_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':id/photo')
  @ApiOperation({ summary: 'Upload/replace employee photo (Admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 }
      ],
      {
        fileFilter: (req, file, callback) => {
          console.log('🔍 DEBUG: HR Employee Photo Upload FileInterceptor called');
          console.log('  File object:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
          callback(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB for employee photos
        }
      }
    )
  )
  @ApiResponse({ status: 200, description: 'Employee photo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Validation or file error' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @Roles('ADMIN', 'EDITOR')
  async uploadEmployeePhoto(
    @Res() response: Response,
    @Param('id') id: string,
    @UploadedFiles() files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      // Check for file in any of the accepted fields
      const file = files?.image?.[0] || files?.file?.[0];
      
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const employee = await this.employeeService.uploadEmployeePhoto(id, file, user.id);
      const apiResponse = ApiResponseBuilder.success(employee);
      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.status || 400;
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_PHOTO_UPLOAD_ERROR',
        error.message
      );
      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id/photo')
  @ApiOperation({ summary: 'Remove employee photo (Admin)' })
  @Roles('ADMIN', 'EDITOR')
  async removeEmployeePhoto(
    @Res() response: Response,
    @Param('id') id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const employee = await this.employeeService.removeEmployeePhoto(id, user.id);
      const apiResponse = ApiResponseBuilder.success(employee);
      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.status || 400;
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_PHOTO_REMOVE_ERROR',
        error.message
      );
      response.status(status).json(apiResponse);
    }
  }

  @Post('debug-form-data')
  @ApiOperation({ summary: 'Debug form data (Admin - temporary)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 }
      ],
      {
        fileFilter: (req, file, callback) => {
          console.log('🔍 DEBUG: Form Data Debug FileInterceptor called');
          console.log('  File object:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
          callback(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024,
        }
      }
    )
  )
  @Roles('ADMIN', 'EDITOR')
  async debugFormData(
    @Res() response: Response,
    @UploadedFiles() files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] },
    @Body() formData: any,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const debugInfo = {
        user: user.id,
        files: files ? Object.keys(files).map(key => ({
          field: key,
          count: files[key]?.length || 0,
          files: files[key]?.map(f => ({
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
            fieldname: f.fieldname
          }))
        })) : [],
        formData: formData,
        formDataKeys: Object.keys(formData || {}),
        formDataEntries: formData ? Object.entries(formData).map(([key, value]) => ({
          key,
          value,
          type: typeof value
        })) : []
      };
      
      console.log('🔍 DEBUG: Complete form data debug info:', JSON.stringify(debugInfo, null, 2));
      
      const apiResponse = ApiResponseBuilder.success(debugInfo);
      response.status(200).json(apiResponse);
    } catch (error) {
      console.error('❌ ERROR in debugFormData:', error);
      const apiResponse = ApiResponseBuilder.error(
        'DEBUG_ERROR',
        error.message
      );
      response.status(500).json(apiResponse);
    }
  }

  @Post('upload-with-employee')
  @ApiOperation({ summary: 'Create employee with image upload (Admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 }
      ],
      {
        fileFilter: (req, file, callback) => {
          console.log('🔍 DEBUG: HR Employee Upload with Creation FileInterceptor called');
          console.log('  File object:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
          callback(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB for employee photos
        }
      }
    )
  )
  @ApiResponse({ status: 201, description: 'Employee created with image successfully' })
  @ApiResponse({ status: 400, description: 'Validation or file error' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('ADMIN', 'EDITOR')
  async createEmployeeWithImage(
    @Res() response: Response,
    @UploadedFiles() files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] },
    @Body() employeeData: any,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      console.log('🔍 DEBUG: HR Employee Upload with Creation Controller');
      console.log('=====================================');
      
      console.log('📋 Request Details:');
      console.log('  User ID:', user.id);
      console.log('  Files received:', files);
      console.log('  Employee data received:', employeeData);
      console.log('  Employee data type:', typeof employeeData);
      console.log('  Employee data keys:', Object.keys(employeeData || {}));
      
      // Log each field individually to debug parsing issues
      if (employeeData) {
        Object.entries(employeeData).forEach(([key, value]) => {
          console.log(`  ${key}:`, value, `(type: ${typeof value})`);
        });
      }
      
      console.log('=====================================');
      
      // Check for file in any of the accepted fields
      const file = files?.image?.[0] || files?.file?.[0];
      
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const employee = await this.employeeService.createEmployeeWithImage(file, employeeData, user.id);
      const apiResponse = ApiResponseBuilder.success(employee);
      response.status(201).json(apiResponse);
    } catch (error) {
      console.error('❌ ERROR in createEmployeeWithImage:', error);
      console.error('  Error message:', error.message);
      console.error('  Error stack:', error.stack);
      
      const status = error.status || 400;
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_CREATE_WITH_IMAGE_ERROR',
        error.message
      );
      response.status(status).json(apiResponse);
    }
  }

  @Put(':id/photo')
  @ApiOperation({ summary: 'Replace employee photo (Admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 }
      ],
      {
        fileFilter: (req, file, callback) => {
          console.log('🔍 DEBUG: HR Employee Photo Replace FileInterceptor called');
          console.log('  File object:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
          callback(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB for employee photos
        }
      }
    )
  )
  @ApiResponse({ status: 200, description: 'Employee photo replaced successfully' })
  @ApiResponse({ status: 400, description: 'Validation or file error' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @Roles('ADMIN', 'EDITOR')
  async replaceEmployeePhoto(
    @Res() response: Response,
    @Param('id') id: string,
    @UploadedFiles() files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      // Check for file in any of the accepted fields
      const file = files?.image?.[0] || files?.file?.[0];
      
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const employee = await this.employeeService.uploadEmployeePhoto(id, file, user.id);
      const apiResponse = ApiResponseBuilder.success(employee);
      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.status || 400;
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_PHOTO_REPLACE_ERROR',
        error.message
      );
      response.status(status).json(apiResponse);
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export employees (Admin)' })
  @ApiResponse({ status: 200, description: 'Employees exported successfully' })
  @ApiQuery({ name: 'format', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async exportEmployees(
    @Res() response: Response,
    @Query() query: EmployeeQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<void> {
    try {
      const buffer = await this.employeeService.exportEmployees(query, format);
      
      const contentType = format === 'json' ? 'application/json' : 'application/octet-stream';
      const filename = `employees-export.${format}`;
      
      response.setHeader('Content-Type', contentType);
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.send(buffer);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_EXPORT_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import employees (Admin)' })
  @ApiResponse({ status: 201, description: 'Employees imported successfully' })
  @ApiResponse({ status: 400, description: 'Import failed' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 }
      ],
      {
        fileFilter: (req, file, callback) => {
          console.log('🔍 DEBUG: HR Employee Import FileInterceptor called');
          console.log('  File object:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
          callback(null, true);
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB for employee import files
        }
      }
    )
  )
  @Roles('ADMIN')
  async importEmployees(
    @Res() response: Response,
    @UploadedFiles() files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      // Check for file in any of the accepted fields
      const file = files?.image?.[0] || files?.file?.[0];
      
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const result = await this.employeeService.importEmployees(file, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_IMPORT_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Post('bulk-activate')
  @ApiOperation({ summary: 'Bulk activate employees (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk activation completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkActivate(
    @Res() response: Response,
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.employeeService.bulkActivate(data.ids, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_BULK_ACTIVATION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('bulk-deactivate')
  @ApiOperation({ summary: 'Bulk deactivate employees (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk deactivation completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkDeactivate(
    @Res() response: Response,
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.employeeService.bulkDeactivate(data.ids, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_BULK_DEACTIVATION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete employees (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk deletion completed' })
  @Roles('ADMIN')
  async bulkDelete(
    @Res() response: Response,
    @Body() data: { ids: string[] }
  ): Promise<void> {
    try {
      const result = await this.employeeService.bulkDelete(data.ids);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_BULK_DELETION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('bulk-remove-photos')
  @ApiOperation({ summary: 'Bulk remove employee photos (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk photo removal completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkRemovePhotos(
    @Res() response: Response,
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.employeeService.bulkRemovePhotos(data.ids, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_BULK_PHOTO_REMOVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id/photo/analytics')
  @ApiOperation({ summary: 'Get employee photo analytics (Admin)' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeePhotoAnalytics(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('dateFrom') dateFrom?: Date,
    @Query('dateTo') dateTo?: Date
  ): Promise<void> {
    try {
      const analytics = await this.employeeService.getEmployeePhotoAnalytics(id, dateFrom, dateTo);
      
      const apiResponse = ApiResponseBuilder.success(analytics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_PHOTO_ANALYTICS_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('photos/active')
  @ApiOperation({ summary: 'Get active employee photos only (Admin)' })
  @ApiResponse({ status: 200, description: 'Active employee photos retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async getActiveEmployeePhotos(
    @Res() response: Response,
    @Query() query?: EmployeeQueryDto
  ): Promise<void> {
    try {
      const result = await this.employeeService.getActiveEmployeePhotos(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_ACTIVE_PHOTOS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('positions/summary')
  @ApiOperation({ summary: 'Get position summary with employee counts (Admin)' })
  @ApiResponse({ status: 200, description: 'Position summary retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getPositionSummary(
    @Res() response: Response
  ): Promise<void> {
    try {
      const summary = await this.employeeService.getPositionSummary();
      
      const apiResponse = ApiResponseBuilder.success(summary);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'POSITION_SUMMARY_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('with-details-and-photos')
  @ApiOperation({ summary: 'Get all employees with detailed information and photos (Admin)' })
  @ApiResponse({ status: 200, description: 'Employees with details and photos retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeesWithDetailsAndPhotos(
    @Res() response: Response,
    @Query() query?: EmployeeQueryDto
  ): Promise<void> {
    try {
      const result = await this.employeeService.getEmployeesWithDetailsAndPhotos(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEES_WITH_DETAILS_AND_PHOTOS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('position/:position/with-details-and-photos')
  @ApiOperation({ summary: 'Get employees by position with detailed information and photos (Admin)' })
  @ApiResponse({ status: 200, description: 'Employees by position with details and photos retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Position name' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeesByPositionWithDetailsAndPhotos(
    @Res() response: Response,
    @Param('position') position: string,
    @Query() query?: EmployeeQueryDto
  ): Promise<void> {
    try {
      const result = await this.employeeService.getEmployeesByPositionWithDetailsAndPhotos(position, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEES_BY_POSITION_WITH_DETAILS_AND_PHOTOS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id/with-details-and-photo')
  @ApiOperation({ summary: 'Get employee with detailed information and photo (Admin)' })
  @ApiResponse({ status: 200, description: 'Employee with details and photo retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @Roles('ADMIN', 'EDITOR')
  async getEmployeeWithDetailsAndPhoto(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const employee = await this.employeeService.getEmployeeDetailsWithPhoto(id);
      
      const apiResponse = ApiResponseBuilder.success(employee);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_WITH_DETAILS_AND_PHOTO_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('homepage/all')
  @ApiOperation({ summary: 'Get all homepage employees (up and down sections) (Admin)' })
  @ApiResponse({ status: 200, description: 'Homepage employees retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getHomepageEmployees(
    @Res() response: Response
  ): Promise<void> {
    try {
      const result = await this.employeeService.getHomepageEmployees();
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HOMEPAGE_EMPLOYEES_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('homepage/up')
  @ApiOperation({ summary: 'Get employees for homepage top section (Admin)' })
  @ApiResponse({ status: 200, description: 'Up section employees retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async getHomepageUpSection(
    @Res() response: Response,
    @Query() query?: EmployeeQueryDto
  ): Promise<void> {
    try {
      const result = await this.employeeService.getEmployeesByHomepageSection('up', query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HOMEPAGE_UP_SECTION_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('homepage/down')
  @ApiOperation({ summary: 'Get employees for homepage bottom section (Admin)' })
  @ApiResponse({ status: 200, description: 'Down section employees retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async getHomepageDownSection(
    @Res() response: Response,
    @Query() query?: EmployeeQueryDto
  ): Promise<void> {
    try {
      const result = await this.employeeService.getEmployeesByHomepageSection('down', query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HOMEPAGE_DOWN_SECTION_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }
} 