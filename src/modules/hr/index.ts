export { HRModule } from './hr.module';
export { DepartmentService } from './services/department.service';
export { EmployeeService } from './services/employee.service';
export { DepartmentRepository } from './repositories/department.repository';
export { EmployeeRepository } from './repositories/employee.repository';
export { PublicDepartmentController } from './controllers/public-department.controller';
export { PublicEmployeeController } from './controllers/public-employee.controller';
export { AdminDepartmentController } from './controllers/admin-department.controller';
export { AdminEmployeeController } from './controllers/admin-employee.controller';
export * from './dto/hr.dto';
export * from './entities/department.entity';
export * from './entities/employee.entity';

// Export new homepage-specific types
export { HomepageEmployeeDto, HomepageResponseDto } from './dto/hr.dto'; 