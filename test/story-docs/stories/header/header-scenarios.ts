import { Scenario } from '../../framework/types';

export const headerConfigurationScenarios: Record<string, Scenario> = {
  headerBasicSetup: {
    id: 'header-basic-setup',
    title: 'Set Up Basic Header Configuration',
    description: 'An admin creates a basic header configuration with typography and layout settings for the government website.',
    category: 'Header Management',
    prerequisites: [
      'Admin access to the system',
      'Understanding of website branding requirements',
      'Basic knowledge of typography and layout design'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'MEDIUM'
  },

  logoManagement: {
    id: 'logo-management',
    title: 'Manage Header Logos and Branding',
    description: 'An admin configures left and right logos with proper alignment and spacing for official government branding.',
    category: 'Header Management',
    prerequisites: [
      'Header configuration exists',
      'Logo image files available',
      'Branding guidelines document'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'MEDIUM'
  },

  headerLayoutCustomization: {
    id: 'header-layout-customization',
    title: 'Customize Header Layout and Styling',
    description: 'A designer configures advanced header layout including height, spacing, borders, and background colors.',
    category: 'Header Management',
    prerequisites: [
      'Basic header configuration exists',
      'Design specifications available',
      'Color scheme and spacing guidelines'
    ],
    estimatedDuration: '3 minutes',
    difficulty: 'HARD'
  },

  headerPreviewAndTesting: {
    id: 'header-preview-testing',
    title: 'Preview and Test Header Configuration',
    description: 'An admin previews header configurations and tests CSS generation before publishing.',
    category: 'Header Management',
    prerequisites: [
      'Header configuration ready for testing',
      'Preview functionality available',
      'CSS generation working'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'EASY'
  },

  headerPublishingWorkflow: {
    id: 'header-publishing-workflow',
    title: 'Complete Header Publishing Workflow',
    description: 'An admin manages the complete workflow from header creation to public deployment.',
    category: 'Header Management',
    prerequisites: [
      'Header configuration completed',
      'Quality review completed',
      'Publishing permissions available'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'MEDIUM'
  },

  publicHeaderDisplay: {
    id: 'public-header-display',
    title: 'View Published Header on Public Website',
    description: 'A citizen visits the government website and sees the properly configured header with logos and styling.',
    category: 'Public Access',
    prerequisites: [
      'Header configuration is published',
      'Website is accessible',
      'Active header configuration exists'
    ],
    estimatedDuration: '30 seconds',
    difficulty: 'EASY'
  },

  headerBulkOperations: {
    id: 'header-bulk-operations',
    title: 'Perform Bulk Header Management Operations',
    description: 'An admin efficiently manages multiple header configurations through bulk operations.',
    category: 'Header Management',
    prerequisites: [
      'Multiple header configurations exist',
      'Admin privileges for bulk operations',
      'Clear management strategy'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'HARD'
  },

  headerAnalyticsAndStatistics: {
    id: 'header-analytics-statistics',
    title: 'Analyze Header Configuration Statistics',
    description: 'A content manager reviews header configuration usage and performance statistics.',
    category: 'Header Management',
    prerequisites: [
      'Header configurations with usage history',
      'Analytics tracking enabled',
      'Admin access to statistics'
    ],
    estimatedDuration: '60 seconds',
    difficulty: 'EASY'
  },

  headerResponsiveDesign: {
    id: 'header-responsive-design',
    title: 'Configure Responsive Header Design',
    description: 'A designer ensures header configuration works properly across different screen sizes and devices.',
    category: 'Header Management',
    prerequisites: [
      'Header configuration exists',
      'Responsive design requirements',
      'Testing on multiple devices'
    ],
    estimatedDuration: '3 minutes',
    difficulty: 'HARD'
  },

  headerErrorHandling: {
    id: 'header-error-handling',
    title: 'Handle Header Configuration Errors',
    description: 'Testing how the system handles various error scenarios in header configuration management.',
    category: 'Error Handling',
    prerequisites: [
      'Error simulation capabilities',
      'Error logging enabled',
      'Proper error messages configured'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'MEDIUM'
  },

  headerImportExport: {
    id: 'header-import-export',
    title: 'Import and Export Header Configurations',
    description: 'An admin backs up and migrates header configurations between environments.',
    category: 'Header Management',
    prerequisites: [
      'Header configurations to export',
      'Import/export functionality',
      'Backup storage available'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'MEDIUM'
  },

  headerVersionControl: {
    id: 'header-version-control',
    title: 'Manage Header Configuration Versions',
    description: 'An admin tracks changes to header configurations and manages version history.',
    category: 'Header Management',
    prerequisites: [
      'Header configurations with change history',
      'Version tracking enabled',
      'Change documentation'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'MEDIUM'
  }
}; 