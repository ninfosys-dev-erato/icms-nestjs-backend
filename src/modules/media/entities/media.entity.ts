import { TranslatableEntity } from '../../../common/types/translatable.entity';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT'
}

export class Media {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  mediaType: MediaType;
  altText?: TranslatableEntity;
  caption?: TranslatableEntity;
  width?: number;
  height?: number;
  duration?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (for future implementation)
  albums?: any[];
  sliders?: any[]; // Slider relation
} 