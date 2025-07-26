import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { OfficeDescription, OfficeDescriptionType } from '../entities/office-description.entity';
import { CreateOfficeDescriptionDto } from '../dto/office-description.dto';
import { UpdateOfficeDescriptionDto } from '../dto/office-description.dto';

@Injectable()
export class OfficeDescriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<OfficeDescription | null> {
    const description = await this.prisma.officeDescription.findUnique({
      where: { id },
    });

    if (!description) return null;

    return {
      id: description.id,
      officeDescriptionType: description.officeDescriptionType as OfficeDescriptionType,
      content: description.content as any,
      createdAt: description.createdAt,
      updatedAt: description.updatedAt,
    };
  }

  async findByType(type: OfficeDescriptionType): Promise<OfficeDescription | null> {
    const description = await this.prisma.officeDescription.findFirst({
      where: { officeDescriptionType: type },
    });

    if (!description) return null;

    return {
      id: description.id,
      officeDescriptionType: description.officeDescriptionType as OfficeDescriptionType,
      content: description.content as any,
      createdAt: description.createdAt,
      updatedAt: description.updatedAt,
    };
  }

  async findAll(): Promise<OfficeDescription[]> {
    const descriptions = await this.prisma.officeDescription.findMany({
      orderBy: { officeDescriptionType: 'asc' },
    });

    return descriptions.map(description => ({
      id: description.id,
      officeDescriptionType: description.officeDescriptionType as OfficeDescriptionType,
      content: description.content as any,
      createdAt: description.createdAt,
      updatedAt: description.updatedAt,
    }));
  }

  async create(data: CreateOfficeDescriptionDto): Promise<OfficeDescription> {
    const description = await this.prisma.officeDescription.create({
      data: {
        officeDescriptionType: data.officeDescriptionType,
        content: data.content as any,
      },
    });

    return {
      id: description.id,
      officeDescriptionType: description.officeDescriptionType as OfficeDescriptionType,
      content: description.content as any,
      createdAt: description.createdAt,
      updatedAt: description.updatedAt,
    };
  }

  async update(id: string, data: UpdateOfficeDescriptionDto): Promise<OfficeDescription> {
    // First check if the record exists
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Office description not found');
    }

    const description = await this.prisma.officeDescription.update({
      where: { id },
      data: {
        ...(data.officeDescriptionType && { officeDescriptionType: data.officeDescriptionType }),
        ...(data.content && { content: data.content as any }),
      },
    });

    return {
      id: description.id,
      officeDescriptionType: description.officeDescriptionType as OfficeDescriptionType,
      content: description.content as any,
      createdAt: description.createdAt,
      updatedAt: description.updatedAt,
    };
  }

  async upsertByType(type: OfficeDescriptionType, data: CreateOfficeDescriptionDto): Promise<OfficeDescription> {
    // First check if a description of this type exists
    const existing = await this.findByType(type);
    
    if (existing) {
      // Update existing
      return this.update(existing.id, { content: data.content });
    } else {
      // Create new
      return this.create(data);
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.officeDescription.delete({
      where: { id },
    });
  }

  async deleteByType(type: OfficeDescriptionType): Promise<void> {
    await this.prisma.officeDescription.deleteMany({
      where: { officeDescriptionType: type },
    });
  }

  async existsByType(type: OfficeDescriptionType): Promise<boolean> {
    const count = await this.prisma.officeDescription.count({
      where: { officeDescriptionType: type },
    });
    return count > 0;
  }

  async getStatistics(): Promise<{
    total: number;
    byType: Record<OfficeDescriptionType, number>;
    lastUpdated: Date | null;
  }> {
    const [total, byTypeResult, lastUpdated] = await Promise.all([
      this.prisma.officeDescription.count(),
      this.prisma.officeDescription.groupBy({
        by: ['officeDescriptionType'],
        _count: {
          officeDescriptionType: true,
        },
      }),
      this.prisma.officeDescription.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    const byType: Record<OfficeDescriptionType, number> = {
      [OfficeDescriptionType.INTRODUCTION]: 0,
      [OfficeDescriptionType.OBJECTIVE]: 0,
      [OfficeDescriptionType.WORK_DETAILS]: 0,
      [OfficeDescriptionType.ORGANIZATIONAL_STRUCTURE]: 0,
      [OfficeDescriptionType.DIGITAL_CHARTER]: 0,
      [OfficeDescriptionType.EMPLOYEE_SANCTIONS]: 0,
    };

    byTypeResult.forEach(result => {
      byType[result.officeDescriptionType as OfficeDescriptionType] = result._count.officeDescriptionType;
    });

    return {
      total,
      byType,
      lastUpdated: lastUpdated?.updatedAt || null,
    };
  }

  async bulkCreate(descriptions: CreateOfficeDescriptionDto[]): Promise<OfficeDescription[]> {
    const createdDescriptions = await this.prisma.officeDescription.createMany({
      data: descriptions.map(desc => ({
        officeDescriptionType: desc.officeDescriptionType,
        content: desc.content as any,
      })),
    });

    // Return the created descriptions
    return this.findAll();
  }

  async bulkUpdate(updates: { id: string; content: any }[]): Promise<OfficeDescription[]> {
    const results: OfficeDescription[] = [];

    for (const update of updates) {
      // Check if record exists
      const existing = await this.findById(update.id);
      if (!existing) {
        throw new Error(`Office description with ID ${update.id} not found`);
      }

      const description = await this.prisma.officeDescription.update({
        where: { id: update.id },
        data: {
          content: update.content as any,
        },
      });

      results.push({
        id: description.id,
        officeDescriptionType: description.officeDescriptionType as OfficeDescriptionType,
        content: description.content as any,
        createdAt: description.createdAt,
        updatedAt: description.updatedAt,
      });
    }

    return results;
  }
} 