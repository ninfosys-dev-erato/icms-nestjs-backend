import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  SessionStatistics,
} from '../dto/auth.dto';

type UserSession = any;

@Injectable()
export class UserSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserSession | null> {
    return (this.prisma as any).userSession.findUnique({
      where: { id },
    });
  }

  async findByToken(token: string): Promise<UserSession | null> {
    return (this.prisma as any).userSession.findUnique({
      where: { token },
    });
  }

  async findByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    return (this.prisma as any).userSession.findUnique({
      where: { refreshToken },
    });
  }

  async findActiveByUser(userId: string): Promise<UserSession[]> {
    return (this.prisma as any).userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async create(data: CreateSessionDto): Promise<UserSession> {
    return (this.prisma as any).userSession.create({
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

  async update(id: string, data: UpdateSessionDto): Promise<UserSession> {
    return (this.prisma as any).userSession.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).userSession.delete({
      where: { id },
    });
  }

  async deactivate(id: string): Promise<void> {
    await (this.prisma as any).userSession.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async deactivateAllUserSessions(userId: string): Promise<void> {
    await (this.prisma as any).userSession.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  async cleanExpiredSessions(): Promise<void> {
    await (this.prisma as any).userSession.deleteMany({
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
      (this.prisma as any).userSession.count(),
      (this.prisma as any).userSession.count({
        where: {
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
      }),
      (this.prisma as any).userSession.count({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      }),
      (this.prisma as any).userSession.groupBy({
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