import { Module } from '@nestjs/common';
import { MediaController } from './controllers/media.controller';
import { AdminMediaController } from './controllers/admin-media.controller';
import { MediaAlbumController } from './controllers/media-album.controller';
import { MediaService } from './services/media.service';
import { MediaAlbumService } from './services/media-album.service';
import { S3Service } from './services/s3.service';
import { MediaRepository } from './repositories/media.repository';
import { MediaAlbumRepository } from './repositories/media-album.repository';

@Module({
  controllers: [
    MediaController,
    AdminMediaController,
    MediaAlbumController,
  ],
  providers: [
    MediaService,
    MediaAlbumService,
    S3Service,
    MediaRepository,
    MediaAlbumRepository,
  ],
  exports: [MediaService, MediaAlbumService, S3Service],
})
export class MediaModule {} 