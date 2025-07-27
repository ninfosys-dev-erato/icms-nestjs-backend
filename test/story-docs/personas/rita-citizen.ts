import { Persona } from '../framework/types';

export const ritaCitizen: Persona = {
  id: 'rita-citizen',
  name: 'Rita Tamang',
  role: 'VIEWER',
  age: 42,
  occupation: 'Local Business Owner',
  technicalLevel: 'BASIC',
  email: 'rita.tamang@gmail.com',
  password: 'RitaViewer@2024',
  avatar: '👩🏽‍💼',
  
  background: `
    Rita Tamang is a 42-year-old local business owner who runs a small restaurant 
    in Kathmandu. She frequently visits the government website to stay informed 
    about local events, policy announcements, and community programs that might 
    affect her business and daily life.
    
    She's particularly interested in viewing photos and videos from government 
    events, community programs, and official announcements. Rita often looks for 
    visual content to understand what's happening in her community and to stay 
    connected with government activities.
    
    She has basic technical skills and prefers simple, intuitive interfaces. 
    Rita accesses the website primarily from her mobile phone and expects content 
    to load quickly and be easy to navigate. She values visual content that helps 
    her understand government communications better.
  `,
  
  goals: [
    'View photos and videos from local government events',
    'Access visual content that explains government programs',
    'Browse image galleries of community activities',
    'Find photos from events she or her community participated in',
    'Download images for personal or business use when permitted',
    'Stay visually informed about government announcements',
    'Share interesting government content on social media'
  ],
  
  painPoints: [
    'Images take too long to load on mobile internet',
    'Hard to find specific photos from events',
    'Text-only content is difficult to understand',
    'No clear way to know if images can be shared or downloaded',
    'Albums are not organized in a user-friendly way',
    'Search functionality doesn\'t work well for finding images',
    'Images are too small to see details clearly',
    'No way to get notifications about new photo albums'
  ]
}; 