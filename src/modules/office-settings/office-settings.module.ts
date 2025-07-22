import { Module } from '@nestjs/common';

import { OfficeSettingsController } from './controllers/office-settings.controller';
import { OfficeSettingsService } from './services/office-settings.service';
import { OfficeSettingsRepository } from './repositories/office-settings.repository';

@Module({
  controllers: [OfficeSettingsController],
  providers: [OfficeSettingsService, OfficeSettingsRepository],
  exports: [OfficeSettingsService],
})
export class OfficeSettingsModule {} 