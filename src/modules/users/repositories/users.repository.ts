import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  PaginatedUserResult,
  UserStatistics,
  UserActivityDto,
  BulkOperationResult,
  ValidationResult,
} from '../dto/users.dto';

type User = any;
type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return (this.prisma as any).user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return (this.prisma as any).user.findUnique({
      where: { email },
    });
  }

  async findAll(query: UserQueryDto): Promise<PaginatedUserResult> {
    const { page = 1, limit = 10, search, role, isActive, isEmailVerified, sort = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isEmailVerified !== undefined) {
      where.isEmailVerified = isEmailVerified;
    }

    const [users, total] = await Promise.all([
      (this.prisma as any).user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
      }),
      (this.prisma as any).user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findActive(query: UserQueryDto): Promise<PaginatedUserResult> {
    return this.findAll({ ...query, isActive: true });
  }

  async findByRole(role: UserRole, query: UserQueryDto): Promise<PaginatedUserResult> {
    return this.findAll({ ...query, role });
  }

  async search(searchTerm: string, query: UserQueryDto): Promise<PaginatedUserResult> {
    return this.findAll({ ...query, search: searchTerm });
  }

  async create(data: CreateUserDto): Promise<User> {
    return (this.prisma as any).user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return (this.prisma as any).user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).user.delete({
      where: { id },
    });
  }

  async activate(id: string): Promise<User> {
    return (this.prisma as any).user.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: string): Promise<User> {
    return (this.prisma as any).user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    return (this.prisma as any).user.update({
      where: { id },
      data: { role },
    });
  }

  async getStatistics(): Promise<UserStatistics> {
    const [
      total,
      active,
      verified,
      unverified,
      byRole,
      recentRegistrations,
      recentLogins,
    ] = await Promise.all([
      (this.prisma as any).user.count(),
      (this.prisma as any).user.count({ where: { isActive: true } }),
      (this.prisma as any).user.count({ where: { isEmailVerified: true } }),
      (this.prisma as any).user.count({ where: { isEmailVerified: false } }),
      (this.prisma as any).user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      (this.prisma as any).user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      (this.prisma as any).user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    const roleCounts = byRole.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {} as Record<UserRole, number>);

    return {
      total,
      active,
      byRole: roleCounts,
      verified,
      unverified,
      recentRegistrations,
      recentLogins,
    };
  }

  async getRecentActivity(limit: number = 10): Promise<UserActivityDto[]> {
    const auditLogs = await (this.prisma as any).auditLog.findMany({
      where: {
        action: {
          in: ['LOGIN', 'LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return auditLogs.map((log: any) => ({
      userId: log.user?.id || 'unknown',
      email: log.user?.email || 'unknown',
      fullName: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown User',
      action: log.action,
      timestamp: log.createdAt,
      ipAddress: log.ipAddress,
    }));
  }

  async bulkActivate(ids: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await (this.prisma as any).user.update({
          where: { id },
          data: { isActive: true },
        });
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to activate user ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkDeactivate(ids: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await (this.prisma as any).user.update({
          where: { id },
          data: { isActive: false },
        });
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to deactivate user ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await (this.prisma as any).user.delete({
          where: { id },
        });
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to delete user ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async validateUser(data: CreateUserDto | UpdateUserDto): Promise<ValidationResult> {
    const errors: any[] = [];

    // Check if email already exists (for create operations)
    if ('email' in data && data.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        errors.push({
          field: 'email',
          message: 'Email already exists',
          code: 'EMAIL_EXISTS',
        });
      }
    }

    // Validate password strength (for create operations)
    if ('password' in data && data.password) {
      if (data.password.length < 8) {
        errors.push({
          field: 'password',
          message: 'Password must be at least 8 characters long',
          code: 'PASSWORD_TOO_SHORT',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
} 