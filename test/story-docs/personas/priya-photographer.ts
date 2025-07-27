import { Persona } from '../framework/types';

export const priyaPhotographer: Persona = {
  id: 'priya-photographer',
  name: 'Priya Gurung',
  role: 'EDITOR',
  age: 29,
  occupation: 'Government Event Photographer',
  technicalLevel: 'INTERMEDIATE',
  email: 'priya.gurung@icms.gov.np',
  password: 'PriyaPhoto@2024',
  avatar: '📷',
  
  background: `
    Priya Gurung is a 29-year-old professional photographer who has been documenting 
    government events and programs for the past 5 years. She started as a freelance 
    photographer and was hired by the government to maintain visual records of all 
    official activities, ceremonies, and public programs.
    
    She's responsible for capturing high-quality photos and videos during government 
    events, organizing them into meaningful collections, and ensuring they're properly 
    stored and accessible for future reference. Priya often works with large volumes 
    of media files and needs efficient tools to upload, organize, and manage visual content.
    
    She has intermediate technical skills and understands the importance of proper 
    file organization, metadata management, and creating visual albums that tell 
    the story of government activities. Priya frequently collaborates with content 
    managers and PR teams who need access to her media.
  `,
  
  goals: [
    'Upload and organize photos/videos from government events efficiently',
    'Create meaningful photo albums that tell complete stories',
    'Ensure all media has proper descriptions in both English and Nepali',
    'Manage large volumes of high-resolution media files',
    'Provide quick access to media for content teams and press releases',
    'Maintain a searchable archive of government visual history',
    'Optimize media files for web use while preserving originals'
  ],
  
  painPoints: [
    'Uploading large batches of photos takes too long',
    'Difficult to organize hundreds of photos from a single event',
    'No efficient way to add captions and descriptions to multiple photos',
    'Hard to find specific photos from past events',
    'Manual resizing and optimization is time-consuming',
    'Sharing media with other departments is cumbersome',
    'Limited storage space for high-resolution originals',
    'No way to track which photos have been used in publications'
  ]
}; 