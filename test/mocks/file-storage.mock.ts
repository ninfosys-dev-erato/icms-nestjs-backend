import { FileStorageService, UploadResult, DownloadResult, FileMetadata } from '../../src/common/services/file-storage/interfaces/file-storage.interface';

export class MockFileStorageService extends FileStorageService {
  private storage = new Map<string, { buffer: Buffer; contentType?: string; metadata?: Record<string, string> }>();

  async upload(
    key: string,
    buffer: Buffer,
    contentType?: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    this.storage.set(key, { buffer, contentType, metadata });
    
    return {
      key,
      url: `https://test-storage.example.com/${key}`,
      size: buffer.length,
      mimeType: contentType,
      etag: 'mock-etag',
    };
  }

  async download(key: string): Promise<DownloadResult> {
    const stored = this.storage.get(key);
    if (!stored) {
      throw new Error(`File not found: ${key}`);
    }

    return {
      buffer: stored.buffer,
      contentType: stored.contentType,
      contentLength: stored.buffer.length,
      etag: 'mock-etag',
    };
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async getUrl(key: string, expiresIn?: number): Promise<string> {
    return `https://test-storage.example.com/${key}`;
  }

  async getMetadata(key: string): Promise<FileMetadata> {
    const stored = this.storage.get(key);
    if (!stored) {
      throw new Error(`File not found: ${key}`);
    }

    return {
      size: stored.buffer.length,
      mimeType: stored.contentType || 'application/octet-stream',
      lastModified: new Date(),
      etag: 'mock-etag',
      metadata: stored.metadata,
    };
  }

  async copy(sourceKey: string, destinationKey: string): Promise<void> {
    const stored = this.storage.get(sourceKey);
    if (!stored) {
      throw new Error(`Source file not found: ${sourceKey}`);
    }

    this.storage.set(destinationKey, { ...stored });
  }

  async generatePresignedUrl(
    key: string,
    operation: 'get' | 'put',
    expiresIn?: number
  ): Promise<string> {
    return `https://test-storage.example.com/${key}?operation=${operation}&expires=${expiresIn || 86400}`; // 24 hours default
  }

  // Override the generateKey method to make it deterministic for tests
  generateKey(folder: string, fileName: string, prefix?: string): string {
    const parts = [folder];
    if (prefix) parts.push(prefix);
    parts.push(`mock-${fileName}`);
    return parts.join('/');
  }

  // Utility method for tests to clear storage
  clearStorage(): void {
    this.storage.clear();
  }

  // Utility method for tests to get stored files
  getStoredFiles(): string[] {
    return Array.from(this.storage.keys());
  }
} 