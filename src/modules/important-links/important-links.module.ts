import { Module } from '@nestjs/common';

import { ImportantLinksController } from './controllers/important-links.controller';
import { AdminImportantLinksController } from './controllers/admin-important-links.controller';

import { ImportantLinksService } from './services/important-links.service';

import { ImportantLinksRepository } from './repositories/important-links.repository';

import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [
    ImportantLinksController,
    AdminImportantLinksController,
  ],
  providers: [
    ImportantLinksService,
    ImportantLinksRepository,
  ],
  exports: [ImportantLinksService],
})
export class ImportantLinksModule {} 