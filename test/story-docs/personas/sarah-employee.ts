import { Persona } from '../framework/types';

export const sarahEmployee: Persona = {
  id: 'sarah-employee',
  name: 'Sarah Gurung',
  role: 'VIEWER',
  age: 28,
  occupation: 'Software Developer',
  technicalLevel: 'ADVANCED',
  background: `
    Sarah Gurung is a 28-year-old software developer who recently joined the 
    government's IT department. She has a strong technical background with 5 years 
    of experience in software development, and she's eager to contribute to 
    government digital initiatives.
    
    As a new employee, Sarah is still learning about government processes and 
    organizational structures. She needs to access information about her 
    department, understand the organizational hierarchy, and find contact 
    information for her colleagues.
    
    Sarah is very comfortable with technology and expects modern, user-friendly 
    interfaces. She values efficiency and appreciates when systems provide clear 
    information without requiring administrative access.
    
    She often needs to look up departmental information, find colleague contact 
    details, understand reporting structures, and access organizational charts 
    to better understand her work environment.
  `,
  goals: [
    'Understand departmental structure and hierarchy',
    'Find colleague contact information quickly',
    'Access organizational charts and reporting structures',
    'Stay updated on departmental changes and announcements',
    'Locate specific team members by role or expertise',
    'Understand government organizational policies',
    'Connect with other employees in different departments',
    'Access employee directory and contact information'
  ],
  painPoints: [
    'Outdated or incomplete employee contact information',
    'Confusing organizational charts that are hard to navigate',
    'Difficulty finding specific employees by role or department',
    'Limited search functionality in employee directories',
    'Inconsistent information across different systems',
    'Lack of mobile-friendly interfaces for quick lookups',
    'Unclear departmental boundaries and reporting relationships',
    'Missing or broken employee profile information'
  ],
  email: 'sarah.gurung@icms.gov.np',
  password: 'SarahDev@2024',
  avatar: '👩🏽‍💻'
}; 