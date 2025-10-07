import { Module } from '@nestjs/common';
import { PublicHeaderController } from './controllers/public-header.controller';
import { AdminHeaderController } from './controllers/admin-header.controller';
import { HeaderConfigService } from './services/header-config.service';
import { HeaderConfigRepository } from './repositories/header-config.repository';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  controllers: [
    PublicHeaderController,
    AdminHeaderController
  ],
  providers: [
    HeaderConfigService,
    HeaderConfigRepository
  ],
  exports: [
    HeaderConfigService,
    HeaderConfigRepository
  ],
})
export class HeaderModule {} 