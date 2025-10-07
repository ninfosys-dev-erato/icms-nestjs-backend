import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStorageService } from './interfaces/file-storage.interface';
import { S3StorageService } from './providers/s3-storage.service';
import { LocalStorageService } from './providers/local-storage.service';
import { BackblazeB2StorageService } from './providers/backblaze-b2-storage.service';

@Injectable()
export class FileStorageFactory {
  private readonly logger = new Logger(FileStorageFactory.name);
  private storageService: FileStorageService;

  constructor(
    private readonly configService: ConfigService,
    private readonly s3StorageService: S3StorageService,
    private readonly localStorageService: LocalStorageService,
    private readonly backblazeB2StorageService: BackblazeB2StorageService,
  ) {
    this.initializeStorageService();
  }

  getStorageService(): FileStorageService {
    return this.storageService;
  }

  private initializeStorageService(): void {
    const provider = this.configService.get<string>('STORAGE_PROVIDER', 'local');
    
    console.log('🔧 FileStorageFactory: Initializing storage service');
    console.log('  STORAGE_PROVIDER:', provider);
    console.log('  Available providers: s3, backblaze-b2, local');
    
    switch (provider) {
      case 's3':
        this.storageService = this.s3StorageService;
        this.logger.log('Using S3 storage service');
        console.log('✅ FileStorageFactory: Using S3 storage service');
        break;
      case 'backblaze-b2':
        this.storageService = this.backblazeB2StorageService;
        this.logger.log('Using Backblaze B2 storage service');
        console.log('✅ FileStorageFactory: Using Backblaze B2 storage service');
        break;
      case 'local':
        this.storageService = this.localStorageService;
        this.logger.log('Using local storage service');
        console.log('⚠️ FileStorageFactory: Using LOCAL storage service (not Backblaze!)');
        break;
      default:
        this.logger.warn(`Unknown storage provider '${provider}', falling back to local storage`);
        this.storageService = this.localStorageService;
        console.log('❌ FileStorageFactory: Unknown provider, falling back to LOCAL storage');
        break;
    }
  }
} 