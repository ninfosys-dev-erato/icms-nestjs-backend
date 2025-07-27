import { 
  Persona, 
  Scenario, 
  StoryConfig, 
  StoryContext, 
  StoryResult, 
  StoryStepResult, 
  StoryStepConfig, 
  ApiSnapshot 
} from './types';
import { MarkdownGenerator } from './markdown-generator';

export class StoryBuilder {
  private persona?: Persona;
  private scenario?: Scenario;
  private narrative?: string;
  private steps: StoryStepConfig[] = [];
  private testData: Record<string, any> = {};

  constructor(private app: any) {} // NestJS app instance

  withPersona(persona: Persona): StoryBuilder {
    this.persona = persona;
    return this;
  }

  withScenario(scenario: Scenario): StoryBuilder {
    this.scenario = scenario;
    return this;
  }

  withNarrative(narrative: string): StoryBuilder {
    this.narrative = narrative;
    return this;
  }

  withTestData(data: Record<string, any>): StoryBuilder {
    this.testData = { ...this.testData, ...data };
    return this;
  }

  step(
    id: string,
    handler: (persona: Persona, context: StoryContext) => Promise<{
      narrative: string;
      expectation: string;
      response: any;
      explanation?: string;
      apiCall?: {
        method: string;
        endpoint: string;
        payload?: any;
        headers?: Record<string, string>;
      };
    }>
  ): StoryBuilder {
    this.steps.push({
      id,
      narrative: '',
      expectation: '',
      handler: async (persona: Persona, context: StoryContext) => {
        const startTime = Date.now();
        
        try {
          const result = await handler(persona, context);
          const endTime = Date.now();
          
          // Use provided API call details or extract from response
          const apiCall = result.apiCall || this.extractApiCallFromResponse(result.response);
          
          return {
            stepId: id,
            narrative: result.narrative,
            expectation: result.expectation,
            apiCall,
            response: {
              status: result.response.status,
              body: result.response.body,
              timing: endTime - startTime
            },
            explanation: result.explanation || this.generateExplanation(result.response),
            success: result.response.status >= 200 && result.response.status < 300
          };
        } catch (error) {
          const endTime = Date.now();
          
          return {
            stepId: id,
            narrative: 'API call failed',
            expectation: 'Expected successful response',
            apiCall: {
              method: 'UNKNOWN',
              endpoint: 'UNKNOWN'
            },
            response: {
              status: 500,
              body: { error: error.message },
              timing: endTime - startTime
            },
            explanation: `Step failed to execute: ${error.message}`,
            success: false,
            error: error.message
          };
        }
      }
    });
    
    return this;
  }

  async run(): Promise<StoryResult> {
    if (!this.persona || !this.scenario) {
      throw new Error('Persona and scenario must be set before running the story');
    }

    const startTime = Date.now();
    const stepResults: StoryStepResult[] = [];
    const errors: string[] = [];
    let overallSuccess = true;

    // Import request here to avoid circular dependencies
    const request = require('supertest');

    // Create story context
    const context: StoryContext = {
      persona: this.persona,
      scenario: this.scenario,
      previousSteps: [],
      currentStep: 0,
      testData: this.testData,
      request: request(this.app.getHttpServer ? this.app.getHttpServer() : this.app)
    };

    // Execute each step
    for (let i = 0; i < this.steps.length; i++) {
      context.currentStep = i;
      context.previousSteps = stepResults;

      try {
        const stepResult = await this.steps[i].handler(this.persona, context);
        stepResults.push(stepResult);

        if (!stepResult.success) {
          overallSuccess = false;
          errors.push(`Step ${stepResult.stepId}: ${stepResult.error || 'Failed'}`);
        }
      } catch (error) {
        overallSuccess = false;
        errors.push(`Step ${this.steps[i].id}: ${error.message}`);
        
        // Create a failed step result
        stepResults.push({
          stepId: this.steps[i].id,
          narrative: 'Step execution failed',
          expectation: 'Expected successful execution',
          apiCall: { method: 'UNKNOWN', endpoint: 'UNKNOWN' },
          response: { status: 500, body: { error: error.message }, timing: 0 },
          explanation: `Step failed to execute: ${error.message}`,
          success: false,
          error: error.message
        });
      }
    }

    const endTime = Date.now();

    // Create story object
    const story = {
      id: `${this.persona.id}-${this.scenario.id}`,
      title: `${this.persona.name}: ${this.scenario.title}`,
      persona: this.persona,
      scenario: this.scenario,
      introduction: this.narrative || this.generateDefaultIntroduction(),
      steps: stepResults.map(result => ({
        id: result.stepId,
        narrative: result.narrative,
        expectation: result.expectation,
        apiCall: result.apiCall,
        response: result.response,
        explanation: result.explanation
      })),
      conclusion: this.generateConclusion(overallSuccess, stepResults),
      metadata: {
        generatedAt: new Date(),
        testResults: stepResults.map(result => ({
          stepId: result.stepId,
          success: result.success,
          actualResponse: result.response,
          actualTiming: result.response.timing,
          error: result.error
        })),
        duration: endTime - startTime,
        success: overallSuccess
      }
    };

    // Generate documentation
    const markdownGenerator = new MarkdownGenerator();
    const markdown = await markdownGenerator.generateStoryDocumentation(story);
    const json = JSON.stringify(story, null, 2);

    return {
      story,
      success: overallSuccess,
      errors,
      generatedDocs: {
        markdown,
        json
      }
    };
  }

  private extractApiCallFromResponse(response: any): any {
    // Try to extract API call details from supertest response
    if (response.request) {
      const request = response.request;
      
      // Try different properties where endpoint might be stored
      const endpoint = request.url || request.path || request._path || 'unknown';
      const method = request.method || (request.req && request.req.method) || 'GET';
      
      // Clean up the endpoint - remove query parameters for cleaner display
      const cleanEndpoint = endpoint.split('?')[0];
      
      return {
        method: method.toUpperCase(),
        endpoint: cleanEndpoint,
        payload: request._data || request.data || undefined,
        headers: this.sanitizeHeaders(request._header || request.headers || {})
      };
    }

    // Check if response has req property (alternative structure)
    if (response.req) {
      const req = response.req;
      return {
        method: (req.method || 'GET').toUpperCase(),
        endpoint: req.path || req.url || 'unknown',
        payload: req._data || undefined,
        headers: this.sanitizeHeaders(req._headers || req.headers || {})
      };
    }

    // Fallback
    return {
      method: 'UNKNOWN',
      endpoint: 'UNKNOWN'
    };
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    
    Object.entries(headers).forEach(([key, value]) => {
      // Skip sensitive headers and convert to string
      if (!key.toLowerCase().includes('password') && 
          !key.toLowerCase().includes('secret') &&
          !key.toLowerCase().includes('token')) {
        sanitized[key] = String(value);
      } else if (key.toLowerCase().includes('authorization')) {
        // Show authorization header but truncate the token
        const authValue = String(value);
        if (authValue.startsWith('Bearer ')) {
          sanitized[key] = `Bearer ${authValue.slice(7, 20)}...`;
        } else {
          sanitized[key] = '[REDACTED]';
        }
      }
    });
    
    return sanitized;
  }

  private generateExplanation(response: any): string {
    const status = response.status;
    
    if (status >= 200 && status < 300) {
      return 'The request was processed successfully. The system responded with the expected data.';
    } else if (status >= 400 && status < 500) {
      return 'The request was rejected due to a client error. This might be due to invalid input or insufficient permissions.';
    } else if (status >= 500) {
      return 'The server encountered an error while processing the request. This indicates a system-level issue.';
    }
    
    return 'The request completed with an unexpected status.';
  }

  private generateDefaultIntroduction(): string {
    return `
      ${this.persona?.name} needs to ${this.scenario?.title.toLowerCase()}. 
      This story follows their journey through the system, documenting each 
      API interaction and explaining what happens at each step.
    `.trim();
  }

  private generateConclusion(success: boolean, steps: StoryStepResult[]): string {
    const successfulSteps = steps.filter(step => step.success).length;
    const totalSteps = steps.length;

    if (success) {
      return `
        ✅ **Journey Completed Successfully**
        
        ${this.persona?.name} successfully completed all ${totalSteps} steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of ${this.scenario?.title.toLowerCase()}.
        
        This demonstrates that the API is working correctly for this user scenario.
      `.trim();
    } else {
      return `
        ❌ **Journey Encountered Issues**
        
        ${this.persona?.name} completed ${successfulSteps} out of ${totalSteps} steps successfully. 
        ${totalSteps - successfulSteps} step(s) failed, preventing them from fully achieving 
        their goal of ${this.scenario?.title.toLowerCase()}.
        
        This indicates areas where the API or user experience could be improved.
      `.trim();
    }
  }

  // Static method to create a new story builder
  static create(app: any): StoryBuilder {
    return new StoryBuilder(app);
  }
} 