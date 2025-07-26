import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OfficeSettingsRepository } from '../repositories/office-settings.repository';
import { CreateOfficeSettingsDto } from '../dto/create-office-settings.dto';
import { UpdateOfficeSettingsDto } from '../dto/update-office-settings.dto';
import { OfficeSettingsResponseDto } from '../dto/office-settings-response.dto';
import { TranslatableEntityHelper } from '../../../common/types/translatable.entity';

// Re-export DTOs for use in tests
export { CreateOfficeSettingsDto, UpdateOfficeSettingsDto, OfficeSettingsResponseDto };

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface SEOOfficeSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  socialMedia: {
    x?: string;
    youtube?: string;
  };
}

@Injectable()
export class OfficeSettingsService {
  constructor(private readonly officeSettingsRepository: OfficeSettingsRepository) {}

  async getOfficeSettings(lang?: string): Promise<OfficeSettingsResponseDto> {
    const settings = await this.officeSettingsRepository.findFirst();
    
    if (!settings) {
      throw new NotFoundException('Office settings not found');
    }

    return this.transformToResponseDto(settings, lang);
  }

  async getOfficeSettingsById(id: string): Promise<OfficeSettingsResponseDto> {
    const settings = await this.officeSettingsRepository.findById(id);
    
    if (!settings) {
      throw new NotFoundException('Office settings not found');
    }

    return this.transformToResponseDto(settings);
  }

  async createOfficeSettings(data: CreateOfficeSettingsDto): Promise<OfficeSettingsResponseDto> {
    // Defensive check for required fields
    if (!data.directorate || !data.officeName || !data.officeAddress || !data.phoneNumber || !data.email) {
      throw new BadRequestException('Missing required fields');
    }
    const validation = await this.validateOfficeSettings(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed');
    }

    const settings = await this.officeSettingsRepository.create(data);
    return this.transformToResponseDto(settings);
  }

  async updateOfficeSettings(id: string, data: UpdateOfficeSettingsDto): Promise<OfficeSettingsResponseDto> {
    // Check if settings exist first
    const existingSettings = await this.officeSettingsRepository.findById(id);
    if (!existingSettings) {
      throw new NotFoundException('Office settings not found');
    }

    const validation = await this.validateOfficeSettings(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed');
    }

    const settings = await this.officeSettingsRepository.update(id, data);
    return this.transformToResponseDto(settings);
  }

  async upsertOfficeSettings(data: CreateOfficeSettingsDto): Promise<OfficeSettingsResponseDto> {
    const validation = await this.validateOfficeSettings(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed');
    }

    const settings = await this.officeSettingsRepository.upsert(data);
    return this.transformToResponseDto(settings);
  }

  async deleteOfficeSettings(id: string): Promise<void> {
    const exists = await this.officeSettingsRepository.findById(id);
    if (!exists) {
      throw new NotFoundException('Office settings not found');
    }

    await this.officeSettingsRepository.delete(id);
  }

  async validateOfficeSettings(data: CreateOfficeSettingsDto | UpdateOfficeSettingsDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate email format
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Email must be a valid email address',
        code: 'INVALID_EMAIL',
      });
    }

    // Validate URLs
    if (data.xLink && !this.isValidUrl(data.xLink)) {
      errors.push({
        field: 'xLink',
        message: 'X Link must be a valid URL',
        code: 'INVALID_URL',
      });
    }

    if (data.website && !this.isValidUrl(data.website)) {
      errors.push({
        field: 'website',
        message: 'Website must be a valid URL',
        code: 'INVALID_URL',
      });
    }

    if (data.youtube && !this.isValidUrl(data.youtube)) {
      errors.push({
        field: 'youtube',
        message: 'YouTube link must be a valid URL',
        code: 'INVALID_URL',
      });
    }

    // Validate translatable fields
    if ('directorate' in data && data.directorate) {
      const directorateErrors = TranslatableEntityHelper.validate(data.directorate, {
        en: { required: true, minLength: 1, maxLength: 500 },
        ne: { required: true, minLength: 1, maxLength: 500 },
      });
      directorateErrors.forEach(error => {
        errors.push({
          field: 'directorate',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    if ('officeName' in data && data.officeName) {
      const officeNameErrors = TranslatableEntityHelper.validate(data.officeName, {
        en: { required: true, minLength: 1, maxLength: 500 },
        ne: { required: true, minLength: 1, maxLength: 500 },
      });
      officeNameErrors.forEach(error => {
        errors.push({
          field: 'officeName',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    if ('officeAddress' in data && data.officeAddress) {
      const officeAddressErrors = TranslatableEntityHelper.validate(data.officeAddress, {
        en: { required: true, minLength: 1, maxLength: 1000 },
        ne: { required: true, minLength: 1, maxLength: 1000 },
      });
      officeAddressErrors.forEach(error => {
        errors.push({
          field: 'officeAddress',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    if ('phoneNumber' in data && data.phoneNumber) {
      const phoneNumberErrors = TranslatableEntityHelper.validate(data.phoneNumber, {
        en: { required: true, minLength: 1, maxLength: 50 },
        ne: { required: true, minLength: 1, maxLength: 50 },
      });
      phoneNumberErrors.forEach(error => {
        errors.push({
          field: 'phoneNumber',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getOfficeSettingsForSEO(): Promise<SEOOfficeSettings> {
    const settings = await this.officeSettingsRepository.findFirst();
    
    if (!settings) {
      throw new NotFoundException('Office settings not found');
    }

    return {
      name: TranslatableEntityHelper.getValue(settings.officeName, 'en'),
      description: `Official website of ${TranslatableEntityHelper.getValue(settings.officeName, 'en')}`,
      address: TranslatableEntityHelper.getValue(settings.officeAddress, 'en'),
      phone: TranslatableEntityHelper.getValue(settings.phoneNumber, 'en'),
      email: settings.email,
      website: settings.website,
      socialMedia: {
        x: settings.xLink,
        youtube: settings.youtube,
      },
    };
  }

  async updateBackgroundPhoto(id: string, file: Express.Multer.File): Promise<OfficeSettingsResponseDto> {
    // Check if settings exist first
    const existingSettings = await this.officeSettingsRepository.findById(id);
    if (!existingSettings) {
      throw new NotFoundException('Office settings not found');
    }

    // Validate file
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, and WebP are allowed');
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB');
    }

    // TODO: Upload to S3 and get URL
    const photoUrl = `uploads/background-photos/${file.filename}`;

    const settings = await this.officeSettingsRepository.update(id, {
      backgroundPhoto: photoUrl,
    });

    return this.transformToResponseDto(settings);
  }

  async removeBackgroundPhoto(id: string): Promise<OfficeSettingsResponseDto> {
    const existingSettings = await this.officeSettingsRepository.findById(id);
    if (!existingSettings) {
      throw new NotFoundException('Office settings not found');
    }

    const settings = await this.officeSettingsRepository.update(id, {
      backgroundPhoto: null,
    });

    return this.transformToResponseDto(settings);
  }

  private transformToResponseDto(settings: any, lang?: string): OfficeSettingsResponseDto {
    return {
      id: settings.id,
      directorate: settings.directorate,
      officeName: settings.officeName,
      officeAddress: settings.officeAddress,
      backgroundPhoto: settings.backgroundPhoto,
      email: settings.email,
      phoneNumber: settings.phoneNumber,
      xLink: settings.xLink,
      mapIframe: settings.mapIframe,
      website: settings.website,
      youtube: settings.youtube,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
} 