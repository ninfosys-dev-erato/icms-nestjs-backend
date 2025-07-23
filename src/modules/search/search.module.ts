import { Module } from '@nestjs/common';
import { PublicSearchController } from './controllers/public-search.controller';
import { AdminSearchController } from './controllers/admin-search.controller';
import { SearchService } from './services/search.service';
import { SearchIndexService } from './services/search-index.service';
import { SearchSuggestionService } from './services/search-suggestion.service';
import { SearchIndexRepository } from './repositories/search-index.repository';
import { SearchQueryRepository } from './repositories/search-query.repository';
import { SearchSuggestionRepository } from './repositories/search-suggestion.repository';

@Module({
  controllers: [
    PublicSearchController,
    AdminSearchController
  ],
  providers: [
    SearchService,
    SearchIndexService,
    SearchSuggestionService,
    SearchIndexRepository,
    SearchQueryRepository,
    SearchSuggestionRepository
  ],
  exports: [
    SearchService,
    SearchIndexService,
    SearchSuggestionService,
    SearchIndexRepository,
    SearchQueryRepository,
    SearchSuggestionRepository
  ],
})
export class SearchModule {} 