# ✅ Ravi Thapa: Navigate Paginated Important Links

**Generated**: 2025-07-27T11:08:55.910Z  
**Duration**: 0.04s  
**Status**: Success  
**Test Results**: 3/3 steps passed

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

## 🎯 The Mission: Navigate Paginated Important Links

🟢 **Difficulty**: EASY  
📁 **Category**: Public Access  
⏱️ **Estimated Duration**: 60 seconds

### What needs to happen:
A user navigates through paginated important links to find specific government resources.

### Prerequisites:
- Multiple important links exist
- Pagination is properly configured
- Search and filtering work correctly

---

## 🎬 The Story Begins

Ravi Thapa, a Investigative Journalist visiting from abroad, needs to systematically browse through all government important links for his research.

---

## 🚀 The Journey

### Step 1: Ravi Thapa starts browsing important links using pagination to review them systematically ✅

**What Ravi Thapa expects**: He expects to see the first page with 3 links and pagination information

**API Call**: `GET /api/v1/important-links/pagination`

**Response**: 🟢 200 (23ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlktfdw0003jsvcsymy91ay",
      "linkTitle": {
        "en": "Government Portal",
        "ne": "सरकारी पोर्टल"
      },
      "linkUrl": "https://www.gov.np",
      "order": 1,
      "isActive": true,
      "createdAt": "2025-07-27T11:08:55.461Z",
      "updatedAt": "2025-07-27T11:08:55.461Z"
    },
    {
      "id": "cmdlktfe00004jsvctdciymgb",
      "linkTitle": {
        "en": "Ministry of Education",
        "ne": "शिक्षा मन्त्रालय"
      },
      "linkUrl": "https://moe.gov.np",
      "order": 2,
      "isActive": true,
      "createdAt": "2025-07-27T11:08:55.464Z",
      "updatedAt": "2025-07-27T11:08:55.464Z"
    },
    {
      "id": "cmdlktfe10005jsvcqdlp5q7q",
      "linkTitle": {
        "en": "National Portal",
        "ne": "राष्ट्रिय पोर्टल"
      },
      "linkUrl": "https://nepal.gov.np",
      "order": 3,
      "isActive": true,
      "createdAt": "2025-07-27T11:08:55.465Z",
      "updatedAt": "2025-07-27T11:08:55.465Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 3,
    "total": 5,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-07-27T11:08:55.890Z",
    "version": "1.0.0"
  }
}
```

**What happened**: The system returns paginated results with metadata about total pages and navigation

---

### Step 2: Ravi Thapa navigates to the second page to continue reviewing important links ✅

**What Ravi Thapa expects**: He should see the next set of links with updated pagination information

**API Call**: `GET /api/v1/important-links/pagination`

**Response**: 🟢 200 (8ms)

```json
{
  "success": true,
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
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 3,
    "total": 5,
    "totalPages": 2,
    "hasNext": false,
    "hasPrev": true
  },
  "meta": {
    "timestamp": "2025-07-27T11:08:55.901Z",
    "version": "1.0.0"
  }
}
```

**What happened**: The pagination system correctly displays the next page of important links

---

### Step 3: Ravi Thapa filters the pagination to show only active links for current information ✅

**What Ravi Thapa expects**: The system should return only active links in the paginated results

**API Call**: `GET /api/v1/important-links/pagination`

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlktfdw0003jsvcsymy91ay",
      "linkTitle": {
        "en": "Government Portal",
        "ne": "सरकारी पोर्टल"
      },
      "linkUrl": "https://www.gov.np",
      "order": 1,
      "isActive": true,
      "createdAt": "2025-07-27T11:08:55.461Z",
      "updatedAt": "2025-07-27T11:08:55.461Z"
    },
    {
      "id": "cmdlktfe00004jsvctdciymgb",
      "linkTitle": {
        "en": "Ministry of Education",
        "ne": "शिक्षा मन्त्रालय"
      },
      "linkUrl": "https://moe.gov.np",
      "order": 2,
      "isActive": true,
      "createdAt": "2025-07-27T11:08:55.464Z",
      "updatedAt": "2025-07-27T11:08:55.464Z"
    },
    {
      "id": "cmdlktfe10005jsvcqdlp5q7q",
      "linkTitle": {
        "en": "National Portal",
        "ne": "राष्ट्रिय पोर्टल"
      },
      "linkUrl": "https://nepal.gov.np",
      "order": 3,
      "isActive": true,
      "createdAt": "2025-07-27T11:08:55.465Z",
      "updatedAt": "2025-07-27T11:08:55.465Z"
    },
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
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 4,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-07-27T11:08:55.907Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Filtering combines with pagination to show only relevant, active important links

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Ravi Thapa successfully completed all 3 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of navigate paginated important links.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 3
- **Successful**: 3
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.04s

### Performance Metrics
- **paginated-links-page-1**: 23ms ✅
- **paginated-links-page-2**: 8ms ✅
- **filter-active-paginated**: 7ms ✅