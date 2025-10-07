# ✅ Priya Basnet: Analyze Document Usage and Performance

**Generated**: 2025-07-27T06:40:58.119Z  
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

## 🎯 The Mission: Analyze Document Usage and Performance

🟢 **Difficulty**: EASY  
📁 **Category**: Document Management  
⏱️ **Estimated Duration**: 45 seconds

### What needs to happen:
Document managers review analytics to understand document usage patterns.

### Prerequisites:
- Documents with download history
- Analytics tracking is enabled
- Admin access to statistics

---

## 🎬 The Story Begins


          Priya needs to prepare a monthly report on document usage for the 
          office administration. She wants to understand which documents are 
          most popular, track download patterns, and identify content that 
          might need updates or better promotion.
          
          This analytics will help inform content strategy and resource 
          allocation for document management.
        

---

## 🚀 The Journey

### Step 1: Priya logs in to access document analytics and statistics ✅

**What Priya Basnet expects**: Authentication for analytics and reporting capabilities

**API Call**: `POST http://127.0.0.1:42967/api/v1/auth/login`

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

**Response**: 🟢 200 (199ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlb8to1001kjsiluy5rxj3j",
      "email": "priya.basnet@icms.gov.np",
      "firstName": "Priya",
      "lastName": "Basnet",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T06:40:57.845Z",
      "createdAt": "2025-07-27T06:40:57.649Z",
      "updatedAt": "2025-07-27T06:40:57.846Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjh0bzEwMDFranNpbHV5NXJ4ajNqIiwiaWF0IjoxNzUzNTk4NDU4LCJqdGkiOiI0N2M5NzU1MmVlOWE1MDVlNDlmNTg1NDg0N2VjMGZiYiIsImV4cCI6MTc1MzYwMjA1OH0.dPE0bcKy_qgDw7xC9jlqPhj4MRMKecKJ6QiHMltYgjI",
    "refreshToken": "1f259231d868219f0fe6569e38a2643e2bc204e5bfb28f7a1b03d9d8034706ed8cd78fe4a4a6db1ee4c2ae166c0ed257051888b96e57396df8608345de0694e2",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:58.079Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Analytics access requires admin privileges to view comprehensive usage data

---

### Step 2: Priya reviews overall document repository statistics ✅

**What Priya Basnet expects**: The system should provide comprehensive repository metrics

**API Call**: `GET http://127.0.0.1:33643/api/v1/admin/documents/statistics`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjh0bzEwMDFranNpbHV5NXJ4ajNqIiwiaWF0IjoxNzUzNTk4NDU4LCJqdGkiOiI0N2M5NzU1MmVlOWE1MDVlNDlmNTg1NDg0N2VjMGZiYiIsImV4cCI6MTc1MzYwMjA1OH0.dPE0bcKy_qgDw7xC9jlqPhj4MRMKecKJ6QiHMltYgjI
```

**Response**: 🟢 200 (16ms)

```json
{
  "success": true,
  "data": {
    "total": 1,
    "published": 1,
    "draft": 0,
    "archived": 0,
    "byType": {
      "PDF": 1,
      "DOC": 0,
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
      "REPORT": 1,
      "FORM": 0,
      "POLICY": 0,
      "PROCEDURE": 0,
      "GUIDELINE": 0,
      "NOTICE": 0,
      "CIRCULAR": 0,
      "OTHER": 0
    },
    "totalDownloads": 1,
    "averageDownloadsPerDocument": 1,
    "totalSize": 47,
    "averageSize": 47
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:58.095Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Overall statistics give document managers insights into repository health and usage

---

### Step 3: Priya analyzes detailed performance metrics for the popular report ✅

**What Priya Basnet expects**: The system should show download patterns, user engagement, and access trends

**API Call**: `GET http://127.0.0.1:44539/api/v1/admin/documents/cmdlb8tu6001qjsil6og0c53q/analytics`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjh0bzEwMDFranNpbHV5NXJ4ajNqIiwiaWF0IjoxNzUzNTk4NDU4LCJqdGkiOiI0N2M5NzU1MmVlOWE1MDVlNDlmNTg1NDg0N2VjMGZiYiIsImV4cCI6MTc1MzYwMjA1OH0.dPE0bcKy_qgDw7xC9jlqPhj4MRMKecKJ6QiHMltYgjI
```

**Response**: 🟢 200 (14ms)

```json
{
  "success": true,
  "data": {
    "documentId": "cmdlb8tu6001qjsil6og0c53q",
    "documentTitle": "Popular Government Report",
    "totalDownloads": 0,
    "downloadsByDate": {},
    "downloadsByBrowser": {},
    "downloadsByDevice": {},
    "topDownloaders": []
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:58.109Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Detailed analytics help identify successful content and optimization opportunities

---

### Step 4: Priya searches for documents to compare performance across similar content ✅

**What Priya Basnet expects**: The search should help identify related documents for performance comparison

**API Call**: `GET http://127.0.0.1:33207/api/v1/admin/documents/search`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYjh0bzEwMDFranNpbHV5NXJ4ajNqIiwiaWF0IjoxNzUzNTk4NDU4LCJqdGkiOiI0N2M5NzU1MmVlOWE1MDVlNDlmNTg1NDg0N2VjMGZiYiIsImV4cCI6MTc1MzYwMjA1OH0.dPE0bcKy_qgDw7xC9jlqPhj4MRMKecKJ6QiHMltYgjI
```

**Response**: 🟢 200 (8ms)

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:58.117Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Search functionality helps document managers find and compare similar content performance

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Priya Basnet successfully completed all 4 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of analyze document usage and performance.
        
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
- **login-for-analytics**: 199ms ✅
- **view-overall-statistics**: 16ms ✅
- **analyze-document-performance**: 14ms ✅
- **search-document-performance**: 8ms ✅