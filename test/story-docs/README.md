# 🎭 Story-Driven API Documentation System

## Overview

This system generates beautiful, narrative-driven API documentation from real test results, similar to Spring REST Docs but specifically designed for NestJS applications. It transforms dry API tests into engaging user stories that help developers understand the system's behavior through realistic scenarios.

## 🎯 Goals

- **Human-Readable**: Transform API tests into engaging narratives
- **Real Data**: Documentation generated from actual test results
- **CI Compatible**: Automated generation in CI/CD pipelines
- **Story-Driven**: Each API interaction tells a story with personas
- **Edge Case Coverage**: Document all scenarios including failures
- **Live Documentation**: Always up-to-date with the actual system

## 🏗️ Architecture Overview

```
test/
├── story-docs/                    # Story documentation framework
│   ├── framework/                 # Core framework files
│   │   ├── story-builder.ts       # Main story generation engine
│   │   ├── persona-manager.ts     # Manages user personas
│   │   ├── scenario-runner.ts     # Executes story scenarios
│   │   └── markdown-generator.ts  # Generates final documentation
│   ├── personas/                  # User persona definitions
│   │   ├── ramesh-admin.ts        # Admin persona
│   │   ├── sita-editor.ts         # Editor persona
│   │   └── tourist-viewer.ts      # Viewer persona
│   ├── stories/                   # Story definitions
│   │   ├── auth/                  # Authentication stories
│   │   ├── content-management/    # Content management stories
│   │   └── documents/            # Document management stories
│   └── output/                   # Generated documentation
│       ├── auth-journey.md       # Generated auth documentation
│       ├── api-overview.md       # System overview
│       └── personas.md           # Persona descriptions
└── integration/                   # Existing e2e tests (enhanced)
    ├── auth/
    │   └── auth.story-spec.ts     # Story-enhanced auth tests
    └── ...
```

## 🎭 Persona System

### Core Personas

1. **Ramesh Kumar** - Government Administrator
   - Age: 45, Senior Government Officer
   - Technical Level: Intermediate
   - Goals: Manage office content, ensure data accuracy
   - Pain Points: Complex interfaces, unclear error messages

2. **Sita Sharma** - Content Editor  
   - Age: 32, Communications Officer
   - Technical Level: Basic-Intermediate
   - Goals: Update website content, manage announcements
   - Pain Points: Time-consuming workflows, file upload issues

3. **Tourist (John Smith)** - Public User
   - Age: 28, Foreign Visitor
   - Technical Level: Basic
   - Goals: Find information, download documents
   - Pain Points: Language barriers, slow loading

## 📚 Story Structure

Each story follows this narrative structure:

```typescript
interface Story {
  title: string;                    // "Ramesh logs in and manages office settings"
  persona: Persona;                 // Who is performing the action
  scenario: Scenario;               // What they're trying to achieve
  steps: StoryStep[];              // Individual API interactions
  outcomes: ExpectedOutcome[];      // What should happen
  edgeCases: EdgeCase[];           // What could go wrong
}

interface StoryStep {
  narrative: string;                // "Ramesh enters his credentials"
  apiCall: {
    method: string;
    endpoint: string;
    payload: any;
    headers: any;
  };
  response: {
    status: number;
    body: any;
    timing: number;
  };
  explanation: string;              // Why this happened
}
```

## 🔧 Implementation Details

### 1. Story Builder Framework

```typescript
// framework/story-builder.ts
export class StoryBuilder {
  async generateStory(storyConfig: StoryConfig): Promise<StoryResult>
  async runScenario(persona: Persona, scenario: Scenario): Promise<ScenarioResult>
  async captureApiCall(request: Request, response: Response): Promise<ApiSnapshot>
}
```

### 2. Persona Manager

```typescript
// framework/persona-manager.ts
export class PersonaManager {
  getPersona(name: string): Persona
  createTestUser(persona: Persona): Promise<TestUser>
  generatePersonaCredentials(persona: Persona): Credentials
}
```

### 3. Markdown Generator

```typescript
// framework/markdown-generator.ts
export class MarkdownGenerator {
  generateApiDocumentation(stories: Story[]): string
  generatePersonaGuide(personas: Persona[]): string
  generateSystemOverview(apiCalls: ApiSnapshot[]): string
}
```

## 🚀 Usage Example

```typescript
// test/integration/auth/auth.story-spec.ts
describe('Auth Journey Stories', () => {
  const storyBuilder = new StoryBuilder();
  const ramesh = PersonaManager.getPersona('ramesh-admin');

  it('tells the story of Ramesh logging in', async () => {
    const story = await storyBuilder
      .withPersona(ramesh)
      .withScenario('admin-login')
      .withNarrative(`
        Ramesh Kumar, a 45-year-old senior government officer, 
        arrives at his office on Monday morning. He needs to update 
        the office contact information on the government website.
        
        He opens his computer and navigates to the admin panel...
      `)
      .step('login', async (persona) => {
        // Real API call with story context
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: persona.email,
            password: persona.password,
          });
          
        return {
          narrative: "Ramesh enters his government email and password",
          expectation: "The system should authenticate him and provide access tokens",
          response
        };
      })
      .step('access-office-settings', async (persona, context) => {
        const token = context.previousStep.response.body.data.accessToken;
        
        const response = await request(app.getHttpServer())
          .get('/api/v1/office-settings')
          .set('Authorization', `Bearer ${token}`);
          
        return {
          narrative: "With his access token, Ramesh fetches the current office settings",
          expectation: "He should see the current office information",
          response
        };
      })
      .run();

    // Generate documentation
    expect(story.success).toBe(true);
    await storyBuilder.generateDocumentation(story);
  });
});
```

## 📄 Generated Output Example

The system would generate markdown like this:

```markdown
# 🏛️ Government CMS API - User Journey Documentation

## Story: Ramesh Manages Office Information

**Persona**: Ramesh Kumar, Senior Government Officer (Admin)
**Date**: March 15, 2024
**Scenario**: Updating office contact information

---

### 🎬 The Story Begins

Ramesh Kumar, a 45-year-old senior government officer, arrives at his office on Monday morning. He received a memo that the office phone number has changed, and he needs to update this information on the government website to ensure citizens have the correct contact details.

### Step 1: Authentication
Ramesh opens his computer and navigates to the admin login page. He enters his government-issued credentials.

**API Call**: `POST /api/v1/auth/login`
```json
{
  "email": "ramesh.kumar@icms.gov.np",
  "password": "********"
}
```

**Response**: ✅ Success (200ms)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "admin-123",
      "email": "ramesh.kumar@icms.gov.np",
      "firstName": "Ramesh",
      "lastName": "Kumar",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer"
  }
}
```

**What Happened**: The system successfully authenticated Ramesh and provided him with access tokens. The access token will allow him to make authorized requests, while the refresh token can be used to get new access tokens when they expire.

### Step 2: Fetching Office Settings
Now that Ramesh is authenticated, he navigates to the office settings section to view the current information.

**API Call**: `GET /api/v1/office-settings`
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**: ✅ Success (156ms)
```json
{
  "success": true,
  "data": {
    "officeNameEn": "Chief Secretary Office, Dadeldhura",
    "officeNameNp": "मुख्य सचिव कार्यालय, डडेलधुरा", 
    "phoneNumber": "+977-95-520015",
    "email": "info@dadeldhura.gov.np",
    "address": "Dadeldhura, Nepal"
  }
}
```

**What Happened**: Ramesh can see all the current office information. He notices the phone number is indeed outdated and needs to be changed.

---

## 🚦 Error Scenarios

### When Authentication Fails
Sometimes Ramesh might mistype his password...

**API Call**: `POST /api/v1/auth/login`
```json
{
  "email": "ramesh.kumar@icms.gov.np", 
  "password": "wrong-password"
}
```

**Response**: ❌ Unauthorized (89ms)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ERROR",
    "message": "Invalid credentials"
  }
}
```

**What Happened**: The system correctly rejected the invalid credentials to protect the account from unauthorized access.
```

## 🔄 CI/CD Integration

```yaml
# .github/workflows/api-docs.yml
name: Generate API Documentation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run database migrations
        run: npm run db:migrate
        
      - name: Generate API documentation
        run: npm run test:story-docs
        
      - name: Upload documentation
        uses: actions/upload-artifact@v3
        with:
          name: api-documentation
          path: test/story-docs/output/
          
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: test/story-docs/output/
```

## 🎨 Benefits

1. **Human-Centered**: Documentation reads like stories, not technical specs
2. **Always Accurate**: Generated from real test results, never outdated
3. **Comprehensive**: Covers success cases, edge cases, and error scenarios
4. **Onboarding**: New developers understand the system through narratives
5. **Debugging**: When APIs break, you know exactly what user journey fails
6. **Stakeholder Communication**: Non-technical stakeholders can understand the system

## 🛠️ Next Steps

1. Implement the core framework classes
2. Define personas for your system
3. Create story templates for each module
4. Enhance existing e2e tests with story capturing
5. Set up CI pipeline for automatic documentation generation
6. Create beautiful styling for the generated markdown

This system will transform your API documentation from boring technical specs into engaging narratives that help everyone understand how your government CMS actually works in real-world scenarios! 