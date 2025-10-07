import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  CreateLoginAttemptDto,
  LoginAttemptStatistics,
} from '../dto/auth.dto';

@Injectable()
export class LoginAttemptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateLoginAttemptDto): Promise<any> {
    return this.prisma.loginAttempt.create({
      data: {
        email: data.email,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        success: data.success,
        failureReason: data.failureReason,
      },
    });
  }

  async findByEmail(email: string, limit?: number): Promise<any[]> {
    return this.prisma.loginAttempt.findMany({
      where: { email },
      take: limit,
      orderBy: { attemptedAt: 'desc' },
    });
  }

  async findByIP(ipAddress: string, limit?: number): Promise<any[]> {
    return this.prisma.loginAttempt.findMany({
      where: { ipAddress },
      take: limit,
      orderBy: { attemptedAt: 'desc' },
    });
  }

  async getFailedAttemptsCount(email: string, timeWindow: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - timeWindow);
    
    return this.prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        attemptedAt: {
          gte: cutoffTime,
        },
      },
    });
  }

  async getIPFailedAttemptsCount(ipAddress: string, timeWindow: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - timeWindow);
    
    return this.prisma.loginAttempt.count({
      where: {
        ipAddress,
        success: false,
        attemptedAt: {
          gte: cutoffTime,
        },
      },
    });
  }

  async cleanOldAttempts(daysOld: number): Promise<void> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    await this.prisma.loginAttempt.deleteMany({
      where: {
        attemptedAt: {
          lt: cutoffDate,
        },
      },
    });
  }

  async getStatistics(): Promise<LoginAttemptStatistics> {
    const [
      total,
      successful,
      failed,
      byEmail,
      byIP,
    ] = await Promise.all([
      this.prisma.loginAttempt.count(),
      this.prisma.loginAttempt.count({ where: { success: true } }),
      this.prisma.loginAttempt.count({ where: { success: false } }),
      this.prisma.loginAttempt.groupBy({
        by: ['email'],
        _count: { email: true },
      }),
      this.prisma.loginAttempt.groupBy({
        by: ['ipAddress'],
        _count: { ipAddress: true },
      }),
    ]);

    const emailCounts = byEmail.reduce((acc: any, item: any) => {
      acc[item.email] = item._count.email;
      return acc;
    }, {});

    const ipCounts = byIP.reduce((acc: any, item: any) => {
      acc[item.ipAddress] = item._count.ipAddress;
      return acc;
    }, {});

    return {
      total,
      successful,
      failed,
      byEmail: emailCounts,
      byIP: ipCounts,
    };
  }
} 