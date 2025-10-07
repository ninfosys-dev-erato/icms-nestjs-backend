import { Scenario } from '../../framework/types';

export const documentManagementScenarios: Record<string, Scenario> = {
  documentUpload: {
    id: 'document-upload',
    title: 'Upload and Organize Government Documents',
    description: 'A document manager uploads official documents with proper categorization and metadata.',
    category: 'Document Management',
    prerequisites: [
      'Admin access to the system',
      'Documents ready for upload in supported formats',
      'Clear categorization strategy'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'MEDIUM'
  },

  documentVersioning: {
    id: 'document-versioning',
    title: 'Manage Document Versions and Updates',
    description: 'Managing document versions with detailed change logs and version history tracking.',
    category: 'Document Management',
    prerequisites: [
      'Existing documents in the system',
      'Updated document files',
      'Change documentation'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'MEDIUM'
  },

  documentDiscovery: {
    id: 'document-discovery',
    title: 'Search and Access Government Documents',
    description: 'Citizens and journalists find and download official government documents.',
    category: 'Public Access',
    prerequisites: [
      'Published documents exist',
      'Search functionality is working',
      'Download tracking is enabled'
    ],
    estimatedDuration: '60 seconds',
    difficulty: 'EASY'
  },

  documentAnalytics: {
    id: 'document-analytics',
    title: 'Analyze Document Usage and Performance',
    description: 'Document managers review analytics to understand document usage patterns.',
    category: 'Document Management',
    prerequisites: [
      'Documents with download history',
      'Analytics tracking is enabled',
      'Admin access to statistics'
    ],
    estimatedDuration: '45 seconds',
    difficulty: 'EASY'
  },

  bulkDocumentOperations: {
    id: 'bulk-document-operations',
    title: 'Perform Bulk Document Management',
    description: 'Efficiently manage large sets of documents through bulk operations.',
    category: 'Document Management',
    prerequisites: [
      'Multiple documents in the system',
      'Admin privileges',
      'Clear update strategy'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'HARD'
  },

  documentSecurity: {
    id: 'document-security',
    title: 'Manage Document Access and Security',
    description: 'Control document visibility and access permissions for different user types.',
    category: 'Security',
    prerequisites: [
      'Documents with different security requirements',
      'User roles properly configured',
      'Access control policies defined'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'MEDIUM'
  },

  documentMigration: {
    id: 'document-migration',
    title: 'Export and Import Document Collections',
    description: 'Migrate document collections for backup, transfer, or system updates.',
    category: 'Document Management',
    prerequisites: [
      'Document collections to migrate',
      'Export/import functionality',
      'Storage capacity for backups'
    ],
    estimatedDuration: '3 minutes',
    difficulty: 'HARD'
  },

  documentCompliance: {
    id: 'document-compliance',
    title: 'Ensure Document Compliance and Archival',
    description: 'Manage document lifecycle including archival and compliance requirements.',
    category: 'Document Management',
    prerequisites: [
      'Documents with different status requirements',
      'Archival policies defined',
      'Compliance tracking enabled'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'MEDIUM'
  },

  documentErrorHandling: {
    id: 'document-error-handling',
    title: 'Handle Document Upload and Access Errors',
    description: 'Test system resilience with invalid files, large uploads, and access errors.',
    category: 'Error Handling',
    prerequisites: [
      'Various file types for testing',
      'Network simulation capabilities',
      'Error logging enabled'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'MEDIUM'
  },

  documentPerformance: {
    id: 'document-performance',
    title: 'Test Document System Performance',
    description: 'Evaluate system performance with large files and concurrent access.',
    category: 'Performance',
    prerequisites: [
      'Large document files for testing',
      'Multiple concurrent users',
      'Performance monitoring tools'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'HARD'
  }
}; 