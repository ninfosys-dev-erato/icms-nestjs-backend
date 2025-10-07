import { MenuItemType } from '@prisma/client';

// Re-export for use in tests
export { MenuItemType };

export interface MenuItem {
  id: string;
  menuId: string;
  parentId?: string;
  title: any;
  description?: any;
  url?: string;
  target: string;
  icon?: string;
  order: number;
  isActive: boolean;
  isPublished: boolean;
  itemType: MenuItemType;
  itemId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  menu?: any;
  parent?: any;
  children?: any[];
  createdBy?: any;
  updatedBy?: any;
} 