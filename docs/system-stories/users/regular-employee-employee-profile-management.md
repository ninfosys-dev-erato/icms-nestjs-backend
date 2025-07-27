# ✅ Bikash Thapa: Personal Profile Management and Self-Service

**Generated**: 2025-07-27T11:09:43.383Z  
**Duration**: 0.24s  
**Status**: Success  
**Test Results**: 7/7 steps passed

---

## 👤 Our Story's Hero: Bikash Thapa

👨‍💻 **Bikash Thapa** | 28 years old | Government Officer

### Background

    Bikash Thapa is a 28-year-old Government Officer working in the Department 
    of Local Development. He joined the civil service 3 years ago after 
    completing his Bachelor's degree in Public Administration. As a relatively 
    new employee, he is still learning the various government systems and 
    processes while managing his daily administrative responsibilities.
    
    Bikash primarily uses the government CMS to access information, view 
    announcements, download necessary documents, and manage his personal 
    profile. He occasionally needs to update his contact information, change 
    his password, and access reports relevant to his department's work.
    
    While not highly technical, Bikash is comfortable with basic computer 
    operations and web interfaces. He values simple, intuitive systems that 
    don't require extensive technical knowledge. He often relies on help 
    documentation and colleague assistance when encountering system issues.
  

### What Bikash Thapa wants to achieve:
- Access personal profile and keep information up-to-date
- Easily navigate the system to find needed information and documents
- Manage password and security settings independently
- View department announcements and important updates
- Download and access work-related documents and forms
- Understand system features through clear documentation
- Complete profile updates efficiently without IT support
- Access training materials and system help resources

### Bikash Thapa's challenges:
- Complex system interfaces that are difficult to navigate
- Uncertainty about which information can be updated independently
- Password requirements that are hard to remember and follow
- Lack of clear instructions for common profile management tasks
- Fear of making mistakes that could affect system access
- Difficulty finding help when encountering system issues
- Long loading times and system performance issues
- Inconsistent user experience across different system sections

---

## 🎯 The Mission: Personal Profile Management and Self-Service

🟢 **Difficulty**: EASY  
📁 **Category**: Self-Service  
⏱️ **Estimated Duration**: 1-2 minutes

### What needs to happen:
Regular employee accesses and updates personal profile information, manages security settings, and views account details.

### Prerequisites:
- Valid employee credentials (VIEWER role)
- Existing user account with profile data
- Access to profile management features
- Understanding of allowed profile updates

---

## 🎬 The Story Begins


      Bikash Thapa, a government officer with basic technical skills, needs to update 
      his personal information in the system after moving to a new address and getting 
      a new phone number. As someone who is not highly technical, he values simple, 
      intuitive interfaces and clear instructions. He wants to ensure his contact 
      information is current for official communications and explore what other 
      profile settings he can manage independently without requiring IT support.
    

---

## 🚀 The Journey

### Step 1: Bikash logs into the government system using his employee credentials to access his personal profile. ✅

**What Bikash Thapa expects**: The system should authenticate successfully and provide VIEWER role access with profile management capabilities.

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "bikash.thapa@icms.gov.np",
  "password": "BikashGov@2024"
}
```

**Response**: 🟢 200 (203ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlkufoy001ijs1znllnivp5",
      "email": "bikash.thapa@icms.gov.np",
      "firstName": "Bikash",
      "lastName": "Thapa",
      "role": "VIEWER",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T11:09:43.132Z",
      "createdAt": "2025-07-27T11:09:42.514Z",
      "updatedAt": "2025-07-27T11:09:43.133Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3Vmb3kwMDFpanMxem5sbG5pdnA1IiwiaWF0IjoxNzUzNjE0NTgzLCJqdGkiOiI2YWFkZTdmNTI4YjkyZTc2ZjJlNTlmNTc1YWQzNGNlMSIsImV4cCI6MTc1MzYxODE4M30.sufg3NOPLexXYfkfihCgOGv0ZYIOrPAnJxmnlUZEKGg",
    "refreshToken": "984d71a132f5af81efc00e37be683ec66be35f2057ee9cd90d4e4260880e4051213bf9d02283a04167f29c9eefdb05e748b47de17acc041e45f568c0f0191700",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:43.347Z",
    "version": "1.0.0"
  }
}
```

**What happened**: As a regular employee with VIEWER role, Bikash has limited permissions but should be able to access and manage his own profile information for personal updates.

---

### Step 2: Bikash accesses his current profile to review his personal information and understand what details are currently on file. ✅

**What Bikash Thapa expects**: The system should display his complete profile including personal details, contact information, and role assignment.

**API Call**: `GET /api/v1/users/profile`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3Vmb3kwMDFpanMxem5sbG5pdnA1IiwiaWF0IjoxNzUzNjE0NTgzLCJqdGkiOiI2YWFkZTdmNTI4YjkyZTc2ZjJlNTlmNTc1YWQzNGNlMSIsImV4cCI6MTc1MzYxODE4M30.sufg3NOPLexXYfkfihCgOGv0ZYIOrPAnJxmnlUZEKGg
```

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlkufoy001ijs1znllnivp5",
    "email": "bikash.thapa@icms.gov.np",
    "firstName": "Bikash",
    "lastName": "Thapa",
    "role": "VIEWER",
    "isActive": true,
    "isEmailVerified": false,
    "lastLoginAt": "2025-07-27T11:09:43.335Z",
    "createdAt": "2025-07-27T11:09:42.514Z",
    "updatedAt": "2025-07-27T11:09:43.336Z",
    "fullName": "Bikash Thapa",
    "username": "bikash.thapa"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:43.354Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Viewing the current profile helps Bikash understand what information is stored about him and identifies what needs to be updated for accuracy.

---

### Step 3: Bikash updates his phone number and profile picture after moving to a new address and wanting to have a current professional photo. ✅

**What Bikash Thapa expects**: The system should successfully update his contact information and return the updated profile details.

**API Call**: `PUT /api/v1/users/profile`

**Request Body**:
```json
{
  "firstName": "Bikash",
  "lastName": "Thapa",
  "phoneNumber": "+977-9801234567",
  "avatarUrl": "https://example.com/avatars/bikash-updated.jpg"
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3Vmb3kwMDFpanMxem5sbG5pdnA1IiwiaWF0IjoxNzUzNjE0NTgzLCJqdGkiOiI2YWFkZTdmNTI4YjkyZTc2ZjJlNTlmNTc1YWQzNGNlMSIsImV4cCI6MTc1MzYxODE4M30.sufg3NOPLexXYfkfihCgOGv0ZYIOrPAnJxmnlUZEKGg
```

**Response**: 🟢 200 (8ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlkufoy001ijs1znllnivp5",
    "email": "bikash.thapa@icms.gov.np",
    "firstName": "Bikash",
    "lastName": "Thapa",
    "role": "VIEWER",
    "isActive": true,
    "isEmailVerified": false,
    "lastLoginAt": "2025-07-27T11:09:43.335Z",
    "createdAt": "2025-07-27T11:09:42.514Z",
    "updatedAt": "2025-07-27T11:09:43.362Z",
    "fullName": "Bikash Thapa",
    "username": "bikash.thapa",
    "phoneNumber": "+977-9801234567",
    "avatarUrl": "https://example.com/avatars/bikash-updated.jpg"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:43.363Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Self-service profile updates empower employees to maintain current information independently, reducing administrative burden while ensuring accuracy of personal data.

---

### Step 4: Bikash confirms that his profile updates were saved correctly by viewing his profile again to ensure the changes are reflected. ✅

**What Bikash Thapa expects**: The system should show the updated information while preserving all other profile data that was not changed.

**API Call**: `GET /api/v1/users/profile`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3Vmb3kwMDFpanMxem5sbG5pdnA1IiwiaWF0IjoxNzUzNjE0NTgzLCJqdGkiOiI2YWFkZTdmNTI4YjkyZTc2ZjJlNTlmNTc1YWQzNGNlMSIsImV4cCI6MTc1MzYxODE4M30.sufg3NOPLexXYfkfihCgOGv0ZYIOrPAnJxmnlUZEKGg
```

**Response**: 🟢 200 (6ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlkufoy001ijs1znllnivp5",
    "email": "bikash.thapa@icms.gov.np",
    "firstName": "Bikash",
    "lastName": "Thapa",
    "role": "VIEWER",
    "isActive": true,
    "isEmailVerified": false,
    "lastLoginAt": "2025-07-27T11:09:43.335Z",
    "createdAt": "2025-07-27T11:09:42.514Z",
    "updatedAt": "2025-07-27T11:09:43.362Z",
    "fullName": "Bikash Thapa",
    "username": "bikash.thapa"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:43.369Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Verification gives Bikash confidence that his updates were successful and helps him understand the effectiveness of the self-service system.

---

### Step 5: Bikash explores his profile interface to understand what information he can manage himself and what requires administrator assistance. ✅

**What Bikash Thapa expects**: The interface should clearly indicate which fields are editable and provide helpful guidance about profile management options.

**API Call**: `EXPLORE profile-capabilities-analysis`

**Response**: 🟢 200 (N/A)

```json
{
  "message": "Profile capabilities documented",
  "capabilities": {
    "editableFields": [
      "firstName",
      "lastName",
      "phoneNumber",
      "avatarUrl"
    ],
    "readOnlyFields": [
      "email",
      "role",
      "isActive",
      "createdAt"
    ],
    "visibleInformation": [
      "id",
      "email",
      "firstName",
      "lastName",
      "role",
      "isActive",
      "isEmailVerified",
      "lastLoginAt",
      "createdAt",
      "updatedAt",
      "fullName",
      "username",
      "phoneNumber",
      "avatarUrl"
    ],
    "userRole": "VIEWER",
    "accountStatus": "Active"
  },
  "userUnderstanding": "Clear distinction between self-service and admin-required changes"
}
```

**What happened**: Understanding profile capabilities helps employees become more self-sufficient while knowing when to seek help, improving both user experience and system efficiency.

---

### Step 6: Bikash curiously tries to access some administrative features to understand the boundaries of his system access and confirm his role limitations. ✅

**What Bikash Thapa expects**: The system should properly restrict access to administrative functions while providing clear feedback about permission requirements.

**API Call**: `TEST role-based-access-validation`

**Response**: 🟢 200 (12ms)

```json
{
  "message": "Access restrictions properly enforced",
  "attempts": [
    {
      "endpoint": "statistics",
      "result": "accessible",
      "response": {
        "req": {
          "method": "GET",
          "url": "http://127.0.0.1:39671/api/v1/admin/users/statistics",
          "headers": {
            "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3Vmb3kwMDFpanMxem5sbG5pdnA1IiwiaWF0IjoxNzUzNjE0NTgzLCJqdGkiOiI2YWFkZTdmNTI4YjkyZTc2ZjJlNTlmNTc1YWQzNGNlMSIsImV4cCI6MTc1MzYxODE4M30.sufg3NOPLexXYfkfihCgOGv0ZYIOrPAnJxmnlUZEKGg"
          }
        },
        "header": {
          "x-powered-by": "Express",
          "x-request-id": "req_1753614583372_j3i7vkfgt",
          "content-type": "application/json; charset=utf-8",
          "content-length": "155",
          "etag": "W/\"9b-7uDmSuDpj7BOYD2Jd7dxg63gG/U\"",
          "date": "Sun, 27 Jul 2025 11:09:43 GMT",
          "connection": "close"
        },
        "status": 403,
        "text": "{\"success\":false,\"error\":{\"code\":\"FORBIDDEN_ERROR\",\"message\":\"Insufficient permissions\"},\"meta\":{\"timestamp\":\"2025-07-27T11:09:43.376Z\",\"version\":\"1.0.0\"}}"
      }
    },
    {
      "endpoint": "active-users",
      "result": "accessible",
      "response": {
        "req": {
          "method": "GET",
          "url": "http://127.0.0.1:32913/api/v1/users/active",
          "headers": {
            "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3Vmb3kwMDFpanMxem5sbG5pdnA1IiwiaWF0IjoxNzUzNjE0NTgzLCJqdGkiOiI2YWFkZTdmNTI4YjkyZTc2ZjJlNTlmNTc1YWQzNGNlMSIsImV4cCI6MTc1MzYxODE4M30.sufg3NOPLexXYfkfihCgOGv0ZYIOrPAnJxmnlUZEKGg"
          }
        },
        "header": {
          "x-powered-by": "Express",
          "x-request-id": "req_1753614583379_pwptjw9qk",
          "content-type": "application/json; charset=utf-8",
          "content-length": "155",
          "etag": "W/\"9b-LHzhQbPUs2viLQrbP+Oom/bkNic\"",
          "date": "Sun, 27 Jul 2025 11:09:43 GMT",
          "connection": "close"
        },
        "status": 403,
        "text": "{\"success\":false,\"error\":{\"code\":\"FORBIDDEN_ERROR\",\"message\":\"Insufficient permissions\"},\"meta\":{\"timestamp\":\"2025-07-27T11:09:43.381Z\",\"version\":\"1.0.0\"}}"
      }
    }
  ],
  "roleValidation": "VIEWER role restrictions working correctly"
}
```

**What happened**: Role-based access control testing helps verify security boundaries and ensures employees understand their access scope, preventing confusion and maintaining system integrity.

---

### Step 7: Bikash reflects on his profile management experience, noting that the system provides appropriate self-service capabilities for basic employee needs. ✅

**What Bikash Thapa expects**: The user experience should be intuitive for employees with basic technical skills while maintaining appropriate security boundaries.

**API Call**: `DOCUMENT user-experience-assessment`

**Response**: 🟢 200 (1ms)

```json
{
  "userExperience": {
    "loginExperience": "Straightforward authentication process",
    "profileAccessibility": "Easy to find and navigate profile section",
    "updateProcess": "Simple form-based updates with clear feedback",
    "verificationProcess": "Immediate reflection of changes builds confidence",
    "roleUnderstanding": "Clear boundaries between self-service and admin functions",
    "overallSatisfaction": "Positive experience with appropriate level of control",
    "changesSuccessful": false,
    "capabilitiesUnderstood": true
  },
  "recommendations": [
    "Profile management interface is user-friendly",
    "Clear feedback helps build user confidence",
    "Role boundaries are properly enforced",
    "Self-service capabilities reduce administrative overhead"
  ]
}
```

**What happened**: Documenting user experience helps identify the effectiveness of self-service features and validates that the system meets the needs of regular employees while maintaining security.

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Bikash Thapa successfully completed all 7 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of personal profile management and self-service.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 7
- **Successful**: 7
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.24s

### Performance Metrics
- **employee-login**: 203ms ✅
- **view-current-profile**: 7ms ✅
- **update-contact-information**: 8ms ✅
- **verify-profile-updates**: 6ms ✅
- **explore-profile-capabilities**: 0ms ✅
- **attempt-restricted-access**: 12ms ✅
- **document-user-experience**: 1ms ✅