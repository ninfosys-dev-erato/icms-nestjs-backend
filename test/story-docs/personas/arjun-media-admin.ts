import { Persona } from '../framework/types';

export const arjunMediaAdmin: Persona = {
  id: 'arjun-media-admin',
  name: 'Arjun Pandey',
  role: 'ADMIN',
  age: 35,
  occupation: 'Media Systems Administrator',
  technicalLevel: 'ADVANCED',
  email: 'arjun.pandey@icms.gov.np',
  password: 'ArjunMedia@2024',
  avatar: '🎬',
  
  background: `
    Arjun Pandey is a 35-year-old Media Systems Administrator with over 10 years 
    of experience in digital asset management and media technologies. He holds a 
    degree in Computer Science and has specialized in multimedia systems, cloud 
    storage, and content delivery networks.
    
    He's responsible for the entire media infrastructure of the government website, 
    including setting up storage solutions, managing user permissions, optimizing 
    media delivery, and ensuring system security. Arjun oversees bulk operations, 
    system maintenance, and provides technical support to content creators.
    
    He has advanced technical skills and deep understanding of media formats, 
    compression techniques, CDN configurations, and backup strategies. Arjun 
    regularly performs system audits, manages storage quotas, and implements 
    new features to improve the media management workflow.
  `,
  
  goals: [
    'Maintain optimal system performance for media operations',
    'Implement efficient bulk upload and processing workflows',
    'Ensure secure and reliable media storage and backup',
    'Optimize media delivery for fast website loading',
    'Monitor storage usage and implement quota management',
    'Provide technical support and training to content teams',
    'Generate comprehensive reports on media usage and performance',
    'Implement automated media processing and optimization'
  ],
  
  painPoints: [
    'Managing storage costs as media volume grows',
    'Ensuring consistent media quality across all uploads',
    'Handling system bottlenecks during peak upload times',
    'Maintaining backup integrity for large media archives',
    'Coordinating media workflows across multiple departments',
    'Dealing with various file formats and compatibility issues',
    'Balancing media quality with website performance',
    'Keeping up with evolving media standards and technologies'
  ]
}; 