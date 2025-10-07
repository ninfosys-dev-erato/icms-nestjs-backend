// Important Links Module Stories
// This module provides comprehensive user stories for the Important Links functionality

export { importantLinksScenarios } from './important-links-scenarios';
export { ImportantLinksStories } from './important-links-stories';

// Re-export common framework components for convenience
export { StoryBuilder } from '../../framework/story-builder';
export { PersonaManager } from '../../framework/persona-manager';
export { MarkdownGenerator } from '../../framework/markdown-generator';

// Story metadata
export const IMPORTANT_LINKS_STORY_CONFIG = {
  module: 'Important Links',
  version: '1.0.0',
  description: 'Comprehensive user stories for government important links management and access',
  personas: [
    'tourist-viewer',
    'ravi-journalist', 
    'ramesh-admin',
    'priya-document-manager',
    'sita-editor'
  ],
  scenarios: [
    'viewPublicLinks',
    'searchPaginatedLinks',
    'accessFooterLinks',
    'manageImportantLinks',
    'bulkLinkOperations',
    'reorderLinks',
    'importExportLinks',
    'linkStatistics',
    'linkValidation',
    'linkErrorHandling'
  ],
  coverage: {
    publicEndpoints: 5,
    adminEndpoints: 9,
    totalEndpoints: 14,
    personas: 5,
    scenarios: 10
  }
}; 