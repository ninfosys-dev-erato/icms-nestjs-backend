import { Scenario } from '../../framework/types';

export const faqScenarios: Record<string, Scenario> = {
  faqManagement: {
    id: 'faq-management',
    title: 'Create and Manage FAQ Content',
    description: 'An admin creates and manages frequently asked questions to help citizens find answers quickly.',
    category: 'FAQ Management',
    prerequisites: [
      'Admin access to the system',
      'Understanding of common citizen questions',
      'Bilingual content preparation (English and Nepali)'
    ],
    estimatedDuration: '3 minutes',
    difficulty: 'MEDIUM'
  },

  faqDiscovery: {
    id: 'faq-discovery',
    title: 'Search and Browse FAQ Information',
    description: 'A citizen searches for answers to common questions using the FAQ system.',
    category: 'Public Access',
    prerequisites: [
      'Published FAQ content exists',
      'Search functionality is working',
      'FAQ categories are properly organized'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'EASY'
  },

  faqBulkOperations: {
    id: 'faq-bulk-operations',
    title: 'Perform Bulk FAQ Management',
    description: 'An admin efficiently manages multiple FAQs through bulk operations like import, export, and batch updates.',
    category: 'FAQ Management',
    prerequisites: [
      'Multiple FAQs in the system',
      'Admin privileges',
      'Bulk operation understanding'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'HARD'
  },

  faqAnalytics: {
    id: 'faq-analytics',
    title: 'Analyze FAQ Usage and Performance',
    description: 'A content manager reviews FAQ statistics to understand citizen needs and improve content.',
    category: 'FAQ Management',
    prerequisites: [
      'FAQs with usage history',
      'Analytics tracking enabled',
      'Admin access to statistics'
    ],
    estimatedDuration: '60 seconds',
    difficulty: 'EASY'
  },

  faqOrganization: {
    id: 'faq-organization',
    title: 'Organize and Reorder FAQ Content',
    description: 'An admin organizes FAQs by priority and reorders them for better user experience.',
    category: 'FAQ Management',
    prerequisites: [
      'Multiple FAQs exist in the system',
      'Admin privileges for reordering',
      'Clear organization strategy'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'MEDIUM'
  },

  faqValidation: {
    id: 'faq-validation',
    title: 'Validate and Quality Check FAQ Content',
    description: 'An admin validates FAQ content for accuracy, completeness, and proper translation.',
    category: 'Content Quality',
    prerequisites: [
      'Draft FAQ content prepared',
      'Validation rules defined',
      'Bilingual review capability'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'MEDIUM'
  },

  faqErrorHandling: {
    id: 'faq-error-handling',
    title: 'Handle FAQ System Errors Gracefully',
    description: 'Testing how the system handles various error scenarios in FAQ operations.',
    category: 'Error Handling',
    prerequisites: [
      'Error simulation capabilities',
      'Error logging enabled',
      'Proper error messages configured'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'MEDIUM'
  },

  faqAccessibility: {
    id: 'faq-accessibility',
    title: 'Access FAQ Content by Different User Types',
    description: 'Testing how different types of users access and interact with FAQ content.',
    category: 'Public Access',
    prerequisites: [
      'FAQ content published',
      'Different user role configurations',
      'Access control properly set up'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'EASY'
  }
}; 