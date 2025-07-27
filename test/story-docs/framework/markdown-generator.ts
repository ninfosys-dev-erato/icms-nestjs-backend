import { Story, Persona, DocumentationConfig, GeneratedDocumentation } from './types';

export class MarkdownGenerator {
  
  async generateStoryDocumentation(story: Story): Promise<string> {
    const sections = [
      this.generateHeader(story),
      this.generatePersonaSection(story.persona),
      this.generateScenarioSection(story),
      this.generateIntroduction(story),
      this.generateStorySteps(story),
      this.generateConclusion(story),
      this.generateMetadata(story)
    ];

    return sections.join('\n\n');
  }

  async generateCompleteDocumentation(config: DocumentationConfig): Promise<GeneratedDocumentation> {
    return {
      overview: this.generateOverview(config),
      personas: this.generatePersonasGuide(config.personas),
      stories: await this.generateAllStories(config.stories),
      apiReference: this.generateApiReference(config.stories),
      troubleshooting: this.generateTroubleshooting(config.stories)
    };
  }

  private generateHeader(story: Story): string {
    const statusEmoji = story.metadata.success ? '✅' : '❌';
    const duration = (story.metadata.duration / 1000).toFixed(2);
    
    return `# ${statusEmoji} ${story.title}

**Generated**: ${story.metadata.generatedAt.toISOString()}  
**Duration**: ${duration}s  
**Status**: ${story.metadata.success ? 'Success' : 'Failed'}  
**Test Results**: ${story.metadata.testResults.filter(r => r.success).length}/${story.metadata.testResults.length} steps passed

---`;
  }

  private generatePersonaSection(persona: Persona): string {
    return `## 👤 Our Story's Hero: ${persona.name}

${persona.avatar} **${persona.name}** | ${persona.age} years old | ${persona.occupation}

### Background
${persona.background}

### What ${persona.name} wants to achieve:
${persona.goals.map(goal => `- ${goal}`).join('\n')}

### ${persona.name}'s challenges:
${persona.painPoints.map(point => `- ${point}`).join('\n')}

---`;
  }

  private generateScenarioSection(story: Story): string {
    const difficultyEmoji = {
      'EASY': '🟢',
      'MEDIUM': '🟡', 
      'HARD': '🔴'
    };

    return `## 🎯 The Mission: ${story.scenario.title}

${difficultyEmoji[story.scenario.difficulty]} **Difficulty**: ${story.scenario.difficulty}  
📁 **Category**: ${story.scenario.category}  
⏱️ **Estimated Duration**: ${story.scenario.estimatedDuration}

### What needs to happen:
${story.scenario.description}

### Prerequisites:
${story.scenario.prerequisites.map(req => `- ${req}`).join('\n')}

---`;
  }

  private generateIntroduction(story: Story): string {
    return `## 🎬 The Story Begins

${story.introduction}

---`;
  }

  private generateStorySteps(story: Story): string {
    let stepsMarkdown = `## 🚀 The Journey\n\n`;
    
    story.steps.forEach((step, index) => {
      const stepNumber = index + 1;
      const statusEmoji = step.response?.status >= 200 && step.response?.status < 300 ? '✅' : '❌';
      const timing = step.response?.timing ? `${step.response.timing}ms` : 'N/A';
      
      stepsMarkdown += `### Step ${stepNumber}: ${step.narrative} ${statusEmoji}\n\n`;
      
      stepsMarkdown += `**What ${story.persona.name} expects**: ${step.expectation}\n\n`;
      
      // API Call section
      if (step.apiCall) {
        stepsMarkdown += `**API Call**: \`${step.apiCall.method} ${step.apiCall.endpoint}\`\n\n`;
        
        if (step.apiCall.payload) {
          stepsMarkdown += `**Request Body**:\n\`\`\`json\n${JSON.stringify(step.apiCall.payload, null, 2)}\n\`\`\`\n\n`;
        }
        
        if (step.apiCall.headers && Object.keys(step.apiCall.headers).length > 0) {
          stepsMarkdown += `**Headers**:\n\`\`\`\n${Object.entries(step.apiCall.headers)
            .filter(([key]) => !key.toLowerCase().includes('password'))
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')}\n\`\`\`\n\n`;
        }
      }
      
      // Response section
      if (step.response) {
        const statusColor = step.response.status >= 200 && step.response.status < 300 ? '🟢' : '🔴';
        stepsMarkdown += `**Response**: ${statusColor} ${step.response.status} (${timing})\n\n`;
        
        if (step.response.body) {
          stepsMarkdown += `\`\`\`json\n${JSON.stringify(step.response.body, null, 2)}\n\`\`\`\n\n`;
        }
      }
      
      // Explanation
      stepsMarkdown += `**What happened**: ${step.explanation}\n\n`;
      
      stepsMarkdown += `---\n\n`;
    });
    
    return stepsMarkdown;
  }

  private generateConclusion(story: Story): string {
    return `## 🎯 The Outcome

${story.conclusion}

---`;
  }

  private generateMetadata(story: Story): string {
    const successfulSteps = story.metadata.testResults.filter(r => r.success);
    const failedSteps = story.metadata.testResults.filter(r => !r.success);
    
    let metadata = `## 📊 Technical Details

### Test Summary
- **Total Steps**: ${story.metadata.testResults.length}
- **Successful**: ${successfulSteps.length}
- **Failed**: ${failedSteps.length}
- **Success Rate**: ${((successfulSteps.length / story.metadata.testResults.length) * 100).toFixed(1)}%
- **Total Duration**: ${(story.metadata.duration / 1000).toFixed(2)}s

### Performance Metrics
${story.metadata.testResults.map(result => 
  `- **${result.stepId}**: ${result.actualTiming}ms ${result.success ? '✅' : '❌'}`
).join('\n')}`;

    if (failedSteps.length > 0) {
      metadata += `\n\n### ❌ Failed Steps
${failedSteps.map(step => `- **${step.stepId}**: ${step.error || 'Unknown error'}`).join('\n')}`;
    }

    return metadata;
  }

  private generateOverview(config: DocumentationConfig): string {
    return `# ${config.title}

${config.subtitle}

**Version**: ${config.version}  
**Base URL**: ${config.baseUrl}  
**Generated**: ${new Date().toISOString()}

## 📖 About This Documentation

This documentation tells the story of our API through the eyes of real users. Instead of dry technical specifications, you'll find engaging narratives that show how different people interact with our system.

Each story follows a real person (persona) as they try to accomplish something meaningful with our API. You'll see exactly what requests they make, what responses they get, and what it all means in plain English.

## 🎭 Meet Our Users

We've built these stories around ${config.personas.length} different types of users:

${config.personas.map(persona => 
  `- **${persona.name}** (${persona.role}) - ${persona.occupation}`
).join('\n')}

## 📚 Story Categories

${this.getUniqueCategories(config.stories).map(category => {
  const storiesInCategory = config.stories.filter(s => s.scenario.category === category);
  return `### ${category} (${storiesInCategory.length} stories)
${storiesInCategory.map(story => `- [${story.title}](#${this.slugify(story.title)})`).join('\n')}`;
}).join('\n\n')}

---

*This documentation is automatically generated from real API tests. Every request and response you see here is captured from actual system behavior.*`;
  }

  private generatePersonasGuide(personas: Persona[]): string {
    let guide = `# 👥 User Personas Guide

Meet the people who use our API every day. Each persona represents a real type of user with specific needs, goals, and challenges.

---

`;

    personas.forEach(persona => {
      guide += `## ${persona.avatar} ${persona.name}

**Role**: ${persona.role}  
**Age**: ${persona.age}  
**Occupation**: ${persona.occupation}  
**Technical Level**: ${persona.technicalLevel}

### Background
${persona.background}

### Goals
${persona.goals.map(goal => `- ${goal}`).join('\n')}

### Pain Points
${persona.painPoints.map(point => `- ${point}`).join('\n')}

---

`;
    });

    return guide;
  }

  private async generateAllStories(stories: Story[]): Promise<Record<string, string>> {
    const storyDocs: Record<string, string> = {};
    
    for (const story of stories) {
      storyDocs[story.id] = await this.generateStoryDocumentation(story);
    }
    
    return storyDocs;
  }

  private generateApiReference(stories: Story[]): string {
    const endpoints = new Map<string, any[]>();
    
    // Collect all API calls from stories
    stories.forEach(story => {
      story.steps.forEach(step => {
        if (step.apiCall) {
          const key = `${step.apiCall.method} ${step.apiCall.endpoint}`;
          if (!endpoints.has(key)) {
            endpoints.set(key, []);
          }
          endpoints.get(key)!.push({
            story: story.title,
            persona: story.persona.name,
            response: step.response,
            narrative: step.narrative
          });
        }
      });
    });

    let reference = `# 🔧 API Reference

This reference is generated from real user stories. Each endpoint shows how it's actually used by different personas.

---

`;

    endpoints.forEach((usages, endpoint) => {
      reference += `## \`${endpoint}\`

### Real Usage Examples

${usages.map(usage => 
  `**${usage.persona}** in "${usage.story}":  
${usage.narrative}  
Response: ${usage.response?.status} (${usage.response?.timing}ms)  
`).join('\n')}

---

`;
    });

    return reference;
  }

  private generateTroubleshooting(stories: Story[]): string {
    const errors = new Map<number, any[]>();
    
    // Collect all error scenarios
    stories.forEach(story => {
      story.steps.forEach(step => {
        if (step.response && step.response.status >= 400) {
          if (!errors.has(step.response.status)) {
            errors.set(step.response.status, []);
          }
          errors.get(step.response.status)!.push({
            story: story.title,
            persona: story.persona.name,
            step: step.narrative,
            response: step.response.body,
            explanation: step.explanation
          });
        }
      });
    });

    let guide = `# 🚨 Troubleshooting Guide

When things go wrong, this guide shows you what different users experienced and how to interpret the errors.

---

`;

    errors.forEach((examples, statusCode) => {
      guide += `## HTTP ${statusCode}

### What users experienced:

${examples.map(example => 
  `**${example.persona}** in "${example.story}":  
While trying to: ${example.step}  
Got response: \`${JSON.stringify(example.response)}\`  
Explanation: ${example.explanation}  
`).join('\n')}

---

`;
    });

    return guide;
  }

  private getUniqueCategories(stories: Story[]): string[] {
    return [...new Set(stories.map(story => story.scenario.category))];
  }

  private slugify(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
} 