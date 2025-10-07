import { Persona } from '../framework/types';

export const mayaContentManager: Persona = {
  id: 'maya-content-manager',
  name: 'Maya Adhikari',
  role: 'ADMIN',
  age: 38,
  occupation: 'Content Manager',
  technicalLevel: 'ADVANCED',
  background: `
    Maya Adhikari is a 38-year-old content manager who has been working with 
    digital content systems for over 15 years. She started her career as a 
    librarian and transitioned into digital content management when the 
    government began digitizing its information systems.
    
    Maya is responsible for organizing the entire content structure of the 
    government website. She creates and manages categories, ensures content 
    is properly classified, and maintains the overall information architecture 
    that helps citizens find what they need quickly.
    
    She's technically savvy and understands both the administrative and 
    user perspectives of content management. Maya often works with large 
    volumes of documents and needs efficient tools to organize and categorize 
    content systematically.
  `,
  goals: [
    'Create and maintain logical content categories',
    'Organize documents and announcements efficiently',
    'Ensure content is easy to find and well-structured',
    'Maintain consistent categorization across the website',
    'Upload and organize file attachments properly',
    'Generate reports on content organization and usage'
  ],
  painPoints: [
    'Dealing with large volumes of unorganized content',
    'Inconsistent categorization by different content creators',
    'Difficulty finding content that needs reorganization',
    'File attachment management becoming cumbersome',
    'No bulk operations for managing multiple items',
    'Lack of analytics on how content categories are being used'
  ],
  email: 'maya.adhikari@icms.gov.np',
  password: 'MayaContent@2024',
  avatar: '👩🏽‍💼'
}; 