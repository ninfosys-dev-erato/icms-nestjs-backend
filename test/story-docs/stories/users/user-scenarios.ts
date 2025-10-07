import { Scenario } from '../../framework/types';

export const userScenarios: Record<string, Scenario> = {
  adminUserManagement: {
    id: 'admin-user-management',
    title: 'Comprehensive User Account Management',
    description: 'System administrator manages user accounts, permissions, and performs bulk operations for efficient user lifecycle management.',
    category: 'User Management',
    prerequisites: [
      'Valid admin credentials',
      'Database with existing user accounts',
      'System permissions for user management operations',
      'CSV file for bulk import testing'
    ],
    estimatedDuration: '3-5 minutes',
    difficulty: 'MEDIUM'
  },

  hrEmployeeOnboarding: {
    id: 'hr-employee-onboarding',
    title: 'Employee Onboarding and Profile Coordination',
    description: 'HR coordinator manages new employee onboarding, profile updates, and collaborates with admin for account provisioning.',
    category: 'Human Resources',
    prerequisites: [
      'Valid HR staff credentials (EDITOR role)',
      'New employee information',
      'Department assignment details',
      'Coordination with admin for account creation'
    ],
    estimatedDuration: '2-3 minutes',
    difficulty: 'EASY'
  },

  employeeProfileManagement: {
    id: 'employee-profile-management',
    title: 'Personal Profile Management and Self-Service',
    description: 'Regular employee accesses and updates personal profile information, manages security settings, and views account details.',
    category: 'Self-Service',
    prerequisites: [
      'Valid employee credentials (VIEWER role)',
      'Existing user account with profile data',
      'Access to profile management features',
      'Understanding of allowed profile updates'
    ],
    estimatedDuration: '1-2 minutes',
    difficulty: 'EASY'
  },

  bulkUserOperations: {
    id: 'bulk-user-operations',
    title: 'Bulk User Operations and System Maintenance',
    description: 'Administrator performs bulk operations including user activation, deactivation, role updates, and system maintenance tasks.',
    category: 'System Administration',
    prerequisites: [
      'Valid admin credentials',
      'Multiple test user accounts',
      'CSV file for bulk import',
      'System permissions for bulk operations'
    ],
    estimatedDuration: '4-6 minutes',
    difficulty: 'HARD'
  },

  userActivityAudit: {
    id: 'user-activity-audit',
    title: 'User Activity Monitoring and Audit',
    description: 'Administrator reviews user activity logs, generates reports, and monitors system usage for security and compliance.',
    category: 'Security & Compliance',
    prerequisites: [
      'Valid admin credentials',
      'Existing user activity data',
      'Audit log entries',
      'Report generation permissions'
    ],
    estimatedDuration: '2-3 minutes',
    difficulty: 'MEDIUM'
  },

  roleBasedAccess: {
    id: 'role-based-access',
    title: 'Role-Based Access Control Validation',
    description: 'Verification of proper role-based access control across different user types and permission levels.',
    category: 'Security',
    prerequisites: [
      'Users with different roles (ADMIN, EDITOR, VIEWER)',
      'Various protected endpoints',
      'Role-based permission configuration',
      'Test scenarios for access validation'
    ],
    estimatedDuration: '3-4 minutes',
    difficulty: 'MEDIUM'
  },

  userDataExportImport: {
    id: 'user-data-export-import',
    title: 'User Data Export and Import Operations',
    description: 'Administrator exports user data for reporting and imports bulk user data from external sources.',
    category: 'Data Management',
    prerequisites: [
      'Valid admin credentials',
      'Existing user data for export',
      'CSV file with user data for import',
      'Data import/export permissions'
    ],
    estimatedDuration: '3-4 minutes',
    difficulty: 'MEDIUM'
  },

  userSessionManagement: {
    id: 'user-session-management',
    title: 'User Session and Security Management',
    description: 'Management of user sessions, security settings, and account security features including password changes and session monitoring.',
    category: 'Security',
    prerequisites: [
      'Active user sessions',
      'Valid user credentials',
      'Session management permissions',
      'Security policy configuration'
    ],
    estimatedDuration: '2-3 minutes',
    difficulty: 'MEDIUM'
  }
}; 