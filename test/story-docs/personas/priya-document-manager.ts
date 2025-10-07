import { Persona } from '../framework/types';

export const priyaDocumentManager: Persona = {
  id: 'priya-document-manager',
  name: 'Priya Basnet',
  role: 'ADMIN',
  age: 34,
  occupation: 'Document Manager',
  technicalLevel: 'ADVANCED',
  background: `
    Priya Basnet is a 34-year-old document manager who has been working with 
    digital document systems for over 12 years. She started her career as a 
    librarian and evolved into digital document management when the government 
    began transitioning to electronic record keeping.
    
    Priya is responsible for maintaining the entire document repository of the 
    government office. She manages document uploads, ensures proper categorization, 
    maintains version control, and monitors document usage analytics. Her role 
    is critical in ensuring that citizens and officials can access the right 
    documents efficiently.
    
    She's highly technical and understands the importance of metadata, version 
    control, and proper document lifecycle management. Priya often works with 
    large document collections and needs efficient tools for bulk operations 
    and analytics.
  `,
  goals: [
    'Maintain a well-organized document repository',
    'Ensure all documents are properly categorized and tagged',
    'Track document versions and maintain update history',
    'Monitor document usage and access patterns',
    'Perform bulk operations efficiently for large document sets',
    'Generate comprehensive analytics and reports on document usage',
    'Ensure document security and proper access controls',
    'Migrate and backup document collections safely'
  ],
  painPoints: [
    'Manual document categorization is time-consuming',
    'Difficulty tracking which documents need updates',
    'No bulk operations for managing hundreds of documents',
    'Limited analytics on document usage patterns',
    'File size limitations affecting document uploads',
    'Inconsistent document naming and versioning by different users',
    'Lack of automated backup and migration tools',
    'Difficulty identifying duplicate or outdated documents'
  ],
  email: 'priya.basnet@icms.gov.np',
  password: 'PriyaDocs@2024',
  avatar: '👩🏽‍📚'
}; 