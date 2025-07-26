export interface FileStorageConfig {
  provider: 'local' | 's3';
  s3?: {
    endpoint?: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    forcePathStyle?: boolean;
    signedUrlExpires?: number;
  };
  local?: {
    uploadPath: string;
    baseUrl: string;
  };
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  etag?: string;
  mimeType?: string;
}

export interface DownloadResult {
  buffer: Buffer;
  contentType?: string;
  contentLength?: number;
  etag?: string;
}

export interface FileMetadata {
  size: number;
  mimeType: string;
  lastModified: Date;
  etag?: string;
  metadata?: Record<string, string>;
}

export abstract class FileStorageService {
  abstract upload(
    key: string,
    buffer: Buffer,
    contentType?: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult>;

  abstract download(key: string): Promise<DownloadResult>;

  abstract delete(key: string): Promise<void>;

  abstract exists(key: string): Promise<boolean>;

  abstract getUrl(key: string, expiresIn?: number): Promise<string>;

  abstract getMetadata(key: string): Promise<FileMetadata>;

  abstract copy(sourceKey: string, destinationKey: string): Promise<void>;

  abstract generatePresignedUrl(
    key: string,
    operation: 'get' | 'put',
    expiresIn?: number
  ): Promise<string>;

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

  getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  }

  validateFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }
} 