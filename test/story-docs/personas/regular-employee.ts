import { Persona } from '../framework/types';

export const regularEmployee: Persona = {
  id: 'regular-employee',
  name: 'Bikash Thapa',
  role: 'VIEWER',
  age: 28,
  occupation: 'Government Officer',
  technicalLevel: 'BASIC',
  email: 'bikash.thapa@icms.gov.np',
  password: 'BikashGov@2024',
  avatar: '👨‍💻',
  
  background: `
    Bikash Thapa is a 28-year-old Government Officer working in the Department 
    of Local Development. He joined the civil service 3 years ago after 
    completing his Bachelor's degree in Public Administration. As a relatively 
    new employee, he is still learning the various government systems and 
    processes while managing his daily administrative responsibilities.
    
    Bikash primarily uses the government CMS to access information, view 
    announcements, download necessary documents, and manage his personal 
    profile. He occasionally needs to update his contact information, change 
    his password, and access reports relevant to his department's work.
    
    While not highly technical, Bikash is comfortable with basic computer 
    operations and web interfaces. He values simple, intuitive systems that 
    don't require extensive technical knowledge. He often relies on help 
    documentation and colleague assistance when encountering system issues.
  `,
  
  goals: [
    'Access personal profile and keep information up-to-date',
    'Easily navigate the system to find needed information and documents',
    'Manage password and security settings independently',
    'View department announcements and important updates',
    'Download and access work-related documents and forms',
    'Understand system features through clear documentation',
    'Complete profile updates efficiently without IT support',
    'Access training materials and system help resources'
  ],
  
  painPoints: [
    'Complex system interfaces that are difficult to navigate',
    'Uncertainty about which information can be updated independently',
    'Password requirements that are hard to remember and follow',
    'Lack of clear instructions for common profile management tasks',
    'Fear of making mistakes that could affect system access',
    'Difficulty finding help when encountering system issues',
    'Long loading times and system performance issues',
    'Inconsistent user experience across different system sections'
  ]
}; 