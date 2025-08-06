import { MediaCategory, MediaFolder } from '../dto/media.dto';

export class Media {
  id: string;
  fileName: string;           // Backblaze filename
  originalName: string;       // Original uploaded filename
  url: string;               // Public Backblaze URL
  fileId: string;            // Backblaze file ID
  size: number;              // File size in bytes
  contentType: string;       // MIME type
  uploadedBy: string;        // User ID who uploaded
  folder: string;            // Content type folder (sliders, office-settings, users, content, etc.)
  category: MediaCategory;   // Media category (image, document, video, audio, etc.)
  altText?: string;          // Alt text for accessibility
  title?: string;            // Media title
  description?: string;      // Media description
  tags?: string[];           // Searchable tags
  isPublic: boolean;         // Public/private visibility
  isActive: boolean;         // Active/inactive status
  metadata?: any;            // Additional metadata (dimensions, duration, etc.)
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: any;                // User who uploaded
  sliders?: any[];           // Slider relation
  officeSettings?: any[];    // Office settings relation
  profilePictures?: any[];   // User profile pictures
  content?: any[];           // Content relation (future)
} 