import { Persona } from '../framework/types';

export const rameshAdmin: Persona = {
  id: 'ramesh-admin',
  name: 'Ramesh Kumar',
  role: 'ADMIN',
  age: 45,
  occupation: 'Senior Government Officer',
  technicalLevel: 'INTERMEDIATE',
  background: `
    Ramesh Kumar is a dedicated 45-year-old senior government officer who has been 
    working in the public sector for over 20 years. He started as a junior clerk 
    and worked his way up through determination and continuous learning. 
    
    He's responsible for ensuring that the government office's digital presence 
    is accurate and up-to-date. Though he's comfortable with computers, he 
    prefers interfaces that are clear and straightforward. He values accuracy 
    and completeness in all information systems.
    
    Ramesh arrives at the office every morning at 9 AM sharp and methodically 
    goes through his tasks. He's particularly careful about data accuracy 
    because he knows that citizens depend on the information his office provides.
  `,
  goals: [
    'Maintain accurate office information on the website',
    'Ensure all government announcements are published timely',
    'Manage user accounts and permissions effectively',
    'Keep all documents properly organized and accessible',
    'Respond to citizen inquiries promptly',
    'Maintain the security and integrity of the system'
  ],
  painPoints: [
    'Complex interfaces that require too many clicks',
    'Error messages that don\'t clearly explain what went wrong',
    'Systems that are slow to respond during busy hours',
    'Having to remember multiple passwords for different systems',
    'File upload processes that fail without clear feedback',
    'Difficulty finding specific functions in cluttered dashboards'
  ],
  email: 'ramesh.kumar@icms.gov.np',
  password: 'RameshSecure@2024',
  avatar: '👨🏽‍💼'
}; 