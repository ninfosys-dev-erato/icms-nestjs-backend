import { MenuLocation } from '@prisma/client';

// Re-export for use in tests
export { MenuLocation };

export interface Menu {
  id: string;
  name: any;
  description?: any;
  location: MenuLocation;
  isActive: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  menuItems?: any[];
  createdBy?: any;
  updatedBy?: any;
} 