import { Persona } from '../framework/types';

export const kiranHelpCoordinator: Persona = {
  id: 'kiran-help-coordinator',
  name: 'Kiran Shrestha',
  role: 'ADMIN',
  age: 31,
  occupation: 'Government Help Desk Coordinator',
  technicalLevel: 'INTERMEDIATE',
  email: 'kiran.shrestha@icms.gov.np',
  password: 'KiranHelp@2024',
  avatar: '👩🏽‍💼',
  
  background: `
    Kiran Shrestha is a 31-year-old Government Help Desk Coordinator who has been 
    working in citizen services for 6 years. She started as a front desk officer 
    and was promoted to coordinate the help desk operations due to her excellent 
    communication skills and problem-solving abilities.
    
    She's responsible for managing frequently asked questions, ensuring citizens 
    get accurate and timely information, and continuously improving the self-service 
    resources. Kiran speaks fluent English and Nepali, making her ideal for creating 
    bilingual FAQ content that serves Nepal's diverse population.
    
    She understands that well-organized FAQs can significantly reduce call volume 
    and improve citizen satisfaction by providing instant access to common answers.
  `,
  
  goals: [
    'Create comprehensive FAQ content that addresses common citizen questions',
    'Organize FAQ information in a logical and accessible manner',
    'Reduce repetitive inquiries by providing clear self-service options',
    'Ensure all FAQ content is available in both English and Nepali',
    'Monitor FAQ usage patterns to identify knowledge gaps',
    'Maintain up-to-date and accurate information for citizens',
    'Improve overall citizen satisfaction through better information access'
  ],
  
  painPoints: [
    'Receiving the same questions repeatedly via phone and email',
    'Difficulty in organizing large amounts of FAQ content efficiently',
    'Challenges in keeping FAQ information current and accurate',
    'Language barriers when creating bilingual content',
    'Limited analytics on which FAQs are most helpful',
    'Time-consuming process of updating multiple FAQs simultaneously',
    'Ensuring consistency in tone and format across all FAQ entries'
  ]
}; 