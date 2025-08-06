import { Module } from '@nestjs/common';
import { FileStorageModule } from '../../common/services/file-storage/file-storage.module';
import { MediaController } from './controllers/media.controller';
import { MediaService } from './services/media.service';
import { MediaRepository } from './repositories/media.repository';

@Module({
  imports: [FileStorageModule],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaService, MediaRepository],
})
export class MediaModule {} 