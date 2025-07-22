import { TranslatableEntity } from '../../../common/types/translatable.entity';

export class Department {
  id: string;
  departmentName: any; // JsonValue from Prisma
  parentId?: string;
  departmentHeadId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (for future implementation)
  parent?: Department;
  children?: Department[];
  employees?: any[];
  departmentHead?: any;
} 