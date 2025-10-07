import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateAuditLogDto,
  AuditLogQueryDto,
  PaginatedAuditLogResult,
  AuditLogStatistics,
} from '../dto/auth.dto';

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuditLogDto): Promise<any> {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async findByUser(userId: string, query: AuditLogQueryDto): Promise<PaginatedAuditLogResult> {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs as any,
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

  async findByAction(action: string, query: AuditLogQueryDto): Promise<PaginatedAuditLogResult> {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where = { action };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs as any,
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

  async findByResource(resource: string, query: AuditLogQueryDto): Promise<PaginatedAuditLogResult> {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where = { resource };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs as any,
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

  async search(searchTerm: string, query: AuditLogQueryDto): Promise<PaginatedAuditLogResult> {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { action: { contains: searchTerm, mode: 'insensitive' as any } },
        { resource: { contains: searchTerm, mode: 'insensitive' as any } },
        { resourceId: { contains: searchTerm, mode: 'insensitive' as any } },
      ],
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where: where as any }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs as any,
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

  async getStatistics(): Promise<AuditLogStatistics> {
    const [
      total,
      byAction,
      byResource,
      byUser,
      byDate,
    ] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['resource'],
        _count: { resource: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        _count: { userId: true },
      }),
      this.prisma.auditLog.groupBy({
        by: ['createdAt'],
        _count: { createdAt: true },
      }),
    ]);

    const actionCounts = byAction.reduce((acc: any, item: any) => {
      acc[item.action] = item._count.action;
      return acc;
    }, {});

    const resourceCounts = byResource.reduce((acc: any, item: any) => {
      acc[item.resource] = item._count.resource;
      return acc;
    }, {});

    const userCounts = byUser.reduce((acc: any, item: any) => {
      acc[item.userId || 'anonymous'] = item._count.userId;
      return acc;
    }, {});

    const dateCounts = byDate.reduce((acc: any, item: any) => {
      const date = item.createdAt.toISOString().split('T')[0];
      acc[date] = item._count.createdAt;
      return acc;
    }, {});

    return {
      total,
      byAction: actionCounts,
      byResource: resourceCounts,
      byUser: userCounts,
      byDate: dateCounts,
    };
  }

  async cleanOldLogs(daysOld: number): Promise<void> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
} 