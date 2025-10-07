import { Persona } from './types';
import { rameshAdmin } from '../personas/ramesh-admin';
import { sitaEditor } from '../personas/sita-editor';
import { touristViewer } from '../personas/tourist-viewer';
import { mayaContentManager } from '../personas/maya-content-manager';
import { raviJournalist } from '../personas/ravi-journalist';
import { priyaDocumentManager } from '../personas/priya-document-manager';
import { kiranHelpCoordinator } from '../personas/kiran-help-coordinator';
import { mayaHRManager } from '../personas/maya-hr-manager';
import { deepakDepartmentHead } from '../personas/deepak-department-head';
import { sarahEmployee } from '../personas/sarah-employee';
import { arjunMediaAdmin } from '../personas/arjun-media-admin';
import { priyaPhotographer } from '../personas/priya-photographer';
import { ritaCitizen } from '../personas/rita-citizen';

export class PersonaManager {
  private static personas: Record<string, Persona> = {
    'ramesh-admin': rameshAdmin,
    'sita-editor': sitaEditor,
    'tourist-viewer': touristViewer,
    'maya-content-manager': mayaContentManager,
    'ravi-journalist': raviJournalist,
    'priya-document-manager': priyaDocumentManager,
    'kiran-help-coordinator': kiranHelpCoordinator,
    'maya-hr-manager': mayaHRManager,
    'deepak-department-head': deepakDepartmentHead,
    'sarah-employee': sarahEmployee,
    'arjun-media-admin': arjunMediaAdmin,
    'priya-photographer': priyaPhotographer,
    'rita-citizen': ritaCitizen,
  };

  static getPersona(id: string): Persona {
    const persona = this.personas[id];
    if (!persona) {
      throw new Error(`Persona with id '${id}' not found. Available personas: ${Object.keys(this.personas).join(', ')}`);
    }
    return persona;
  }

  static getAllPersonas(): Persona[] {
    return Object.values(this.personas);
  }

  static addPersona(persona: Persona): void {
    this.personas[persona.id] = persona;
  }

  static getPersonasByRole(role: 'ADMIN' | 'EDITOR' | 'VIEWER'): Persona[] {
    return Object.values(this.personas).filter(persona => persona.role === role);
  }

  /**
   * Create test credentials for a persona
   */
  static generateTestCredentials(persona: Persona, suffix?: string): {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  } {
    const [firstName, lastName] = persona.name.split(' ');
    const emailSuffix = suffix ? `-${suffix}` : '';
    
    return {
      email: persona.email.replace('@', `${emailSuffix}@`),
      password: persona.password,
      firstName: firstName || 'Test',
      lastName: lastName || 'User',
      role: persona.role
    };
  }

  /**
   * Get a persona suitable for a specific scenario
   */
  static getPersonaForScenario(scenarioType: string): Persona {
    switch (scenarioType.toLowerCase()) {
      case 'admin':
      case 'administration':
      case 'management':
      case 'header':
      case 'header management':
        return this.getPersona('ramesh-admin');
      
      case 'editor':
      case 'content':
      case 'publishing':
        return this.getPersona('sita-editor');

      case 'content manager':
      case 'content management':
      case 'branding':
      case 'logo':
        return this.getPersona('maya-content-manager');
        
      case 'viewer':
      case 'public':
      case 'tourist':
      case 'guest':
      case 'public access':
        return this.getPersona('tourist-viewer');

      case 'faq':
      case 'help':
      case 'support':
        return this.getPersona('kiran-help-coordinator');

      case 'document':
      case 'documents':
      case 'document management':
        return this.getPersona('priya-document-manager');

      case 'hr':
      case 'human resources':
      case 'employee':
      case 'employees':
      case 'hr management':
        return this.getPersona('maya-hr-manager');

      case 'department':
      case 'departments':
      case 'department head':
      case 'department management':
        return this.getPersona('deepak-department-head');

      case 'employee directory':
      case 'employee access':
      case 'staff':
      case 'team member':
        return this.getPersona('sarah-employee');
        
      default:
        return this.getPersona('tourist-viewer'); // Default to viewer
    }
  }

  /**
   * Create a narrative introduction for a persona
   */
  static generatePersonaIntroduction(persona: Persona, scenario: string): string {
    const introTemplates = {
      'ADMIN': [
        `${persona.name}, a ${persona.age}-year-old ${persona.occupation}, arrives at the office ready to ${scenario}.`,
        `It's another busy day for ${persona.name}, the dedicated ${persona.occupation}. Today's task: ${scenario}.`,
        `${persona.name} sits down at their desk, coffee in hand, preparing to ${scenario} in their role as ${persona.occupation}.`
      ],
      'EDITOR': [
        `${persona.name}, the ${persona.occupation}, has urgent work ahead: ${scenario}.`,
        `With a deadline approaching, ${persona.name} needs to quickly ${scenario}.`,
        `${persona.name} rushes to their computer to ${scenario} before the end of the day.`
      ],
      'VIEWER': [
        `${persona.name}, a ${persona.occupation} visiting from abroad, needs to ${scenario}.`,
        `${persona.name} opens their laptop, hoping to ${scenario} using the government website.`,
        `As a ${persona.occupation}, ${persona.name} expects to easily ${scenario}.`
      ]
    };

    const templates = introTemplates[persona.role] || introTemplates['VIEWER'];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return randomTemplate;
  }
} 