import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateSliderViewDto } from '../dto/slider.dto';

@Injectable()
export class SliderViewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSliderViewDto): Promise<any> {
    return this.prisma.sliderView.create({
      data: {
        sliderId: data.sliderId,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        viewDuration: data.viewDuration,
      },
      include: {
        slider: true,
        user: true,
      },
    });
  }

  async findBySliderId(sliderId: string): Promise<any[]> {
    return this.prisma.sliderView.findMany({
      where: { sliderId },
      include: {
        slider: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getViewCount(sliderId: string): Promise<number> {
    return this.prisma.sliderView.count({
      where: { sliderId },
    });
  }

  async getRecentViews(limit: number = 10): Promise<any[]> {
    return this.prisma.sliderView.findMany({
      take: limit,
      include: {
        slider: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getViewsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    return this.prisma.sliderView.findMany({
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

  async getViewsBySliderAndDateRange(
    sliderId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    return this.prisma.sliderView.findMany({
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

  async getViewsByDate(sliderId: string): Promise<Record<string, number>> {
    const views = await this.prisma.sliderView.findMany({
      where: { sliderId },
      select: {
        createdAt: true,
      },
    });

    const viewsByDate: Record<string, number> = {};
    views.forEach((view) => {
      const date = view.createdAt.toISOString().split('T')[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });

    return viewsByDate;
  }

  async getAverageViewDuration(sliderId: string): Promise<number> {
    const result = await this.prisma.sliderView.aggregate({
      where: { 
        sliderId,
        viewDuration: { not: null }
      },
      _avg: {
        viewDuration: true,
      },
    });

    return result._avg.viewDuration || 0;
  }
} 