// Module
export { OfficeDescriptionModule } from './office-description.module';

// Controllers
export { OfficeDescriptionController } from './controllers/office-description.controller';
export { AdminOfficeDescriptionController } from './controllers/admin-office-description.controller';

// Services
export { OfficeDescriptionService } from './services/office-description.service';

// Repositories
export { OfficeDescriptionRepository } from './repositories/office-description.repository';

// DTOs
export {
  CreateOfficeDescriptionDto,
  UpdateOfficeDescriptionDto,
  OfficeDescriptionResponseDto,
  OfficeDescriptionQueryDto,
  OfficeDescriptionType,
  BulkCreateOfficeDescriptionDto,
  BulkUpdateOfficeDescriptionDto,
  BulkUpdateItemDto,
  OfficeDescriptionStatistics,
  ValidationResult,
  ValidationError,
  ImportResult,
  ExportResult,
  TranslatableEntityDto,
} from './dto/office-description.dto';

// Entities
export { OfficeDescription } from './entities/office-description.entity'; 