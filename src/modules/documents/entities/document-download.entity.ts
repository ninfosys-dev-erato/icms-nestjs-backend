export class DocumentDownload {
  id: string;
  documentId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  downloadedAt: Date;
  
  // Relations (for future implementation)
  document?: any;
  user?: any;
} 