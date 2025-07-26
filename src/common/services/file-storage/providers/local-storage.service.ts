import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileStorageService, UploadResult, DownloadResult, FileMetadata } from '../interfaces/file-storage.interface';

@Injectable()
export class LocalStorageService extends FileStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadPath: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    super();
    
    this.uploadPath = this.configService.get<string>('STORAGE_LOCAL_PATH', './uploads');
    this.baseUrl = this.configService.get<string>('STORAGE_LOCAL_BASE_URL', 'http://localhost:3000/uploads');
    
    this.ensureUploadDirectory();
    this.logger.log(`LocalStorageService initialized with path: ${this.uploadPath}`);
  }

  async upload(
    key: string,
    buffer: Buffer,
    contentType?: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    try {
      const filePath = path.join(this.uploadPath, key);
      const directory = path.dirname(filePath);
      
      // Ensure directory exists
      await fs.mkdir(directory, { recursive: true });
      
      // Write file
      await fs.writeFile(filePath, buffer);
      
      // Save metadata if provided
      if (metadata && Object.keys(metadata).length > 0) {
        const metadataPath = `${filePath}.meta`;
        const metadataContent = {
          contentType,
          metadata,
          uploadedAt: new Date().toISOString(),
        };
        await fs.writeFile(metadataPath, JSON.stringify(metadataContent, null, 2));
      }

      const url = `${this.baseUrl}/${key}`;
      
      this.logger.debug(`File uploaded successfully: ${key}`);

      return {
        key,
        url,
        size: buffer.length,
        mimeType: contentType,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async download(key: string): Promise<DownloadResult> {
    try {
      const filePath = path.join(this.uploadPath, key);
      const buffer = await fs.readFile(filePath);
      
      // Try to get metadata
      let contentType: string | undefined;
      try {
        const metadataPath = `${filePath}.meta`;
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);
        contentType = metadata.contentType;
      } catch {
        // Metadata file doesn't exist, that's okay
      }

      this.logger.debug(`File downloaded successfully: ${key}`);

      return {
        buffer,
        contentType,
        contentLength: buffer.length,
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${key}`);
      }
      this.logger.error(`Failed to download file ${key}: ${error.message}`);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadPath, key);
      const metadataPath = `${filePath}.meta`;
      
      // Delete main file
      await fs.unlink(filePath);
      
      // Delete metadata file if exists
      try {
        await fs.unlink(metadataPath);
      } catch {
        // Metadata file doesn't exist, that's okay
      }

      this.logger.debug(`File deleted successfully: ${key}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${key}`);
      }
      this.logger.error(`Failed to delete file ${key}: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadPath, key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getUrl(key: string, expiresIn?: number): Promise<string> {
    // For local storage, we return a static URL
    // In a real implementation, you might want to generate signed URLs
    return `${this.baseUrl}/${key}`;
  }

  async getMetadata(key: string): Promise<FileMetadata> {
    try {
      const filePath = path.join(this.uploadPath, key);
      const stats = await fs.stat(filePath);
      
      let contentType = 'application/octet-stream';
      let metadata: Record<string, string> = {};
      
      // Try to read metadata file
      try {
        const metadataPath = `${filePath}.meta`;
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        const metaData = JSON.parse(metadataContent);
        contentType = metaData.contentType || contentType;
        metadata = metaData.metadata || {};
      } catch {
        // Metadata file doesn't exist, that's okay
      }

      return {
        size: stats.size,
        mimeType: contentType,
        lastModified: stats.mtime,
        metadata,
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${key}`);
      }
      this.logger.error(`Failed to get metadata for ${key}: ${error.message}`);
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  async copy(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const sourcePath = path.join(this.uploadPath, sourceKey);
      const destinationPath = path.join(this.uploadPath, destinationKey);
      const destinationDir = path.dirname(destinationPath);
      
      // Ensure destination directory exists
      await fs.mkdir(destinationDir, { recursive: true });
      
      // Copy main file
      await fs.copyFile(sourcePath, destinationPath);
      
      // Copy metadata file if exists
      try {
        const sourceMetaPath = `${sourcePath}.meta`;
        const destMetaPath = `${destinationPath}.meta`;
        await fs.copyFile(sourceMetaPath, destMetaPath);
      } catch {
        // Metadata file doesn't exist, that's okay
      }

      this.logger.debug(`File copied from ${sourceKey} to ${destinationKey}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Source file not found: ${sourceKey}`);
      }
      this.logger.error(`Failed to copy file from ${sourceKey} to ${destinationKey}: ${error.message}`);
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  async generatePresignedUrl(
    key: string,
    operation: 'get' | 'put',
    expiresIn?: number
  ): Promise<string> {
    // For local storage, we return a static URL
    // In a real implementation, you might want to implement JWT-based signed URLs
    return `${this.baseUrl}/${key}`;
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
    } catch (error) {
      this.logger.error(`Failed to create upload directory: ${error.message}`);
      throw new Error(`Failed to create upload directory: ${error.message}`);
    }
  }
} 