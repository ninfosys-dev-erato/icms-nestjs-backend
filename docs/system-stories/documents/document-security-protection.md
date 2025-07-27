# ❌ John Smith (Tourist): Manage Document Access and Security

**Generated**: 2025-07-27T06:40:56.431Z  
**Duration**: 0.02s  
**Status**: Failed  
**Test Results**: 2/3 steps passed

---

## 👤 Our Story's Hero: John Smith (Tourist)

🧑🏼‍💻 **John Smith (Tourist)** | 28 years old | Software Developer / Tourist

### Background

    John Smith is a 28-year-old software developer from the United States who 
    is planning a trekking trip to Nepal. He's tech-savvy but completely new 
    to Nepali government systems. He represents the typical international 
    visitor who needs to access government information and services.
    
    John is used to modern, intuitive interfaces and has high expectations 
    for user experience. He's comfortable with technology but expects systems 
    to be self-explanatory. He values quick access to information and doesn't 
    want to spend time figuring out complex navigation.
    
    As a tourist, John needs specific information about permits, local regulations, 
    contact information, and downloadable forms. He might access the system 
    from different devices and potentially slower internet connections.
  

### What John Smith (Tourist) wants to achieve:
- Find contact information for government offices quickly
- Download necessary forms and documents for permits
- Access tourist-related announcements and updates
- Get information about local regulations and requirements
- Find emergency contact information
- Access the system in English (language preference)

### John Smith (Tourist)'s challenges:
- Slow loading times on mobile connections
- Complex navigation that requires local knowledge
- Content only available in Nepali language
- Broken download links for important documents
- Unclear categorization of information
- No search functionality to find specific information

---

## 🎯 The Mission: Manage Document Access and Security

🟡 **Difficulty**: MEDIUM  
📁 **Category**: Security  
⏱️ **Estimated Duration**: 90 seconds

### What needs to happen:
Control document visibility and access permissions for different user types.

### Prerequisites:
- Documents with different security requirements
- User roles properly configured
- Access control policies defined

---

## 🎬 The Story Begins


          John Smith, a tourist, is browsing the government website looking 
          for public information. He accidentally tries to access a confidential 
          document that requires authentication. This scenario tests how the 
          system protects sensitive documents from unauthorized access.
        

---

## 🚀 The Journey

### Step 1: John tries to access a confidential document without authentication ✅

**What John Smith (Tourist) expects**: The system should deny access and return an appropriate error

**API Call**: `GET http://127.0.0.1:39157/api/v1/documents/cmdlb8spj001djsili4bguon4`

**Response**: 🟢 200 (6ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlb8spj001djsili4bguon4",
    "title": {
      "en": "Confidential Internal Report",
      "ne": "गोप्य आन्तरिक प्रतिवेदन"
    },
    "description": null,
    "fileName": "1753598456405-fuzrbsptowp-confidential-report.pdf",
    "originalName": "confidential-report.pdf",
    "filePath": "documents/1753598456405-fuzrbsptowp-confidential-report.pdf",
    "fileSize": 48,
    "mimeType": "application/pdf",
    "documentType": "PDF",
    "category": "OFFICIAL",
    "status": "PUBLISHED",
    "documentNumber": null,
    "version": "1.0",
    "publishDate": null,
    "expiryDate": null,
    "tags": [],
    "isPublic": false,
    "requiresAuth": true,
    "order": 0,
    "isActive": true,
    "downloadCount": 0,
    "downloadUrl": "http://localhost:3000/uploads/documents/1753598456405-fuzrbsptowp-confidential-report.pdf",
    "createdAt": "2025-07-27T06:40:56.407Z",
    "updatedAt": "2025-07-27T06:40:56.407Z"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:56.416Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Document security ensures confidential materials are protected from unauthorized access

---

### Step 2: John searches for publicly available documents that he can access ✅

**What John Smith (Tourist) expects**: The system should only return documents marked as public

**API Call**: `GET http://127.0.0.1:36027/api/v1/documents`

**Response**: 🟢 200 (7ms)

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
    "timestamp": "2025-07-27T06:40:56.423Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Public document filtering ensures users only see content they're authorized to access

---

### Step 3: John tries to access the admin document management interface ❌

**What John Smith (Tourist) expects**: The system should deny access due to lack of authentication

**API Call**: `GET http://127.0.0.1:39071/api/v1/admin/documents`

**Response**: 🔴 401 (6ms)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ERROR",
    "message": "Unauthorized"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:56.429Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Admin endpoints must be protected from unauthorized access to maintain system security

---



## 🎯 The Outcome

❌ **Journey Encountered Issues**
        
        John Smith (Tourist) completed 2 out of 3 steps successfully. 
        1 step(s) failed, preventing them from fully achieving 
        their goal of manage document access and security.
        
        This indicates areas where the API or user experience could be improved.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 3
- **Successful**: 2
- **Failed**: 1
- **Success Rate**: 66.7%
- **Total Duration**: 0.02s

### Performance Metrics
- **attempt-private-document-access**: 6ms ✅
- **search-for-public-documents**: 7ms ✅
- **attempt-admin-endpoint-access**: 6ms ❌

### ❌ Failed Steps
- **attempt-admin-endpoint-access**: Unknown error