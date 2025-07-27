# HR Management Stories

This directory contains comprehensive user stories for the Human Resources (HR) module, covering department management, employee administration, and organizational structure maintenance.

## Overview

The HR Management module enables government organizations to maintain accurate departmental structures, manage employee information, and provide public access to organizational information. These stories demonstrate how different personas interact with the HR system to accomplish their specific goals.

## Personas

### 👩🏽‍💼 Maya Shrestha - HR Manager
- **Role**: EDITOR
- **Age**: 38
- **Occupation**: Human Resources Manager
- **Technical Level**: INTERMEDIATE
- **Primary Responsibilities**: 
  - Manage departmental organizational structure
  - Maintain employee records and information
  - Generate HR reports and analytics
  - Handle employee lifecycle management
  - Ensure compliance with government HR regulations

### 👨🏽‍💻 Deepak Thapa - Department Head
- **Role**: EDITOR
- **Age**: 42
- **Occupation**: IT Department Head
- **Technical Level**: ADVANCED
- **Primary Responsibilities**: 
  - Manage team organizational structure
  - Oversee employee assignments and roles
  - Support HR processes within department
  - Handle departmental reorganizations
  - Collaborate with HR on team changes

### 👩🏽‍💻 Sarah Gurung - Employee
- **Role**: VIEWER
- **Age**: 28
- **Occupation**: Software Developer
- **Technical Level**: ADVANCED
- **Primary Responsibilities**: 
  - Access employee directory information
  - Find colleague contact information
  - Understand organizational structure
  - Navigate departmental hierarchies
  - Access public organizational information

## Story Categories

### 🏢 Department Management Stories
Stories focused on creating, organizing, and managing departmental structures within the government organization.

### 👥 Employee Management Stories
Stories covering the complete employee lifecycle from onboarding to transfers and role updates.

### 📊 HR Analytics and Reporting Stories
Stories demonstrating data analysis, report generation, and organizational metrics.

### 🔍 Employee Directory Access Stories
Stories showing how employees and visitors access organizational information and contact details.

### ⚡ Bulk Operations Stories
Stories covering efficient bulk management of departments and employees.

## User Stories

### Story 1: Maya HR Manager - Department Creation and Management

**Scenario**: Create New Department Structure  
**Duration**: 3 minutes  
**Difficulty**: MEDIUM  

Maya needs to create a new "Digital Innovation Department" to support the organization's technology initiatives.

#### Journey Steps:
1. **Access HR Dashboard** - Maya navigates to the department management interface
2. **Create Department** - She fills out the department creation form with bilingual names
3. **Verify Hierarchy** - Maya confirms the department appears correctly in the organizational structure

#### Key Interactions:
- `GET /api/v1/admin/departments` - Access department management
- `POST /api/v1/admin/departments` - Create new department
- `GET /api/v1/departments/hierarchy` - Verify organizational structure

#### Success Criteria:
- ✅ Department created with proper English and Nepali names
- ✅ Department appears in organizational hierarchy
- ✅ All validation rules are properly enforced

---

### Story 2: Maya HR Manager - Employee Onboarding Process

**Scenario**: Complete Employee Onboarding Process  
**Duration**: 2 minutes  
**Difficulty**: EASY  

Maya needs to onboard a new Senior Software Engineer to the Software Engineering Department.

#### Journey Steps:
1. **Setup Department** - Maya ensures the target department exists
2. **Create Employee Profile** - She fills out comprehensive employee information
3. **Verify Assignment** - Maya confirms the employee appears in the department roster

#### Key Interactions:
- `POST /api/v1/admin/departments` - Setup department structure
- `POST /api/v1/admin/employees` - Create employee profile
- `GET /api/v1/employees/department/{id}` - Verify department assignment

#### Success Criteria:
- ✅ Employee created with complete profile information
- ✅ Employee properly assigned to target department
- ✅ All mandatory fields validated and populated

---

### Story 3: Deepak Department Head - Team Reorganization

**Scenario**: Handle Organizational Restructuring  
**Duration**: 5 minutes  
**Difficulty**: HARD  

Deepak needs to reorganize his IT department by transferring employees between sub-departments and updating roles.

#### Journey Steps:
1. **Review Current Structure** - Deepak analyzes existing departmental hierarchy
2. **Transfer Employee** - He moves an employee between departments with a promotion
3. **Verify Changes** - Deepak confirms the reorganization was successful

#### Key Interactions:
- `GET /api/v1/departments/hierarchy` - Review organizational structure
- `PUT /api/v1/admin/employees/{id}` - Transfer and promote employee
- `GET /api/v1/employees/department/{id}` - Verify reorganization

#### Success Criteria:
- ✅ Employee successfully transferred between departments
- ✅ Employee position and role updated correctly
- ✅ Organizational structure maintains integrity

---

### Story 4: Sarah Employee - Directory Exploration

**Scenario**: Access Employee Directory and Contacts  
**Duration**: 90 seconds  
**Difficulty**: EASY  

Sarah, as a new employee, needs to explore the organizational structure and find HR contacts for assistance.

#### Journey Steps:
1. **Explore Departments** - Sarah browses the department structure
2. **Search HR Employees** - She searches for Human Resources staff
3. **View Department Roster** - Sarah explores specific department employee lists
4. **Review Hierarchy** - She examines the complete organizational structure

#### Key Interactions:
- `GET /api/v1/departments` - Browse department structure
- `GET /api/v1/employees/search?q=HR` - Search for specific employees
- `GET /api/v1/employees/department/{id}` - View department employees
- `GET /api/v1/departments/hierarchy` - Explore organizational hierarchy

#### Success Criteria:
- ✅ Successfully accessed department information
- ✅ Found relevant HR contacts through search
- ✅ Understood organizational structure and relationships

---

### Story 5: Maya HR Manager - Analytics and Bulk Operations

**Scenario**: Generate HR Analytics and Reports  
**Duration**: 3 minutes  
**Difficulty**: MEDIUM  

Maya needs to generate comprehensive HR statistics and perform bulk operations for efficiency.

#### Journey Steps:
1. **Generate Statistics** - Maya accesses HR analytics dashboard
2. **Bulk Operations** - She performs bulk activation of employees
3. **Export Data** - Maya exports department data for reporting

#### Key Interactions:
- `GET /api/v1/admin/hr/statistics` - Generate organizational metrics
- `POST /api/v1/admin/employees/bulk-activate` - Bulk employee operations
- `GET /api/v1/admin/departments/export` - Export department data

#### Success Criteria:
- ✅ Comprehensive statistics generated successfully
- ✅ Bulk operations completed efficiently
- ✅ Data exported in required format

## Technical Implementation

### Story Testing Framework

Each story is implemented as an executable test that:
- **Validates API Endpoints** - Ensures all endpoints work correctly
- **Tests User Workflows** - Verifies complete user journeys
- **Checks Data Integrity** - Confirms data consistency and relationships
- **Measures Performance** - Tracks response times and system behavior

### Story Structure

```typescript
interface StoryStep {
  id: string;
  narrative: string;           // What the user is doing
  expectation: string;         // What should happen
  apiCall: {
    method: string;
    endpoint: string;
    payload?: any;
    query?: Record<string, string>;
  };
  explanation: string;         // Why this step matters
}
```

### Context Management

Stories use dynamic context variables to:
- **Link Related Steps** - Pass data between story steps
- **Maintain Relationships** - Ensure proper entity associations
- **Support Complex Workflows** - Handle multi-step processes

```typescript
// Example context usage
const context = {
  departmentId: response.body.data.id,
  employeeId: newEmployee.id
};

// Used in subsequent API calls
endpoint: '/api/v1/employees/department/{{departmentId}}'
```

## API Coverage

### Department Management
- ✅ `GET /api/v1/departments` - List active departments
- ✅ `GET /api/v1/departments/hierarchy` - Department hierarchy
- ✅ `GET /api/v1/departments/search` - Search departments
- ✅ `GET /api/v1/departments/{id}` - Get department details
- ✅ `POST /api/v1/admin/departments` - Create department
- ✅ `PUT /api/v1/admin/departments/{id}` - Update department
- ✅ `DELETE /api/v1/admin/departments/{id}` - Delete department

### Employee Management
- ✅ `GET /api/v1/employees` - List active employees
- ✅ `GET /api/v1/employees/search` - Search employees
- ✅ `GET /api/v1/employees/department/{id}` - Department employees
- ✅ `GET /api/v1/employees/position/{position}` - Employees by position
- ✅ `GET /api/v1/employees/{id}` - Get employee details
- ✅ `POST /api/v1/admin/employees` - Create employee
- ✅ `PUT /api/v1/admin/employees/{id}` - Update employee
- ✅ `DELETE /api/v1/admin/employees/{id}` - Delete employee

### Bulk Operations
- ✅ `POST /api/v1/admin/departments/bulk-activate` - Bulk activate departments
- ✅ `POST /api/v1/admin/departments/bulk-deactivate` - Bulk deactivate departments
- ✅ `POST /api/v1/admin/departments/bulk-delete` - Bulk delete departments
- ✅ `POST /api/v1/admin/employees/bulk-activate` - Bulk activate employees
- ✅ `POST /api/v1/admin/employees/bulk-deactivate` - Bulk deactivate employees
- ✅ `POST /api/v1/admin/employees/bulk-delete` - Bulk delete employees

### Analytics and Reporting
- ✅ `GET /api/v1/admin/hr/statistics` - HR analytics and metrics
- ✅ `GET /api/v1/admin/departments/export` - Export department data
- ✅ `POST /api/v1/admin/departments/import` - Import department data
- ✅ `GET /api/v1/admin/employees/export` - Export employee data
- ✅ `POST /api/v1/admin/employees/import` - Import employee data

## Story Validation

### Data Validation Testing
- **Required Fields** - All mandatory fields properly validated
- **Bilingual Content** - English and Nepali translations required
- **Field Lengths** - Minimum and maximum constraints enforced
- **Email Formats** - Proper email validation
- **Phone Numbers** - Valid phone number formats
- **Department Relationships** - Proper hierarchy validation

### Business Logic Testing
- **Organizational Hierarchy** - Department parent-child relationships
- **Employee Assignments** - Proper department-employee associations
- **Role Permissions** - Correct access control enforcement
- **Data Consistency** - Referential integrity maintained
- **Circular References** - Prevention of invalid hierarchies

### Performance Testing
- **Response Times** - API calls complete within acceptable timeframes
- **Bulk Operations** - Efficient handling of multiple records
- **Search Performance** - Fast search across large datasets
- **Pagination** - Proper pagination for large result sets

## Error Scenarios

### Authentication Errors
- **Unauthorized Access** - 401 responses for missing tokens
- **Insufficient Permissions** - 403 responses for role violations
- **Token Expiration** - Proper handling of expired tokens

### Validation Errors
- **Missing Required Fields** - 400 responses with clear error messages
- **Invalid Data Formats** - Proper format validation feedback
- **Business Rule Violations** - Clear explanation of constraint violations

### Not Found Errors
- **Invalid Entity IDs** - 404 responses for non-existent records
- **Deleted References** - Proper handling of orphaned relationships

## Running the Stories

### Execute All HR Stories
```bash
npm test -- --testPathPattern=hr.story.e2e-spec.ts
```

### Execute Specific Stories
```bash
# Department management stories
npm test -- --testNamePattern="Maya HR Manager - Department Creation"

# Employee management stories  
npm test -- --testNamePattern="Employee Onboarding"

# Directory access stories
npm test -- --testNamePattern="Sarah Employee - Directory"
```

### Story Output
Stories provide detailed narrative output showing:
- **📖 Story Title** - Clear description of the scenario
- **👤 Persona** - Who is performing the actions
- **📝 Scenario** - What they're trying to accomplish
- **📍 Step Progress** - Detailed step-by-step execution
- **✅ Success Indicators** - Confirmation of successful completion
- **🎉 Story Completion** - Summary of accomplishments

## Best Practices

### Story Design
1. **User-Centric** - Stories focus on real user needs and workflows
2. **Complete Journeys** - Each story represents a complete user task
3. **Realistic Data** - Uses government-appropriate test data
4. **Error Handling** - Includes both success and failure scenarios
5. **Performance Aware** - Validates system responsiveness

### Code Quality
1. **Readable Narratives** - Clear, descriptive step explanations
2. **Comprehensive Assertions** - Thorough validation of outcomes
3. **Context Management** - Proper data flow between steps
4. **Resource Cleanup** - Clean test environment for each story
5. **Documentation** - Well-documented API interactions

### Maintenance
1. **Version Control** - Stories tracked alongside code changes
2. **Regular Updates** - Stories updated with API changes
3. **Persona Evolution** - Personas updated based on user feedback
4. **Scenario Expansion** - New scenarios added for feature coverage
5. **Performance Monitoring** - Story timing tracked over time

## Contributing

When adding new HR stories:

1. **Define Clear Personas** - Ensure personas have realistic backgrounds and goals
2. **Map User Journeys** - Document complete workflows from start to finish
3. **Validate API Coverage** - Ensure all relevant endpoints are tested
4. **Include Edge Cases** - Test both positive and negative scenarios
5. **Document Expectations** - Clear success criteria for each step
6. **Test Data Management** - Proper setup and cleanup procedures

## Related Documentation

- [HR Module API Documentation](../../../docs/modules/hr/README.md)
- [HR Module Test Documentation](../../../test/integration/hr/README.md)
- [Story Testing Framework](../../framework/README.md)
- [Persona Documentation](../../personas/README.md)

---

**Note**: These stories serve as both functional tests and living documentation of the HR module's capabilities. They demonstrate how real users interact with the system and validate that all user workflows function correctly. 