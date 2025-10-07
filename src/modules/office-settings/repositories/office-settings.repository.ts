import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { OfficeSettings } from '../entities/office-settings.entity';
import { CreateOfficeSettingsDto } from '../dto/create-office-settings.dto';
import { UpdateOfficeSettingsDto } from '../dto/update-office-settings.dto';

@Injectable()
export class OfficeSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<OfficeSettings | null> {
    const settings = await this.prisma.officeSettings.findUnique({
      where: { id },
    });
    if (!settings) return null;
    return {
      id: settings.id,
      directorate: settings.directorate as any,
      officeName: settings.officeName as any,
      officeAddress: settings.officeAddress as any,
      backgroundPhotoId: settings.backgroundPhotoId,
      email: settings.email,
      phoneNumber: settings.phoneNumber as any,
      xLink: settings.xLink,
      mapIframe: settings.mapIframe,
      website: settings.website,
      youtube: settings.youtube,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  async findFirst(): Promise<OfficeSettings | null> {
    const settings = await this.prisma.officeSettings.findFirst();
    if (!settings) return null;
    return {
      id: settings.id,
      directorate: settings.directorate as any,
      officeName: settings.officeName as any,
      officeAddress: settings.officeAddress as any,
      backgroundPhotoId: settings.backgroundPhotoId,
      email: settings.email,
      phoneNumber: settings.phoneNumber as any,
      xLink: settings.xLink,
      mapIframe: settings.mapIframe,
      website: settings.website,
      youtube: settings.youtube,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  async create(data: CreateOfficeSettingsDto): Promise<OfficeSettings> {
    const settings = await this.prisma.officeSettings.create({
      data: {
        directorate: data.directorate as any,
        officeName: data.officeName as any,
        officeAddress: data.officeAddress as any,
        backgroundPhotoId: data.backgroundPhoto || null,
        email: data.email,
        phoneNumber: data.phoneNumber as any,
        xLink: data.xLink,
        mapIframe: data.mapIframe,
        website: data.website,
        youtube: data.youtube,
      },
    });
    return {
      id: settings.id,
      directorate: settings.directorate as any,
      officeName: settings.officeName as any,
      officeAddress: settings.officeAddress as any,
      backgroundPhotoId: settings.backgroundPhotoId,
      email: settings.email,
      phoneNumber: settings.phoneNumber as any,
      xLink: settings.xLink,
      mapIframe: settings.mapIframe,
      website: settings.website,
      youtube: settings.youtube,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  async update(id: string, data: UpdateOfficeSettingsDto): Promise<OfficeSettings> {
    console.log('🔧 Office Settings Repository: Update called');
    console.log('  ID:', id);
    console.log('  Update data:', data);
    console.log('  backgroundPhoto value:', data.backgroundPhoto);
    console.log('  backgroundPhoto !== undefined:', data.backgroundPhoto !== undefined);
    
    // Add stack trace to see what's calling this method
    console.log('📍 Office Settings Repository: Call stack:');
    const stack = new Error().stack;
    const relevantStack = stack?.split('\n').slice(1, 6).join('\n');
    console.log(relevantStack);

    // Only update backgroundPhotoId if explicitly provided (not just undefined)
    // This prevents accidental clearing of backgroundPhotoId from other update calls
    const updateData = {
      ...(data.directorate && { directorate: data.directorate as any }),
      ...(data.officeName && { officeName: data.officeName as any }),
      ...(data.officeAddress && { officeAddress: data.officeAddress as any }),
      // Only update backgroundPhotoId if the backgroundPhoto field is explicitly provided
      ...(data.hasOwnProperty('backgroundPhoto') && { backgroundPhotoId: data.backgroundPhoto || null }),
      ...(data.email && { email: data.email }),
      ...(data.phoneNumber && { phoneNumber: data.phoneNumber as any }),
      ...(data.xLink !== undefined && { xLink: data.xLink }),
      ...(data.mapIframe !== undefined && { mapIframe: data.mapIframe }),
      ...(data.website !== undefined && { website: data.website }),
      ...(data.youtube !== undefined && { youtube: data.youtube }), 
    };

    console.log('🔧 Office Settings Repository: Prisma update data:', updateData);

    const settings = await this.prisma.officeSettings.update({
      where: { id },
      data: updateData,
    });

    console.log('🔧 Office Settings Repository: Prisma response:', {
      id: settings.id,
      backgroundPhotoId: settings.backgroundPhotoId,
      updatedAt: settings.updatedAt
    });

    return {
      id: settings.id,
      directorate: settings.directorate as any,
      officeName: settings.officeName as any,
      officeAddress: settings.officeAddress as any,
      backgroundPhotoId: settings.backgroundPhotoId,
      email: settings.email,
      phoneNumber: settings.phoneNumber as any,
      xLink: settings.xLink,
      mapIframe: settings.mapIframe,
      website: settings.website,
      youtube: settings.youtube,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  async upsert(data: CreateOfficeSettingsDto): Promise<OfficeSettings> {
    const existingSettings = await this.prisma.officeSettings.findFirst();
    if (existingSettings) {
      const settings = await this.prisma.officeSettings.update({
        where: { id: existingSettings.id },
        data: {
          directorate: data.directorate as any,
          officeName: data.officeName as any,
          officeAddress: data.officeAddress as any,
          backgroundPhotoId: data.backgroundPhoto || null,
          email: data.email,
          phoneNumber: data.phoneNumber as any,
          xLink: data.xLink,
          mapIframe: data.mapIframe,
          website: data.website,
          youtube: data.youtube,
        },
      });
      return {
        id: settings.id,
        directorate: settings.directorate as any,
        officeName: settings.officeName as any,
        officeAddress: settings.officeAddress as any,
        backgroundPhotoId: settings.backgroundPhotoId,
        email: settings.email,
        phoneNumber: settings.phoneNumber as any,
        xLink: settings.xLink,
        mapIframe: settings.mapIframe,
        website: settings.website,
        youtube: settings.youtube,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      };
    } else {
      const settings = await this.prisma.officeSettings.create({
        data: {
          directorate: data.directorate as any,
          officeName: data.officeName as any,
          officeAddress: data.officeAddress as any,
          backgroundPhotoId: data.backgroundPhoto,
          email: data.email,
          phoneNumber: data.phoneNumber as any,
          xLink: data.xLink,
          mapIframe: data.mapIframe,
          website: data.website,
          youtube: data.youtube,
        },
      });
      return {
        id: settings.id,
        directorate: settings.directorate as any,
        officeName: settings.officeName as any,
        officeAddress: settings.officeAddress as any,
        backgroundPhotoId: settings.backgroundPhotoId,
        email: settings.email,
        phoneNumber: settings.phoneNumber as any,
        xLink: settings.xLink,
        mapIframe: settings.mapIframe,
        website: settings.website,
        youtube: settings.youtube,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      };
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.officeSettings.delete({
      where: { id },
    });
  }

  async exists(): Promise<boolean> {
    const count = await this.prisma.officeSettings.count();
    return count > 0;
  }
} 