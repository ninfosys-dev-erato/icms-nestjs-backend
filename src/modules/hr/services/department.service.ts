import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DepartmentRepository } from '../repositories/department.repository';
import { MediaService } from '../../media/services/media.service';
import { 
  CreateDepartmentDto, 
  UpdateDepartmentDto, 
  DepartmentQueryDto,
  DepartmentResponseDto,
  HRStatistics,
  ValidationResult,
  ValidationError,
  BulkOperationResult,
  PaginationInfo
} from '../dto/hr.dto';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly mediaService: MediaService
  ) {}

  async getDepartmentById(id: string): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.transformToResponseDto(department);
  }

  async getAllDepartments(query: DepartmentQueryDto): Promise<{
    data: DepartmentResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.departmentRepository.findAll(query);
    
    return {
      data: result.data.map(department => this.transformToResponseDto(department)),
      pagination: result.pagination
    };
  }

  async getActiveDepartments(query: DepartmentQueryDto): Promise<{
    data: DepartmentResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.departmentRepository.findActive(query);
    
    return {
      data: result.data.map(department => this.transformToResponseDto(department)),
      pagination: result.pagination
    };
  }

  async searchDepartments(searchTerm: string, query: DepartmentQueryDto): Promise<{
    data: DepartmentResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.departmentRepository.search(searchTerm, query);
    
    return {
      data: result.data.map(department => this.transformToResponseDto(department)),
      pagination: result.pagination
    };
  }

  async createDepartment(data: CreateDepartmentDto, userId: string): Promise<DepartmentResponseDto> {
    const validation = await this.validateDepartment(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    const department = await this.departmentRepository.create(data, userId);
    return this.transformToResponseDto(department);
  }

  async updateDepartment(id: string, data: UpdateDepartmentDto, userId: string): Promise<DepartmentResponseDto> {
    const existingDepartment = await this.departmentRepository.findById(id);
    if (!existingDepartment) {
      throw new NotFoundException('Department not found');
    }

    const validation = await this.validateDepartment(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    const department = await this.departmentRepository.update(id, data, userId);
    return this.transformToResponseDto(department);
  }

  async deleteDepartment(id: string): Promise<void> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check if department has employees
    if (department.employees && department.employees.length > 0) {
      throw new BadRequestException('Cannot delete department with employees');
    }

    // Check if department has children
    if (department.children && department.children.length > 0) {
      throw new BadRequestException('Cannot delete department with child departments');
    }

    await this.departmentRepository.delete(id);
  }

  async getDepartmentHierarchy(): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentRepository.getHierarchy();
    return departments.map(department => this.transformToResponseDto(department));
  }

  async getDepartmentsWithEmployeesOrdered(): Promise<{
    data: Array<{
      id: string;
      departmentName: any;
      parentId?: string;
      order: number;
      isActive: boolean;
      employees: Array<{
        id: string;
        name: any;
        position: any;
        order: number;
        mobileNumber?: string;
        telephone?: string;
        email?: string;
        roomNumber?: string;
        photoMediaId?: string;
        photoPresignedUrl?: string;
        isActive: boolean;
      }>;
    }>;
  }> {
    const departments = await this.departmentRepository.getHierarchyWithEmployeesOrdered();
    
    // Process departments and generate presigned URLs for employee photos
    const processedData = await Promise.all(
      departments.map(async (department) => {
        // Process employees and generate presigned URLs for photos
        const processedEmployees = await Promise.all(
          department.employees
            .filter(emp => emp.isActive)
            .sort((a, b) => a.order - b.order)
            .map(async (employee) => {
              let photoPresignedUrl: string | undefined;
              
              // Generate presigned URL for employee photo if available
              if (employee.photoMediaId) {
                try {
                  // Use the media service to generate presigned URL directly with media ID
                  photoPresignedUrl = await this.mediaService.generatePresignedUrl(employee.photoMediaId, 'get', 86400);
                } catch (error) {
                  console.warn(`Failed to generate presigned URL for employee photo ${employee.photoMediaId}: ${error.message}`);
                }
              }
              
              return {
                id: employee.id,
                name: employee.name,
                position: employee.position,
                order: employee.order,
                mobileNumber: employee.mobileNumber,
                telephone: employee.telephone,
                email: employee.email,
                roomNumber: employee.roomNumber,
                photoMediaId: employee.photoMediaId,
                photoPresignedUrl,
                isActive: employee.isActive
              };
            })
        );
        
        return {
          id: department.id,
          departmentName: department.departmentName,
          parentId: department.parentId,
          order: department.order,
          isActive: department.isActive,
          employees: processedEmployees
        };
      })
    );
    
    return {
      data: processedData
    };
  }

  async validateDepartment(data: CreateDepartmentDto | UpdateDepartmentDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate department name
    if ('departmentName' in data && data.departmentName) {
      if (!data.departmentName.en || !data.departmentName.ne) {
        errors.push({
          field: 'departmentName',
          message: 'Department name must be provided in both English and Nepali',
          code: 'INVALID_DEPARTMENT_NAME'
        });
      }
    }

    // Validate order
    if ('order' in data && data.order !== undefined) {
      if (data.order < 0) {
        errors.push({
          field: 'order',
          message: 'Order must be a non-negative number',
          code: 'INVALID_ORDER'
        });
      }
    }

    // Validate parent department exists
    if ('parentId' in data && data.parentId) {
      const parentDepartment = await this.departmentRepository.findById(data.parentId);
      if (!parentDepartment) {
        errors.push({
          field: 'parentId',
          message: 'Parent department not found',
          code: 'PARENT_DEPARTMENT_NOT_FOUND'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async getHRStatistics(): Promise<HRStatistics> {
    return this.departmentRepository.getStatistics();
  }

  async exportDepartments(query: DepartmentQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer> {
    const result = await this.departmentRepository.findAll(query);
    
    if (format === 'json') {
      return Buffer.from(JSON.stringify(result.data, null, 2));
    }
    
    // TODO: Implement CSV and PDF export
    throw new BadRequestException('Export format not implemented yet');
  }

  async importDepartments(file: Express.Multer.File, userId: string): Promise<{ success: number; failed: number; errors: string[] }> {
    // TODO: Implement import functionality
    throw new BadRequestException('Import functionality not implemented yet');
  }

  async bulkActivate(ids: string[], userId: string): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await this.updateDepartment(id, { isActive: true }, userId);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to activate department ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkDeactivate(ids: string[], userId: string): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await this.updateDepartment(id, { isActive: false }, userId);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to deactivate department ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await this.deleteDepartment(id);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to delete department ${id}: ${error.message}`);
      }
    }

    return result;
  }

  private transformToResponseDto(department: any): DepartmentResponseDto {
    return {
      id: department.id,
      departmentName: department.departmentName,
      parentId: department.parentId,
      departmentHeadId: department.departmentHeadId,
      order: department.order,
      isActive: department.isActive,
      parent: department.parent ? this.transformToResponseDto(department.parent) : undefined,
      children: department.children ? department.children.map((child: any) => this.transformToResponseDto(child)) : undefined,
      employees: department.employees,
      departmentHead: department.departmentHead,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt
    };
  }
} 