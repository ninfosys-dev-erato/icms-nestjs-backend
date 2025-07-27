import { Persona } from '../framework/types';

export const hrStaffCoordinator: Persona = {
  id: 'hr-staff-coordinator',
  name: 'Sunita Maharjan',
  role: 'EDITOR',
  age: 35,
  occupation: 'Human Resources Coordinator',
  technicalLevel: 'INTERMEDIATE',
  email: 'sunita.maharjan@icms.gov.np',
  password: 'SunitaHR@2024',
  avatar: '👩‍💼',
  
  background: `
    Sunita Maharjan is a 35-year-old Human Resources Coordinator with 8 years 
    of experience in government HR operations and employee lifecycle management. 
    She holds a degree in Human Resource Management and has specialized in 
    employee onboarding, profile management, and inter-departmental coordination.
    
    As an HR Coordinator, Sunita works closely with the system administrator to 
    manage employee data, coordinate new hire onboarding, handle profile updates, 
    and ensure accurate employee information across all systems. She regularly 
    interacts with department heads to gather employee requirements and facilitate 
    smooth user account provisioning.
    
    Sunita has good technical skills for HR systems and understands the 
    importance of data accuracy, compliance with government policies, and 
    maintaining employee privacy. She frequently handles bulk employee data 
    updates during organizational changes and ensures proper documentation 
    for audit purposes.
  `,
  
  goals: [
    'Streamline employee onboarding and account setup processes',
    'Maintain accurate and up-to-date employee profile information',
    'Coordinate effectively with system administrators for user management',
    'Ensure compliance with government HR policies and data protection',
    'Facilitate smooth role transitions and department transfers',
    'Provide excellent support for employee account-related queries',
    'Generate comprehensive employee reports for management decisions',
    'Optimize HR workflows through better system utilization'
  ],
  
  painPoints: [
    'Manual data entry for new employee profiles takes significant time',
    'Coordinating user permissions with multiple department requirements',
    'Handling urgent profile updates outside business hours',
    'Ensuring data consistency across HR and system records',
    'Managing employee transfers between departments and roles',
    'Dealing with incomplete information during bulk import processes',
    'Balancing employee privacy with operational transparency needs',
    'Keeping track of temporary staff and contract employee access'
  ]
}; 