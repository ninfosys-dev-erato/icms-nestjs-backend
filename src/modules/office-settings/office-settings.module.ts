import { Module } from '@nestjs/common';

import { OfficeSettingsController } from './controllers/office-settings.controller';
import { OfficeSettingsService } from './services/office-settings.service';
import { OfficeSettingsRepository } from './repositories/office-settings.repository';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [OfficeSettingsController],
  providers: [OfficeSettingsService, OfficeSettingsRepository],
  exports: [OfficeSettingsService],
})
export class OfficeSettingsModule {} 