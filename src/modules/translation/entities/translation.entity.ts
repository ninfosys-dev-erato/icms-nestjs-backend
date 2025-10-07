export interface Translation {
  id: string;
  key: string;
  enValue: string;
  neValue: string;
  groupName: string;
  description?: string;
  isActive: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: any;
  updatedBy?: any;
} 