import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileStorageService } from './interfaces/file-storage.interface';
import { S3StorageService } from './providers/s3-storage.service';
import { LocalStorageService } from './providers/local-storage.service';
import { BackblazeB2StorageService } from './providers/backblaze-b2-storage.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FileStorageService,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('STORAGE_PROVIDER');
        switch (provider) {
          case 's3':
            return new S3StorageService(configService);
          case 'local':
            return new LocalStorageService(configService);
          case 'backblaze-b2':
            return new BackblazeB2StorageService(configService);
          default:
            throw new Error(`Unknown STORAGE_PROVIDER: ${provider}. Supported values: 's3', 'local', 'backblaze-b2'`);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [FileStorageService],
})
export class FileStorageModule {}