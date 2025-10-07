import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileStorageFactory } from './file-storage.factory';
import { S3StorageService } from './providers/s3-storage.service';
import { LocalStorageService } from './providers/local-storage.service';
import { BackblazeB2StorageService } from './providers/backblaze-b2-storage.service';
import { FileStorageService } from './interfaces/file-storage.interface';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    S3StorageService,
    LocalStorageService,
    BackblazeB2StorageService,
    FileStorageFactory,
    {
      provide: FileStorageService,
      useFactory: (factory: FileStorageFactory) => factory.getStorageService(),
      inject: [FileStorageFactory],
    },
  ],
  exports: [FileStorageService, FileStorageFactory],
})
export class FileStorageModule {} 