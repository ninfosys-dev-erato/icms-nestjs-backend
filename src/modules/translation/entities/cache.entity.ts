export interface TranslationCache {
  id: string;
  language: string;
  groupName: string;
  cacheKey: string;
  cacheValue: string;
  expiresAt: Date;
  createdAt: Date;
} 