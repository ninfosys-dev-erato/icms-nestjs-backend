# Search Module

## Overview

The Search module provides comprehensive global search functionality across all content types with full-text search capabilities, search result ranking, and search analytics. This module serves as the central search engine for the entire CMS system.

## Features

- **Global Search:** Search across all content types and modules
- **Full-Text Search:** Advanced text search with relevance ranking
- **Multi-Content Search:** Search across content, documents, media, and more
- **Search Analytics:** Track search patterns and user behavior
- **Search Suggestions:** Provide intelligent search suggestions
- **Search Optimization:** Optimize search performance and accuracy

## Implementation Status

✅ **Completed:**
- [x] SearchService implementation
- [x] SearchIndexService implementation
- [x] SearchSuggestionService implementation
- [x] SearchIndexRepository implementation
- [x] SearchQueryRepository implementation
- [x] SearchSuggestionRepository implementation
- [x] PublicSearchController implementation
- [x] AdminSearchController implementation
- [x] Search DTOs and entities
- [x] Search result ranking
- [x] Search analytics tracking
- [x] Search suggestions functionality
- [x] Search index management
- [x] Export/Import functionality
- [x] Search statistics and reporting

## API Endpoints

### Public Endpoints
- `GET /search` - Search content
- `POST /search/advanced` - Advanced search
- `GET /search/suggestions` - Get search suggestions
- `GET /search/popular` - Get popular searches
- `GET /search/history` - Get search history

### Admin Endpoints
- `GET /admin/search/analytics` - Get search analytics
- `GET /admin/search/statistics` - Get search statistics
- `POST /admin/search/reindex/{contentId}/{contentType}` - Reindex content
- `POST /admin/search/bulk-reindex` - Bulk reindex
- `POST /admin/search/optimize` - Optimize search index
- `DELETE /admin/search/cache` - Clear search cache
- `GET /admin/search/export` - Export search data
- `GET /admin/search-indices/{id}` - Get index by ID
- `POST /admin/search-indices` - Create index
- `PUT /admin/search-indices/{id}` - Update index
- `DELETE /admin/search-indices/{id}` - Delete index
- `GET /admin/search-indices/statistics` - Get index statistics
- `GET /admin/search-indices/export` - Export indices
- `POST /admin/search-indices/import` - Import indices
- `GET /admin/search-suggestions/{id}` - Get suggestion by ID
- `POST /admin/search-suggestions` - Create suggestion
- `PUT /admin/search-suggestions/{id}` - Update suggestion
- `DELETE /admin/search-suggestions/{id}` - Delete suggestion
- `GET /admin/search-suggestions/statistics` - Get suggestion statistics
- `GET /admin/search-suggestions/export` - Export suggestions
- `POST /admin/search-suggestions/import` - Import suggestions

## Usage

The search module is now fully implemented and ready for use. It provides:

1. **Full-text search** across all content types
2. **Search analytics** and reporting
3. **Search suggestions** and auto-complete
4. **Index management** for administrators
5. **Export/Import** functionality for data management
6. **Performance optimization** tools 