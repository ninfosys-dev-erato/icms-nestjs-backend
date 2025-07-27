# ✅ Ramesh Shrestha: Comprehensive User Account Management

**Generated**: 2025-07-27T11:09:39.895Z  
**Duration**: 0.51s  
**Status**: Success  
**Test Results**: 10/10 steps passed

---

## 👤 Our Story's Hero: Ramesh Shrestha

👨‍💼 **Ramesh Shrestha** | 42 years old | System Administrator & User Manager

### Background

    Ramesh Shrestha is a 42-year-old System Administrator with over 15 years 
    of experience in government IT systems and user management. He holds a 
    Master's degree in Information Systems and has specialized in identity 
    management, access control, and system security.
    
    As the primary system administrator for the government CMS, Ramesh is 
    responsible for managing user accounts, setting permissions, overseeing 
    bulk operations, and maintaining system security. He handles user 
    onboarding, role assignments, account lifecycle management, and provides 
    technical support to department heads.
    
    Ramesh has deep expertise in user authentication systems, role-based 
    access control, audit logging, and compliance requirements. He regularly 
    performs user audits, manages bulk operations for new employee onboarding, 
    and ensures the system meets security and governance standards.
  

### What Ramesh Shrestha wants to achieve:
- Efficiently manage user accounts across all government departments
- Implement secure user onboarding and offboarding processes
- Maintain comprehensive audit trails for compliance
- Optimize bulk operations for large-scale user management
- Ensure proper role-based access control enforcement
- Provide timely technical support for user account issues
- Generate detailed reports on user activity and system usage
- Maintain system security and prevent unauthorized access

### Ramesh Shrestha's challenges:
- Managing large volumes of user creation during hiring seasons
- Ensuring consistent role assignments across departments
- Handling urgent account activation requests efficiently
- Maintaining data accuracy during bulk import operations
- Coordinating user permissions with department requirements
- Dealing with password reset requests and security incidents
- Balancing security requirements with user convenience
- Keeping track of inactive accounts and system cleanup

---

## 🎯 The Mission: Comprehensive User Account Management

🟡 **Difficulty**: MEDIUM  
📁 **Category**: User Management  
⏱️ **Estimated Duration**: 3-5 minutes

### What needs to happen:
System administrator manages user accounts, permissions, and performs bulk operations for efficient user lifecycle management.

### Prerequisites:
- Valid admin credentials
- Database with existing user accounts
- System permissions for user management operations
- CSV file for bulk import testing

---

## 🎬 The Story Begins


      Ramesh Shrestha, the experienced System Administrator, starts his day by reviewing 
      the user management dashboard. As the government office is expanding, he needs to 
      efficiently manage user accounts, handle new employee onboarding, and maintain 
      system security. Today's tasks include creating new user accounts, updating existing 
      user permissions, performing bulk operations, and generating user activity reports 
      for the monthly compliance review.
    

---

## 🚀 The Journey

### Step 1: Ramesh logs into the system using his administrator credentials to access the user management dashboard. ✅

**What Ramesh Shrestha expects**: The system should authenticate successfully and provide admin access token with full privileges.

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "ramesh.shrestha@icms.gov.np",
  "password": "RameshAdmin@2024"
}
```

**Response**: 🟢 200 (204ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlkucg60000js1zxduq3hum",
      "email": "ramesh.shrestha@icms.gov.np",
      "firstName": "Ramesh",
      "lastName": "Shrestha",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T11:09:38.921Z",
      "createdAt": "2025-07-27T11:09:38.310Z",
      "updatedAt": "2025-07-27T11:09:38.922Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VjZzYwMDAwanMxenhkdXEzaHVtIiwiaWF0IjoxNzUzNjE0NTc5LCJqdGkiOiI5NzI1YzliMTIwNDBjZjE4MGQ4MmM2MzQ1MTBmODAxYyIsImV4cCI6MTc1MzYxODE3OX0.NtmnErGsVHxyw-wNVbG8NXKODKwm1cEKjbzJmwxMCuk",
    "refreshToken": "63534fe279ff0eacb2a3f777decaf0559d88293c467964d158a22b867723dea739665d1b14f8b0c0aefd119dbf3357856ae0be3fc82382647220dd69eb9a59df",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:39.584Z",
    "version": "1.0.0"
  }
}
```

**What happened**: As a system administrator, Ramesh requires elevated privileges to manage user accounts. The authentication process validates his admin role and grants access to administrative functions.

---

### Step 2: Ramesh reviews the user statistics dashboard to understand the current user base composition and system usage. ✅

**What Ramesh Shrestha expects**: The system should display comprehensive user statistics including total users, active users, role distribution, and recent activity metrics.

**API Call**: `GET /api/v1/admin/users/statistics`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VjZzYwMDAwanMxenhkdXEzaHVtIiwiaWF0IjoxNzUzNjE0NTc5LCJqdGkiOiI5NzI1YzliMTIwNDBjZjE4MGQ4MmM2MzQ1MTBmODAxYyIsImV4cCI6MTc1MzYxODE3OX0.NtmnErGsVHxyw-wNVbG8NXKODKwm1cEKjbzJmwxMCuk
```

**Response**: 🟢 200 (10ms)

```json
{
  "success": true,
  "data": {
    "total": 3,
    "active": 3,
    "byRole": {
      "EDITOR": 1,
      "ADMIN": 1,
      "VIEWER": 1
    },
    "verified": 0,
    "unverified": 3,
    "recentRegistrations": 3,
    "recentLogins": 3
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:39.593Z",
    "version": "1.0.0"
  }
}
```

**What happened**: User statistics provide Ramesh with essential insights for capacity planning, security monitoring, and understanding system utilization patterns across different user roles.

---

### Step 3: Ramesh creates a new user account for Sita Poudel, a new content editor joining the communications department. ✅

**What Ramesh Shrestha expects**: The system should create the user account with appropriate role permissions and return the user details without the password.

**API Call**: `POST /api/v1/admin/users`

**Request Body**:
```json
{
  "email": "new.employee@icms.gov.np",
  "password": "TempPassword123!",
  "firstName": "Sita",
  "lastName": "Poudel",
  "role": "EDITOR",
  "isActive": true,
  "phoneNumber": "+977-9812345678"
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VjZzYwMDAwanMxenhkdXEzaHVtIiwiaWF0IjoxNzUzNjE0NTc5LCJqdGkiOiI5NzI1YzliMTIwNDBjZjE4MGQ4MmM2MzQ1MTBmODAxYyIsImV4cCI6MTc1MzYxODE3OX0.NtmnErGsVHxyw-wNVbG8NXKODKwm1cEKjbzJmwxMCuk
```

**Response**: 🟢 201 (207ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlkudlb000njs1z01yap42h",
    "email": "new.employee@icms.gov.np",
    "firstName": "Sita",
    "lastName": "Poudel",
    "role": "EDITOR",
    "isActive": true,
    "isEmailVerified": false,
    "lastLoginAt": null,
    "createdAt": "2025-07-27T11:09:39.791Z",
    "updatedAt": "2025-07-27T11:09:39.791Z"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:39.800Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Creating new user accounts is a core administrative function. The system validates input data, hashes the password securely, assigns the specified role, and creates an audit trail for the account creation.

---

### Step 4: Ramesh verifies that the new user account was created correctly and checks the user details. ✅

**What Ramesh Shrestha expects**: The system should return the complete user profile with correct role assignment and account status.

**API Call**: `GET /api/v1/admin/users/cmdlkudlb000njs1z01yap42h`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VjZzYwMDAwanMxenhkdXEzaHVtIiwiaWF0IjoxNzUzNjE0NTc5LCJqdGkiOiI5NzI1YzliMTIwNDBjZjE4MGQ4MmM2MzQ1MTBmODAxYyIsImV4cCI6MTc1MzYxODE3OX0.NtmnErGsVHxyw-wNVbG8NXKODKwm1cEKjbzJmwxMCuk
```

**Response**: 🟢 200 (8ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlkudlb000njs1z01yap42h",
    "email": "new.employee@icms.gov.np",
    "firstName": "Sita",
    "lastName": "Poudel",
    "role": "EDITOR",
    "isActive": true,
    "isEmailVerified": false,
    "lastLoginAt": null,
    "createdAt": "2025-07-27T11:09:39.791Z",
    "updatedAt": "2025-07-27T11:09:39.791Z"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:39.809Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Verification ensures that the user account was created with the correct information and settings. This step is crucial for maintaining data integrity and confirming successful account provisioning.

---

### Step 5: Ramesh promotes Sita to ADMIN role after realizing she will need additional system privileges for her new responsibilities. ✅

**What Ramesh Shrestha expects**: The system should update the user role and reflect the change in the user's permissions.

**API Call**: `PUT /api/v1/admin/users/cmdlkudlb000njs1z01yap42h/role`

**Request Body**:
```json
{
  "role": "ADMIN"
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VjZzYwMDAwanMxenhkdXEzaHVtIiwiaWF0IjoxNzUzNjE0NTc5LCJqdGkiOiI5NzI1YzliMTIwNDBjZjE4MGQ4MmM2MzQ1MTBmODAxYyIsImV4cCI6MTc1MzYxODE3OX0.NtmnErGsVHxyw-wNVbG8NXKODKwm1cEKjbzJmwxMCuk
```

**Response**: 🟢 200 (23ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlkudlb000njs1z01yap42h",
    "email": "new.employee@icms.gov.np",
    "firstName": "Sita",
    "lastName": "Poudel",
    "role": "ADMIN",
    "isActive": true,
    "isEmailVerified": false,
    "lastLoginAt": null,
    "createdAt": "2025-07-27T11:09:39.791Z",
    "updatedAt": "2025-07-27T11:09:39.829Z"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:39.831Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Role updates are common in dynamic organizations. The system must handle role changes securely, ensuring proper permission inheritance and maintaining audit trails for compliance.

---

### Step 6: Ramesh tests the user activation workflow by temporarily deactivating and then reactivating Sita's account to ensure the process works correctly. ✅

**What Ramesh Shrestha expects**: The system should properly handle both deactivation and reactivation, managing session cleanup and access control appropriately.

**API Call**: `POST /api/v1/admin/users/cmdlkudlb000njs1z01yap42h/deactivate and /activate`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VjZzYwMDAwanMxenhkdXEzaHVtIiwiaWF0IjoxNzUzNjE0NTc5LCJqdGkiOiI5NzI1YzliMTIwNDBjZjE4MGQ4MmM2MzQ1MTBmODAxYyIsImV4cCI6MTc1MzYxODE3OX0.NtmnErGsVHxyw-wNVbG8NXKODKwm1cEKjbzJmwxMCuk
```

**Response**: 🟢 200 (25ms)

```json
{
  "deactivate": {
    "success": true,
    "data": {
      "id": "cmdlkudlb000njs1z01yap42h",
      "email": "new.employee@icms.gov.np",
      "firstName": "Sita",
      "lastName": "Poudel",
      "role": "ADMIN",
      "isActive": false,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T11:09:39.791Z",
      "updatedAt": "2025-07-27T11:09:39.845Z"
    },
    "meta": {
      "timestamp": "2025-07-27T11:09:39.847Z",
      "version": "1.0.0"
    }
  },
  "activate": {
    "success": true,
    "data": {
      "id": "cmdlkudlb000njs1z01yap42h",
      "email": "new.employee@icms.gov.np",
      "firstName": "Sita",
      "lastName": "Poudel",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T11:09:39.791Z",
      "updatedAt": "2025-07-27T11:09:39.855Z"
    },
    "meta": {
      "timestamp": "2025-07-27T11:09:39.857Z",
      "version": "1.0.0"
    }
  }
}
```

**What happened**: User activation/deactivation is critical for managing temporary access restrictions, handling employee leaves, or addressing security concerns. The system must properly manage session states and access permissions.

---

### Step 7: Ramesh reviews the list of currently active users to monitor system usage and identify any unusual access patterns. ✅

**What Ramesh Shrestha expects**: The system should return a paginated list of active users with their basic information and last activity details.

**API Call**: `GET /api/v1/users/active?page=1&limit=10`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VjZzYwMDAwanMxenhkdXEzaHVtIiwiaWF0IjoxNzUzNjE0NTc5LCJqdGkiOiI5NzI1YzliMTIwNDBjZjE4MGQ4MmM2MzQ1MTBmODAxYyIsImV4cCI6MTc1MzYxODE3OX0.NtmnErGsVHxyw-wNVbG8NXKODKwm1cEKjbzJmwxMCuk
```

**Response**: 🟢 200 (8ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlkudlb000njs1z01yap42h",
      "email": "new.employee@icms.gov.np",
      "firstName": "Sita",
      "lastName": "Poudel",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T11:09:39.791Z",
      "updatedAt": "2025-07-27T11:09:39.855Z"
    },
    {
      "id": "cmdlkucre0002js1za2y7yp2f",
      "email": "bikash.thapa@icms.gov.np",
      "firstName": "Bikash",
      "lastName": "Thapa",
      "role": "VIEWER",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T11:09:39.364Z",
      "createdAt": "2025-07-27T11:09:38.715Z",
      "updatedAt": "2025-07-27T11:09:39.366Z"
    },
    {
      "id": "cmdlkuclx0001js1zz6gvoglh",
      "email": "sunita.maharjan@icms.gov.np",
      "firstName": "Sunita",
      "lastName": "Maharjan",
      "role": "EDITOR",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T11:09:39.162Z",
      "createdAt": "2025-07-27T11:09:38.518Z",
      "updatedAt": "2025-07-27T11:09:39.163Z"
    },
    {
      "id": "cmdlkucg60000js1zxduq3hum",
      "email": "ramesh.shrestha@icms.gov.np",
      "firstName": "Ramesh",
      "lastName": "Shrestha",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T11:09:39.570Z",
      "createdAt": "2025-07-27T11:09:38.310Z",
      "updatedAt": "2025-07-27T11:09:39.571Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:39.865Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Monitoring active users helps administrators track system usage, identify potential security issues, and ensure proper resource allocation. Regular review of active users is a key security practice.

---

### Step 8: Ramesh examines recent user activity logs to identify any suspicious behavior and ensure compliance with security policies. ✅

**What Ramesh Shrestha expects**: The system should provide detailed activity logs showing user actions, timestamps, and IP addresses for security monitoring.

**API Call**: `GET /api/v1/admin/users/activity?limit=20`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VjZzYwMDAwanMxenhkdXEzaHVtIiwiaWF0IjoxNzUzNjE0NTc5LCJqdGkiOiI5NzI1YzliMTIwNDBjZjE4MGQ4MmM2MzQ1MTBmODAxYyIsImV4cCI6MTc1MzYxODE3OX0.NtmnErGsVHxyw-wNVbG8NXKODKwm1cEKjbzJmwxMCuk
```

**Response**: 🟢 200 (8ms)

```json
{
  "success": true,
  "data": [
    {
      "userId": "unknown",
      "email": "unknown",
      "fullName": "Unknown User",
      "action": "USER_CREATED",
      "timestamp": "2025-07-27T11:09:39.799Z",
      "ipAddress": "system"
    },
    {
      "userId": "cmdlkucg60000js1zxduq3hum",
      "email": "ramesh.shrestha@icms.gov.np",
      "fullName": "Ramesh Shrestha",
      "action": "LOGIN",
      "timestamp": "2025-07-27T11:09:39.583Z",
      "ipAddress": "::ffff:127.0.0.1"
    },
    {
      "userId": "cmdlkucre0002js1za2y7yp2f",
      "email": "bikash.thapa@icms.gov.np",
      "fullName": "Bikash Thapa",
      "action": "LOGIN",
      "timestamp": "2025-07-27T11:09:39.377Z",
      "ipAddress": "::ffff:127.0.0.1"
    },
    {
      "userId": "cmdlkuclx0001js1zz6gvoglh",
      "email": "sunita.maharjan@icms.gov.np",
      "fullName": "Sunita Maharjan",
      "action": "LOGIN",
      "timestamp": "2025-07-27T11:09:39.174Z",
      "ipAddress": "::ffff:127.0.0.1"
    },
    {
      "userId": "cmdlkucg60000js1zxduq3hum",
      "email": "ramesh.shrestha@icms.gov.np",
      "fullName": "Ramesh Shrestha",
      "action": "LOGIN",
      "timestamp": "2025-07-27T11:09:38.933Z",
      "ipAddress": "::ffff:127.0.0.1"
    }
  ],
  "meta": {
    "timestamp": "2025-07-27T11:09:39.873Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Activity monitoring is essential for security compliance and incident investigation. The audit trail helps administrators track user behavior and detect potential security threats or policy violations.

---

### Step 9: Ramesh exports user data in CSV format for the monthly management report and backup purposes. ✅

**What Ramesh Shrestha expects**: The system should generate and return a CSV file containing user information suitable for external reporting and backup.

**API Call**: `GET /api/v1/admin/users/export?format=csv`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VjZzYwMDAwanMxenhkdXEzaHVtIiwiaWF0IjoxNzUzNjE0NTc5LCJqdGkiOiI5NzI1YzliMTIwNDBjZjE4MGQ4MmM2MzQ1MTBmODAxYyIsImV4cCI6MTc1MzYxODE3OX0.NtmnErGsVHxyw-wNVbG8NXKODKwm1cEKjbzJmwxMCuk
```

**Response**: 🟢 200 (7ms)

```json
{}
```

**What happened**: Data export capabilities are crucial for reporting, backup procedures, and integration with external systems. The CSV format ensures compatibility with spreadsheet applications for further analysis.

---

### Step 10: Ramesh removes the test user account to maintain system cleanliness and prevent accumulation of test data. ✅

**What Ramesh Shrestha expects**: The system should successfully delete the user account and all associated data while maintaining audit trail integrity.

**API Call**: `DELETE /api/v1/admin/users/cmdlkudlb000njs1z01yap42h`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsa3VjZzYwMDAwanMxenhkdXEzaHVtIiwiaWF0IjoxNzUzNjE0NTc5LCJqdGkiOiI5NzI1YzliMTIwNDBjZjE4MGQ4MmM2MzQ1MTBmODAxYyIsImV4cCI6MTc1MzYxODE3OX0.NtmnErGsVHxyw-wNVbG8NXKODKwm1cEKjbzJmwxMCuk
```

**Response**: 🟢 200 (13ms)

```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  },
  "meta": {
    "timestamp": "2025-07-27T11:09:39.893Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Proper cleanup procedures ensure that test data doesn't interfere with production operations. The deletion process must handle all related data and maintain referential integrity.

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Ramesh Shrestha successfully completed all 10 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of comprehensive user account management.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 10
- **Successful**: 10
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.51s

### Performance Metrics
- **admin-login**: 204ms ✅
- **view-user-statistics**: 10ms ✅
- **create-new-user**: 207ms ✅
- **verify-user-creation**: 8ms ✅
- **update-user-role**: 23ms ✅
- **activate-deactivate-user**: 25ms ✅
- **view-active-users**: 8ms ✅
- **view-user-activity-logs**: 8ms ✅
- **export-user-data**: 7ms ✅
- **cleanup-test-user**: 13ms ✅