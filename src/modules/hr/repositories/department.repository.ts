import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Department } from '../entities/department.entity';
import { 
  CreateDepartmentDto, 
  UpdateDepartmentDto, 
  DepartmentQueryDto,
  HRStatistics,
  PaginationInfo
} from '../dto/hr.dto';

@Injectable()
export class DepartmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Department | null> {
    return this.prisma.department.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        employees: true,
        departmentHead: true
      }
    });
  }

  async findAll(query: DepartmentQueryDto): Promise<{
    data: Department[];
    pagination: PaginationInfo;
  }> {
    let page = Number(query.page) || 1;
    let limit = Number(query.limit) || 10;
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.parentId !== undefined) {
      where.parentId = query.parentId;
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo);
      }
    }

    const orderBy: any = {};
    if (query.sort) {
      orderBy[query.sort] = query.order || 'desc';
    } else {
      orderBy.order = 'asc';
    }

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          parent: true,
          children: true,
          employees: true,
          departmentHead: true
        }
      }),
      this.prisma.department.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async findActive(query: DepartmentQueryDto): Promise<{
    data: Department[];
    pagination: PaginationInfo;
  }> {
    let page = Number(query.page) || 1;
    let limit = Number(query.limit) || 10;
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    const orderBy = { order: 'asc' as const };

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          parent: true,
          children: true,
          employees: true,
          departmentHead: true
        }
      }),
      this.prisma.department.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async search(searchTerm: string, query: DepartmentQueryDto): Promise<{
    data: Department[];
    pagination: PaginationInfo;
  }> {
    let page = Number(query.page) || 1;
    let limit = Number(query.limit) || 10;
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        {
          departmentName: {
            path: ['en'],
            string_contains: searchTerm
          }
        },
        {
          departmentName: {
            path: ['ne'],
            string_contains: searchTerm
          }
        }
      ]
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const orderBy = { order: 'asc' as const };

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          parent: true,
          children: true,
          employees: true,
          departmentHead: true
        }
      }),
      this.prisma.department.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async create(data: CreateDepartmentDto, userId: string): Promise<Department> {
    return this.prisma.department.create({
      data: {
        departmentName: data.departmentName as any,
        parentId: data.parentId,
        departmentHeadId: data.departmentHeadId,
        order: data.order || 0,
        isActive: data.isActive ?? true
      },
      include: {
        parent: true,
        children: true,
        employees: true,
        departmentHead: true
      }
    });
  }

  async update(id: string, data: UpdateDepartmentDto, userId: string): Promise<Department> {
    return this.prisma.department.update({
      where: { id },
      data: {
        departmentName: data.departmentName as any,
        parentId: data.parentId,
        departmentHeadId: data.departmentHeadId,
        order: data.order,
        isActive: data.isActive
      },
      include: {
        parent: true,
        children: true,
        employees: true,
        departmentHead: true
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.department.delete({
      where: { id }
    });
  }

  async getHierarchy(): Promise<Department[]> {
    return this.prisma.department.findMany({
      where: { isActive: true },
      include: {
        parent: true,
        children: true,
        employees: true,
        departmentHead: true
      },
      orderBy: { order: 'asc' }
    });
  }

  async getHierarchyWithEmployeesOrdered(): Promise<Department[]> {
    return this.prisma.department.findMany({
      where: { isActive: true },
      include: {
        parent: true,
        children: true,
        employees: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        departmentHead: true
      },
      orderBy: { order: 'asc' }
    });
  }

  async getStatistics(): Promise<HRStatistics> {
    const [totalDepartments, activeDepartments, totalEmployees, activeEmployees, byDepartment, withHead, withoutHead] = await Promise.all([
      this.prisma.department.count(),
      this.prisma.department.count({ where: { isActive: true } }),
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { isActive: true } }),
      this.prisma.employee.groupBy({
        by: ['departmentId'],
        _count: { departmentId: true }
      }),
      this.prisma.department.count({ where: { departmentHeadId: { not: null } } }),
      this.prisma.department.count({ where: { departmentHeadId: null } })
    ]);

    const employeesByDepartment: Record<string, number> = {};
    byDepartment.forEach(item => {
      employeesByDepartment[item.departmentId] = item._count.departmentId;
    });

    return {
      totalDepartments,
      activeDepartments,
      totalEmployees,
      activeEmployees,
      employeesByDepartment,
      departmentsWithHead: withHead,
      departmentsWithoutHead: withoutHead
    };
  }

  async isDepartmentActive(id: string): Promise<boolean> {
    const department = await this.prisma.department.findUnique({
      where: { id },
      select: {
        isActive: true
      }
    });

    return department?.isActive || false;
  }
} 