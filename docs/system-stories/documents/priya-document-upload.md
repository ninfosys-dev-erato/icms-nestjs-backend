# ✅ Priya Basnet: Upload and Organize Government Documents

**Generated**: 2025-07-27T06:40:53.030Z  
**Duration**: 0.54s  
**Status**: Success  
**Test Results**: 5/5 steps passed

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

## 🎯 The Mission: Upload and Organize Government Documents

🟡 **Difficulty**: MEDIUM  
📁 **Category**: Document Management  
⏱️ **Estimated Duration**: 2 minutes

### What needs to happen:
A document manager uploads official documents with proper categorization and metadata.

### Prerequisites:
- Admin access to the system
- Documents ready for upload in supported formats
- Clear categorization strategy

---

## 🎬 The Story Begins


          Priya Basnet starts her Monday morning with an important task. The 
          Ministry has just released new policy documents and she needs to 
          upload them to the government website so citizens can access the 
          latest information immediately.
          
          She has three different documents: a main policy document (PDF), 
          an implementation guideline (DOC), and a summary report (XLSX). 
          Each needs proper categorization and metadata to ensure citizens 
          can find them easily through search and navigation.
        

---

## 🚀 The Journey

### Step 1: Priya sets up her document manager account with full admin privileges ✅

**What Priya Basnet expects**: The system should create her admin account with document management access

**API Call**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "priya.basnet@icms.gov.np",
  "password": "PriyaDocs@2024",
  "confirmPassword": "PriyaDocs@2024",
  "firstName": "Priya",
  "lastName": "Basnet",
  "role": "ADMIN"
}
```

**Response**: 🟢 201 (230ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb8puu0000jsil7yu0xfit",
      "email": "priya.basnet@icms.gov.np",
      "firstName": "Priya",
      "lastName": "Basnet",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T06:40:52.710Z",
      "updatedAt": "2025-07-27T06:40:52.710Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhwdXUwMDAwanNpbDd5dTB4Zml0IiwiaWF0IjoxNzUzNTk4NDUyLCJqdGkiOiI5M2NjZTM3NTUyMDA1NzU3MGE3ZjBjMjkxZmIwY2ZhNyIsImV4cCI6MTc1MzYwMjA1Mn0.REaa26cx3dE4Kb1jx9KTWHXL7zreubtVXNTCR0TFvMI",
    "refreshToken": "1322de5c37ce35c4e34001e37b8a18817f624796ebbc23e1de589e51d68828bbcbfabaaeddb0339ff4fe4b522e9d09ef674c9559a28b79814d374c0b3b1fdca3",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:52.719Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Document managers need admin privileges to upload and organize documents

---

### Step 2: Priya logs into the document management system ✅

**What Priya Basnet expects**: Successful authentication with document management capabilities

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "priya.basnet@icms.gov.np",
  "password": "PriyaDocs@2024"
}
```

**Response**: 🟢 200 (216ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb8puu0000jsil7yu0xfit",
      "email": "priya.basnet@icms.gov.np",
      "firstName": "Priya",
      "lastName": "Basnet",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T06:40:52.710Z",
      "updatedAt": "2025-07-27T06:40:52.710Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhwdXUwMDAwanNpbDd5dTB4Zml0IiwiaWF0IjoxNzUzNTk4NDUyLCJqdGkiOiIxYzkzYmU1NTZhYmM3ZGNjYzlkZWQzYzZhYTAzOTEyNyIsImV4cCI6MTc1MzYwMjA1Mn0.jbSXIHNLOmsgtW9hbh-449oc4xxLZdvHj7cSCyYVHSI",
    "refreshToken": "038e164e9ccb8d75423f90f309b9848c22e760d67de450a4a25a1bf3e6ed0df957fbfdeaedab437a997c1f0a8c21582aec6cea8e65b82de0c478b82fc6ac834b",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:52.938Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Authentication provides the necessary tokens for document operations

---

### Step 3: Priya uploads the main policy document with comprehensive metadata ✅

**What Priya Basnet expects**: The system should upload the document and make it publicly accessible

**API Call**: `POST /api/v1/admin/documents/upload`

**Request Body**:
```json
{
  "title[en]": "New Government Policy Framework 2024",
  "title[ne]": "नयाँ सरकारी नीति ढाँचा २०२४",
  "description[en]": "Comprehensive policy framework for government operations in 2024-2025",
  "description[ne]": "२०२४-२०२५ को लागि सरकारी सञ्चालनको व्यापक नीति ढाँचा",
  "category": "POLICY",
  "status": "PUBLISHED",
  "documentNumber": "POL-2024-001",
  "version": "1.0",
  "isPublic": "true",
  "requiresAuth": "false",
  "order": "1",
  "isActive": "true",
  "file": "policy-document.pdf"
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhwdXUwMDAwanNpbDd5dTB4Zml0IiwiaWF0IjoxNzUzNTk4NDUyLCJqdGkiOiIxYzkzYmU1NTZhYmM3ZGNjYzlkZWQzYzZhYTAzOTEyNyIsImV4cCI6MTc1MzYwMjA1Mn0.jbSXIHNLOmsgtW9hbh-449oc4xxLZdvHj7cSCyYVHSI
```

**Response**: 🟢 201 (38ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlb8q230006jsilqk1cfz71",
    "title": {
      "en": "New Government Policy Framework 2024",
      "ne": "नयाँ सरकारी नीति ढाँचा २०२४"
    },
    "description": {
      "en": "Comprehensive policy framework for government operations in 2024-2025",
      "ne": "२०२४-२०२५ को लागि सरकारी सञ्चालनको व्यापक नीति ढाँचा"
    },
    "fileName": "1753598452966-10l44nfrxqn-policy-document.pdf",
    "originalName": "policy-document.pdf",
    "filePath": "documents/1753598452966-10l44nfrxqn-policy-document.pdf",
    "fileSize": 113,
    "mimeType": "application/pdf",
    "documentType": "PDF",
    "category": "POLICY",
    "status": "PUBLISHED",
    "documentNumber": "POL-2024-001",
    "version": "1.0",
    "publishDate": null,
    "expiryDate": null,
    "tags": [],
    "isPublic": true,
    "requiresAuth": false,
    "order": 1,
    "isActive": true,
    "downloadCount": 0,
    "downloadUrl": "http://localhost:3000/uploads/documents/1753598452966-10l44nfrxqn-policy-document.pdf",
    "createdAt": "2025-07-27T06:40:52.971Z",
    "updatedAt": "2025-07-27T06:40:52.971Z"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:52.976Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Policy documents need to be publicly accessible with proper categorization for easy discovery

---

### Step 4: Priya uploads the implementation guidelines document ✅

**What Priya Basnet expects**: The system should categorize it as a guideline and make it accessible

**API Call**: `POST /api/v1/admin/documents/upload`

**Request Body**:
```json
{
  "title[en]": "Policy Implementation Guidelines",
  "title[ne]": "नीति कार्यान्वयन दिशानिर्देशहरू",
  "description[en]": "Detailed guidelines for implementing the new policy framework",
  "description[ne]": "नयाँ नीति ढाँचा कार्यान्वयनका लागि विस्तृत दिशानिर्देशहरू",
  "category": "GUIDELINE",
  "status": "PUBLISHED",
  "documentNumber": "GUIDE-2024-001",
  "version": "1.0",
  "isPublic": "true",
  "requiresAuth": "false",
  "order": "2",
  "isActive": "true",
  "file": "implementation-guide.doc"
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhwdXUwMDAwanNpbDd5dTB4Zml0IiwiaWF0IjoxNzUzNTk4NDUyLCJqdGkiOiIxYzkzYmU1NTZhYmM3ZGNjYzlkZWQzYzZhYTAzOTEyNyIsImV4cCI6MTc1MzYwMjA1Mn0.jbSXIHNLOmsgtW9hbh-449oc4xxLZdvHj7cSCyYVHSI
```

**Response**: 🟢 201 (27ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlb8q2w0007jsilwez3iy9i",
    "title": {
      "en": "Policy Implementation Guidelines",
      "ne": "नीति कार्यान्वयन दिशानिर्देशहरू"
    },
    "description": {
      "en": "Detailed guidelines for implementing the new policy framework",
      "ne": "नयाँ नीति ढाँचा कार्यान्वयनका लागि विस्तृत दिशानिर्देशहरू"
    },
    "fileName": "1753598452998-4e4tm051udw-implementation-guide.doc",
    "originalName": "implementation-guide.doc",
    "filePath": "documents/1753598452998-4e4tm051udw-implementation-guide.doc",
    "fileSize": 88,
    "mimeType": "application/msword",
    "documentType": "DOC",
    "category": "GUIDELINE",
    "status": "PUBLISHED",
    "documentNumber": "GUIDE-2024-001",
    "version": "1.0",
    "publishDate": null,
    "expiryDate": null,
    "tags": [],
    "isPublic": true,
    "requiresAuth": false,
    "order": 2,
    "isActive": true,
    "downloadCount": 0,
    "downloadUrl": "http://localhost:3000/uploads/documents/1753598452998-4e4tm051udw-implementation-guide.doc",
    "createdAt": "2025-07-27T06:40:53.000Z",
    "updatedAt": "2025-07-27T06:40:53.000Z"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:53.003Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Implementation guides help users understand how to apply policies in practice

---

### Step 5: Priya reviews the document repository statistics after uploads ✅

**What Priya Basnet expects**: The system should show updated document counts and category distribution

**API Call**: `GET /api/v1/admin/documents/statistics`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhwdXUwMDAwanNpbDd5dTB4Zml0IiwiaWF0IjoxNzUzNTk4NDUyLCJqdGkiOiIxYzkzYmU1NTZhYmM3ZGNjYzlkZWQzYzZhYTAzOTEyNyIsImV4cCI6MTc1MzYwMjA1Mn0.jbSXIHNLOmsgtW9hbh-449oc4xxLZdvHj7cSCyYVHSI
```

**Response**: 🟢 200 (25ms)

```json
{
  "success": true,
  "data": {
    "total": 2,
    "published": 2,
    "draft": 0,
    "archived": 0,
    "byType": {
      "PDF": 1,
      "DOC": 1,
      "DOCX": 0,
      "XLS": 0,
      "XLSX": 0,
      "PPT": 0,
      "PPTX": 0,
      "TXT": 0,
      "RTF": 0,
      "CSV": 0,
      "ZIP": 0,
      "RAR": 0,
      "OTHER": 0
    },
    "byCategory": {
      "OFFICIAL": 0,
      "REPORT": 0,
      "FORM": 0,
      "POLICY": 1,
      "PROCEDURE": 0,
      "GUIDELINE": 1,
      "NOTICE": 0,
      "CIRCULAR": 0,
      "OTHER": 0
    },
    "totalDownloads": 0,
    "averageDownloadsPerDocument": 0,
    "totalSize": 201,
    "averageSize": 101
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:53.027Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Statistics help document managers understand the current state of the repository

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Priya Basnet successfully completed all 5 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of upload and organize government documents.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 5
- **Successful**: 5
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.54s

### Performance Metrics
- **setup-document-manager**: 230ms ✅
- **login-document-manager**: 216ms ✅
- **upload-policy-document**: 38ms ✅
- **upload-implementation-guide**: 27ms ✅
- **check-document-statistics**: 25ms ✅