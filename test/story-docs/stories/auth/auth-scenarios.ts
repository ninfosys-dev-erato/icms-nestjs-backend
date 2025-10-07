import { Scenario } from '../../framework/types';

export const authScenarios: Record<string, Scenario> = {
  adminLogin: {
    id: 'admin-login',
    title: 'Admin Login and System Access',
    description: 'An administrator logs into the system to manage office settings and user accounts.',
    category: 'Authentication',
    prerequisites: [
      'Valid admin credentials',
      'System is running and accessible',
      'Database is properly seeded'
    ],
    estimatedDuration: '30 seconds',
    difficulty: 'EASY'
  },

  editorLogin: {
    id: 'editor-login', 
    title: 'Editor Login for Content Management',
    description: 'A content editor logs in to publish urgent announcements and manage website content.',
    category: 'Authentication',
    prerequisites: [
      'Valid editor credentials',
      'Content requiring updates exists',
      'System permissions properly configured'
    ],
    estimatedDuration: '45 seconds',
    difficulty: 'EASY'
  },

  passwordChange: {
    id: 'password-change',
    title: 'Secure Password Update',
    description: 'A user needs to update their password for security reasons following organization policy.',
    category: 'Security',
    prerequisites: [
      'User is already authenticated',
      'Current password is known',
      'New password meets security requirements'
    ],
    estimatedDuration: '60 seconds',
    difficulty: 'MEDIUM'
  },

  sessionManagement: {
    id: 'session-management',
    title: 'Managing Multiple Sessions',
    description: 'A user needs to view and manage their active sessions across different devices.',
    category: 'Security',
    prerequisites: [
      'User has multiple active sessions',
      'User is currently authenticated',
      'Session tracking is enabled'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'MEDIUM'
  },

  forgotPassword: {
    id: 'forgot-password',
    title: 'Password Recovery Process',
    description: 'A user has forgotten their password and needs to reset it through the email recovery process.',
    category: 'Authentication',
    prerequisites: [
      'User account exists in system',
      'Email system is configured',
      'User has access to their registered email'
    ],
    estimatedDuration: '120 seconds',
    difficulty: 'HARD'
  },

  tokenRefresh: {
    id: 'token-refresh',
    title: 'Automatic Token Renewal',
    description: 'The system automatically refreshes expired access tokens to maintain seamless user experience.',
    category: 'Authentication',
    prerequisites: [
      'User has valid refresh token',
      'Access token is expired or near expiry',
      'JWT configuration is proper'
    ],
    estimatedDuration: '15 seconds',
    difficulty: 'EASY'
  },

  unauthorizedAccess: {
    id: 'unauthorized-access',
    title: 'Handling Unauthorized Access Attempts',
    description: 'The system properly rejects requests from unauthenticated users and provides clear feedback.',
    category: 'Security',
    prerequisites: [
      'No valid authentication token',
      'Protected endpoint exists',
      'Proper error handling is configured'
    ],
    estimatedDuration: '20 seconds',
    difficulty: 'EASY'
  },

  rateLimitTest: {
    id: 'rate-limit-test',
    title: 'Rate Limiting Protection',
    description: 'Testing the system\'s ability to prevent brute force attacks through rate limiting.',
    category: 'Security',
    prerequisites: [
      'Rate limiting is configured',
      'Test account for failed attempts',
      'Throttling mechanism is active'
    ],
    estimatedDuration: '45 seconds',
    difficulty: 'MEDIUM'
  }
}; 