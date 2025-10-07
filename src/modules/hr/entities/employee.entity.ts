import { TranslatableEntity } from '../../../common/types/translatable.entity';

export class Employee {
  id: string;
  name: any; // JsonValue from Prisma
  departmentId: string;
  position: any; // JsonValue from Prisma
  order: number;
  mobileNumber?: string;
  telephone?: string;
  email?: string;
  roomNumber?: string;
  photoMediaId?: string;
  isActive: boolean;
  showUpInHomepage: boolean;
  showDownInHomepage: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (for future implementation)
  department?: any;
  photo?: any;
} 