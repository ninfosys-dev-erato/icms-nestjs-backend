# ✅ Priya Basnet: Manage Document Versions and Updates

**Generated**: 2025-07-27T06:40:54.013Z  
**Duration**: 0.24s  
**Status**: Success  
**Test Results**: 4/4 steps passed

---

## 👤 Our Story's Hero: Priya Basnet

👩🏽‍📚 **Priya Basnet** | 34 years old | Document Manager

### Background

    Priya Basnet is a 34-year-old document manager who has been working with 
    digital document systems for over 12 years. She started her career as a 
    librarian and evolved into digital document management when the government 
    began transitioning to electronic record keeping.
    
    Priya is responsible for maintaining the entire document repository of the 
    government office. She manages document uploads, ensures proper categorization, 
    maintains version control, and monitors document usage analytics. Her role 
    is critical in ensuring that citizens and officials can access the right 
    documents efficiently.
    
    She's highly technical and understands the importance of metadata, version 
    control, and proper document lifecycle management. Priya often works with 
    large document collections and needs efficient tools for bulk operations 
    and analytics.
  

### What Priya Basnet wants to achieve:
- Maintain a well-organized document repository
- Ensure all documents are properly categorized and tagged
- Track document versions and maintain update history
- Monitor document usage and access patterns
- Perform bulk operations efficiently for large document sets
- Generate comprehensive analytics and reports on document usage
- Ensure document security and proper access controls
- Migrate and backup document collections safely

### Priya Basnet's challenges:
- Manual document categorization is time-consuming
- Difficulty tracking which documents need updates
- No bulk operations for managing hundreds of documents
- Limited analytics on document usage patterns
- File size limitations affecting document uploads
- Inconsistent document naming and versioning by different users
- Lack of automated backup and migration tools
- Difficulty identifying duplicate or outdated documents

---

## 🎯 The Mission: Manage Document Versions and Updates

🟡 **Difficulty**: MEDIUM  
📁 **Category**: Document Management  
⏱️ **Estimated Duration**: 90 seconds

### What needs to happen:
Managing document versions with detailed change logs and version history tracking.

### Prerequisites:
- Existing documents in the system
- Updated document files
- Change documentation

---

## 🎬 The Story Begins


          Priya receives an urgent request from the Finance Ministry. They've 
          found errors in the budget report that was published last week and 
          need to upload a corrected version immediately. 
          
          She needs to maintain the version history so people can see what 
          changed and access both the original and corrected versions for 
          transparency and accountability.
        

---

## 🚀 The Journey

### Step 1: Priya logs in to handle the urgent document update ✅

**What Priya Basnet expects**: Quick authentication to manage the version update

**API Call**: `POST http://127.0.0.1:38601/api/v1/auth/login`

**Request Body**:
```json
{
  "email": "priya.basnet@icms.gov.np",
  "password": "PriyaDocs@2024"
}
```

**Headers**:
```
content-type: application/json
```

**Response**: 🟢 200 (204ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb8qhj0008jsily2zncegy",
      "email": "priya.basnet@icms.gov.np",
      "firstName": "Priya",
      "lastName": "Basnet",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T06:40:53.725Z",
      "createdAt": "2025-07-27T06:40:53.528Z",
      "updatedAt": "2025-07-27T06:40:53.726Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhxaGowMDA4anNpbHkyem5jZWd5IiwiaWF0IjoxNzUzNTk4NDUzLCJqdGkiOiJmMjkwZWE0MGU1OTA2YTFhNzI1ODkzNTJjZDdhYzkxNCIsImV4cCI6MTc1MzYwMjA1M30.wtemc-82yI0fPHEGCUSPxuumUO9Ncwg0DwyQuPNgSto",
    "refreshToken": "f07d78b5a40326cde62c2765d43e6e3ef8352fc1baf1be4c7bb8341431802c8540a6e206560931455af1b84e3009b469c0311455e34f3b6424dbb7242ace801b",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:53.971Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Version management requires authenticated access to maintain document integrity

---

### Step 2: Priya checks the current version history of the budget report ✅

**What Priya Basnet expects**: The system should show the original version 1.0

**API Call**: `GET http://127.0.0.1:43029/api/v1/admin/documents/cmdlb8qo1000ejsila30y9e1f/versions`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhxaGowMDA4anNpbHkyem5jZWd5IiwiaWF0IjoxNzUzNTk4NDUzLCJqdGkiOiJmMjkwZWE0MGU1OTA2YTFhNzI1ODkzNTJjZDdhYzkxNCIsImV4cCI6MTc1MzYwMjA1M30.wtemc-82yI0fPHEGCUSPxuumUO9Ncwg0DwyQuPNgSto
```

**Response**: 🟢 200 (8ms)

```json
{
  "success": true,
  "data": [],
  "meta": {
    "timestamp": "2025-07-27T06:40:53.979Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Version history helps track document evolution and changes over time

---

### Step 3: Priya uploads the corrected version with detailed change log ✅

**What Priya Basnet expects**: The system should create version 1.1 with the documented changes

**API Call**: `POST http://127.0.0.1:38177/api/v1/admin/documents/cmdlb8qo1000ejsila30y9e1f/versions`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhxaGowMDA4anNpbHkyem5jZWd5IiwiaWF0IjoxNzUzNTk4NDUzLCJqdGkiOiJmMjkwZWE0MGU1OTA2YTFhNzI1ODkzNTJjZDdhYzkxNCIsImV4cCI6MTc1MzYwMjA1M30.wtemc-82yI0fPHEGCUSPxuumUO9Ncwg0DwyQuPNgSto
```

**Response**: 🟢 201 (24ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlb8qo1000ejsila30y9e1f",
    "title": {
      "en": "Budget Report 2024",
      "ne": "बजेट रिपोर्ट २०२४"
    },
    "description": null,
    "fileName": "1753598453750-997nwi2t0a6-original-budget.pdf",
    "originalName": "original-budget.pdf",
    "filePath": "documents/1753598453750-997nwi2t0a6-original-budget.pdf",
    "fileSize": 37,
    "mimeType": "application/pdf",
    "documentType": "PDF",
    "category": "REPORT",
    "status": "PUBLISHED",
    "documentNumber": null,
    "version": "1.1",
    "publishDate": null,
    "expiryDate": null,
    "tags": [],
    "isPublic": true,
    "requiresAuth": false,
    "order": 0,
    "isActive": true,
    "downloadCount": 0,
    "downloadUrl": "http://localhost:3000/uploads/documents/1753598453750-997nwi2t0a6-original-budget.pdf",
    "createdAt": "2025-07-27T06:40:53.761Z",
    "updatedAt": "2025-07-27T06:40:54.001Z"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:54.003Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Version control with change logs ensures transparency about document modifications

---

### Step 4: Priya verifies that both versions are now available in the system ✅

**What Priya Basnet expects**: The system should show both version 1.0 and 1.1 with change history

**API Call**: `GET http://127.0.0.1:42559/api/v1/admin/documents/cmdlb8qo1000ejsila30y9e1f/versions`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhxaGowMDA4anNpbHkyem5jZWd5IiwiaWF0IjoxNzUzNTk4NDUzLCJqdGkiOiJmMjkwZWE0MGU1OTA2YTFhNzI1ODkzNTJjZDdhYzkxNCIsImV4cCI6MTc1MzYwMjA1M30.wtemc-82yI0fPHEGCUSPxuumUO9Ncwg0DwyQuPNgSto
```

**Response**: 🟢 200 (8ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlb8quk000ljsilgl92s4gd",
      "version": "1.1",
      "fileName": "1753598453994-k10arx6mqpp-corrected-budget.pdf",
      "fileSize": 98,
      "mimeType": "application/pdf",
      "changeLog": {
        "en": "Corrected budget calculations and fixed allocation errors in sections 3.1 and 4.2",
        "ne": "बजेट गणना सुधार गरियो र खण्ड ३.१ र ४.२ मा बाँडफाँडका त्रुटिहरू फिक्स गरियो"
      },
      "createdAt": "2025-07-27T06:40:53.996Z"
    }
  ],
  "meta": {
    "timestamp": "2025-07-27T06:40:54.011Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Complete version history ensures accountability and allows users to track document evolution

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Priya Basnet successfully completed all 4 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of manage document versions and updates.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 4
- **Successful**: 4
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.24s

### Performance Metrics
- **login-for-versioning**: 204ms ✅
- **check-current-version**: 8ms ✅
- **upload-corrected-version**: 24ms ✅
- **verify-version-history**: 8ms ✅