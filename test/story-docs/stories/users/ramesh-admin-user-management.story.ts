import { StoryBuilder } from '../../framework/story-builder';
import { adminUserManager } from '../../personas/admin-user-manager';
import { userScenarios } from './user-scenarios';
import { PersonaManager } from '../../framework/persona-manager';

export const createRameshAdminUserManagementStory = async (context: any) => {
  const { getHttpServer, request } = context;
  
  return await StoryBuilder.create(getHttpServer())
    .withPersona(adminUserManager)
    .withScenario(userScenarios.adminUserManagement)
    .withNarrative(`
      Ramesh Shrestha, the experienced System Administrator, starts his day by reviewing 
      the user management dashboard. As the government office is expanding, he needs to 
      efficiently manage user accounts, handle new employee onboarding, and maintain 
      system security. Today's tasks include creating new user accounts, updating existing 
      user permissions, performing bulk operations, and generating user activity reports 
      for the monthly compliance review.
    `)
    .step('admin-login', async (persona, context) => {
      const loginResponse = await context.request
        .post('/api/v1/auth/login')
        .send({
          email: persona.email,
          password: persona.password,
        });

      console.log(`📊 Ramesh login response: status=${loginResponse.status}, hasToken=${!!loginResponse.body?.data?.accessToken}`);

      return {
        narrative: `Ramesh logs into the system using his administrator credentials to access the user management dashboard.`,
        expectation: `The system should authenticate successfully and provide admin access token with full privileges.`,
        response: loginResponse,
        explanation: `As a system administrator, Ramesh requires elevated privileges to manage user accounts. The authentication process validates his admin role and grants access to administrative functions.`,
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/auth/login',
          payload: {
            email: persona.email,
            password: persona.password,
          }
        }
      };
    })
    .step('view-user-statistics', async (persona, context) => {
      const loginStep = context.previousSteps[0];
      const token = loginStep?.response?.body?.data?.accessToken;
      
      const statsResponse = await context.request
        .get('/api/v1/admin/users/statistics')
        .set('Authorization', `Bearer ${token}`);

      console.log(`📈 Ramesh stats response: status=${statsResponse.status}, token=${token ? 'present' : 'missing'}`);

      return {
        narrative: `Ramesh reviews the user statistics dashboard to understand the current user base composition and system usage.`,
        expectation: `The system should display comprehensive user statistics including total users, active users, role distribution, and recent activity metrics.`,
        response: statsResponse,
        explanation: `User statistics provide Ramesh with essential insights for capacity planning, security monitoring, and understanding system utilization patterns across different user roles.`,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/admin/users/statistics',
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('create-new-user', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      const newUserData = {
        email: 'new.employee@icms.gov.np',
        password: 'TempPassword123!',
        firstName: 'Sita',
        lastName: 'Poudel',
        role: 'EDITOR',
        isActive: true,
        phoneNumber: '+977-9812345678'
      };

      const createResponse = await context.request
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUserData);

      context.testData.newUserId = createResponse.body?.data?.id;

      return {
        narrative: `Ramesh creates a new user account for Sita Poudel, a new content editor joining the communications department.`,
        expectation: `The system should create the user account with appropriate role permissions and return the user details without the password.`,
        response: createResponse,
        explanation: `Creating new user accounts is a core administrative function. The system validates input data, hashes the password securely, assigns the specified role, and creates an audit trail for the account creation.`,
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/admin/users',
          payload: newUserData,
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('verify-user-creation', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      const userId = context.testData.newUserId;
      
      const userResponse = await context.request
        .get(`/api/v1/admin/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      return {
        narrative: `Ramesh verifies that the new user account was created correctly and checks the user details.`,
        expectation: `The system should return the complete user profile with correct role assignment and account status.`,
        response: userResponse,
        explanation: `Verification ensures that the user account was created with the correct information and settings. This step is crucial for maintaining data integrity and confirming successful account provisioning.`,
        apiCall: {
          method: 'GET',
          endpoint: `/api/v1/admin/users/${userId}`,
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('update-user-role', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      const userId = context.testData.newUserId;
      
      const roleUpdateResponse = await context.request
        .put(`/api/v1/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'ADMIN' });

      return {
        narrative: `Ramesh promotes Sita to ADMIN role after realizing she will need additional system privileges for her new responsibilities.`,
        expectation: `The system should update the user role and reflect the change in the user's permissions.`,
        response: roleUpdateResponse,
        explanation: `Role updates are common in dynamic organizations. The system must handle role changes securely, ensuring proper permission inheritance and maintaining audit trails for compliance.`,
        apiCall: {
          method: 'PUT',
          endpoint: `/api/v1/admin/users/${userId}/role`,
          payload: { role: 'ADMIN' },
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('activate-deactivate-user', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      const userId = context.testData.newUserId;
      
      // First deactivate
      const deactivateResponse = await context.request
        .post(`/api/v1/admin/users/${userId}/deactivate`)
        .set('Authorization', `Bearer ${token}`);

      // Then reactivate
      const activateResponse = await context.request
        .post(`/api/v1/admin/users/${userId}/activate`)
        .set('Authorization', `Bearer ${token}`);

      return {
        narrative: `Ramesh tests the user activation workflow by temporarily deactivating and then reactivating Sita's account to ensure the process works correctly.`,
        expectation: `The system should properly handle both deactivation and reactivation, managing session cleanup and access control appropriately.`,
        response: { 
          status: activateResponse.status, 
          body: { 
            deactivate: deactivateResponse.body, 
            activate: activateResponse.body 
          } 
        },
        explanation: `User activation/deactivation is critical for managing temporary access restrictions, handling employee leaves, or addressing security concerns. The system must properly manage session states and access permissions.`,
        apiCall: {
          method: 'POST',
          endpoint: `/api/v1/admin/users/${userId}/deactivate and /activate`,
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('view-active-users', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      const activeUsersResponse = await context.request
        .get('/api/v1/users/active?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      return {
        narrative: `Ramesh reviews the list of currently active users to monitor system usage and identify any unusual access patterns.`,
        expectation: `The system should return a paginated list of active users with their basic information and last activity details.`,
        response: activeUsersResponse,
        explanation: `Monitoring active users helps administrators track system usage, identify potential security issues, and ensure proper resource allocation. Regular review of active users is a key security practice.`,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/users/active?page=1&limit=10',
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('view-user-activity-logs', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      const activityResponse = await context.request
        .get('/api/v1/admin/users/activity?limit=20')
        .set('Authorization', `Bearer ${token}`);

      return {
        narrative: `Ramesh examines recent user activity logs to identify any suspicious behavior and ensure compliance with security policies.`,
        expectation: `The system should provide detailed activity logs showing user actions, timestamps, and IP addresses for security monitoring.`,
        response: activityResponse,
        explanation: `Activity monitoring is essential for security compliance and incident investigation. The audit trail helps administrators track user behavior and detect potential security threats or policy violations.`,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/admin/users/activity?limit=20',
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('export-user-data', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      const exportResponse = await context.request
        .get('/api/v1/admin/users/export?format=csv')
        .set('Authorization', `Bearer ${token}`);

      return {
        narrative: `Ramesh exports user data in CSV format for the monthly management report and backup purposes.`,
        expectation: `The system should generate and return a CSV file containing user information suitable for external reporting and backup.`,
        response: exportResponse,
        explanation: `Data export capabilities are crucial for reporting, backup procedures, and integration with external systems. The CSV format ensures compatibility with spreadsheet applications for further analysis.`,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/admin/users/export?format=csv',
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('cleanup-test-user', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      const userId = context.testData.newUserId;
      
      if (userId) {
        const deleteResponse = await context.request
          .delete(`/api/v1/admin/users/${userId}`)
          .set('Authorization', `Bearer ${token}`);

        return {
          narrative: `Ramesh removes the test user account to maintain system cleanliness and prevent accumulation of test data.`,
          expectation: `The system should successfully delete the user account and all associated data while maintaining audit trail integrity.`,
          response: deleteResponse,
          explanation: `Proper cleanup procedures ensure that test data doesn't interfere with production operations. The deletion process must handle all related data and maintain referential integrity.`,
          apiCall: {
            method: 'DELETE',
            endpoint: `/api/v1/admin/users/${userId}`,
            headers: { Authorization: `Bearer ${token}` }
          }
        };
      } else {
        return {
          narrative: `No test user was created successfully, so cleanup is not needed.`,
          expectation: `No action required.`,
          response: { status: 200, body: { message: 'No cleanup needed' } },
          explanation: `Conditional cleanup ensures that only successfully created test data is removed.`,
          apiCall: {
            method: 'SKIP',
            endpoint: 'N/A'
          }
        };
      }
    })
    .run();
}; 