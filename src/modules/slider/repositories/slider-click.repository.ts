import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateSliderClickDto } from '../dto/slider.dto';

@Injectable()
export class SliderClickRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSliderClickDto): Promise<any> {
    return this.prisma.sliderClick.create({
      data: {
        sliderId: data.sliderId,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
      include: {
        slider: true,
        user: true,
      },
    });
  }

  async findBySliderId(sliderId: string): Promise<any[]> {
    return this.prisma.sliderClick.findMany({
      where: { sliderId },
      include: {
        slider: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClickCount(sliderId: string): Promise<number> {
    return this.prisma.sliderClick.count({
      where: { sliderId },
    });
  }

  async getRecentClicks(limit: number = 10): Promise<any[]> {
    return this.prisma.sliderClick.findMany({
      take: limit,
      include: {
        slider: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClicksByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    return this.prisma.sliderClick.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        slider: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClicksBySliderAndDateRange(
    sliderId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    return this.prisma.sliderClick.findMany({
      where: {
        sliderId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        slider: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClicksByDate(sliderId: string): Promise<Record<string, number>> {
    const clicks = await this.prisma.sliderClick.findMany({
      where: { sliderId },
      select: {
        createdAt: true,
      },
    });

    const clicksByDate: Record<string, number> = {};
    clicks.forEach((click) => {
      const date = click.createdAt.toISOString().split('T')[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });

    return clicksByDate;
  }
} 