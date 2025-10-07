import { Scenario } from '../../framework/types';

export const contentManagementScenarios: Record<string, Scenario> = {
  categoryManagement: {
    id: 'category-management',
    title: 'Create and Manage Content Categories',
    description: 'A content manager creates categories to organize government information systematically.',
    category: 'Content Management',
    prerequisites: [
      'Admin access to the system',
      'Understanding of content organization needs',
      'Clear categorization strategy'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'MEDIUM'
  },

  contentCreation: {
    id: 'content-creation',
    title: 'Create and Publish Government Content',
    description: 'An editor creates new content, adds attachments, and publishes it for public access.',
    category: 'Content Management',
    prerequisites: [
      'Editor access to the system',
      'Content categories already exist',
      'Content ready for publication'
    ],
    estimatedDuration: '3 minutes',
    difficulty: 'MEDIUM'
  },

  attachmentManagement: {
    id: 'attachment-management',
    title: 'Upload and Manage File Attachments',
    description: 'Managing file attachments for government documents and announcements.',
    category: 'Content Management',
    prerequisites: [
      'Content already exists',
      'Files ready for upload',
      'Proper file formats and sizes'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'EASY'
  },

  contentDiscovery: {
    id: 'content-discovery',
    title: 'Discover and Access Government Information',
    description: 'A journalist searches for and accesses government documents and announcements.',
    category: 'Public Access',
    prerequisites: [
      'Published content exists',
      'Categories are properly set up',
      'Search functionality is working'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'EASY'
  },

  documentDownload: {
    id: 'document-download',
    title: 'Download Government Documents',
    description: 'Accessing and downloading official government documents and attachments.',
    category: 'Public Access',
    prerequisites: [
      'Documents with attachments exist',
      'Public access is enabled',
      'Download functionality is working'
    ],
    estimatedDuration: '45 seconds',
    difficulty: 'EASY'
  },

  contentWorkflow: {
    id: 'content-workflow',
    title: 'Complete Content Management Workflow',
    description: 'End-to-end content management from category creation to public access.',
    category: 'Content Management',
    prerequisites: [
      'Admin and editor access',
      'Clean system state',
      'File storage is configured'
    ],
    estimatedDuration: '5 minutes',
    difficulty: 'HARD'
  },

  contentSearch: {
    id: 'content-search',
    title: 'Search and Filter Government Content',
    description: 'Using search functionality to find specific government information and documents.',
    category: 'Public Access',
    prerequisites: [
      'Content with various categories exists',
      'Search indexing is working',
      'Filtering capabilities are enabled'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'EASY'
  },

  contentStatistics: {
    id: 'content-statistics',
    title: 'Analyze Content Management Statistics',
    description: 'Reviewing content organization metrics and system usage statistics.',
    category: 'Content Management',
    prerequisites: [
      'Admin access to the system',
      'Content and categories exist',
      'Statistics tracking is enabled'
    ],
    estimatedDuration: '60 seconds',
    difficulty: 'EASY'
  }
}; 