# ✅ Priya Basnet: Perform Bulk Important Links Operations

**Generated**: 2025-07-27T11:08:56.866Z  
**Duration**: 0.06s  
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

## 🎯 The Mission: Perform Bulk Important Links Operations

🔴 **Difficulty**: HARD  
📁 **Category**: Administration  
⏱️ **Estimated Duration**: 3 minutes

### What needs to happen:
An administrator performs bulk operations on important links including bulk create, update, and reordering.

### Prerequisites:
- Admin access to bulk operations
- Multiple links for testing
- Proper validation for bulk data

---

## 🎬 The Story Begins

Priya Basnet, a 34-year-old Document Manager, arrives at the office ready to efficiently manage large sets of important links using bulk operations.

---

## 🚀 The Journey

### Step 1: Priya Basnet uses bulk create to efficiently add multiple important links at once ✅

**What Priya Basnet expects**: The system should validate and create all links in a single operation

**API Call**: `POST /api/v1/admin/important-links/bulk-create`

**Request Body**:
```json
{
  "links": [
    {
      "linkTitle": {
        "en": "Bulk Link 1",
        "ne": "बल्क लिङ्क १"
      },
      "linkUrl": "https://bulk1.gov.np",
      "order": 20,
      "isActive": true
    },
    {
      "linkTitle": {
        "en": "Bulk Link 2",
        "ne": "बल्क लिङ्क २"
      },
      "linkUrl": "https://bulk2.gov.np",
      "order": 21,
      "isActive": true
    },
    {
      "linkTitle": {
        "en": "Bulk Link 3",
        "ne": "बल्क लिङ्क ३"
      },
      "linkUrl": "https://bulk3.gov.np",
      "order": 22,
      "isActive": false
    }
  ]
}
```

**Headers**:
```
Authorization: Bearer [TOKEN]
```

**Response**: 🟢 201 (14ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlktgfo000jjsvctrufseex",
      "linkTitle": {
        "en": "Bulk Link 1",
        "ne": "बल्क लिङ्क १"
      },
      "linkUrl": "https://bulk1.gov.np",
      "order": 20,
      "isActive": true,
      "createdAt": "2025-07-27T11:08:56.820Z",
      "updatedAt": "2025-07-27T11:08:56.820Z"
    },
    {
      "id": "cmdlktgfp000kjsvci2gamg7x",
      "linkTitle": {
        "en": "Bulk Link 2",
        "ne": "बल्क लिङ्क २"
      },
      "linkUrl": "https://bulk2.gov.np",
      "order": 21,
      "isActive": true,
      "createdAt": "2025-07-27T11:08:56.822Z",
      "updatedAt": "2025-07-27T11:08:56.822Z"
    },
    {
      "id": "cmdlktgfq000ljsvczf29wwud",
      "linkTitle": {
        "en": "Bulk Link 3",
        "ne": "बल्क लिङ्क ३"
      },
      "linkUrl": "https://bulk3.gov.np",
      "order": 22,
      "isActive": false,
      "createdAt": "2025-07-27T11:08:56.823Z",
      "updatedAt": "2025-07-27T11:08:56.823Z"
    }
  ],
  "meta": {
    "timestamp": "2025-07-27T11:08:56.823Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Bulk creation allows efficient management of multiple important links simultaneously

---

### Step 2: Priya Basnet reorders the important links to prioritize the most relevant resources ✅

**What Priya Basnet expects**: The system should update the display order of all specified links

**API Call**: `POST /api/v1/admin/important-links/reorder`

**Request Body**:
```json
{
  "orders": [
    {
      "id": "cmdlktfdw0003jsvcsymy91ay",
      "order": 30
    },
    {
      "id": "cmdlktfe00004jsvctdciymgb",
      "order": 25
    },
    {
      "id": "cmdlktfe10005jsvcqdlp5q7q",
      "order": 35
    }
  ]
}
```

**Headers**:
```
Authorization: Bearer [TOKEN]
```

**Response**: 🟢 200 (23ms)

```json
{
  "success": true,
  "data": {
    "message": "Important links reordered successfully"
  },
  "meta": {
    "timestamp": "2025-07-27T11:08:56.846Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Reordering allows administrators to control the priority and visibility of important links

---

### Step 3: Priya Basnet imports important links from an external source for system migration ✅

**What Priya Basnet expects**: The system should validate and import links with detailed success/failure reporting

**API Call**: `POST /api/v1/admin/important-links/import`

**Request Body**:
```json
{
  "links": [
    {
      "linkTitle": {
        "en": "Imported Portal 1",
        "ne": "आयातित पोर्टल १"
      },
      "linkUrl": "https://imported1.gov.np",
      "order": 40,
      "isActive": true
    },
    {
      "linkTitle": {
        "en": "Imported Portal 2",
        "ne": "आयातित पोर्टल २"
      },
      "linkUrl": "https://imported2.gov.np",
      "order": 41,
      "isActive": true
    }
  ]
}
```

**Headers**:
```
Authorization: Bearer [TOKEN]
```

**Response**: 🟢 200 (11ms)

```json
{
  "success": true,
  "data": {
    "success": 2,
    "failed": 0,
    "errors": []
  },
  "meta": {
    "timestamp": "2025-07-27T11:08:56.857Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Import functionality enables migration and bulk addition of important links from external sources

---

### Step 4: Priya Basnet exports all important links for backup and documentation purposes ✅

**What Priya Basnet expects**: The system should generate a complete export of all important links with metadata

**API Call**: `GET /api/v1/admin/important-links/export`

**Headers**:
```
Authorization: Bearer [TOKEN]
```

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "cmdlktfe20006jsvcutek23fj",
        "linkTitle": {
          "en": "Tourist Information",
          "ne": "पर्यटक सूचना"
        },
        "linkUrl": "https://tourism.gov.np",
        "order": 4,
        "isActive": true,
        "createdAt": "2025-07-27T11:08:55.467Z",
        "updatedAt": "2025-07-27T11:08:55.467Z"
      },
      {
        "id": "cmdlktfe30007jsvctmn1pqhe",
        "linkTitle": {
          "en": "Inactive Link",
          "ne": "निष्क्रिय लिङ्क"
        },
        "linkUrl": "https://old.gov.np",
        "order": 5,
        "isActive": false,
        "createdAt": "2025-07-27T11:08:55.468Z",
        "updatedAt": "2025-07-27T11:08:55.468Z"
      },
      {
        "id": "cmdlktg6b000djsvccybkudxi",
        "linkTitle": {
          "en": "Updated Government Portal",
          "ne": "अपडेटेड सरकारी पोर्टल"
        },
        "linkUrl": "https://newportal.gov.np",
        "order": 5,
        "isActive": true,
        "createdAt": "2025-07-27T11:08:56.483Z",
        "updatedAt": "2025-07-27T11:08:56.493Z"
      },
      {
        "id": "cmdlktgfo000jjsvctrufseex",
        "linkTitle": {
          "en": "Bulk Link 1",
          "ne": "बल्क लिङ्क १"
        },
        "linkUrl": "https://bulk1.gov.np",
        "order": 20,
        "isActive": true,
        "createdAt": "2025-07-27T11:08:56.820Z",
        "updatedAt": "2025-07-27T11:08:56.820Z"
      },
      {
        "id": "cmdlktgfp000kjsvci2gamg7x",
        "linkTitle": {
          "en": "Bulk Link 2",
          "ne": "बल्क लिङ्क २"
        },
        "linkUrl": "https://bulk2.gov.np",
        "order": 21,
        "isActive": true,
        "createdAt": "2025-07-27T11:08:56.822Z",
        "updatedAt": "2025-07-27T11:08:56.822Z"
      },
      {
        "id": "cmdlktgfq000ljsvczf29wwud",
        "linkTitle": {
          "en": "Bulk Link 3",
          "ne": "बल्क लिङ्क ३"
        },
        "linkUrl": "https://bulk3.gov.np",
        "order": 22,
        "isActive": false,
        "createdAt": "2025-07-27T11:08:56.823Z",
        "updatedAt": "2025-07-27T11:08:56.823Z"
      },
      {
        "id": "cmdlktfe00004jsvctdciymgb",
        "linkTitle": {
          "en": "Ministry of Education",
          "ne": "शिक्षा मन्त्रालय"
        },
        "linkUrl": "https://moe.gov.np",
        "order": 25,
        "isActive": true,
        "createdAt": "2025-07-27T11:08:55.464Z",
        "updatedAt": "2025-07-27T11:08:56.845Z"
      },
      {
        "id": "cmdlktfdw0003jsvcsymy91ay",
        "linkTitle": {
          "en": "Government Portal",
          "ne": "सरकारी पोर्टल"
        },
        "linkUrl": "https://www.gov.np",
        "order": 30,
        "isActive": true,
        "createdAt": "2025-07-27T11:08:55.461Z",
        "updatedAt": "2025-07-27T11:08:56.845Z"
      },
      {
        "id": "cmdlktfe10005jsvcqdlp5q7q",
        "linkTitle": {
          "en": "National Portal",
          "ne": "राष्ट्रिय पोर्टल"
        },
        "linkUrl": "https://nepal.gov.np",
        "order": 35,
        "isActive": true,
        "createdAt": "2025-07-27T11:08:55.465Z",
        "updatedAt": "2025-07-27T11:08:56.846Z"
      },
      {
        "id": "cmdlktggn000mjsvc8ig9vxzv",
        "linkTitle": {
          "en": "Imported Portal 1",
          "ne": "आयातित पोर्टल १"
        },
        "linkUrl": "https://imported1.gov.np",
        "order": 40,
        "isActive": true,
        "createdAt": "2025-07-27T11:08:56.855Z",
        "updatedAt": "2025-07-27T11:08:56.855Z"
      },
      {
        "id": "cmdlktggp000njsvcpxo0t5qb",
        "linkTitle": {
          "en": "Imported Portal 2",
          "ne": "आयातित पोर्टल २"
        },
        "linkUrl": "https://imported2.gov.np",
        "order": 41,
        "isActive": true,
        "createdAt": "2025-07-27T11:08:56.857Z",
        "updatedAt": "2025-07-27T11:08:56.857Z"
      }
    ],
    "total": 11,
    "exportedAt": "2025-07-27T11:08:56.864Z"
  },
  "meta": {
    "timestamp": "2025-07-27T11:08:56.864Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Export functionality provides backup capabilities and data portability for important links

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Priya Basnet successfully completed all 4 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of perform bulk important links operations.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 4
- **Successful**: 4
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.06s

### Performance Metrics
- **bulk-create-links**: 14ms ✅
- **reorder-links**: 23ms ✅
- **import-links**: 11ms ✅
- **export-links**: 7ms ✅