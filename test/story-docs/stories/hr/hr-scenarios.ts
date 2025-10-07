import { Scenario } from '../../framework/types';

export const hrManagementScenarios: Record<string, Scenario> = {
  departmentCreation: {
    id: 'department-creation',
    title: 'Create New Department Structure',
    description: 'HR manager creates a new department with proper hierarchy, naming conventions, and initial configuration.',
    category: 'Department Management',
    prerequisites: [
      'HR manager access to the system',
      'Understanding of organizational structure requirements',
      'Department naming and hierarchy guidelines'
    ],
    estimatedDuration: '3 minutes',
    difficulty: 'MEDIUM'
  },

  departmentHierarchyManagement: {
    id: 'department-hierarchy-management',
    title: 'Manage Complex Department Hierarchies',
    description: 'HR manager configures parent-child relationships between departments and manages organizational restructuring.',
    category: 'Department Management',
    prerequisites: [
      'Existing departments in the system',
      'Organizational chart requirements',
      'Understanding of hierarchy relationships'
    ],
    estimatedDuration: '4 minutes',
    difficulty: 'HARD'
  },

  employeeOnboarding: {
    id: 'employee-onboarding',
    title: 'Complete Employee Onboarding Process',
    description: 'HR manager adds a new employee with complete profile, department assignment, and contact information.',
    category: 'Employee Management',
    prerequisites: [
      'Department structure exists',
      'Employee personal information available',
      'Position and role definitions'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'EASY'
  },

  bulkEmployeeManagement: {
    id: 'bulk-employee-management',
    title: 'Bulk Update Employee Information',
    description: 'HR manager performs bulk operations on multiple employees including status updates and transfers.',
    category: 'Employee Management',
    prerequisites: [
      'Multiple employees in the system',
      'List of employees requiring updates',
      'New department or status information'
    ],
    estimatedDuration: '3 minutes',
    difficulty: 'MEDIUM'
  },

  departmentReorganization: {
    id: 'department-reorganization',
    title: 'Handle Organizational Restructuring',
    description: 'Department head manages team reorganization including employee transfers and role updates.',
    category: 'Department Management',
    prerequisites: [
      'Existing department structure',
      'New organizational requirements',
      'Employee reassignment plan'
    ],
    estimatedDuration: '5 minutes',
    difficulty: 'HARD'
  },

  employeeDirectoryAccess: {
    id: 'employee-directory-access',
    title: 'Access Employee Directory and Contacts',
    description: 'Employee searches for colleagues, accesses contact information, and explores organizational structure.',
    category: 'Employee Access',
    prerequisites: [
      'Public access to employee directory',
      'Understanding of search functionality',
      'Basic knowledge of organizational structure'
    ],
    estimatedDuration: '90 seconds',
    difficulty: 'EASY'
  },

  hrReportsGeneration: {
    id: 'hr-reports-generation',
    title: 'Generate HR Analytics and Reports',
    description: 'HR manager generates comprehensive reports on department statistics, employee distribution, and organizational metrics.',
    category: 'HR Analytics',
    prerequisites: [
      'HR manager access with reporting permissions',
      'Existing employee and department data',
      'Understanding of required metrics'
    ],
    estimatedDuration: '3 minutes',
    difficulty: 'MEDIUM'
  },

  employeeProfileManagement: {
    id: 'employee-profile-management',
    title: 'Manage Employee Profiles and Information',
    description: 'HR manager updates employee profiles including contact information, positions, and departmental assignments.',
    category: 'Employee Management',
    prerequisites: [
      'Existing employee records',
      'Updated employee information',
      'Department and position data'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'EASY'
  },

  departmentSearchAndFiltering: {
    id: 'department-search-filtering',
    title: 'Search and Filter Department Information',
    description: 'Users search for specific departments, filter by status, and explore departmental hierarchies.',
    category: 'Department Access',
    prerequisites: [
      'Multiple departments with various statuses',
      'Understanding of search functionality',
      'Basic knowledge of filtering options'
    ],
    estimatedDuration: '2 minutes',
    difficulty: 'EASY'
  },

  employeeTransferProcess: {
    id: 'employee-transfer-process',
    title: 'Process Employee Department Transfers',
    description: 'HR manager handles employee transfers between departments including position updates and notification processes.',
    category: 'Employee Management',
    prerequisites: [
      'Multiple departments available',
      'Employee requiring transfer',
      'New position and role information'
    ],
    estimatedDuration: '4 minutes',
    difficulty: 'MEDIUM'
  },

  departmentHeadAssignment: {
    id: 'department-head-assignment',
    title: 'Assign and Manage Department Heads',
    description: 'HR manager assigns department heads and manages leadership hierarchy within organizational structure.',
    category: 'Department Management',
    prerequisites: [
      'Existing departments',
      'Eligible employees for leadership roles',
      'Understanding of leadership hierarchy'
    ],
    estimatedDuration: '3 minutes',
    difficulty: 'MEDIUM'
  },

  hrDataValidation: {
    id: 'hr-data-validation',
    title: 'Validate HR Data Integrity and Consistency',
    description: 'HR manager reviews and validates employee and department data for accuracy and compliance.',
    category: 'Data Management',
    prerequisites: [
      'Existing HR data in the system',
      'Data validation requirements',
      'Understanding of compliance standards'
    ],
    estimatedDuration: '4 minutes',
    difficulty: 'MEDIUM'
  }
}; 