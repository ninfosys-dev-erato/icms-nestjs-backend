# ✅ Priya Basnet: Perform Bulk Document Management

**Generated**: 2025-07-27T06:40:54.991Z  
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

## 🎯 The Mission: Perform Bulk Document Management

🔴 **Difficulty**: HARD  
📁 **Category**: Document Management  
⏱️ **Estimated Duration**: 2 minutes

### What needs to happen:
Efficiently manage large sets of documents through bulk operations.

### Prerequisites:
- Multiple documents in the system
- Admin privileges
- Clear update strategy

---

## 🎬 The Story Begins


          Priya has just received approval to publish all the annual reports 
          that have been in draft status. Instead of updating each document 
          one by one, she decides to use the bulk operation feature to 
          efficiently publish all three reports simultaneously.
          
          This will save significant time and ensure consistency across 
          all the annual reports being published.
        

---

## 🚀 The Journey

### Step 1: Priya logs in to perform bulk document operations ✅

**What Priya Basnet expects**: Authentication for bulk management capabilities

**API Call**: `POST http://127.0.0.1:41157/api/v1/auth/login`

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

**Response**: 🟢 200 (202ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb8r8d000mjsilyc66fjuo",
      "email": "priya.basnet@icms.gov.np",
      "firstName": "Priya",
      "lastName": "Basnet",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T06:40:54.697Z",
      "createdAt": "2025-07-27T06:40:54.494Z",
      "updatedAt": "2025-07-27T06:40:54.698Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhyOGQwMDBtanNpbHljNjZmanVvIiwiaWF0IjoxNzUzNTk4NDU0LCJqdGkiOiIyMTVkZjZmOTJlYWE5ZmVlZjFlNTNkOGY1MWE3NmRiYyIsImV4cCI6MTc1MzYwMjA1NH0.Q06ycyIBz5Jr_sQ2nq-e3iSzOZHeNzEuaTVDQZvM3Ns",
    "refreshToken": "ebaa42f1546122a42aa57ef957831b03118ef236caa70d5ecc9353fcdb287e3d295c5de1d871684538220e19662fc885534c88347fe9206a7ab13b402db2dd04",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:54.953Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Bulk operations require admin privileges to ensure data integrity

---

### Step 2: Priya publishes all three annual reports using bulk update operation ✅

**What Priya Basnet expects**: The system should update all documents to published status simultaneously

**API Call**: `PUT http://127.0.0.1:41107/api/v1/admin/documents/bulk-update`

**Request Body**:
```json
{
  "ids": [
    "cmdlb8ren000sjsillobcrai3",
    "cmdlb8rf3000tjsil95lycja4",
    "cmdlb8rfh000ujsillanyr31k"
  ],
  "updates": {
    "status": "PUBLISHED",
    "isPublic": true,
    "isActive": true
  }
}
```

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhyOGQwMDBtanNpbHljNjZmanVvIiwiaWF0IjoxNzUzNTk4NDU0LCJqdGkiOiIyMTVkZjZmOTJlYWE5ZmVlZjFlNTNkOGY1MWE3NmRiYyIsImV4cCI6MTc1MzYwMjA1NH0.Q06ycyIBz5Jr_sQ2nq-e3iSzOZHeNzEuaTVDQZvM3Ns
content-type: application/json
```

**Response**: 🟢 200 (17ms)

```json
{
  "success": true,
  "data": {
    "success": 3,
    "failed": 0,
    "errors": []
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:54.970Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Bulk operations improve efficiency when managing multiple documents with similar updates

---

### Step 3: Priya verifies that all annual reports are now published and publicly accessible ✅

**What Priya Basnet expects**: The system should show all three reports with published status

**API Call**: `GET http://127.0.0.1:37639/api/v1/admin/documents`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhyOGQwMDBtanNpbHljNjZmanVvIiwiaWF0IjoxNzUzNTk4NDU0LCJqdGkiOiIyMTVkZjZmOTJlYWE5ZmVlZjFlNTNkOGY1MWE3NmRiYyIsImV4cCI6MTc1MzYwMjA1NH0.Q06ycyIBz5Jr_sQ2nq-e3iSzOZHeNzEuaTVDQZvM3Ns
```

**Response**: 🟢 200 (10ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlb8rfh000ujsillanyr31k",
      "title": {
        "en": "Annual Report 2021",
        "ne": "वार्षिक प्रतिवेदन २०२१"
      },
      "description": null,
      "fileName": "1753598454747-35h49f3da3c-annual-report-3.pdf",
      "originalName": "annual-report-3.pdf",
      "filePath": "documents/1753598454747-35h49f3da3c-annual-report-3.pdf",
      "fileSize": 18,
      "mimeType": "application/pdf",
      "documentType": "PDF",
      "category": "REPORT",
      "status": "PUBLISHED",
      "documentNumber": null,
      "version": "1.0",
      "publishDate": null,
      "expiryDate": null,
      "tags": [],
      "isPublic": true,
      "requiresAuth": false,
      "order": 0,
      "isActive": true,
      "downloadCount": 0,
      "downloadUrl": "http://localhost:3000/uploads/documents/1753598454747-35h49f3da3c-annual-report-3.pdf",
      "createdAt": "2025-07-27T06:40:54.749Z",
      "updatedAt": "2025-07-27T06:40:54.969Z"
    },
    {
      "id": "cmdlb8rf3000tjsil95lycja4",
      "title": {
        "en": "Annual Report 2022",
        "ne": "वार्षिक प्रतिवेदन २०२२"
      },
      "description": null,
      "fileName": "1753598454734-0v08cjt1wafb-annual-report-2.pdf",
      "originalName": "annual-report-2.pdf",
      "filePath": "documents/1753598454734-0v08cjt1wafb-annual-report-2.pdf",
      "fileSize": 18,
      "mimeType": "application/pdf",
      "documentType": "PDF",
      "category": "REPORT",
      "status": "PUBLISHED",
      "documentNumber": null,
      "version": "1.0",
      "publishDate": null,
      "expiryDate": null,
      "tags": [],
      "isPublic": true,
      "requiresAuth": false,
      "order": 0,
      "isActive": true,
      "downloadCount": 0,
      "downloadUrl": "http://localhost:3000/uploads/documents/1753598454734-0v08cjt1wafb-annual-report-2.pdf",
      "createdAt": "2025-07-27T06:40:54.735Z",
      "updatedAt": "2025-07-27T06:40:54.965Z"
    },
    {
      "id": "cmdlb8ren000sjsillobcrai3",
      "title": {
        "en": "Annual Report 2023",
        "ne": "वार्षिक प्रतिवेदन २०२३"
      },
      "description": null,
      "fileName": "1753598454717-9do6n090abd-annual-report-1.pdf",
      "originalName": "annual-report-1.pdf",
      "filePath": "documents/1753598454717-9do6n090abd-annual-report-1.pdf",
      "fileSize": 18,
      "mimeType": "application/pdf",
      "documentType": "PDF",
      "category": "REPORT",
      "status": "PUBLISHED",
      "documentNumber": null,
      "version": "1.0",
      "publishDate": null,
      "expiryDate": null,
      "tags": [],
      "isPublic": true,
      "requiresAuth": false,
      "order": 0,
      "isActive": true,
      "downloadCount": 0,
      "downloadUrl": "http://localhost:3000/uploads/documents/1753598454717-9do6n090abd-annual-report-1.pdf",
      "createdAt": "2025-07-27T06:40:54.719Z",
      "updatedAt": "2025-07-27T06:40:54.961Z"
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
    "timestamp": "2025-07-27T06:40:54.980Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Verification ensures that bulk operations completed successfully for all targeted documents

---

### Step 4: Priya exports the report collection for backup and external sharing ✅

**What Priya Basnet expects**: The system should generate a comprehensive export of all report documents

**API Call**: `GET http://127.0.0.1:38277/api/v1/admin/documents/export`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjhyOGQwMDBtanNpbHljNjZmanVvIiwiaWF0IjoxNzUzNTk4NDU0LCJqdGkiOiIyMTVkZjZmOTJlYWE5ZmVlZjFlNTNkOGY1MWE3NmRiYyIsImV4cCI6MTc1MzYwMjA1NH0.Q06ycyIBz5Jr_sQ2nq-e3iSzOZHeNzEuaTVDQZvM3Ns
```

**Response**: 🟢 200 (9ms)

```json
[
  {
    "id": "cmdlb8rfh000ujsillanyr31k",
    "title": {
      "en": "Annual Report 2021",
      "ne": "वार्षिक प्रतिवेदन २०२१"
    },
    "description": null,
    "fileName": "1753598454747-35h49f3da3c-annual-report-3.pdf",
    "originalName": "annual-report-3.pdf",
    "filePath": "documents/1753598454747-35h49f3da3c-annual-report-3.pdf",
    "fileSize": 18,
    "mimeType": "application/pdf",
    "documentType": "PDF",
    "category": "REPORT",
    "status": "PUBLISHED",
    "documentNumber": null,
    "version": "1.0",
    "publishDate": null,
    "expiryDate": null,
    "tags": [],
    "isPublic": true,
    "requiresAuth": false,
    "order": 0,
    "isActive": true,
    "downloadCount": 0,
    "downloadUrl": "http://localhost:3000/uploads/documents/1753598454747-35h49f3da3c-annual-report-3.pdf",
    "createdAt": "2025-07-27T06:40:54.749Z",
    "updatedAt": "2025-07-27T06:40:54.969Z"
  },
  {
    "id": "cmdlb8rf3000tjsil95lycja4",
    "title": {
      "en": "Annual Report 2022",
      "ne": "वार्षिक प्रतिवेदन २०२२"
    },
    "description": null,
    "fileName": "1753598454734-0v08cjt1wafb-annual-report-2.pdf",
    "originalName": "annual-report-2.pdf",
    "filePath": "documents/1753598454734-0v08cjt1wafb-annual-report-2.pdf",
    "fileSize": 18,
    "mimeType": "application/pdf",
    "documentType": "PDF",
    "category": "REPORT",
    "status": "PUBLISHED",
    "documentNumber": null,
    "version": "1.0",
    "publishDate": null,
    "expiryDate": null,
    "tags": [],
    "isPublic": true,
    "requiresAuth": false,
    "order": 0,
    "isActive": true,
    "downloadCount": 0,
    "downloadUrl": "http://localhost:3000/uploads/documents/1753598454734-0v08cjt1wafb-annual-report-2.pdf",
    "createdAt": "2025-07-27T06:40:54.735Z",
    "updatedAt": "2025-07-27T06:40:54.965Z"
  },
  {
    "id": "cmdlb8ren000sjsillobcrai3",
    "title": {
      "en": "Annual Report 2023",
      "ne": "वार्षिक प्रतिवेदन २०२३"
    },
    "description": null,
    "fileName": "1753598454717-9do6n090abd-annual-report-1.pdf",
    "originalName": "annual-report-1.pdf",
    "filePath": "documents/1753598454717-9do6n090abd-annual-report-1.pdf",
    "fileSize": 18,
    "mimeType": "application/pdf",
    "documentType": "PDF",
    "category": "REPORT",
    "status": "PUBLISHED",
    "documentNumber": null,
    "version": "1.0",
    "publishDate": null,
    "expiryDate": null,
    "tags": [],
    "isPublic": true,
    "requiresAuth": false,
    "order": 0,
    "isActive": true,
    "downloadCount": 0,
    "downloadUrl": "http://localhost:3000/uploads/documents/1753598454717-9do6n090abd-annual-report-1.pdf",
    "createdAt": "2025-07-27T06:40:54.719Z",
    "updatedAt": "2025-07-27T06:40:54.961Z"
  }
]
```

**What happened**: Export functionality enables document archival and sharing with external systems

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Priya Basnet successfully completed all 4 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of perform bulk document management.
        
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
- **login-for-bulk-ops**: 202ms ✅
- **bulk-publish-documents**: 17ms ✅
- **verify-bulk-update**: 10ms ✅
- **export-document-collection**: 9ms ✅