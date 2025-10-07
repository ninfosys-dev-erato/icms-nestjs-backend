import { Persona } from '../framework/types';

export const adminUserManager: Persona = {
  id: 'admin-user-manager',
  name: 'Ramesh Shrestha',
  role: 'ADMIN',
  age: 42,
  occupation: 'System Administrator & User Manager',
  technicalLevel: 'ADVANCED',
  email: 'ramesh.shrestha@icms.gov.np',
  password: 'RameshAdmin@2024',
  avatar: '👨‍💼',
  
  background: `
    Ramesh Shrestha is a 42-year-old System Administrator with over 15 years 
    of experience in government IT systems and user management. He holds a 
    Master's degree in Information Systems and has specialized in identity 
    management, access control, and system security.
    
    As the primary system administrator for the government CMS, Ramesh is 
    responsible for managing user accounts, setting permissions, overseeing 
    bulk operations, and maintaining system security. He handles user 
    onboarding, role assignments, account lifecycle management, and provides 
    technical support to department heads.
    
    Ramesh has deep expertise in user authentication systems, role-based 
    access control, audit logging, and compliance requirements. He regularly 
    performs user audits, manages bulk operations for new employee onboarding, 
    and ensures the system meets security and governance standards.
  `,
  
  goals: [
    'Efficiently manage user accounts across all government departments',
    'Implement secure user onboarding and offboarding processes',
    'Maintain comprehensive audit trails for compliance',
    'Optimize bulk operations for large-scale user management',
    'Ensure proper role-based access control enforcement',
    'Provide timely technical support for user account issues',
    'Generate detailed reports on user activity and system usage',
    'Maintain system security and prevent unauthorized access'
  ],
  
  painPoints: [
    'Managing large volumes of user creation during hiring seasons',
    'Ensuring consistent role assignments across departments',
    'Handling urgent account activation requests efficiently',
    'Maintaining data accuracy during bulk import operations',
    'Coordinating user permissions with department requirements',
    'Dealing with password reset requests and security incidents',
    'Balancing security requirements with user convenience',
    'Keeping track of inactive accounts and system cleanup'
  ]
}; 