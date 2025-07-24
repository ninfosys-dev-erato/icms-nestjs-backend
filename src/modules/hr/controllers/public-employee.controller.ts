import { Controller, Get, Param, Query } from '@nestjs/common';
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
    @Query() query?: EmployeeQueryDto
  ) {
    const result = await this.employeeService.getActiveEmployees(query);
    return result;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search employees' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'search', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  async searchEmployees(
    @Query() query: EmployeeQueryDto
  ) {
    if (!query.search) {
      throw new Error('Search term is required');
    }

    const result = await this.employeeService.searchEmployees(query.search, query);
    return result;
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get employees by department' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  async getEmployeesByDepartment(
    @Param('departmentId') departmentId: string
  ) {
    const employees = await this.employeeService.getEmployeesByDepartment(departmentId);
    return employees;
  }

  @Get('position/:position')
  @ApiOperation({ summary: 'Get employees by position' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Position name' })
  async getEmployeesByPosition(
    @Param('position') position: string
  ) {
    const employees = await this.employeeService.getEmployeesByPosition(position);
    return employees;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  async getEmployeeById(
    @Param('id') id: string
  ) {
    const employee = await this.employeeService.getEmployeeById(id);
    return employee;
  }
} 