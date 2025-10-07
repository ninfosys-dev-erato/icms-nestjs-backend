import { TranslatableEntity } from '../../../common/types/translatable.entity';

export class DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  changeLog?: TranslatableEntity;
  createdAt: Date;
  
  // Relations (for future implementation)
  document?: any;
} 