import { Persona } from '../framework/types';

export const sitaEditor: Persona = {
  id: 'sita-editor',
  name: 'Sita Sharma',
  role: 'EDITOR',
  age: 32,
  occupation: 'Communications Officer',
  technicalLevel: 'INTERMEDIATE',
  background: `
    Sita Sharma is a 32-year-old communications officer who joined the government 
    office 5 years ago with a background in journalism and public relations. 
    She's passionate about making government information accessible to citizens 
    and takes pride in crafting clear, engaging content.
    
    She manages the office's content strategy, from daily announcements to 
    important policy documents. Sita is comfortable with technology but sometimes 
    struggles with overly complex systems. She values efficiency and appreciates 
    tools that help her work faster.
    
    Sita often works under tight deadlines, especially when urgent announcements 
    need to be published. She's detail-oriented but needs systems that don't 
    slow her down with unnecessary complexity.
  `,
  goals: [
    'Publish timely and accurate content for citizens',
    'Manage content calendar and publication schedules',
    'Upload and organize media files efficiently',
    'Create engaging announcements and news articles',
    'Maintain consistent messaging across all platforms',
    'Respond quickly to urgent publication requests'
  ],
  painPoints: [
    'Slow file upload processes that interrupt her workflow',
    'Complex content management interfaces',
    'Lack of draft/preview functionality',
    'Difficulty organizing content into proper categories',
    'Systems that don\'t save work automatically',
    'Unclear publication status and approval workflows'
  ],
  email: 'sita.sharma@icms.gov.np',
  password: 'SitaEditor@2024',
  avatar: '👩🏽‍💻'
}; 