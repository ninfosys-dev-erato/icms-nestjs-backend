# ❌ Priya Basnet: Handle Document Upload and Access Errors

**Generated**: 2025-07-27T06:40:57.167Z  
**Duration**: 0.44s  
**Status**: Failed  
**Test Results**: 1/4 steps passed

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

## 🎯 The Mission: Handle Document Upload and Access Errors

🟡 **Difficulty**: MEDIUM  
📁 **Category**: Error Handling  
⏱️ **Estimated Duration**: 90 seconds

### What needs to happen:
Test system resilience with invalid files, large uploads, and access errors.

### Prerequisites:
- Various file types for testing
- Network simulation capabilities
- Error logging enabled

---

## 🎬 The Story Begins


          Priya is having a challenging day with document uploads. She encounters 
          various issues: invalid file types, oversized files, and network problems. 
          This scenario tests how the system handles these error conditions gracefully 
          and provides helpful feedback to users.
        

---

## 🚀 The Journey

### Step 1: Priya logs in to attempt document uploads ✅

**What Priya Basnet expects**: Successful authentication for testing error scenarios

**API Call**: `POST http://127.0.0.1:33341/api/v1/auth/login`

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

**Response**: 🟢 200 (401ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb8t3q001ejsilsdrvqfve",
      "email": "priya.basnet@icms.gov.np",
      "firstName": "Priya",
      "lastName": "Basnet",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T06:40:56.918Z",
      "updatedAt": "2025-07-27T06:40:56.918Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjh0M3EwMDFlanNpbHNkcnZxZnZlIiwiaWF0IjoxNzUzNTk4NDU3LCJqdGkiOiI3OTBkODI3M2QwYjc2MDFmNjhhODJmMzk0Y2Y0NDU5MSIsImV4cCI6MTc1MzYwMjA1N30.OL9EQt5dt97U95v6MzC42pfEWRKCRWycp9gigXwk6gI",
    "refreshToken": "62552b77b3e18cf4d1b4312c977540579a75d722c80adaf8d7238da14e53d895a42a91b387edd006448503c5bffa95bd9ac9cd346d6b366f9312d5367179a8f4",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:57.127Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Authentication is required to test upload error handling

---

### Step 2: Priya tries to upload an executable file instead of a document ❌

**What Priya Basnet expects**: The system should reject the file and provide a clear error message

**API Call**: `POST http://127.0.0.1:36925/api/v1/admin/documents/upload`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjh0M3EwMDFlanNpbHNkcnZxZnZlIiwiaWF0IjoxNzUzNTk4NDU3LCJqdGkiOiI3OTBkODI3M2QwYjc2MDFmNjhhODJmMzk0Y2Y0NDU5MSIsImV4cCI6MTc1MzYwMjA1N30.OL9EQt5dt97U95v6MzC42pfEWRKCRWycp9gigXwk6gI
```

**Response**: 🔴 400 (20ms)

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_UPLOAD_ERROR",
    "message": "File validation failed"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:57.147Z",
    "version": "1.0.0"
  }
}
```

**What happened**: File type validation protects the system from potentially harmful or inappropriate files

---

### Step 3: Priya forgets to attach a file but tries to create a document ❌

**What Priya Basnet expects**: The system should require a file and return a validation error

**API Call**: `POST http://127.0.0.1:39829/api/v1/admin/documents/upload`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjh0M3EwMDFlanNpbHNkcnZxZnZlIiwiaWF0IjoxNzUzNTk4NDU3LCJqdGkiOiI3OTBkODI3M2QwYjc2MDFmNjhhODJmMzk0Y2Y0NDU5MSIsImV4cCI6MTc1MzYwMjA1N30.OL9EQt5dt97U95v6MzC42pfEWRKCRWycp9gigXwk6gI
```

**Response**: 🔴 400 (11ms)

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_UPLOAD_ERROR",
    "message": "No file uploaded"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:57.158Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Proper validation ensures documents cannot be created without actual file content

---

### Step 4: Priya tries to access a document that doesn't exist ❌

**What Priya Basnet expects**: The system should return a 404 error with appropriate message

**API Call**: `GET http://127.0.0.1:40651/api/v1/documents/nonexistent-document-id`

**Response**: 🔴 404 (7ms)

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document not found"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:57.165Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Proper error handling for missing resources provides clear feedback to users

---



## 🎯 The Outcome

❌ **Journey Encountered Issues**
        
        Priya Basnet completed 1 out of 4 steps successfully. 
        3 step(s) failed, preventing them from fully achieving 
        their goal of handle document upload and access errors.
        
        This indicates areas where the API or user experience could be improved.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 4
- **Successful**: 1
- **Failed**: 3
- **Success Rate**: 25.0%
- **Total Duration**: 0.44s

### Performance Metrics
- **setup-for-error-testing**: 401ms ✅
- **attempt-invalid-file-upload**: 20ms ❌
- **attempt-upload-without-file**: 11ms ❌
- **attempt-access-nonexistent-document**: 7ms ❌

### ❌ Failed Steps
- **attempt-invalid-file-upload**: Unknown error
- **attempt-upload-without-file**: Unknown error
- **attempt-access-nonexistent-document**: Unknown error