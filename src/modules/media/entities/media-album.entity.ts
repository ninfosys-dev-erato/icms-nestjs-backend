import { TranslatableEntity } from '../../../common/types/translatable.entity';

export class MediaAlbum {
  id: string;
  name: TranslatableEntity;
  description?: TranslatableEntity;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (for future implementation)
  media?: any[];
} 