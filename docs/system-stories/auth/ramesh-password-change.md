# ✅ Ramesh Kumar: Secure Password Update

**Generated**: 2025-07-27T06:40:25.445Z  
**Duration**: 0.79s  
**Status**: Success  
**Test Results**: 3/3 steps passed

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

## 🎯 The Mission: Secure Password Update

🟡 **Difficulty**: MEDIUM  
📁 **Category**: Security  
⏱️ **Estimated Duration**: 60 seconds

### What needs to happen:
A user needs to update their password for security reasons following organization policy.

### Prerequisites:
- User is already authenticated
- Current password is known
- New password meets security requirements

---

## 🎬 The Story Begins


          Ramesh received a memo from the IT security department recommending that 
          all government employees update their passwords quarterly. As a responsible 
          administrator, he wants to set a good example and update his password 
          to something even more secure.
          
          He decides to use the system's built-in password change functionality 
          rather than asking IT to reset it manually.
        

---

## 🚀 The Journey

### Step 1: Ramesh logs in with his current password ✅

**What Ramesh Kumar expects**: Successful authentication with current credentials

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "ramesh.kumar@icms.gov.np",
  "password": "RameshSecure@2024"
}
```

**Response**: 🟢 200 (199ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb847h0006jse3lv50wfxj",
      "email": "ramesh.kumar@icms.gov.np",
      "firstName": "Ramesh",
      "lastName": "Kumar",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T06:40:24.653Z",
      "updatedAt": "2025-07-27T06:40:24.653Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjg0N2gwMDA2anNlM2x2NTB3ZnhqIiwiaWF0IjoxNzUzNTk4NDI0LCJqdGkiOiIxYWZkOWMyY2YyMDE5MjA2YWU3ZmVjMzI3OGIyZWQyOSIsImV4cCI6MTc1MzYwMjAyNH0.zJ2tCy8bkxtHdMQ9TYH9W8sdfKu2XuHZGBmbKR0Zh30",
    "refreshToken": "050027b1f33ccb1f759801416ee3f70a6a0e012aad978ad99d1dc109286efea6ada63d4360a723aa5a2f435904860af4bd2c4df5ed247d91caa8c65a6d311aac",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:24.856Z",
    "version": "1.0.0"
  }
}
```

**What happened**: The request was processed successfully. The system responded with the expected data.

---

### Step 2: Ramesh enters his current password and his new, more secure password ✅

**What Ramesh Kumar expects**: The system should update his password successfully

**API Call**: `POST /api/v1/auth/change-password`

**Request Body**:
```json
{
  "currentPassword": "RameshSecure@2024",
  "newPassword": "RameshSecure@2024NEW",
  "confirmPassword": "RameshSecure@2024NEW"
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjg0N2gwMDA2anNlM2x2NTB3ZnhqIiwiaWF0IjoxNzUzNTk4NDI0LCJqdGkiOiIxYWZkOWMyY2YyMDE5MjA2YWU3ZmVjMzI3OGIyZWQyOSIsImV4cCI6MTc1MzYwMjAyNH0.zJ2tCy8bkxtHdMQ9TYH9W8sdfKu2XuHZGBmbKR0Zh30
```

**Response**: 🟢 200 (377ms)

```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:25.233Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Password changes require the current password for security and confirmation of the new password

---

### Step 3: Ramesh tests his new password by logging in again ✅

**What Ramesh Kumar expects**: He should be able to authenticate with the new password

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "ramesh.kumar@icms.gov.np",
  "password": "RameshSecure@2024NEW"
}
```

**Response**: 🟢 200 (209ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb847h0006jse3lv50wfxj",
      "email": "ramesh.kumar@icms.gov.np",
      "firstName": "Ramesh",
      "lastName": "Kumar",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T06:40:24.846Z",
      "createdAt": "2025-07-27T06:40:24.653Z",
      "updatedAt": "2025-07-27T06:40:25.224Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjg0N2gwMDA2anNlM2x2NTB3ZnhqIiwiaWF0IjoxNzUzNTk4NDI1LCJqdGkiOiI0ZmE4ZWNiMjlhMDAyNjg2NWZkNTc1NzZlZTZlZGY2NyIsImV4cCI6MTc1MzYwMjAyNX0.gvxf1r-s45R9j-aKXLG0sFcVzc_qfcVNkWRGek3cDBs",
    "refreshToken": "b3968a4b9c358d63fe7f873d34cdb3f6307a4d205798a3ff1d5b917726cc4b9783f51e4cfdc41cd2f0f88ba8dc73d54affbeca007ab4c26421cbc389704492f2",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:25.443Z",
    "version": "1.0.0"
  }
}
```

**What happened**: This confirms the password change was successful and the new credentials work properly

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Ramesh Kumar successfully completed all 3 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of secure password update.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 3
- **Successful**: 3
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.79s

### Performance Metrics
- **login-first**: 199ms ✅
- **change-password**: 377ms ✅
- **login-with-new-password**: 209ms ✅