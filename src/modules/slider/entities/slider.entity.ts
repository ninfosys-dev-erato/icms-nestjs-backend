import { TranslatableEntity } from '../../../common/types/translatable.entity';

export class Slider {
  id: string;
  position: number;
  displayTime: number;
  title?: any; // JsonValue from Prisma
  mediaId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (for future implementation)
  media?: any;
} 