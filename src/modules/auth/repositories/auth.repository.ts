import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  PaginatedUserResult,
  UserStatistics,
} from '../dto/auth.dto';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<any> {
    return this.prisma.user.findUnique({
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
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
      }),
      this.prisma.user.count({ where }),
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

  async create(data: CreateUserDto): Promise<any> {
    return this.prisma.user.create({
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

  async update(id: string, data: UpdateUserDto): Promise<any> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<any> {
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });
  }

  async updateLastLogin(id: string): Promise<any> {
    // First check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async verifyEmail(token: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
    
    if (!user) {
      throw new Error('Invalid verification token');
    }
    
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });
  }

  async setPasswordResetToken(email: string, token: string, expiresAt: Date): Promise<any> {
    return this.prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
      },
    });
  }

  async resetPassword(token: string, hashedPassword: string): Promise<any> {
    // First find the user by reset token
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Then update the user by ID
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(),
      },
    });
  }

  async getStatistics(): Promise<UserStatistics> {
    const [
      total,
      active,
      verified,
      unverified,
      byRole,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isEmailVerified: true } }),
      this.prisma.user.count({ where: { isEmailVerified: false } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
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
    };
  }

  async findByVerificationToken(token: string): Promise<any> {
    return this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
  }

  async findByResetToken(token: string): Promise<any> {
    return this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });
  }
} 