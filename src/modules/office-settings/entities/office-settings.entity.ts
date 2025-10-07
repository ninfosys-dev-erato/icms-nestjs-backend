import { TranslatableEntity } from '../../../common/types/translatable.entity';

export class OfficeSettings {
  id: string;
  directorate: TranslatableEntity;
  officeName: TranslatableEntity;
  officeAddress: TranslatableEntity;
  backgroundPhotoId?: string;
  email: string;
  phoneNumber: TranslatableEntity;
  xLink?: string;
  mapIframe?: string;
  website?: string;
  youtube?: string;
  createdAt: Date;
  updatedAt: Date;
} 