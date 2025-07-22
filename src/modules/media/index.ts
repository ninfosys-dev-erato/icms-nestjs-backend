// Module
export { MediaModule } from './media.module';

// Controllers
export { MediaController } from './controllers/media.controller';
export { AdminMediaController } from './controllers/admin-media.controller';
export { MediaAlbumController } from './controllers/media-album.controller';

// Services
export { MediaService } from './services/media.service';
export { MediaAlbumService } from './services/media-album.service';
export { S3Service } from './services/s3.service';

// Repositories
export { MediaRepository } from './repositories/media.repository';
export { MediaAlbumRepository } from './repositories/media-album.repository';

// DTOs
export {
  CreateMediaDto,
  UpdateMediaDto,
  MediaResponseDto,
  MediaQueryDto,
  BulkCreateMediaDto,
  BulkUpdateMediaDto,
  MediaStatistics,
  MediaProcessingOptions,
  CreateMediaAlbumDto,
  UpdateMediaAlbumDto,
  MediaAlbumResponseDto,
  AlbumStatistics,
  ValidationResult,
  ValidationError,
  BulkOperationResult,
  ImportResult,
  ExportResult,
  UploadResult,
  FileMetadata,
  TranslatableEntityDto,
  MediaType
} from './dto/media.dto';

// Entities
export { Media, MediaType as MediaTypeEnum } from './entities/media.entity';
export { MediaAlbum } from './entities/media-album.entity'; 