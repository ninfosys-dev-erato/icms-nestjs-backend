import { Module } from '@nestjs/common';
import { PublicDepartmentController } from './controllers/public-department.controller';
import { PublicEmployeeController } from './controllers/public-employee.controller';
import { AdminDepartmentController } from './controllers/admin-department.controller';
import { AdminEmployeeController } from './controllers/admin-employee.controller';
import { DepartmentService } from './services/department.service';
import { EmployeeService } from './services/employee.service';
import { DepartmentRepository } from './repositories/department.repository';
import { EmployeeRepository } from './repositories/employee.repository';

@Module({
  controllers: [
    PublicDepartmentController,
    PublicEmployeeController,
    AdminDepartmentController,
    AdminEmployeeController
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