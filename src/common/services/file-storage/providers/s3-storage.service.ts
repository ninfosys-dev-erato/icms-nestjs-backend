import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileStorageService, UploadResult, DownloadResult, FileMetadata, FileStorageConfig } from '../interfaces/file-storage.interface';

@Injectable()
export class S3StorageService extends FileStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly config: FileStorageConfig['s3'];

  constructor(private readonly configService: ConfigService) {
    super();
    
    this.config = {
      endpoint: this.configService.get<string>('STORAGE_S3_ENDPOINT'),
      region: this.configService.get<string>('STORAGE_S3_REGION', 'us-east-1'),
      bucket: this.configService.get<string>('STORAGE_S3_BUCKET'),
      accessKeyId: this.configService.get<string>('STORAGE_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('STORAGE_S3_SECRET_ACCESS_KEY'),
      forcePathStyle: this.configService.get<boolean>('STORAGE_S3_FORCE_PATH_STYLE', true),
      signedUrlExpires: this.configService.get<number>('STORAGE_S3_SIGNED_URL_EXPIRES', 86400), // 24 hours default
    };

    if (!this.config.bucket || !this.config.accessKeyId || !this.config.secretAccessKey) {
      throw new Error('S3 configuration is incomplete. Please check environment variables.');
    }

    this.bucket = this.config.bucket;

    // Configure S3 client for AWS S3 or MinIO
    const clientConfig: any = {
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    };

    // If endpoint is provided (MinIO), configure accordingly
    if (this.config.endpoint) {
      clientConfig.endpoint = this.config.endpoint;
      clientConfig.forcePathStyle = this.config.forcePathStyle;
    }

    this.s3Client = new S3Client(clientConfig);
    
    this.logger.log(`S3StorageService initialized with bucket: ${this.bucket}`);
  }

  async upload(
    key: string,
    buffer: Buffer,
    contentType?: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: metadata,
      });

      const result = await this.s3Client.send(command);
      const url = await this.getUrl(key);

      this.logger.debug(`File uploaded successfully: ${key}`);

      return {
        key,
        url,
        size: buffer.length,
        etag: result.ETag?.replace(/"/g, ''),
        mimeType: contentType,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async download(key: string): Promise<DownloadResult> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const result = await this.s3Client.send(command);
      
      if (!result.Body) {
        throw new Error('No file content received');
      }

      const buffer = await this.streamToBuffer(result.Body as any);

      this.logger.debug(`File downloaded successfully: ${key}`);

      return {
        buffer,
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        etag: result.ETag?.replace(/"/g, ''),
      };
    } catch (error) {
      this.logger.error(`Failed to download file ${key}: ${error.message}`);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.debug(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      this.logger.error(`Failed to check file existence ${key}: ${error.message}`);
      throw new Error(`Failed to check file existence: ${error.message}`);
    }
  }

  async getUrl(key: string, expiresIn?: number): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const expires = expiresIn || this.config.signedUrlExpires || 86400; // 24 hours default
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: expires });
      
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate URL for ${key}: ${error.message}`);
      throw new Error(`Failed to generate URL: ${error.message}`);
    }
  }

  async getMetadata(key: string): Promise<FileMetadata> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const result = await this.s3Client.send(command);

      return {
        size: result.ContentLength || 0,
        mimeType: result.ContentType || 'application/octet-stream',
        lastModified: result.LastModified || new Date(),
        etag: result.ETag?.replace(/"/g, ''),
        metadata: result.Metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to get metadata for ${key}: ${error.message}`);
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  async copy(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
      });

      await this.s3Client.send(command);
      this.logger.debug(`File copied from ${sourceKey} to ${destinationKey}`);
    } catch (error) {
      this.logger.error(`Failed to copy file from ${sourceKey} to ${destinationKey}: ${error.message}`);
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  async generatePresignedUrl(
    key: string,
    operation: 'get' | 'put',
    expiresIn?: number
  ): Promise<string> {
    try {
      const expires = expiresIn || this.config.signedUrlExpires || 86400; // 24 hours default
      
      let command;
      if (operation === 'get') {
        command = new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
      } else {
        command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
      }

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: expires });
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${key}: ${error.message}`);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  private async streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
} 