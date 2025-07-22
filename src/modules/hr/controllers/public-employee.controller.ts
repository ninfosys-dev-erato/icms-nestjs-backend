import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam 
} from '@nestjs/swagger';
import { EmployeeService } from '../services/employee.service';
import { 
  EmployeeQueryDto, 
  EmployeeResponseDto 
} from '../dto/hr.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Public Employees')
@Controller('employees')
export class PublicEmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  async getAllEmployees(
    @Res() response: Response,
    @Query() query?: EmployeeQueryDto
  ): Promise<void> {
    try {
      const result = await this.employeeService.getActiveEmployees(query);
      
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
  @ApiOperation({ summary: 'Search employees' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  async searchEmployees(
    @Res() response: Response,
    @Query('q') searchTerm: string,
    @Query() query?: EmployeeQueryDto
  ): Promise<void> {
    try {
      const result = await this.employeeService.searchEmployees(searchTerm, query);
      
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
  @ApiOperation({ summary: 'Get employees by department' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
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
  @ApiOperation({ summary: 'Get employees by position' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Position name' })
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
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
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
} 