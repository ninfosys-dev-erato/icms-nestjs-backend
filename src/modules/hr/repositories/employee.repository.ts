import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Employee } from '../entities/employee.entity';
import { 
  CreateEmployeeDto, 
  UpdateEmployeeDto, 
  EmployeeQueryDto,
  PaginationInfo
} from '../dto/hr.dto';

// Type for Prisma employee with relations
type EmployeeWithRelations = any; // Using any for now since Prisma types don't include new fields

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<EmployeeWithRelations | null> {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        photo: true
      }
    });
  }

  async findAll(query: EmployeeQueryDto): Promise<{
    data: Employee[];
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

    if (query.departmentId !== undefined) {
      where.departmentId = query.departmentId;
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
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          department: true,
          photo: true
        }
      }),
      this.prisma.employee.count({ where })
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

  async findActive(query: EmployeeQueryDto): Promise<{
    data: Employee[];
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
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          department: true,
          photo: true
        }
      }),
      this.prisma.employee.count({ where })
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

  async search(searchTerm: string, query: EmployeeQueryDto): Promise<{
    data: Employee[];
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
          name: {
            path: ['en'],
            string_contains: searchTerm
          }
        },
        {
          name: {
            path: ['ne'],
            string_contains: searchTerm
          }
        },
        {
          position: {
            path: ['en'],
            string_contains: searchTerm
          }
        },
        {
          position: {
            path: ['ne'],
            string_contains: searchTerm
          }
        },
        {
          email: {
            contains: searchTerm
          }
        }
      ]
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.departmentId !== undefined) {
      where.departmentId = query.departmentId;
    }

    const orderBy = { order: 'asc' as const };

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          department: true,
          photo: true
        }
      }),
      this.prisma.employee.count({ where })
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

  async create(data: CreateEmployeeDto, userId: string): Promise<Employee> {
    return this.prisma.employee.create({
      data: {
        name: data.name as any,
        departmentId: data.departmentId,
        position: data.position as any,
        order: data.order || 0,
        mobileNumber: data.mobileNumber,
        telephone: data.telephone,
        email: data.email,
        roomNumber: data.roomNumber,
        photoMediaId: data.photoMediaId,
        isActive: data.isActive ?? true,
        showUpInHomepage: data.showUpInHomepage ?? false,
        showDownInHomepage: data.showDownInHomepage ?? false
      },
      include: {
        department: true,
        photo: true
      }
    });
  }

  async update(id: string, data: UpdateEmployeeDto, userId: string): Promise<Employee> {
    return this.prisma.employee.update({
      where: { id },
      data: {
        name: data.name as any,
        departmentId: data.departmentId,
        position: data.position as any,
        order: data.order,
        mobileNumber: data.mobileNumber,
        telephone: data.telephone,
        email: data.email,
        roomNumber: data.roomNumber,
        photoMediaId: (data as any).photoMediaId,
        isActive: data.isActive,
        showUpInHomepage: data.showUpInHomepage,
        showDownInHomepage: data.showDownInHomepage
      },
      include: {
        department: true,
        photo: true
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.employee.delete({
      where: { id }
    });
  }

  async findByDepartment(departmentId: string): Promise<Employee[]> {
    return this.prisma.employee.findMany({
      where: { 
        departmentId,
        isActive: true
      },
      include: {
        department: true,
        photo: true
      },
      orderBy: { order: 'asc' }
    });
  }

  async findByPosition(position: string): Promise<Employee[]> {
    return this.prisma.employee.findMany({
      where: {
        position: {
          path: ['en'],
          string_contains: position
        },
        isActive: true
      },
      include: {
        department: true,
        photo: true
      },
      orderBy: { order: 'asc' }
    });
  }

  async isEmployeeActive(id: string): Promise<boolean> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        isActive: true
      }
    });

    return employee?.isActive || false;
  }

  async findHomepageEmployees(): Promise<{
    upSection: Employee[];
    downSection: Employee[];
  }> {
    const [upSection, downSection] = await Promise.all([
      this.prisma.employee.findMany({
        where: {
          isActive: true,
          showUpInHomepage: true
        },
        include: {
          department: true,
          photo: true
        },
        orderBy: { order: 'asc' }
      }),
      this.prisma.employee.findMany({
        where: {
          isActive: true,
          showDownInHomepage: true
        },
        include: {
          department: true,
          photo: true
        },
        orderBy: { order: 'asc' }
      })
    ]);

    return { upSection, downSection };
  }

  async findEmployeesByHomepageSection(section: 'up' | 'down', query?: EmployeeQueryDto): Promise<{
    data: Employee[];
    pagination: PaginationInfo;
  }> {
    let page = Number(query?.page) || 1;
    let limit = Number(query?.limit) || 10;
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      [section === 'up' ? 'showUpInHomepage' : 'showDownInHomepage']: true
    };

    if (query?.departmentId) {
      where.departmentId = query.departmentId;
    }

    const orderBy = { order: 'asc' as const };

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          department: true,
          photo: true
        }
      }),
      this.prisma.employee.count({ where })
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
} 