import { Persona } from '../framework/types';

export const raviJournalist: Persona = {
  id: 'ravi-journalist',
  name: 'Ravi Thapa',
  role: 'VIEWER',
  age: 29,
  occupation: 'Investigative Journalist',
  technicalLevel: 'INTERMEDIATE',
  background: `
    Ravi Thapa is a 29-year-old investigative journalist who works for a 
    prominent Nepali newspaper. He regularly accesses government websites 
    to research stories, verify information, and download official documents 
    for his investigative reports.
    
    Ravi is comfortable with technology and expects government websites to 
    be transparent and easy to navigate. He often needs to quickly find 
    specific documents, download attachments, and verify the authenticity 
    of government announcements.
    
    He represents the media community that relies on government transparency 
    and open access to public information. Ravi needs efficient search 
    capabilities and reliable download links to do his job effectively.
  `,
  goals: [
    'Quickly find government documents and announcements',
    'Download official documents and attachments reliably',
    'Search for content by categories and topics',
    'Access the latest published government information',
    'Verify authenticity of government communications',
    'Get notifications about new important announcements'
  ],
  painPoints: [
    'Broken download links for important documents',
    'Poor search functionality that returns irrelevant results',
    'Inconsistent categorization making content hard to find',
    'Slow loading times when accessing documents',
    'Lack of clear publication dates and version information',
    'No way to bookmark or track important content updates'
  ],
  email: 'ravi.thapa@journalist.com',
  password: 'RaviJourno@2024',
  avatar: '👨🏽‍💻'
}; 