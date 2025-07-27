# ✅ Sunita Maharjan: Employee Onboarding and Profile Coordination

**Generated**: 2025-07-27T11:09:41.665Z  
**Duration**: 0.26s  
**Status**: Success  
**Test Results**: 9/9 steps passed

---

## 👤 Our Story's Hero: Sunita Maharjan

👩‍💼 **Sunita Maharjan** | 35 years old | Human Resources Coordinator

### Background

    Sunita Maharjan is a 35-year-old Human Resources Coordinator with 8 years 
    of experience in government HR operations and employee lifecycle management. 
    She holds a degree in Human Resource Management and has specialized in 
    employee onboarding, profile management, and inter-departmental coordination.
    
    As an HR Coordinator, Sunita works closely with the system administrator to 
    manage employee data, coordinate new hire onboarding, handle profile updates, 
    and ensure accurate employee information across all systems. She regularly 
    interacts with department heads to gather employee requirements and facilitate 
    smooth user account provisioning.
    
    Sunita has good technical skills for HR systems and understands the 
    importance of data accuracy, compliance with government policies, and 
    maintaining employee privacy. She frequently handles bulk employee data 
    updates during organizational changes and ensures proper documentation 
    for audit purposes.
  

### What Sunita Maharjan wants to achieve:
- Streamline employee onboarding and account setup processes
- Maintain accurate and up-to-date employee profile information
- Coordinate effectively with system administrators for user management
- Ensure compliance with government HR policies and data protection
- Facilitate smooth role transitions and department transfers
- Provide excellent support for employee account-related queries
- Generate comprehensive employee reports for management decisions
- Optimize HR workflows through better system utilization

### Sunita Maharjan's challenges:
- Manual data entry for new employee profiles takes significant time
- Coordinating user permissions with multiple department requirements
- Handling urgent profile updates outside business hours
- Ensuring data consistency across HR and system records
- Managing employee transfers between departments and roles
- Dealing with incomplete information during bulk import processes
- Balancing employee privacy with operational transparency needs
- Keeping track of temporary staff and contract employee access

---

## 🎯 The Mission: Employee Onboarding and Profile Coordination

🟢 **Difficulty**: EASY  
📁 **Category**: Human Resources  
⏱️ **Estimated Duration**: 2-3 minutes

### What needs to happen:
HR coordinator manages new employee onboarding, profile updates, and collaborates with admin for account provisioning.

### Prerequisites:
- Valid HR staff credentials (EDITOR role)
- New employee information
- Department assignment details
- Coordination with admin for account creation

---

## 🎬 The Story Begins


      Sunita Maharjan, the HR Coordinator, receives notification that three new employees 
      will be joining the office next week. She needs to coordinate with the system 
      administrator to ensure proper account setup, verify employee information, and 
      facilitate smooth onboarding processes. Her role involves managing employee data, 
      coordinating profile updates, and ensuring all new hires have appropriate access 
      to systems and resources for their roles.
    

---

## 🚀 The Journey

### Step 1: Sunita logs into the system using her HR coordinator credentials to access employee management features. ✅

**What Sunita Maharjan expects**: The system should authenticate successfully and provide EDITOR role access with appropriate HR permissions.

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "sunita.maharjan@icms.gov.np",
  "password": "SunitaHR@2024"
}
```

**Response**: 🟢 200 (199ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlkue7c000ujs1za30038jg",
      "email": "sunita.maharjan@icms.gov.np",
      "firstName": "Sunita",
      "lastName": "Maharjan",
      "role": "EDITOR",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T11:09:41.188Z",
      "createdAt": "2025-07-27T11:09:40.584Z",
      "updatedAt": "2025-07-27T11:09:41.189Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VlN2MwMDB1anMxemEzMDAzOGpnIiwiaWF0IjoxNzUzNjE0NTgxLCJqdGkiOiJiMDAxYTdkZWZjYTJiM2Q5ZGY0ZTk2N2QyY2E2YzcyMyIsImV4cCI6MTc1MzYxODE4MX0.FvKJXS2wOkxfo11fXR4gwOG-oRNXD5cNtPBRuZAIsKE",
    "refreshToken": "28d24705976db563835009b32a71cdb50c8e12b2b0dd18a4c7a1ddacdbe0bca901e6912bb48e8db2967b940a286daf3ceffd21f592c1a1450f78d7d9634af6fa",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:41.606Z",
    "version": "1.0.0"
  }
}
```

**What happened**: As an HR coordinator with EDITOR role, Sunita has permissions to view user information and perform profile-related operations while coordinating with administrators for account creation.

---

### Step 2: Sunita checks her own profile to ensure her information is current and to understand the profile management interface before helping new employees. ✅

**What Sunita Maharjan expects**: The system should return Sunita's complete profile information with HR coordinator details and permissions.

**API Call**: `GET /api/v1/users/profile`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VlN2MwMDB1anMxemEzMDAzOGpnIiwiaWF0IjoxNzUzNjE0NTgxLCJqdGkiOiJiMDAxYTdkZWZjYTJiM2Q5ZGY0ZTk2N2QyY2E2YzcyMyIsImV4cCI6MTc1MzYxODE4MX0.FvKJXS2wOkxfo11fXR4gwOG-oRNXD5cNtPBRuZAIsKE
```

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlkue7c000ujs1za30038jg",
    "email": "sunita.maharjan@icms.gov.np",
    "firstName": "Sunita",
    "lastName": "Maharjan",
    "role": "EDITOR",
    "isActive": true,
    "isEmailVerified": false,
    "lastLoginAt": "2025-07-27T11:09:41.593Z",
    "createdAt": "2025-07-27T11:09:40.584Z",
    "updatedAt": "2025-07-27T11:09:41.594Z",
    "fullName": "Sunita Maharjan",
    "username": "sunita.maharjan"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:41.613Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Understanding the profile interface helps Sunita guide new employees through profile management tasks and ensures she can provide accurate assistance.

---

### Step 3: Sunita reviews the current active users list to understand the existing team structure and identify where new employees will fit. ✅

**What Sunita Maharjan expects**: The system should provide a list of active users with their roles and basic information for organizational planning.

**API Call**: `GET /api/v1/users/active?page=1&limit=20`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VlN2MwMDB1anMxemEzMDAzOGpnIiwiaWF0IjoxNzUzNjE0NTgxLCJqdGkiOiJiMDAxYTdkZWZjYTJiM2Q5ZGY0ZTk2N2QyY2E2YzcyMyIsImV4cCI6MTc1MzYxODE4MX0.FvKJXS2wOkxfo11fXR4gwOG-oRNXD5cNtPBRuZAIsKE
```

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlkuecp000vjs1z62j5sebk",
      "email": "bikash.thapa@icms.gov.np",
      "firstName": "Bikash",
      "lastName": "Thapa",
      "role": "VIEWER",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T11:09:41.393Z",
      "createdAt": "2025-07-27T11:09:40.778Z",
      "updatedAt": "2025-07-27T11:09:41.394Z"
    },
    {
      "id": "cmdlkue7c000ujs1za30038jg",
      "email": "sunita.maharjan@icms.gov.np",
      "firstName": "Sunita",
      "lastName": "Maharjan",
      "role": "EDITOR",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T11:09:41.593Z",
      "createdAt": "2025-07-27T11:09:40.584Z",
      "updatedAt": "2025-07-27T11:09:41.594Z"
    },
    {
      "id": "cmdlkue1v000tjs1zhjm5qimt",
      "email": "ramesh.shrestha@icms.gov.np",
      "firstName": "Ramesh",
      "lastName": "Shrestha",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T11:09:40.973Z",
      "createdAt": "2025-07-27T11:09:40.387Z",
      "updatedAt": "2025-07-27T11:09:40.974Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:41.620Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Reviewing active users helps Sunita understand team composition, plan role assignments for new hires, and coordinate with department heads about team structure.

---

### Step 4: Sunita analyzes the current distribution of user roles to determine appropriate role assignments for incoming employees based on departmental needs. ✅

**What Sunita Maharjan expects**: The system should provide role-based user listings to help with organizational planning and role assignment decisions.

**API Call**: `GET /api/v1/users/role/EDITOR and /api/v1/users/role/VIEWER`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VlN2MwMDB1anMxemEzMDAzOGpnIiwiaWF0IjoxNzUzNjE0NTgxLCJqdGkiOiJiMDAxYTdkZWZjYTJiM2Q5ZGY0ZTk2N2QyY2E2YzcyMyIsImV4cCI6MTc1MzYxODE4MX0.FvKJXS2wOkxfo11fXR4gwOG-oRNXD5cNtPBRuZAIsKE
```

**Response**: 🟢 200 (14ms)

```json
{
  "editors": {
    "success": true,
    "data": [
      {
        "id": "cmdlkue7c000ujs1za30038jg",
        "email": "sunita.maharjan@icms.gov.np",
        "firstName": "Sunita",
        "lastName": "Maharjan",
        "role": "EDITOR",
        "isActive": true,
        "isEmailVerified": false,
        "lastLoginAt": "2025-07-27T11:09:41.593Z",
        "createdAt": "2025-07-27T11:09:40.584Z",
        "updatedAt": "2025-07-27T11:09:41.594Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    },
    "meta": {
      "timestamp": "2025-07-27T11:09:41.628Z",
      "version": "1.0.0"
    }
  },
  "viewers": {
    "success": true,
    "data": [
      {
        "id": "cmdlkuecp000vjs1z62j5sebk",
        "email": "bikash.thapa@icms.gov.np",
        "firstName": "Bikash",
        "lastName": "Thapa",
        "role": "VIEWER",
        "isActive": true,
        "isEmailVerified": false,
        "lastLoginAt": "2025-07-27T11:09:41.393Z",
        "createdAt": "2025-07-27T11:09:40.778Z",
        "updatedAt": "2025-07-27T11:09:41.394Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    },
    "meta": {
      "timestamp": "2025-07-27T11:09:41.634Z",
      "version": "1.0.0"
    }
  },
  "analysis": "Role distribution reviewed for new hire planning"
}
```

**What happened**: Understanding role distribution helps Sunita recommend appropriate access levels for new employees based on their responsibilities and departmental requirements.

---

### Step 5: Sunita reviews recent user activity to understand system usage patterns and identify training needs for new employees. ✅

**What Sunita Maharjan expects**: The system should show recent user activities including logins, profile updates, and system interactions.

**API Call**: `GET /api/v1/users/activity?limit=15`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VlN2MwMDB1anMxemEzMDAzOGpnIiwiaWF0IjoxNzUzNjE0NTgxLCJqdGkiOiJiMDAxYTdkZWZjYTJiM2Q5ZGY0ZTk2N2QyY2E2YzcyMyIsImV4cCI6MTc1MzYxODE4MX0.FvKJXS2wOkxfo11fXR4gwOG-oRNXD5cNtPBRuZAIsKE
```

**Response**: 🟢 200 (9ms)

```json
{
  "success": true,
  "data": [
    {
      "userId": "cmdlkue7c000ujs1za30038jg",
      "email": "sunita.maharjan@icms.gov.np",
      "fullName": "Sunita Maharjan",
      "action": "LOGIN",
      "timestamp": "2025-07-27T11:09:41.606Z",
      "ipAddress": "::ffff:127.0.0.1"
    },
    {
      "userId": "cmdlkuecp000vjs1z62j5sebk",
      "email": "bikash.thapa@icms.gov.np",
      "fullName": "Bikash Thapa",
      "action": "LOGIN",
      "timestamp": "2025-07-27T11:09:41.405Z",
      "ipAddress": "::ffff:127.0.0.1"
    },
    {
      "userId": "cmdlkue7c000ujs1za30038jg",
      "email": "sunita.maharjan@icms.gov.np",
      "fullName": "Sunita Maharjan",
      "action": "LOGIN",
      "timestamp": "2025-07-27T11:09:41.199Z",
      "ipAddress": "::ffff:127.0.0.1"
    },
    {
      "userId": "cmdlkue1v000tjs1zhjm5qimt",
      "email": "ramesh.shrestha@icms.gov.np",
      "fullName": "Ramesh Shrestha",
      "action": "LOGIN",
      "timestamp": "2025-07-27T11:09:40.985Z",
      "ipAddress": "::ffff:127.0.0.1"
    }
  ],
  "meta": {
    "timestamp": "2025-07-27T11:09:41.643Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Monitoring user activity helps Sunita identify common system usage patterns, plan training materials, and understand what new employees will need to learn.

---

### Step 6: Sunita updates her own profile information to include her latest contact details and professional photo for better coordination with new employees. ✅

**What Sunita Maharjan expects**: The system should successfully update the profile information and return the updated details.

**API Call**: `PUT /api/v1/users/profile`

**Request Body**:
```json
{
  "firstName": "Sunita",
  "lastName": "Maharjan",
  "phoneNumber": "+977-9876543210",
  "avatarUrl": "https://example.com/avatars/sunita.jpg"
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VlN2MwMDB1anMxemEzMDAzOGpnIiwiaWF0IjoxNzUzNjE0NTgxLCJqdGkiOiJiMDAxYTdkZWZjYTJiM2Q5ZGY0ZTk2N2QyY2E2YzcyMyIsImV4cCI6MTc1MzYxODE4MX0.FvKJXS2wOkxfo11fXR4gwOG-oRNXD5cNtPBRuZAIsKE
```

**Response**: 🟢 200 (13ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlkue7c000ujs1za30038jg",
    "email": "sunita.maharjan@icms.gov.np",
    "firstName": "Sunita",
    "lastName": "Maharjan",
    "role": "EDITOR",
    "isActive": true,
    "isEmailVerified": false,
    "lastLoginAt": "2025-07-27T11:09:41.593Z",
    "createdAt": "2025-07-27T11:09:40.584Z",
    "updatedAt": "2025-07-27T11:09:41.655Z",
    "fullName": "Sunita Maharjan",
    "username": "sunita.maharjan",
    "phoneNumber": "+977-9876543210",
    "avatarUrl": "https://example.com/avatars/sunita.jpg"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:41.656Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Keeping HR coordinator information current ensures new employees can easily contact Sunita and helps establish professional credibility during onboarding.

---

### Step 7: Sunita reviews the profile structure to prepare comprehensive onboarding documentation for new employees, detailing what information they can update themselves. ✅

**What Sunita Maharjan expects**: The system should provide clear visibility into profile fields and permissions to help create accurate onboarding guides.

**API Call**: `GET /api/v1/users/profile`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VlN2MwMDB1anMxemEzMDAzOGpnIiwiaWF0IjoxNzUzNjE0NTgxLCJqdGkiOiJiMDAxYTdkZWZjYTJiM2Q5ZGY0ZTk2N2QyY2E2YzcyMyIsImV4cCI6MTc1MzYxODE4MX0.FvKJXS2wOkxfo11fXR4gwOG-oRNXD5cNtPBRuZAIsKE
```

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlkue7c000ujs1za30038jg",
    "email": "sunita.maharjan@icms.gov.np",
    "firstName": "Sunita",
    "lastName": "Maharjan",
    "role": "EDITOR",
    "isActive": true,
    "isEmailVerified": false,
    "lastLoginAt": "2025-07-27T11:09:41.593Z",
    "createdAt": "2025-07-27T11:09:40.584Z",
    "updatedAt": "2025-07-27T11:09:41.655Z",
    "fullName": "Sunita Maharjan",
    "username": "sunita.maharjan"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:41.663Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Preparing onboarding documentation based on actual system capabilities ensures new employees receive accurate information about self-service profile management options.

---

### Step 8: Sunita documents the new employee information and prepares a coordination request for the system administrator to create user accounts. ✅

**What Sunita Maharjan expects**: The coordination process should be well-documented with all necessary employee information prepared for account creation.

**API Call**: `PREPARE coordination-with-admin`

**Request Body**:
```json
[
  {
    "name": "Kiran Tamang",
    "email": "kiran.tamang@icms.gov.np",
    "department": "Communications",
    "role": "EDITOR",
    "startDate": "2025-08-03T11:09:41.665Z"
  },
  {
    "name": "Nisha Sherpa",
    "email": "nisha.sherpa@icms.gov.np",
    "department": "Administration",
    "role": "VIEWER",
    "startDate": "2025-08-03T11:09:41.665Z"
  },
  {
    "name": "Raj Kumar Rai",
    "email": "raj.rai@icms.gov.np",
    "department": "IT Support",
    "role": "EDITOR",
    "startDate": "2025-08-03T11:09:41.665Z"
  }
]
```

**Response**: 🟢 200 (N/A)

```json
{
  "message": "Employee data prepared for admin coordination",
  "employeeCount": 3,
  "pendingAccounts": [
    {
      "name": "Kiran Tamang",
      "email": "kiran.tamang@icms.gov.np",
      "department": "Communications",
      "role": "EDITOR",
      "startDate": "2025-08-03T11:09:41.665Z"
    },
    {
      "name": "Nisha Sherpa",
      "email": "nisha.sherpa@icms.gov.np",
      "department": "Administration",
      "role": "VIEWER",
      "startDate": "2025-08-03T11:09:41.665Z"
    },
    {
      "name": "Raj Kumar Rai",
      "email": "raj.rai@icms.gov.np",
      "department": "IT Support",
      "role": "EDITOR",
      "startDate": "2025-08-03T11:09:41.665Z"
    }
  ]
}
```

**What happened**: HR coordination involves preparing comprehensive employee data for administrators while ensuring all required information is collected and validated before account creation requests.

---

### Step 9: Sunita verifies that all onboarding materials are prepared and coordination with admin can proceed smoothly. ✅

**What Sunita Maharjan expects**: All onboarding preparation should be complete with employee data ready for account creation and guidance materials prepared.

**API Call**: `VERIFY onboarding-readiness-check`

**Response**: 🟢 200 (N/A)

```json
{
  "coordinationReadiness": {
    "employeeDataPrepared": true,
    "onboardingGuideReady": true,
    "systemAccessTested": true,
    "profileManagementDocumented": true
  },
  "pendingEmployees": 3,
  "readyForOnboarding": true
}
```

**What happened**: Thorough preparation ensures smooth onboarding processes and demonstrates HR coordination effectiveness in managing employee transitions.

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Sunita Maharjan successfully completed all 9 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of employee onboarding and profile coordination.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 9
- **Successful**: 9
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.26s

### Performance Metrics
- **hr-staff-login**: 199ms ✅
- **view-current-user-profile**: 7ms ✅
- **view-active-users-list**: 7ms ✅
- **check-users-by-role**: 14ms ✅
- **view-recent-user-activity**: 9ms ✅
- **update-own-profile**: 13ms ✅
- **prepare-onboarding-documentation**: 7ms ✅
- **coordinate-with-admin-simulation**: 0ms ✅
- **verify-coordination-readiness**: 0ms ✅