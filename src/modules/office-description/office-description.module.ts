import { Module } from '@nestjs/common';

import { OfficeDescriptionController } from './controllers/office-description.controller';
import { AdminOfficeDescriptionController } from './controllers/admin-office-description.controller';

import { OfficeDescriptionService } from './services/office-description.service';

import { OfficeDescriptionRepository } from './repositories/office-description.repository';

@Module({
  controllers: [
    OfficeDescriptionController,
    AdminOfficeDescriptionController,
  ],
  providers: [
    OfficeDescriptionService,
    OfficeDescriptionRepository,
  ],
  exports: [OfficeDescriptionService],
})
export class OfficeDescriptionModule {} 