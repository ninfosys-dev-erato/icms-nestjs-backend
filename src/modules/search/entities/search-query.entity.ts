import { ContentType } from '../dto/search.dto';

export class SearchQuery {
  id: string;
  userId?: string;
  query: string;
  language: string;
  contentType?: ContentType;
  filters?: Record<string, any>;
  resultsCount: number;
  executionTime: number;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  
  // Relations (for future implementation)
  user?: any;
  results: SearchResult[];
}

export class SearchResult {
  id: string;
  searchQueryId: string;
  contentId: string;
  contentType: ContentType;
  title: string;
  snippet: string;
  relevanceScore: number;
  rank: number;
  
  // Relations (for future implementation)
  searchQuery: SearchQuery;
} 