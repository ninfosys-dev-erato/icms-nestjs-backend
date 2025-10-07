# ✅ Sita Sharma: Editor Login for Content Management

**Generated**: 2025-07-27T06:40:26.117Z  
**Duration**: 0.40s  
**Status**: Success  
**Test Results**: 3/3 steps passed

---

## 👤 Our Story's Hero: Sita Sharma

👩🏽‍💻 **Sita Sharma** | 32 years old | Communications Officer

### Background

    Sita Sharma is a 32-year-old communications officer who joined the government 
    office 5 years ago with a background in journalism and public relations. 
    She's passionate about making government information accessible to citizens 
    and takes pride in crafting clear, engaging content.
    
    She manages the office's content strategy, from daily announcements to 
    important policy documents. Sita is comfortable with technology but sometimes 
    struggles with overly complex systems. She values efficiency and appreciates 
    tools that help her work faster.
    
    Sita often works under tight deadlines, especially when urgent announcements 
    need to be published. She's detail-oriented but needs systems that don't 
    slow her down with unnecessary complexity.
  

### What Sita Sharma wants to achieve:
- Publish timely and accurate content for citizens
- Manage content calendar and publication schedules
- Upload and organize media files efficiently
- Create engaging announcements and news articles
- Maintain consistent messaging across all platforms
- Respond quickly to urgent publication requests

### Sita Sharma's challenges:
- Slow file upload processes that interrupt her workflow
- Complex content management interfaces
- Lack of draft/preview functionality
- Difficulty organizing content into proper categories
- Systems that don't save work automatically
- Unclear publication status and approval workflows

---

## 🎯 The Mission: Editor Login for Content Management

🟢 **Difficulty**: EASY  
📁 **Category**: Authentication  
⏱️ **Estimated Duration**: 45 seconds

### What needs to happen:
A content editor logs in to publish urgent announcements and manage website content.

### Prerequisites:
- Valid editor credentials
- Content requiring updates exists
- System permissions properly configured

---

## 🎬 The Story Begins


          Sita Sharma rushes into the office at 8:30 AM. There's breaking news about 
          a road closure that affects the main route to the government office, and 
          she needs to publish an urgent announcement on the website immediately.
          
          Citizens are already calling the office asking for information, and she 
          knows that getting this announcement online quickly will help reduce 
          confusion and phone traffic. Time is of the essence.
        

---

## 🚀 The Journey

### Step 1: Sita's editor account is set up in the system ✅

**What Sita Sharma expects**: Account creation should succeed with editor permissions

**API Call**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "sita.sharma@icms.gov.np",
  "password": "SitaEditor@2024",
  "confirmPassword": "SitaEditor@2024",
  "firstName": "Sita",
  "lastName": "Sharma",
  "role": "EDITOR"
}
```

**Response**: 🟢 201 (194ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb8566000hjse3g54u9ind",
      "email": "sita.sharma@icms.gov.np",
      "firstName": "Sita",
      "lastName": "Sharma",
      "role": "EDITOR",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T06:40:25.903Z",
      "updatedAt": "2025-07-27T06:40:25.903Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjg1NjYwMDBoanNlM2c1NHU5aW5kIiwiaWF0IjoxNzUzNTk4NDI1LCJqdGkiOiI2Y2Q4NDI1YTgxNTQ2NTg0MzIwNDgwNGVhYjhhYzBmNSIsImV4cCI6MTc1MzYwMjAyNX0.-SYWEDZHJwEZTWDFDpnp-qj2Y8581AZvt47Z-sFSEtM",
    "refreshToken": "3d0966ff40a7b0c191a484303cef0f5d6f57f6cdbb87e1c8c599045791fe6e71308c6edbaff4c99698ce43003604bf526790646e1027230daa5ea8d1f0c1887a",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:25.909Z",
    "version": "1.0.0"
  }
}
```

**What happened**: The request was processed successfully. The system responded with the expected data.

---

### Step 2: Sita quickly enters her credentials, knowing every minute counts ✅

**What Sita Sharma expects**: Fast authentication to get her into the content management system

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "sita.sharma@icms.gov.np",
  "password": "SitaEditor@2024"
}
```

**Response**: 🟢 200 (199ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb8566000hjse3g54u9ind",
      "email": "sita.sharma@icms.gov.np",
      "firstName": "Sita",
      "lastName": "Sharma",
      "role": "EDITOR",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T06:40:25.903Z",
      "updatedAt": "2025-07-27T06:40:25.903Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjg1NjYwMDBoanNlM2c1NHU5aW5kIiwiaWF0IjoxNzUzNTk4NDI2LCJqdGkiOiI4Mjk2OTQyMjk5NjdlMDAwMjllMGQyOWFjZWQ0MDU1NCIsImV4cCI6MTc1MzYwMjAyNn0.fJZAq5yKr1cdmtA_xW2iB5Gz5OaS2IfohOhcdYjRN3Y",
    "refreshToken": "db6978c636786fc91b2474cea0b6a8055553a79a925421f600d59c934935748c8c84994e83d50f29a708f64541fcddaea8f0ddcd739961bea2c7088fdc020bf3",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:26.107Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Quick login is crucial for content editors who often work under tight deadlines

---

### Step 3: Sita confirms she has the right permissions to publish content ✅

**What Sita Sharma expects**: Her profile should show EDITOR role with content management capabilities

**API Call**: `GET /api/v1/auth/me`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjg1NjYwMDBoanNlM2c1NHU5aW5kIiwiaWF0IjoxNzUzNTk4NDI2LCJqdGkiOiI4Mjk2OTQyMjk5NjdlMDAwMjllMGQyOWFjZWQ0MDU1NCIsImV4cCI6MTc1MzYwMjAyNn0.fJZAq5yKr1cdmtA_xW2iB5Gz5OaS2IfohOhcdYjRN3Y
```

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlb8566000hjse3g54u9ind",
    "email": "sita.sharma@icms.gov.np",
    "firstName": "Sita",
    "lastName": "Sharma",
    "role": "EDITOR",
    "isActive": true,
    "isEmailVerified": false
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:26.114Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Editor role verification ensures she can access content publishing features

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Sita Sharma successfully completed all 3 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of editor login for content management.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 3
- **Successful**: 3
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.40s

### Performance Metrics
- **register-editor**: 194ms ✅
- **urgent-login**: 199ms ✅
- **verify-editor-permissions**: 7ms ✅