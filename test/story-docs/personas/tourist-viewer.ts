import { Persona } from '../framework/types';

export const touristViewer: Persona = {
  id: 'tourist-viewer',
  name: 'John Smith (Tourist)',
  role: 'VIEWER',
  age: 28,
  occupation: 'Software Developer / Tourist',
  technicalLevel: 'ADVANCED',
  background: `
    John Smith is a 28-year-old software developer from the United States who 
    is planning a trekking trip to Nepal. He's tech-savvy but completely new 
    to Nepali government systems. He represents the typical international 
    visitor who needs to access government information and services.
    
    John is used to modern, intuitive interfaces and has high expectations 
    for user experience. He's comfortable with technology but expects systems 
    to be self-explanatory. He values quick access to information and doesn't 
    want to spend time figuring out complex navigation.
    
    As a tourist, John needs specific information about permits, local regulations, 
    contact information, and downloadable forms. He might access the system 
    from different devices and potentially slower internet connections.
  `,
  goals: [
    'Find contact information for government offices quickly',
    'Download necessary forms and documents for permits',
    'Access tourist-related announcements and updates',
    'Get information about local regulations and requirements',
    'Find emergency contact information',
    'Access the system in English (language preference)'
  ],
  painPoints: [
    'Slow loading times on mobile connections',
    'Complex navigation that requires local knowledge',
    'Content only available in Nepali language',
    'Broken download links for important documents',
    'Unclear categorization of information',
    'No search functionality to find specific information'
  ],
  email: 'john.smith.tourist@gmail.com',
  password: 'TouristView@2024',
  avatar: '🧑🏼‍💻'
}; 