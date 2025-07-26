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
  @UseInterceptors(FileInterceptor('file'))
  @Roles('ADMIN')
  async importEmployees(
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
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
} 