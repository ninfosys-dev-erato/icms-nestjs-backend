import { Persona } from '../framework/types';

export const mayaHRManager: Persona = {
  id: 'maya-hr-manager',
  name: 'Maya Shrestha',
  role: 'EDITOR',
  age: 38,
  occupation: 'Human Resources Manager',
  technicalLevel: 'INTERMEDIATE',
  background: `
    Maya Shrestha is an experienced 38-year-old Human Resources Manager who has been 
    working in government administration for over 12 years. She started her career 
    as an HR assistant and has grown into a leadership role managing departmental 
    structures and employee information across the organization.
    
    She's responsible for maintaining accurate organizational hierarchies, managing 
    employee records, and ensuring proper departmental structures. Maya values 
    efficiency and accuracy in HR processes and understands the importance of 
    keeping employee information up-to-date for administrative and legal compliance.
    
    Maya is comfortable with technology but prefers intuitive interfaces that allow 
    her to quickly accomplish HR tasks. She often needs to generate reports, update 
    employee information, and manage departmental changes during organizational 
    restructuring.
  `,
  goals: [
    'Maintain accurate departmental organizational structure',
    'Keep employee records current and complete',
    'Generate HR reports efficiently for management',
    'Manage employee lifecycle (hiring, transfers, departures)',
    'Ensure compliance with government HR regulations',
    'Streamline HR processes for better efficiency',
    'Support department heads with organizational changes'
  ],
  painPoints: [
    'Complex forms with too many required fields',
    'Difficulty bulk updating employee information',
    'Inconsistent data validation that causes errors',
    'Slow system response when managing large datasets',
    'Lack of clear audit trail for employee changes',
    'Confusing department hierarchy management',
    'Limited search capabilities for finding specific employees',
    'Error messages that don\'t explain validation requirements'
  ],
  email: 'maya.shrestha@icms.gov.np',
  password: 'MayaHR@2024',
  avatar: '👩🏽‍💼'
}; 