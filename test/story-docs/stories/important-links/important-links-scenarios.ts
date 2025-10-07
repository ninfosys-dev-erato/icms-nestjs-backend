import { Scenario } from '../../framework/types';

export const importantLinksScenarios: Record<string, Scenario> = {
  viewPublicLinks: {
    id: 'view-public-links',
    title: 'Browse Important Government Links',
    description: 'A visitor browses important government links to find useful resources and official portals.',
    category: 'Public Access',
    prerequisites: [
      'Important links are published and active',
      'Website is accessible',
      'Links are properly categorized'
    ],
    estimatedDuration: '45 seconds',
    difficulty: 'EASY'
  },

  searchPaginatedLinks: {
    id: 'search-paginated-links',
    title: 'Navigate Paginated Important Links',
    description: 'A user navigates through paginated important links to find specific government resources.',
    category: 'Public Access',
    prerequisites: [
      'Multiple important links exist',
      'Pagination is properly configured',
      'Search and filtering work correctly'
    ],
    estimatedDuration: '60 seconds',
    difficulty: 'EASY'
  },

  accessFooterLinks: {
    id: 'access-footer-links',
    title: 'Access Categorized Footer Links',
    description: 'A visitor accesses categorized footer links for quick navigation to different types of government resources.',
    category: 'Public Access',
    prerequisites: [
      'Footer links are categorized properly',
      'Links are organized by type (quick, government, social, contact)',
      'Categories contain active links'
    ],
    estimatedDuration: '30 seconds',
    difficulty: 'EASY'
  },

  manageImportantLinks: {
    id: 'manage-important-links',
    title: 'Manage Important Links Administration',
    description: 'An administrator manages important links including creation, updates, and organization.',
    category: 'Administration',
    prerequisites: [
      'Admin authentication is working',
      'Link management permissions are configured',
      'URL validation is enabled'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'MEDIUM'
  },

  bulkLinkOperations: {
    id: 'bulk-link-operations',
    title: 'Perform Bulk Important Links Operations',
    description: 'An administrator performs bulk operations on important links including bulk create, update, and reordering.',
    category: 'Administration',
    prerequisites: [
      'Admin access to bulk operations',
      'Multiple links for testing',
      'Proper validation for bulk data'
    ],
    estimatedDuration: '3 minutes',
    difficulty: 'HARD'
  },

  reorderLinks: {
    id: 'reorder-links',
    title: 'Reorder Important Links for Better Organization',
    description: 'An administrator reorders important links to improve user experience and prioritize key resources.',
    category: 'Administration',
    prerequisites: [
      'Multiple important links exist',
      'Admin permissions for reordering',
      'Order validation is working'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'MEDIUM'
  },

  importExportLinks: {
    id: 'import-export-links',
    title: 'Import and Export Important Links',
    description: 'An administrator imports links from external sources and exports current links for backup or migration.',
    category: 'Data Management',
    prerequisites: [
      'Import/export functionality is enabled',
      'Valid data format for import',
      'Admin access to data operations'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'MEDIUM'
  },

  linkStatistics: {
    id: 'link-statistics',
    title: 'Analyze Important Links Statistics',
    description: 'An administrator reviews important links statistics to understand usage patterns and optimize link organization.',
    category: 'Analytics',
    prerequisites: [
      'Important links with various states exist',
      'Statistics tracking is enabled',
      'Admin access to analytics'
    ],
    estimatedDuration: '45 seconds',
    difficulty: 'EASY'
  },

  linkValidation: {
    id: 'link-validation',
    title: 'Validate Important Links Data',
    description: 'The system validates important links data including URL format, required fields, and business rules.',
    category: 'Data Validation',
    prerequisites: [
      'Validation rules are configured',
      'Test data with various validation scenarios',
      'Error handling is properly implemented'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'MEDIUM'
  },

  linkErrorHandling: {
    id: 'link-error-handling',
    title: 'Handle Important Links Errors Gracefully',
    description: 'The system properly handles errors when managing important links and provides clear feedback to users.',
    category: 'Error Handling',
    prerequisites: [
      'Error scenarios for testing',
      'Proper error messages configured',
      'Graceful degradation implemented'
    ],
    estimatedDuration: '60 seconds',
    difficulty: 'MEDIUM'
  }
}; 