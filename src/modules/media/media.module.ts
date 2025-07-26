import { Module } from '@nestjs/common';
import { FileStorageModule } from '../../common/services/file-storage/file-storage.module';
import { MediaController } from './controllers/media.controller';
import { AdminMediaController } from './controllers/admin-media.controller';
import { MediaAlbumController } from './controllers/media-album.controller';
import { MediaService } from './services/media.service';
import { MediaAlbumService } from './services/media-album.service';
import { MediaRepository } from './repositories/media.repository';
import { MediaAlbumRepository } from './repositories/media-album.repository';

@Module({
  imports: [FileStorageModule],
  controllers: [
    MediaController,
    AdminMediaController,
    MediaAlbumController,
  ],
  providers: [
    MediaService,
    MediaAlbumService,
    MediaRepository,
    MediaAlbumRepository,
  ],
  exports: [MediaService, MediaAlbumService],
})
export class MediaModule {} 