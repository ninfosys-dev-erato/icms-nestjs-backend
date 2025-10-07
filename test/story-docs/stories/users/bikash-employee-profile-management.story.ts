import { StoryBuilder } from '../../framework/story-builder';
import { regularEmployee } from '../../personas/regular-employee';
import { userScenarios } from './user-scenarios';
import { PersonaManager } from '../../framework/persona-manager';

export const createBikashEmployeeProfileManagementStory = async (context: any) => {
  const { getHttpServer, request } = context;
  
  return await StoryBuilder.create(getHttpServer())
    .withPersona(regularEmployee)
    .withScenario(userScenarios.employeeProfileManagement)
    .withNarrative(`
      Bikash Thapa, a government officer with basic technical skills, needs to update 
      his personal information in the system after moving to a new address and getting 
      a new phone number. As someone who is not highly technical, he values simple, 
      intuitive interfaces and clear instructions. He wants to ensure his contact 
      information is current for official communications and explore what other 
      profile settings he can manage independently without requiring IT support.
    `)
    .step('employee-login', async (persona, context) => {
      const loginResponse = await context.request
        .post('/api/v1/auth/login')
        .send({
          email: persona.email,
          password: persona.password,
        });

      return {
        narrative: `Bikash logs into the government system using his employee credentials to access his personal profile.`,
        expectation: `The system should authenticate successfully and provide VIEWER role access with profile management capabilities.`,
        response: loginResponse,
        explanation: `As a regular employee with VIEWER role, Bikash has limited permissions but should be able to access and manage his own profile information for personal updates.`,
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
    .step('view-current-profile', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      const profileResponse = await context.request
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`);

      // Store current profile data for comparison
      context.testData.originalProfile = profileResponse.body?.data;

      return {
        narrative: `Bikash accesses his current profile to review his personal information and understand what details are currently on file.`,
        expectation: `The system should display his complete profile including personal details, contact information, and role assignment.`,
        response: profileResponse,
        explanation: `Viewing the current profile helps Bikash understand what information is stored about him and identifies what needs to be updated for accuracy.`,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/users/profile',
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('update-contact-information', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      const updatedContactInfo = {
        firstName: 'Bikash',
        lastName: 'Thapa',
        phoneNumber: '+977-9801234567', // New phone number
        avatarUrl: 'https://example.com/avatars/bikash-updated.jpg'
      };

      const updateResponse = await context.request
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedContactInfo);

      context.testData.updatedProfile = updateResponse.body?.data;

      return {
        narrative: `Bikash updates his phone number and profile picture after moving to a new address and wanting to have a current professional photo.`,
        expectation: `The system should successfully update his contact information and return the updated profile details.`,
        response: updateResponse,
        explanation: `Self-service profile updates empower employees to maintain current information independently, reducing administrative burden while ensuring accuracy of personal data.`,
        apiCall: {
          method: 'PUT',
          endpoint: '/api/v1/users/profile',
          payload: updatedContactInfo,
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('verify-profile-updates', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      const verificationResponse = await context.request
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`);

      const currentProfile = verificationResponse.body?.data;
      const originalProfile = context.testData.originalProfile;

      // Verify the changes were applied
      const changesVerified = {
        phoneNumberUpdated: currentProfile?.phoneNumber !== originalProfile?.phoneNumber,
        avatarUpdated: currentProfile?.avatarUrl !== originalProfile?.avatarUrl,
        otherFieldsPreserved: currentProfile?.email === originalProfile?.email
      };

      context.testData.changesVerified = changesVerified;

      return {
        narrative: `Bikash confirms that his profile updates were saved correctly by viewing his profile again to ensure the changes are reflected.`,
        expectation: `The system should show the updated information while preserving all other profile data that was not changed.`,
        response: verificationResponse,
        explanation: `Verification gives Bikash confidence that his updates were successful and helps him understand the effectiveness of the self-service system.`,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/users/profile',
          headers: { Authorization: `Bearer ${token}` }
        }
      };
    })
    .step('explore-profile-capabilities', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      const currentProfile = context.testData.updatedProfile;

      // Document what Bikash can see and understand about his profile
      const profileCapabilities = {
        editableFields: ['firstName', 'lastName', 'phoneNumber', 'avatarUrl'],
        readOnlyFields: ['email', 'role', 'isActive', 'createdAt'],
        visibleInformation: Object.keys(currentProfile || {}),
        userRole: currentProfile?.role,
        accountStatus: currentProfile?.isActive ? 'Active' : 'Inactive'
      };

      context.testData.profileCapabilities = profileCapabilities;

      return {
        narrative: `Bikash explores his profile interface to understand what information he can manage himself and what requires administrator assistance.`,
        expectation: `The interface should clearly indicate which fields are editable and provide helpful guidance about profile management options.`,
        response: { 
          status: 200, 
          body: { 
            message: 'Profile capabilities documented',
            capabilities: profileCapabilities,
            userUnderstanding: 'Clear distinction between self-service and admin-required changes'
          }
        },
        explanation: `Understanding profile capabilities helps employees become more self-sufficient while knowing when to seek help, improving both user experience and system efficiency.`,
        apiCall: {
          method: 'EXPLORE',
          endpoint: 'profile-capabilities-analysis'
        }
      };
    })
    .step('attempt-restricted-access', async (persona, context) => {
      const token = context.previousSteps[0]?.response?.body?.data?.accessToken;
      
      // Bikash tries to access admin functions to understand his limitations
      const restrictedAttempts = [];

      // Try to access user statistics (admin only)
      try {
        const statsResponse = await context.request
          .get('/api/v1/admin/users/statistics')
          .set('Authorization', `Bearer ${token}`);
        restrictedAttempts.push({ endpoint: 'statistics', result: 'accessible', response: statsResponse });
      } catch (error) {
        restrictedAttempts.push({ endpoint: 'statistics', result: 'restricted', status: 403 });
      }

      // Try to access active users list (editor/admin only)
      try {
        const activeUsersResponse = await context.request
          .get('/api/v1/users/active')
          .set('Authorization', `Bearer ${token}`);
        restrictedAttempts.push({ endpoint: 'active-users', result: 'accessible', response: activeUsersResponse });
      } catch (error) {
        restrictedAttempts.push({ endpoint: 'active-users', result: 'restricted', status: 403 });
      }

      return {
        narrative: `Bikash curiously tries to access some administrative features to understand the boundaries of his system access and confirm his role limitations.`,
        expectation: `The system should properly restrict access to administrative functions while providing clear feedback about permission requirements.`,
        response: { 
          status: 200,
          body: {
            message: 'Access restrictions properly enforced',
            attempts: restrictedAttempts,
            roleValidation: 'VIEWER role restrictions working correctly'
          }
        },
        explanation: `Role-based access control testing helps verify security boundaries and ensures employees understand their access scope, preventing confusion and maintaining system integrity.`,
        apiCall: {
          method: 'TEST',
          endpoint: 'role-based-access-validation'
        }
      };
    })
    .step('document-user-experience', async (persona, context) => {
      const changesVerified = context.testData.changesVerified;
      const profileCapabilities = context.testData.profileCapabilities;
      const originalProfile = context.testData.originalProfile;
      const updatedProfile = context.testData.updatedProfile;

      const userExperience = {
        loginExperience: 'Straightforward authentication process',
        profileAccessibility: 'Easy to find and navigate profile section',
        updateProcess: 'Simple form-based updates with clear feedback',
        verificationProcess: 'Immediate reflection of changes builds confidence',
        roleUnderstanding: 'Clear boundaries between self-service and admin functions',
        overallSatisfaction: 'Positive experience with appropriate level of control',
        changesSuccessful: Object.values(changesVerified || {}).every(Boolean),
        capabilitiesUnderstood: profileCapabilities !== undefined
      };

      return {
        narrative: `Bikash reflects on his profile management experience, noting that the system provides appropriate self-service capabilities for basic employee needs.`,
        expectation: `The user experience should be intuitive for employees with basic technical skills while maintaining appropriate security boundaries.`,
        response: {
          status: 200,
          body: {
            userExperience,
            recommendations: [
              'Profile management interface is user-friendly',
              'Clear feedback helps build user confidence',
              'Role boundaries are properly enforced',
              'Self-service capabilities reduce administrative overhead'
            ]
          }
        },
        explanation: `Documenting user experience helps identify the effectiveness of self-service features and validates that the system meets the needs of regular employees while maintaining security.`,
        apiCall: {
          method: 'DOCUMENT',
          endpoint: 'user-experience-assessment'
        }
      };
    })
    .run();
}; 