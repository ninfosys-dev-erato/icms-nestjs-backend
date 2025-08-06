import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileStorageService, UploadResult, DownloadResult, FileMetadata } from '../interfaces/file-storage.interface';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as FormData from 'form-data';

export interface BackblazeB2Config {
  applicationKeyId: string;
  applicationKey: string;
  bucketId: string;
  bucketName: string;
  endpoint: string;
  maxRetries: number;
  retryDelay: number;
}

export interface BackblazeAuthResponse {
  accountId: string;
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  allowed: {
    bucketId: string;
    bucketName: string;
    capabilities: string[];
    namePrefix: string;
  };
}

export interface BackblazeUploadUrlResponse {
  bucketId: string;
  uploadUrl: string;
  authorizationToken: string;
}

@Injectable()
export class BackblazeB2StorageService extends FileStorageService {
  private readonly logger = new Logger(BackblazeB2StorageService.name);
  private readonly config: BackblazeB2Config;
  private readonly httpClient: AxiosInstance;
  
  private authToken: string | null = null;
  private apiUrl: string | null = null;
  private downloadUrl: string | null = null;
  private uploadUrl: string | null = null;
  private uploadAuthToken: string | null = null;
  private lastAuthTime: number = 0;
  private readonly AUTH_EXPIRY_TIME = 23 * 60 * 60 * 1000; // 23 hours in milliseconds

  constructor(private readonly configService: ConfigService) {
    super();
    
    console.log('🔧 BackblazeB2: Loading configuration from environment variables');
    console.log('  BACKBLAZE_APPLICATION_KEY_ID:', this.configService.get<string>('BACKBLAZE_APPLICATION_KEY_ID') ? 'Set' : 'Not set');
    console.log('  BACKBLAZE_APPLICATION_KEY:', this.configService.get<string>('BACKBLAZE_APPLICATION_KEY') ? 'Set' : 'Not set');
    console.log('  BACKBLAZE_BUCKET_ID:', this.configService.get<string>('BACKBLAZE_BUCKET_ID') ? 'Set' : 'Not set');
    console.log('  BACKBLAZE_BUCKET_NAME:', this.configService.get<string>('BACKBLAZE_BUCKET_NAME') ? 'Set' : 'Not set');
    console.log('  BACKBLAZE_ENDPOINT:', this.configService.get<string>('BACKBLAZE_ENDPOINT', 'https://api.backblazeb2.com'));
    
    this.config = {
      applicationKeyId: this.configService.get<string>('BACKBLAZE_APPLICATION_KEY_ID'),
      applicationKey: this.configService.get<string>('BACKBLAZE_APPLICATION_KEY'),
      bucketId: this.configService.get<string>('BACKBLAZE_BUCKET_ID'),
      bucketName: this.configService.get<string>('BACKBLAZE_BUCKET_NAME'),
      endpoint: this.configService.get<string>('BACKBLAZE_ENDPOINT', 'https://api.backblazeb2.com'),
      maxRetries: this.configService.get<number>('BACKBLAZE_MAX_RETRIES', 3),
      retryDelay: this.configService.get<number>('BACKBLAZE_RETRY_DELAY', 1000),
    };

    if (!this.config.applicationKeyId || !this.config.applicationKey || 
        !this.config.bucketId || !this.config.bucketName) {
      console.error('❌ BackblazeB2: Configuration is incomplete!');
      console.error('  Missing required environment variables:');
      if (!this.config.applicationKeyId) console.error('    - BACKBLAZE_APPLICATION_KEY_ID');
      if (!this.config.applicationKey) console.error('    - BACKBLAZE_APPLICATION_KEY');
      if (!this.config.bucketId) console.error('    - BACKBLAZE_BUCKET_ID');
      if (!this.config.bucketName) console.error('    - BACKBLAZE_BUCKET_NAME');
      throw new Error('Backblaze B2 configuration is incomplete. Please check environment variables.');
    }

    console.log('✅ BackblazeB2: Configuration loaded successfully');
    console.log('  Bucket Name:', this.config.bucketName);
    console.log('  Bucket ID:', this.config.bucketId);
    console.log('  Endpoint:', this.config.endpoint);

    this.httpClient = axios.create({
      timeout: 30000, // 30 seconds timeout
      headers: {
        'User-Agent': 'NestJS-BackblazeB2-Client/1.0',
      },
    });

    this.logger.log(`BackblazeB2StorageService initialized with bucket: ${this.config.bucketName}`);
  }

  async upload(
    key: string,
    buffer: Buffer,
    contentType?: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    try {
      console.log('☁️ BackblazeB2: Starting upload');
      console.log('  Key:', key);
      console.log('  Buffer size:', buffer.length);
      console.log('  Content type:', contentType);
      console.log('  Metadata:', metadata);

      await this.ensureAuthenticated();
      console.log('✅ BackblazeB2: Authentication successful');

      await this.ensureUploadUrl();
      console.log('✅ BackblazeB2: Upload URL obtained');

      const formData = new FormData();
      formData.append('file', buffer, {
        filename: key.split('/').pop() || 'file',
        contentType: contentType || 'application/octet-stream',
      });

      // Add metadata as form fields
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          // Skip undefined values - Backblaze doesn't accept them
          if (value !== undefined && value !== null) {
            formData.append(`X-Bz-Info-${key}`, String(value));
          }
        });
        console.log('📋 BackblazeB2: Metadata added to form data');
      }

      console.log('📤 BackblazeB2: Sending upload request...');
      console.log('  Upload URL:', this.uploadUrl);
      console.log('  Upload Auth Token (first 20 chars):', this.uploadAuthToken?.substring(0, 20) + '...');
      console.log('  FormData fields:');
      console.log('    - file:', {
        filename: key.split('/').pop() || 'file',
        contentType: contentType || 'application/octet-stream',
        size: buffer.length
      });
      
      if (metadata) {
        console.log('    - metadata fields:');
        Object.entries(metadata).forEach(([key, value]) => {
          console.log(`      X-Bz-Info-${key}: ${value}`);
        });
      }

      let response;
      try {
        response = await this.retryOperation(async () => {
          const headers = {
            ...formData.getHeaders(),
            'Authorization': this.uploadAuthToken!,
          };
          
          console.log('  Request headers:', headers);
          
          return this.httpClient.post(this.uploadUrl!, formData, { headers });
        });
      } catch (error) {
        console.error('❌ BackblazeB2: Upload with metadata failed, trying without metadata...');
        
        // Try again without metadata
        const simpleFormData = new FormData();
        simpleFormData.append('file', buffer, {
          filename: key.split('/').pop() || 'file',
          contentType: contentType || 'application/octet-stream',
        });
        
        console.log('🔄 BackblazeB2: Retrying upload without metadata...');
        
        response = await this.retryOperation(async () => {
          const headers = {
            ...simpleFormData.getHeaders(),
            'Authorization': this.uploadAuthToken!,
          };
          
          return this.httpClient.post(this.uploadUrl!, simpleFormData, { headers });
        });
      }

      const uploadData = response.data;
      const publicUrl = `${this.downloadUrl}/file/${this.config.bucketName}/${key}`;

      console.log('✅ BackblazeB2: Upload successful!');
      console.log('  Upload data:', uploadData);
      console.log('  Public URL:', publicUrl);

      this.logger.debug(`File uploaded successfully: ${key}`);

      return {
        key,
        url: publicUrl,
        size: buffer.length,
        etag: uploadData.contentSha1,
        mimeType: contentType,
      };
    } catch (error) {
      console.error('❌ BackblazeB2: Upload failed:', error);
      console.error('  Error message:', error.message);
      console.error('  Error response:', error.response?.data);
      console.error('  Error status:', error.response?.status);
      console.error('  Error headers:', error.response?.headers);
      console.error('  Request URL:', this.uploadUrl);
      console.error('  Request method:', 'POST');
      
      // Log the full error response for debugging
      if (error.response?.data) {
        console.error('  Full error response:', JSON.stringify(error.response.data, null, 2));
      }
      
      this.logger.error(`Failed to upload file ${key}: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async download(key: string): Promise<DownloadResult> {
    try {
      await this.ensureAuthenticated();

      const response = await this.retryOperation(async () => {
        return this.httpClient.get(`${this.downloadUrl}/file/${this.config.bucketName}/${key}`, {
          headers: {
            'Authorization': this.authToken!,
          },
          responseType: 'arraybuffer',
        });
      });

      const buffer = Buffer.from(response.data);

      return {
        buffer,
        contentType: response.headers['content-type'],
        contentLength: parseInt(response.headers['content-length'] || '0'),
        etag: response.headers['x-bz-content-sha1'],
      };
    } catch (error) {
      this.logger.error(`Failed to download file ${key}: ${error.message}`);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.ensureAuthenticated();

      // First, get file info to get the file ID
      const fileInfo = await this.getFileInfo(key);
      
      if (!fileInfo) {
        this.logger.warn(`File not found for deletion: ${key}`);
        return;
      }

      await this.retryOperation(async () => {
        return this.httpClient.post(
          `${this.apiUrl}/b2api/v2/b2_delete_file_version`,
          {
            fileName: key,
            fileId: fileInfo.fileId,
          },
          {
            headers: {
              'Authorization': this.authToken!,
            },
          }
        );
      });

      this.logger.debug(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const fileInfo = await this.getFileInfo(key);
      return !!fileInfo;
    } catch (error) {
      this.logger.debug(`File existence check failed for ${key}: ${error.message}`);
      return false;
    }
  }

  async getUrl(key: string, expiresIn?: number): Promise<string> {
    // Backblaze B2 provides public URLs, but we can generate signed URLs if needed
    if (expiresIn) {
      return this.generatePresignedUrl(key, 'get', expiresIn);
    }
    
    await this.ensureAuthenticated();
    return `${this.downloadUrl}/file/${this.config.bucketName}/${key}`;
  }

  async getMetadata(key: string): Promise<FileMetadata> {
    try {
      await this.ensureAuthenticated();

      const fileInfo = await this.getFileInfo(key);
      
      if (!fileInfo) {
        throw new Error('File not found');
      }

      return {
        size: fileInfo.contentLength,
        mimeType: fileInfo.contentType,
        lastModified: new Date(fileInfo.uploadTimestamp),
        etag: fileInfo.contentSha1,
        metadata: fileInfo.fileInfo || {},
      };
    } catch (error) {
      this.logger.error(`Failed to get metadata for file ${key}: ${error.message}`);
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  async copy(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      await this.ensureAuthenticated();

      const fileInfo = await this.getFileInfo(sourceKey);
      
      if (!fileInfo) {
        throw new Error('Source file not found');
      }

      await this.retryOperation(async () => {
        return this.httpClient.post(
          `${this.apiUrl}/b2api/v2/b2_copy_file`,
          {
            sourceFileId: fileInfo.fileId,
            destinationBucketId: this.config.bucketId,
            destinationFileName: destinationKey,
          },
          {
            headers: {
              'Authorization': this.authToken!,
            },
          }
        );
      });

      this.logger.debug(`File copied successfully: ${sourceKey} -> ${destinationKey}`);
    } catch (error) {
      this.logger.error(`Failed to copy file ${sourceKey} to ${destinationKey}: ${error.message}`);
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  async generatePresignedUrl(
    key: string,
    operation: 'get' | 'put',
    expiresIn?: number
  ): Promise<string> {
    try {
      await this.ensureAuthenticated();

      const expirySeconds = Math.floor((expiresIn || 3600) / 1000);

      if (operation === 'get') {
        const response = await this.retryOperation(async () => {
          return this.httpClient.get(
            `${this.apiUrl}/b2api/v2/b2_download_file_by_name`,
            {
              params: {
                bucketName: this.config.bucketName,
                fileName: key,
                b2ContentDisposition: `attachment; filename="${key.split('/').pop()}"`,
              },
              headers: {
                'Authorization': this.authToken!,
              },
            }
          );
        });

        return response.data.downloadUrl;
      } else {
        // For PUT operations, we need to get an upload URL
        await this.ensureUploadUrl();
        return this.uploadUrl!;
      }
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${key}: ${error.message}`);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    const now = Date.now();
    
    if (!this.authToken || !this.apiUrl || !this.downloadUrl || 
        (now - this.lastAuthTime) > this.AUTH_EXPIRY_TIME) {
      await this.authenticate();
    }
  }

  private async ensureUploadUrl(): Promise<void> {
    if (!this.uploadUrl || !this.uploadAuthToken) {
      await this.getUploadUrl();
    }
  }

  private async authenticate(): Promise<void> {
    try {
      const authString = `${this.config.applicationKeyId}:${this.config.applicationKey}`;
      const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

      console.log('🔐 BackblazeB2: Authenticating...');
      console.log('  Endpoint:', this.config.endpoint);
      console.log('  Application Key ID:', this.config.applicationKeyId);

      const response = await this.httpClient.get(
        `${this.config.endpoint}/b2api/v2/b2_authorize_account`,
        {
          headers: {
            'Authorization': authHeader,
          },
        }
      );

      const authData: BackblazeAuthResponse = response.data;
      
      console.log('✅ BackblazeB2: Authentication response received');
      console.log('  Account ID:', authData.accountId);
      console.log('  API URL:', authData.apiUrl);
      console.log('  Download URL:', authData.downloadUrl);
      console.log('  Allowed buckets:', authData.allowed);
      console.log('  Allowed capabilities:', authData.allowed?.capabilities);
      console.log('  Allowed bucket ID:', authData.allowed?.bucketId);
      console.log('  Allowed bucket name:', authData.allowed?.bucketName);
      console.log('  Name prefix:', authData.allowed?.namePrefix);
      
      this.authToken = authData.authorizationToken;
      this.apiUrl = authData.apiUrl;
      this.downloadUrl = authData.downloadUrl;
      this.lastAuthTime = Date.now();

      this.logger.debug('Backblaze B2 authentication successful');
    } catch (error) {
      console.error('❌ BackblazeB2: Authentication failed');
      console.error('  Error message:', error.message);
      console.error('  Error response:', error.response?.data);
      console.error('  Error status:', error.response?.status);
      
      this.logger.error(`Backblaze B2 authentication failed: ${error.message}`);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  private async getUploadUrl(): Promise<void> {
    try {
      console.log('🔍 BackblazeB2: Getting upload URL...');
      console.log('  API URL:', this.apiUrl);
      console.log('  Bucket ID:', this.config.bucketId);
      console.log('  Auth Token (first 20 chars):', this.authToken?.substring(0, 20) + '...');
      
      const requestBody = {
        bucketId: this.config.bucketId,
      };
      console.log('  Request body:', requestBody);

      const response = await this.httpClient.post(
        `${this.apiUrl}/b2api/v2/b2_get_upload_url`,
        requestBody,
        {
          headers: {
            'Authorization': this.authToken!,
          },
        }
      );

      const uploadData: BackblazeUploadUrlResponse = response.data;
      
      this.uploadUrl = uploadData.uploadUrl;
      this.uploadAuthToken = uploadData.authorizationToken;

      console.log('✅ BackblazeB2: Upload URL obtained successfully');
      console.log('  Upload URL:', this.uploadUrl);
      console.log('  Upload Auth Token (first 20 chars):', this.uploadAuthToken?.substring(0, 20) + '...');

      this.logger.debug('Upload URL obtained successfully');
    } catch (error) {
      console.error('❌ BackblazeB2: Failed to get upload URL');
      console.error('  Error message:', error.message);
      console.error('  Error response:', error.response?.data);
      console.error('  Error status:', error.response?.status);
      console.error('  Error headers:', error.response?.headers);
      
      this.logger.error(`Failed to get upload URL: ${error.message}`);
      throw new Error(`Failed to get upload URL: ${error.message}`);
    }
  }

  private async getFileInfo(key: string): Promise<any> {
    try {
      const response = await this.httpClient.get(
        `${this.apiUrl}/b2api/v2/b2_list_file_names`,
        {
          params: {
            bucketId: this.config.bucketId,
            prefix: key,
            maxFileCount: 1,
          },
          headers: {
            'Authorization': this.authToken!,
          },
        }
      );

      const files = response.data.files;
      return files.find((file: any) => file.fileName === key);
    } catch (error) {
      this.logger.error(`Failed to get file info for ${key}: ${error.message}`);
      return null;
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.config.maxRetries) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        
        this.logger.warn(`Operation failed, retrying (${attempt}/${this.config.maxRetries}): ${error.message}`);
      }
    }

    throw lastError!;
  }

  // Override the generateKey method to create Backblaze B2 compatible keys
  generateKey(
    folder: string,
    fileName: string,
    prefix?: string
  ): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const parts = [folder];
    if (prefix) parts.push(prefix);
    parts.push(`${timestamp}-${randomString}-${cleanFileName}`);
    
    return parts.join('/');
  }
}