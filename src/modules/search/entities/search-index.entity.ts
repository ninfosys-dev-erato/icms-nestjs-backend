import { ContentType } from '../dto/search.dto';

export class SearchIndex {
  id: string;
  contentId: string;
  contentType: ContentType;
  title: any; // JsonValue from Prisma
  content: any; // JsonValue from Prisma
  description?: any; // JsonValue from Prisma
  tags: string[];
  language: string;
  isPublished: boolean;
  isActive: boolean;
  searchScore: number;
  lastIndexedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (for future implementation)
  relatedContent?: any; // Polymorphic relation
} 