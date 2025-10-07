// Module
export { OfficeSettingsModule } from './office-settings.module';

// Controllers
export { OfficeSettingsController } from './controllers/office-settings.controller';

// Services
export { OfficeSettingsService } from './services/office-settings.service';

// Repositories
export { OfficeSettingsRepository } from './repositories/office-settings.repository';

// DTOs
export { CreateOfficeSettingsDto, TranslatableEntityDto } from './dto/create-office-settings.dto';
export { UpdateOfficeSettingsDto } from './dto/update-office-settings.dto';
export { OfficeSettingsResponseDto } from './dto/office-settings-response.dto';

// Entities
export { OfficeSettings } from './entities/office-settings.entity';

// Types
export type { ValidationResult, ValidationError, SEOOfficeSettings } from './services/office-settings.service'; 