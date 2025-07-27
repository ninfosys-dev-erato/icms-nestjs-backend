# ✅ Ramesh Kumar: Admin Login and System Access

**Generated**: 2025-07-27T06:40:24.181Z  
**Duration**: 0.47s  
**Status**: Success  
**Test Results**: 4/4 steps passed

---

## 👤 Our Story's Hero: Ramesh Kumar

👨🏽‍💼 **Ramesh Kumar** | 45 years old | Senior Government Officer

### Background

    Ramesh Kumar is a dedicated 45-year-old senior government officer who has been 
    working in the public sector for over 20 years. He started as a junior clerk 
    and worked his way up through determination and continuous learning. 
    
    He's responsible for ensuring that the government office's digital presence 
    is accurate and up-to-date. Though he's comfortable with computers, he 
    prefers interfaces that are clear and straightforward. He values accuracy 
    and completeness in all information systems.
    
    Ramesh arrives at the office every morning at 9 AM sharp and methodically 
    goes through his tasks. He's particularly careful about data accuracy 
    because he knows that citizens depend on the information his office provides.
  

### What Ramesh Kumar wants to achieve:
- Maintain accurate office information on the website
- Ensure all government announcements are published timely
- Manage user accounts and permissions effectively
- Keep all documents properly organized and accessible
- Respond to citizen inquiries promptly
- Maintain the security and integrity of the system

### Ramesh Kumar's challenges:
- Complex interfaces that require too many clicks
- Error messages that don't clearly explain what went wrong
- Systems that are slow to respond during busy hours
- Having to remember multiple passwords for different systems
- File upload processes that fail without clear feedback
- Difficulty finding specific functions in cluttered dashboards

---

## 🎯 The Mission: Admin Login and System Access

🟢 **Difficulty**: EASY  
📁 **Category**: Authentication  
⏱️ **Estimated Duration**: 30 seconds

### What needs to happen:
An administrator logs into the system to manage office settings and user accounts.

### Prerequisites:
- Valid admin credentials
- System is running and accessible
- Database is properly seeded

---

## 🎬 The Story Begins


          It's Monday morning, and Ramesh Kumar arrives at his government office 
          with an important task ahead. The office has relocated to a new building, 
          and he needs to update all the contact information on the government website 
          to ensure citizens can reach them at the correct address and phone number.
          
          As a senior government officer with 20 years of experience, Ramesh 
          understands the importance of keeping public information accurate and 
          up-to-date. He opens his computer, grabs his coffee, and prepares to 
          log into the administrative system.
        

---

## 🚀 The Journey

### Step 1: First, Ramesh creates his administrative account in the system ✅

**What Ramesh Kumar expects**: The system should create his admin account and provide access tokens

**API Call**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "ramesh.kumar@icms.gov.np",
  "password": "RameshSecure@2024",
  "confirmPassword": "RameshSecure@2024",
  "firstName": "Ramesh",
  "lastName": "Kumar",
  "role": "ADMIN"
}
```

**Response**: 🟢 201 (242ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb83nk0000jse35oz9jzks",
      "email": "ramesh.kumar@icms.gov.np",
      "firstName": "Ramesh",
      "lastName": "Kumar",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T06:40:23.936Z",
      "updatedAt": "2025-07-27T06:40:23.936Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjgzbmswMDAwanNlMzVvejlqemtzIiwiaWF0IjoxNzUzNTk4NDIzLCJqdGkiOiI1MzNiZTU2YTU4NzUxNmJkZTdkMDJmZDFhNTdiYjExYSIsImV4cCI6MTc1MzYwMjAyM30.d4MrM6zlCNMVrnuTDlG1kUf5LP_gIWCSF9EzUDeYqLI",
    "refreshToken": "a285cda69602171924f45e8dab268240d05ce56dbf2d8ed0ef0848420fe0bdc607fc05f9d53a33d365180b4a90e7354e8c2fd3fbdb81b57647e196ba5e5473b5",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:23.945Z",
    "version": "1.0.0"
  }
}
```

**What happened**: This step simulates the account creation process that would typically be done by a system administrator

---

### Step 2: Ramesh enters his government email and password into the login form ✅

**What Ramesh Kumar expects**: The system should authenticate him and provide secure access tokens

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "ramesh.kumar@icms.gov.np",
  "password": "RameshSecure@2024"
}
```

**Response**: 🟢 200 (216ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb83nk0000jse35oz9jzks",
      "email": "ramesh.kumar@icms.gov.np",
      "firstName": "Ramesh",
      "lastName": "Kumar",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T06:40:23.936Z",
      "updatedAt": "2025-07-27T06:40:23.936Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjgzbmswMDAwanNlMzVvejlqemtzIiwiaWF0IjoxNzUzNTk4NDI0LCJqdGkiOiIwMzgzMDkwYzk2YzI4OGRlMGQwMDhmNWNlMmUwOGNiMyIsImV4cCI6MTc1MzYwMjAyNH0.BuYH6-mR64k2FKsixu4kdICrGfsl5xEKwDsRJC_6ec0",
    "refreshToken": "161d3b44a43a45732619c65f7edfb2b606bd8302088e3f95e8d5d18c0b00f409165267c059e9adffd4693db4a8ea2b6fd53e535cb714540a3152c07cee278422",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:24.164Z",
    "version": "1.0.0"
  }
}
```

**What happened**: The system validates his credentials and issues JWT tokens for secure communication

---

### Step 3: Ramesh verifies his profile information is correct in the system ✅

**What Ramesh Kumar expects**: He should see his complete profile with admin privileges

**API Call**: `GET /api/v1/auth/me`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjgzbmswMDAwanNlMzVvejlqemtzIiwiaWF0IjoxNzUzNTk4NDI0LCJqdGkiOiIwMzgzMDkwYzk2YzI4OGRlMGQwMDhmNWNlMmUwOGNiMyIsImV4cCI6MTc1MzYwMjAyNH0.BuYH6-mR64k2FKsixu4kdICrGfsl5xEKwDsRJC_6ec0
```

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlb83nk0000jse35oz9jzks",
    "email": "ramesh.kumar@icms.gov.np",
    "firstName": "Ramesh",
    "lastName": "Kumar",
    "role": "ADMIN",
    "isActive": true,
    "isEmailVerified": false
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:24.171Z",
    "version": "1.0.0"
  }
}
```

**What happened**: This confirms his authentication was successful and his role permissions are properly set

---

### Step 4: Being security-conscious, Ramesh checks his active sessions ✅

**What Ramesh Kumar expects**: He should see his current session listed with proper details

**API Call**: `GET /api/v1/auth/sessions`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjgzbmswMDAwanNlMzVvejlqemtzIiwiaWF0IjoxNzUzNTk4NDI0LCJqdGkiOiIwMzgzMDkwYzk2YzI4OGRlMGQwMDhmNWNlMmUwOGNiMyIsImV4cCI6MTc1MzYwMjAyNH0.BuYH6-mR64k2FKsixu4kdICrGfsl5xEKwDsRJC_6ec0
```

**Response**: 🟢 200 (8ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlb83tq0002jse312e528zx",
      "ipAddress": "::ffff:127.0.0.1",
      "userAgent": "unknown",
      "isActive": true,
      "expiresAt": "2025-08-03T06:40:24.157Z",
      "createdAt": "2025-07-27T06:40:24.158Z"
    }
  ],
  "meta": {
    "timestamp": "2025-07-27T06:40:24.178Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Session management allows users to monitor and control their account access for security

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Ramesh Kumar successfully completed all 4 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of admin login and system access.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 4
- **Successful**: 4
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.47s

### Performance Metrics
- **register-admin**: 242ms ✅
- **admin-login**: 216ms ✅
- **verify-profile**: 7ms ✅
- **view-sessions**: 8ms ✅