import { TranslatableEntity } from '../../../common/types/translatable.entity';

export class FAQ {
  id: string;
  question: TranslatableEntity;
  answer: TranslatableEntity;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 