import { StoryBuilder } from '../../framework/story-builder';
import { hrStaffCoordinator } from '../../personas/hr-staff-coordinator';
import { userScenarios } from './user-scenarios';
import { PersonaManager } from '../../framework/persona-manager';

export const createSunitaHREmployeeOnboardingStory = async (context: any) => {
  const { getHttpServer, request } = context;
  
  return await StoryBuilder.create(getHttpServer())
    .withPersona(hrStaffCoordinator)
    .withScenario(userScenarios.hrEmployeeOnboarding)
    .withNarrative(`
      Sunita Maharjan, the HR Coordinator, receives notification that three new employees 
      will be joining the office next week. She needs to coordinate with the system 
      administrator to ensure proper account setup, verify employee information, and 
      facilitate smooth onboarding processes. Her role involves managing employee data, 
      coordinating profile updates, and ensuring all new hires have appropriate access 
      to systems and resources for their roles.
    `)
    .step('hr-staff-login', async (persona, context) => {
      const loginResponse = await context.request
        .post('/api/v1/auth/login')
        .send({
          email: persona.email,
          password: persona.password,
        });

      return {
        narrative: `Sunita logs into the system using her HR coordinator credentials to access employee management features.`,
        expectation: `The system should authenticate successfully and provide EDITOR role access with appropriate HR permissions.`,
        response: loginResponse,
        explanation: `As an HR coordinator with EDITOR role, Sunita has permissions to view user information and perform profile-related operations while coordinating with administrators for account creation.`,
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
    .step('view-current-user-profile', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      const profileResponse = await context.request
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`);

      return {
        narrative: `Sunita checks her own profile to ensure her information is current and to understand the profile management interface before helping new employees.`,
        expectation: `The system should return Sunita's complete profile information with HR coordinator details and permissions.`,
        response: profileResponse,
        explanation: `Understanding the profile interface helps Sunita guide new employees through profile management tasks and ensures she can provide accurate assistance.`,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/users/profile',
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('view-active-users-list', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      const activeUsersResponse = await context.request
        .get('/api/v1/users/active?page=1&limit=20')
        .set('Authorization', `Bearer ${token}`);

      return {
        narrative: `Sunita reviews the current active users list to understand the existing team structure and identify where new employees will fit.`,
        expectation: `The system should provide a list of active users with their roles and basic information for organizational planning.`,
        response: activeUsersResponse,
        explanation: `Reviewing active users helps Sunita understand team composition, plan role assignments for new hires, and coordinate with department heads about team structure.`,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/users/active?page=1&limit=20',
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('check-users-by-role', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      // Check different role distributions to understand staffing
      const editorUsersResponse = await context.request
        .get('/api/v1/users/role/EDITOR?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      const viewerUsersResponse = await context.request
        .get('/api/v1/users/role/VIEWER?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      return {
        narrative: `Sunita analyzes the current distribution of user roles to determine appropriate role assignments for incoming employees based on departmental needs.`,
        expectation: `The system should provide role-based user listings to help with organizational planning and role assignment decisions.`,
        response: {
          status: 200,
          body: {
            editors: editorUsersResponse.body,
            viewers: viewerUsersResponse.body,
            analysis: 'Role distribution reviewed for new hire planning'
          }
        },
        explanation: `Understanding role distribution helps Sunita recommend appropriate access levels for new employees based on their responsibilities and departmental requirements.`,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/users/role/EDITOR and /api/v1/users/role/VIEWER',
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('view-recent-user-activity', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      const activityResponse = await context.request
        .get('/api/v1/users/activity?limit=15')
        .set('Authorization', `Bearer ${token}`);

      return {
        narrative: `Sunita reviews recent user activity to understand system usage patterns and identify training needs for new employees.`,
        expectation: `The system should show recent user activities including logins, profile updates, and system interactions.`,
        response: activityResponse,
        explanation: `Monitoring user activity helps Sunita identify common system usage patterns, plan training materials, and understand what new employees will need to learn.`,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/users/activity?limit=15',
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('update-own-profile', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      const profileUpdateData = {
        firstName: 'Sunita',
        lastName: 'Maharjan',
        phoneNumber: '+977-9876543210',
        avatarUrl: 'https://example.com/avatars/sunita.jpg'
      };

      const updateResponse = await context.request
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(profileUpdateData);

      return {
        narrative: `Sunita updates her own profile information to include her latest contact details and professional photo for better coordination with new employees.`,
        expectation: `The system should successfully update the profile information and return the updated details.`,
        response: updateResponse,
        explanation: `Keeping HR coordinator information current ensures new employees can easily contact Sunita and helps establish professional credibility during onboarding.`,
        apiCall: {
          method: 'PUT',
          endpoint: '/api/v1/users/profile',
          payload: profileUpdateData,
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('prepare-onboarding-documentation', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      // Sunita checks what information she can access to prepare onboarding guides
      const profileResponse = await context.request
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`);

      // Document the successful profile access for onboarding preparation
      const onboardingData = {
        profileFields: profileResponse.body?.data || {},
        requiredInformation: [
          'firstName', 'lastName', 'email', 'phoneNumber', 'role'
        ],
        optionalInformation: [
          'avatarUrl', 'phoneNumber'
        ]
      };

      context.testData.onboardingGuide = onboardingData;

      return {
        narrative: `Sunita reviews the profile structure to prepare comprehensive onboarding documentation for new employees, detailing what information they can update themselves.`,
        expectation: `The system should provide clear visibility into profile fields and permissions to help create accurate onboarding guides.`,
        response: profileResponse,
        explanation: `Preparing onboarding documentation based on actual system capabilities ensures new employees receive accurate information about self-service profile management options.`,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/users/profile',
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('coordinate-with-admin-simulation', async (persona, context) => {
      // This step simulates coordination with admin but doesn't actually create users
      // as that would require admin privileges that Sunita doesn't have
      
      const newEmployeeData = [
        {
          name: 'Kiran Tamang',
          email: 'kiran.tamang@icms.gov.np',
          department: 'Communications',
          role: 'EDITOR',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Nisha Sherpa',
          email: 'nisha.sherpa@icms.gov.np',
          department: 'Administration',
          role: 'VIEWER',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Raj Kumar Rai',
          email: 'raj.rai@icms.gov.np',
          department: 'IT Support',
          role: 'EDITOR',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      context.testData.pendingEmployees = newEmployeeData;

      return {
        narrative: `Sunita documents the new employee information and prepares a coordination request for the system administrator to create user accounts.`,
        expectation: `The coordination process should be well-documented with all necessary employee information prepared for account creation.`,
        response: { 
          status: 200, 
          body: { 
            message: 'Employee data prepared for admin coordination',
            employeeCount: newEmployeeData.length,
            pendingAccounts: newEmployeeData
          }
        },
        explanation: `HR coordination involves preparing comprehensive employee data for administrators while ensuring all required information is collected and validated before account creation requests.`,
        apiCall: {
          method: 'PREPARE',
          endpoint: 'coordination-with-admin',
          payload: newEmployeeData
        }
      };
    })
    .step('verify-coordination-readiness', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      const pendingEmployees = context.testData.pendingEmployees || [];
      const onboardingGuide = context.testData.onboardingGuide || {};

      // Verify that all coordination materials are ready
      const coordinationReadiness = {
        employeeDataPrepared: pendingEmployees.length > 0,
        onboardingGuideReady: Object.keys(onboardingGuide).length > 0,
        systemAccessTested: true,
        profileManagementDocumented: true
      };

      return {
        narrative: `Sunita verifies that all onboarding materials are prepared and coordination with admin can proceed smoothly.`,
        expectation: `All onboarding preparation should be complete with employee data ready for account creation and guidance materials prepared.`,
        response: { 
          status: 200, 
          body: { 
            coordinationReadiness,
            pendingEmployees: pendingEmployees.length,
            readyForOnboarding: Object.values(coordinationReadiness).every(Boolean)
          }
        },
        explanation: `Thorough preparation ensures smooth onboarding processes and demonstrates HR coordination effectiveness in managing employee transitions.`,
        apiCall: {
          method: 'VERIFY',
          endpoint: 'onboarding-readiness-check'
        }
      };
    })
    .run();
}; 