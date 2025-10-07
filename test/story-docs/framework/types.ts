export interface Persona {
  id: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  age: number;
  occupation: string;
  technicalLevel: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  background: string;
  goals: string[];
  painPoints: string[];
  email: string;
  password: string;
  avatar?: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  prerequisites: string[];
  estimatedDuration: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface StoryStep {
  id: string;
  narrative: string;
  expectation: string;
  apiCall: {
    method: string;
    endpoint: string;
    payload?: any;
    headers?: Record<string, string>;
    query?: Record<string, string>;
  };
  response?: {
    status: number;
    body: any;
    headers?: Record<string, string>;
    timing: number;
  };
  explanation: string;
  errorScenarios?: ErrorScenario[];
}

export interface ErrorScenario {
  condition: string;
  description: string;
  expectedStatus: number;
  expectedMessage: string;
  narrative: string;
}

export interface Story {
  id: string;
  title: string;
  persona: Persona;
  scenario: Scenario;
  introduction: string;
  steps: StoryStep[];
  conclusion: string;
  metadata: {
    generatedAt: Date;
    testResults: TestResult[];
    duration: number;
    success: boolean;
  };
}

export interface TestResult {
  stepId: string;
  success: boolean;
  actualResponse?: any;
  actualTiming?: number;
  error?: string;
}

export interface StoryConfig {
  persona: Persona;
  scenario: Scenario;
  narrative: string;
  steps: StoryStepConfig[];
}

export interface StoryStepConfig {
  id: string;
  narrative: string;
  expectation: string;
  handler: (persona: Persona, context: StoryContext) => Promise<StoryStepResult>;
  errorScenarios?: ErrorScenario[];
}

export interface StoryContext {
  persona: Persona;
  scenario: Scenario;
  previousSteps: StoryStepResult[];
  currentStep: number;
  testData: Record<string, any>;
  request?: any; // SuperTest request object for making HTTP calls
}

export interface StoryStepResult {
  stepId: string;
  narrative: string;
  expectation: string;
  apiCall: {
    method: string;
    endpoint: string;
    payload?: any;
    headers?: Record<string, string>;
  };
  response: {
    status: number;
    body: any;
    timing: number;
  };
  explanation: string;
  success: boolean;
  error?: string;
}

export interface StoryResult {
  story: Story;
  success: boolean;
  errors: string[];
  generatedDocs: {
    markdown: string;
    json: string;
  };
}

export interface ApiSnapshot {
  timestamp: Date;
  method: string;
  endpoint: string;
  request: {
    headers: Record<string, string>;
    payload?: any;
    query?: Record<string, string>;
  };
  response: {
    status: number;
    headers: Record<string, string>;
    body: any;
    timing: number;
  };
  persona?: Persona;
  narrative?: string;
}

export interface DocumentationConfig {
  title: string;
  subtitle: string;
  version: string;
  baseUrl: string;
  personas: Persona[];
  stories: Story[];
  outputDir: string;
  styling: {
    theme: 'GOVERNMENT' | 'MODERN' | 'MINIMAL';
    primaryColor: string;
    logoUrl?: string;
  };
}

export interface MarkdownSection {
  title: string;
  content: string;
  order: number;
}

export interface GeneratedDocumentation {
  overview: string;
  personas: string;
  stories: Record<string, string>;
  apiReference: string;
  troubleshooting: string;
} 