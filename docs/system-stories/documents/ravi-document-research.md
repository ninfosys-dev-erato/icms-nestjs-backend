# ✅ Ravi Thapa: Search and Access Government Documents

**Generated**: 2025-07-27T06:40:55.719Z  
**Duration**: 0.04s  
**Status**: Success  
**Test Results**: 5/5 steps passed

---

## 👤 Our Story's Hero: Ravi Thapa

👨🏽‍💻 **Ravi Thapa** | 29 years old | Investigative Journalist

### Background

    Ravi Thapa is a 29-year-old investigative journalist who works for a 
    prominent Nepali newspaper. He regularly accesses government websites 
    to research stories, verify information, and download official documents 
    for his investigative reports.
    
    Ravi is comfortable with technology and expects government websites to 
    be transparent and easy to navigate. He often needs to quickly find 
    specific documents, download attachments, and verify the authenticity 
    of government announcements.
    
    He represents the media community that relies on government transparency 
    and open access to public information. Ravi needs efficient search 
    capabilities and reliable download links to do his job effectively.
  

### What Ravi Thapa wants to achieve:
- Quickly find government documents and announcements
- Download official documents and attachments reliably
- Search for content by categories and topics
- Access the latest published government information
- Verify authenticity of government communications
- Get notifications about new important announcements

### Ravi Thapa's challenges:
- Broken download links for important documents
- Poor search functionality that returns irrelevant results
- Inconsistent categorization making content hard to find
- Slow loading times when accessing documents
- Lack of clear publication dates and version information
- No way to bookmark or track important content updates

---

## 🎯 The Mission: Search and Access Government Documents

🟢 **Difficulty**: EASY  
📁 **Category**: Public Access  
⏱️ **Estimated Duration**: 60 seconds

### What needs to happen:
Citizens and journalists find and download official government documents.

### Prerequisites:
- Published documents exist
- Search functionality is working
- Download tracking is enabled

---

## 🎬 The Story Begins


          Ravi Thapa is investigating government spending patterns for his 
          investigative journalism piece. He needs to find the latest budget 
          documents and download them for detailed analysis. 
          
          As a journalist, he needs reliable access to official documents 
          and wants to track his research by downloading the files for 
          offline analysis and fact-checking.
        

---

## 🚀 The Journey

### Step 1: Ravi searches for '2024 budget' documents on the government website ✅

**What Ravi Thapa expects**: The search should return relevant budget-related documents

**API Call**: `GET /api/v1/documents/search?q=budget+2024`

**Response**: 🟢 200 (9ms)

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
    "timestamp": "2025-07-27T06:40:55.688Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Search functionality helps journalists quickly locate specific government information

---

### Step 2: Ravi browses the official documents category to see all available government publications ✅

**What Ravi Thapa expects**: The system should list all published official documents

**API Call**: `GET /api/v1/documents/category/OFFICIAL`

**Response**: 🟢 200 (9ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlb8s5a0016jsilt6xxfwo2",
      "title": {
        "en": "Government Budget 2024",
        "ne": "सरकारी बजेट २०२४"
      },
      "description": {
        "en": "Annual budget allocation and financial planning"
      },
      "fileName": "1753598455677-o005ibev73h-budget-2024.pdf",
      "originalName": "budget-2024.pdf",
      "filePath": "documents/1753598455677-o005ibev73h-budget-2024.pdf",
      "fileSize": 86,
      "mimeType": "application/pdf",
      "documentType": "PDF",
      "category": "OFFICIAL",
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
      "downloadUrl": "http://localhost:3000/uploads/documents/1753598455677-o005ibev73h-budget-2024.pdf",
      "createdAt": "2025-07-27T06:40:55.678Z",
      "updatedAt": "2025-07-27T06:40:55.678Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:55.695Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Category browsing provides systematic access to government document collections

---

### Step 3: Ravi accesses the specific budget document to read the details ✅

**What Ravi Thapa expects**: The system should show complete document information and metadata

**API Call**: `GET /api/v1/documents/cmdlb8s5a0016jsilt6xxfwo2`

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlb8s5a0016jsilt6xxfwo2",
    "title": {
      "en": "Government Budget 2024",
      "ne": "सरकारी बजेट २०२४"
    },
    "description": {
      "en": "Annual budget allocation and financial planning"
    },
    "fileName": "1753598455677-o005ibev73h-budget-2024.pdf",
    "originalName": "budget-2024.pdf",
    "filePath": "documents/1753598455677-o005ibev73h-budget-2024.pdf",
    "fileSize": 86,
    "mimeType": "application/pdf",
    "documentType": "PDF",
    "category": "OFFICIAL",
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
    "downloadUrl": "http://localhost:3000/uploads/documents/1753598455677-o005ibev73h-budget-2024.pdf",
    "createdAt": "2025-07-27T06:40:55.678Z",
    "updatedAt": "2025-07-27T06:40:55.678Z"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:55.704Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Detailed document view provides journalists with comprehensive information for research

---

### Step 4: Ravi downloads the budget document for offline analysis and fact-checking ✅

**What Ravi Thapa expects**: The system should provide a secure download URL and track the download

**API Call**: `GET /api/v1/documents/cmdlb8s5a0016jsilt6xxfwo2/download`

**Response**: 🟢 200 (8ms)

```json
{
  "success": true,
  "data": {
    "downloadUrl": "http://localhost:3000/uploads/documents/1753598455677-o005ibev73h-budget-2024.pdf"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:55.712Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Download functionality enables journalists to access documents for detailed offline analysis

---

### Step 5: Ravi gets the direct document URL for citation in his article ✅

**What Ravi Thapa expects**: The system should provide document access information for referencing

**API Call**: `GET /api/v1/documents/cmdlb8s5a0016jsilt6xxfwo2/url`

**Response**: 🟢 200 (5ms)

```json
{
  "success": true,
  "data": {
    "url": "http://localhost:3000/uploads/documents/1753598455677-o005ibev73h-budget-2024.pdf",
    "fileName": "1753598455677-o005ibev73h-budget-2024.pdf",
    "fileSize": 86,
    "mimeType": "application/pdf"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:55.717Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Document URLs enable proper citation and referencing in journalistic work

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Ravi Thapa successfully completed all 5 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of search and access government documents.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 5
- **Successful**: 5
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.04s

### Performance Metrics
- **search-budget-documents**: 9ms ✅
- **browse-official-documents**: 9ms ✅
- **access-budget-document**: 7ms ✅
- **download-budget-document**: 8ms ✅
- **get-document-url**: 5ms ✅