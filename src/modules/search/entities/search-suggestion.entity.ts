import { ContentType } from '../dto/search.dto';

export class SearchSuggestion {
  id: string;
  term: string;
  language: string;
  contentType?: ContentType;
  frequency: number;
  lastUsedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 