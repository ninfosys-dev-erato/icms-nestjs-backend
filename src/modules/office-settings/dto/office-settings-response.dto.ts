import { TranslatableEntityDto } from './create-office-settings.dto';

export class OfficeSettingsResponseDto {
  id: string;
  directorate: TranslatableEntityDto;
  officeName: TranslatableEntityDto;
  officeAddress: TranslatableEntityDto;
  backgroundPhoto?: string;
  email: string;
  phoneNumber: TranslatableEntityDto;
  xLink?: string;
  mapIframe?: string;
  website?: string;
  youtube?: string;
  createdAt: Date;
  updatedAt: Date;
} 