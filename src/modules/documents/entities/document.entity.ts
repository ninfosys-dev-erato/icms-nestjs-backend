import { TranslatableEntity } from '../../../common/types/translatable.entity';

export enum DocumentType {
  PDF = 'PDF',
  DOC = 'DOC',
  DOCX = 'DOCX',
  XLS = 'XLS',
  XLSX = 'XLSX',
  PPT = 'PPT',
  PPTX = 'PPTX',
  TXT = 'TXT',
  RTF = 'RTF',
  CSV = 'CSV',
  ZIP = 'ZIP',
  RAR = 'RAR',
  OTHER = 'OTHER'
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  EXPIRED = 'EXPIRED'
}

export enum DocumentCategory {
  OFFICIAL = 'OFFICIAL',
  REPORT = 'REPORT',
  FORM = 'FORM',
  POLICY = 'POLICY',
  PROCEDURE = 'PROCEDURE',
  GUIDELINE = 'GUIDELINE',
  NOTICE = 'NOTICE',
  CIRCULAR = 'CIRCULAR',
  OTHER = 'OTHER'
}

export class Document {
  id: string;
  title: TranslatableEntity;
  description?: TranslatableEntity;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  category: DocumentCategory;
  status: DocumentStatus;
  documentNumber?: string;
  version?: string;
  publishDate?: Date;
  expiryDate?: Date;
  tags?: string[];
  isPublic: boolean;
  requiresAuth: boolean;
  order: number;
  isActive: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (for future implementation)
  downloads?: any[];
  versions?: any[];
} 