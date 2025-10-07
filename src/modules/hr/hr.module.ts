import { Module } from '@nestjs/common';
import { PublicDepartmentController } from './controllers/public-department.controller';
import { PublicEmployeeController } from './controllers/public-employee.controller';
import { AdminDepartmentController } from './controllers/admin-department.controller';
import { AdminEmployeeController } from './controllers/admin-employee.controller';
import { AdminHRController } from './controllers/admin-hr.controller';
import { DepartmentService } from './services/department.service';
import { EmployeeService } from './services/employee.service';
import { DepartmentRepository } from './repositories/department.repository';
import { EmployeeRepository } from './repositories/employee.repository';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [
    PublicDepartmentController,
    PublicEmployeeController,
    AdminDepartmentController,
    AdminEmployeeController,
    AdminHRController
  ],
  providers: [
    DepartmentService,
    EmployeeService,
    DepartmentRepository,
    EmployeeRepository
  ],
  exports: [
    DepartmentService,
    EmployeeService,
    DepartmentRepository,
    EmployeeRepository
  ],
})
export class HRModule {} 