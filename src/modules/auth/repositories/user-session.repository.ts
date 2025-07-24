import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  SessionStatistics,
} from '../dto/auth.dto';

@Injectable()
export class UserSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<any> {
    return this.prisma.userSession.findUnique({
      where: { id },
    });
  }

  async findByToken(token: string): Promise<any> {
    return this.prisma.userSession.findUnique({
      where: { token },
    });
  }

  async findByRefreshToken(refreshToken: string): Promise<any> {
    return this.prisma.userSession.findUnique({
      where: { refreshToken },
    });
  }

  async findActiveByUser(userId: string): Promise<any[]> {
    return this.prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async create(data: CreateSessionDto): Promise<any> {
    return this.prisma.userSession.create({
      data: {
        userId: data.userId,
        token: data.token,
        refreshToken: data.refreshToken,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiresAt: data.expiresAt,
      },
    });
  }

  async update(id: string, data: UpdateSessionDto): Promise<any> {
    return this.prisma.userSession.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userSession.delete({
      where: { id },
    });
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  async cleanExpiredSessions(): Promise<void> {
    await this.prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async getStatistics(): Promise<SessionStatistics> {
    const [
      total,
      active,
      expired,
      byUser,
    ] = await Promise.all([
      this.prisma.userSession.count(),
      this.prisma.userSession.count({
        where: {
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
      }),
      this.prisma.userSession.count({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      }),
      this.prisma.userSession.groupBy({
        by: ['userId'],
        _count: { userId: true },
      }),
    ]);

    const userCounts = byUser.reduce((acc, item) => {
      acc[item.userId] = item._count.userId;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      expired,
      byUser: userCounts,
    };
  }
} 