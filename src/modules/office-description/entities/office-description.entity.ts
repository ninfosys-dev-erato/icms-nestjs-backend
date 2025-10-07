import { TranslatableEntity } from '../../../common/types/translatable.entity';

export enum OfficeDescriptionType {
  INTRODUCTION = 'INTRODUCTION',
  OBJECTIVE = 'OBJECTIVE',
  WORK_DETAILS = 'WORK_DETAILS',
  ORGANIZATIONAL_STRUCTURE = 'ORGANIZATIONAL_STRUCTURE',
  DIGITAL_CHARTER = 'DIGITAL_CHARTER',
  EMPLOYEE_SANCTIONS = 'EMPLOYEE_SANCTIONS',
}

export class OfficeDescription {
  id: string;
  officeDescriptionType: OfficeDescriptionType;
  content: TranslatableEntity;
  createdAt: Date;
  updatedAt: Date;
} 