import { MenuLocation } from '@prisma/client';

// Re-export for use in tests
export { MenuLocation };

export interface Menu {
  id: string;
  name: any;
  description?: any;
  location: MenuLocation;
  order: number;
  isActive: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
  categorySlug?: string;
  
  // Relations
  menuItems?: any[];
  createdBy?: any;
  updatedBy?: any;
} 