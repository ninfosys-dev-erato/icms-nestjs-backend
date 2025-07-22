import { TranslatableEntity } from '../../../common/types/translatable.entity';

export class ImportantLink {
  id: string;
  linkTitle: TranslatableEntity;
  linkUrl: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 