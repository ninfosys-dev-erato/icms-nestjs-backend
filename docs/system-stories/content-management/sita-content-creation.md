# ✅ Sita Sharma: Create and Publish Government Content

**Generated**: 2025-07-27T03:40:56.788Z  
**Duration**: 0.52s  
**Status**: Success  
**Test Results**: 4/4 steps passed

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

## 🎯 The Mission: Create and Publish Government Content

🟡 **Difficulty**: MEDIUM  
📁 **Category**: Content Management  
⏱️ **Estimated Duration**: 3 minutes

### What needs to happen:
An editor creates new content, adds attachments, and publishes it for public access.

### Prerequisites:
- Editor access to the system
- Content categories already exist
- Content ready for publication

---

## 🎬 The Story Begins


          Sita Sharma rushes into the office at 8:15 AM with urgent news to publish. 
          The Chief Minister has just announced a new infrastructure development 
          project, and she needs to get this information on the government website 
          immediately to inform the public.
          
          She has the official press release, some photos from the announcement 
          ceremony, and a detailed project document that needs to be attached 
          for public download. Time is critical - news outlets are waiting 
          for the official government statement.
        

---

## 🚀 The Journey

### Step 1: Sita quickly logs into the content management system ✅

**What Sita Sharma expects**: Fast authentication to start publishing urgent content

**API Call**: `POST unknown`

**Request Body**:
```json
{
  "email": "sita.sharma@icms.gov.np",
  "password": "SitaEditor@2024"
}
```

**Headers**:
```
content-type: application/json
```

**Response**: 🟢 200 (429ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdl4tbf10034js75o60bbiio",
      "email": "sita.sharma@icms.gov.np",
      "firstName": "Sita",
      "lastName": "Sharma",
      "role": "EDITOR",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T03:40:56.461Z",
      "updatedAt": "2025-07-27T03:40:56.461Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsNHRiZjEwMDM0anM3NW82MGJiaWlvIiwiaWF0IjoxNzUzNTg3NjU2LCJqdGkiOiJlNzAzYWQ5ZWIwZDliY2E2ZmQ5YmUxNTgxYjBhODIzYiIsImV4cCI6MTc1MzU5MTI1Nn0.UQaWidjA5FBmXwHJ-9sx-4Z3XidQhrIYcDffugHO-j0",
    "refreshToken": "f39c88306fe578a0955087ce52d4556935dbb697b920846f02f6986754b8791a179c69d95ed07dee172bdfb735f99b48361df54fed0baf326eeeae1cdc2ffc73",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T03:40:56.693Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Editors need quick access during time-sensitive publishing situations

---

### Step 2: Sita creates a draft of the infrastructure announcement with bilingual content ✅

**What Sita Sharma expects**: The system should create a draft that can be reviewed before publishing

**API Call**: `POST unknown`

**Request Body**:
```json
{
  "title": {
    "en": "New Infrastructure Development Project Announced",
    "ne": "नयाँ पूर्वाधार विकास परियोजना घोषणा"
  },
  "content": {
    "en": "The Chief Minister announced a major infrastructure development project that will improve transportation and connectivity across the region.",
    "ne": "मुख्यमन्त्रीले एक प्रमुख पूर्वाधार विकास परियोजनाको घोषणा गर्नुभयो जसले यस क्षेत्रमा यातायात र जडानमा सुधार ल्याउनेछ।"
  },
  "excerpt": {
    "en": "Major infrastructure project announced by Chief Minister",
    "ne": "मुख्यमन्त्रीद्वारा प्रमुख पूर्वाधार परियोजना घोषणा"
  },
  "categoryId": "cmdl4tb9j0033js75sy16yvzc",
  "status": "DRAFT",
  "slug": "infrastructure-project-announcement"
}
```

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsNHRiZjEwMDM0anM3NW82MGJiaWlvIiwiaWF0IjoxNzUzNTg3NjU2LCJqdGkiOiJlNzAzYWQ5ZWIwZDliY2E2ZmQ5YmUxNTgxYjBhODIzYiIsImV4cCI6MTc1MzU5MTI1Nn0.UQaWidjA5FBmXwHJ-9sx-4Z3XidQhrIYcDffugHO-j0
content-type: application/json
```

**Response**: 🟢 201 (33ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdl4tbm5003bjs75sn6oeylo",
    "title": {
      "en": "New Infrastructure Development Project Announced",
      "ne": "नयाँ पूर्वाधार विकास परियोजना घोषणा"
    },
    "content": {
      "en": "The Chief Minister announced a major infrastructure development project that will improve transportation and connectivity across the region.",
      "ne": "मुख्यमन्त्रीले एक प्रमुख पूर्वाधार विकास परियोजनाको घोषणा गर्नुभयो जसले यस क्षेत्रमा यातायात र जडानमा सुधार ल्याउनेछ।"
    },
    "excerpt": {
      "en": "Major infrastructure project announced by Chief Minister",
      "ne": "मुख्यमन्त्रीद्वारा प्रमुख पूर्वाधार परियोजना घोषणा"
    },
    "slug": "infrastructure-project-announcement",
    "categoryId": "cmdl4tb9j0033js75sy16yvzc",
    "status": "DRAFT",
    "publishedAt": null,
    "featured": false,
    "order": 0,
    "createdAt": "2025-07-27T03:40:56.717Z",
    "updatedAt": "2025-07-27T03:40:56.717Z",
    "category": {
      "id": "cmdl4tb9j0033js75sy16yvzc",
      "name": {
        "en": "News",
        "ne": "समाचार"
      },
      "description": null,
      "slug": "news",
      "parentId": null,
      "order": 0,
      "isActive": true,
      "createdAt": "2025-07-27T03:40:56.263Z",
      "updatedAt": "2025-07-27T03:40:56.263Z",
      "children": [],
      "contentCount": 0
    },
    "attachments": [],
    "createdBy": {
      "id": "cmdl4tbf10034js75o60bbiio",
      "email": "sita.sharma@icms.gov.np",
      "firstName": "Sita",
      "lastName": "Sharma"
    },
    "updatedBy": {
      "id": "cmdl4tbf10034js75o60bbiio",
      "email": "sita.sharma@icms.gov.np",
      "firstName": "Sita",
      "lastName": "Sharma"
    }
  },
  "meta": {
    "timestamp": "2025-07-27T03:40:56.726Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Draft status allows editors to prepare content carefully before making it public

---

### Step 3: Sita uploads the detailed project document as an attachment ✅

**What Sita Sharma expects**: The document should be securely attached and available for download

**API Call**: `POST unknown`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsNHRiZjEwMDM0anM3NW82MGJiaWlvIiwiaWF0IjoxNzUzNTg3NjU2LCJqdGkiOiJlNzAzYWQ5ZWIwZDliY2E2ZmQ5YmUxNTgxYjBhODIzYiIsImV4cCI6MTc1MzU5MTI1Nn0.UQaWidjA5FBmXwHJ-9sx-4Z3XidQhrIYcDffugHO-j0
```

**Response**: 🟢 201 (34ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdl4tbn7003djs758kz7wnub",
    "contentId": "cmdl4tbm5003bjs75sn6oeylo",
    "fileName": "infrastructure-project-details.txt",
    "filePath": "content-attachments/cmdl4tbm5003bjs75sn6oeylo/1753587656748-rvjm83vfoc-infrastructure-project-details.txt",
    "fileSize": 180,
    "mimeType": "text/plain",
    "order": 0,
    "createdAt": "2025-07-27T03:40:56.755Z",
    "content": {
      "id": "cmdl4tbm5003bjs75sn6oeylo",
      "title": {
        "en": "New Infrastructure Development Project Announced",
        "ne": "नयाँ पूर्वाधार विकास परियोजना घोषणा"
      },
      "content": {
        "en": "The Chief Minister announced a major infrastructure development project that will improve transportation and connectivity across the region.",
        "ne": "मुख्यमन्त्रीले एक प्रमुख पूर्वाधार विकास परियोजनाको घोषणा गर्नुभयो जसले यस क्षेत्रमा यातायात र जडानमा सुधार ल्याउनेछ।"
      },
      "excerpt": {
        "en": "Major infrastructure project announced by Chief Minister",
        "ne": "मुख्यमन्त्रीद्वारा प्रमुख पूर्वाधार परियोजना घोषणा"
      },
      "slug": "infrastructure-project-announcement",
      "categoryId": "cmdl4tb9j0033js75sy16yvzc",
      "status": "DRAFT",
      "publishedAt": null,
      "featured": false,
      "order": 0,
      "createdById": "cmdl4tbf10034js75o60bbiio",
      "updatedById": "cmdl4tbf10034js75o60bbiio",
      "createdAt": "2025-07-27T03:40:56.717Z",
      "updatedAt": "2025-07-27T03:40:56.717Z"
    },
    "downloadUrl": "/api/v1/attachments/cmdl4tbn7003djs758kz7wnub/download"
  },
  "meta": {
    "timestamp": "2025-07-27T03:40:56.763Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Attachments provide citizens with detailed information beyond the main announcement

---

### Step 4: Sita publishes the announcement to make it immediately available to the public ✅

**What Sita Sharma expects**: The content should go live with all attachments accessible

**API Call**: `POST unknown`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsNHRiZjEwMDM0anM3NW82MGJiaWlvIiwiaWF0IjoxNzUzNTg3NjU2LCJqdGkiOiJlNzAzYWQ5ZWIwZDliY2E2ZmQ5YmUxNTgxYjBhODIzYiIsImV4cCI6MTc1MzU5MTI1Nn0.UQaWidjA5FBmXwHJ-9sx-4Z3XidQhrIYcDffugHO-j0
```

**Response**: 🟢 200 (23ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdl4tbm5003bjs75sn6oeylo",
    "title": {
      "en": "New Infrastructure Development Project Announced",
      "ne": "नयाँ पूर्वाधार विकास परियोजना घोषणा"
    },
    "content": {
      "en": "The Chief Minister announced a major infrastructure development project that will improve transportation and connectivity across the region.",
      "ne": "मुख्यमन्त्रीले एक प्रमुख पूर्वाधार विकास परियोजनाको घोषणा गर्नुभयो जसले यस क्षेत्रमा यातायात र जडानमा सुधार ल्याउनेछ।"
    },
    "excerpt": {
      "en": "Major infrastructure project announced by Chief Minister",
      "ne": "मुख्यमन्त्रीद्वारा प्रमुख पूर्वाधार परियोजना घोषणा"
    },
    "slug": "infrastructure-project-announcement",
    "categoryId": "cmdl4tb9j0033js75sy16yvzc",
    "status": "PUBLISHED",
    "publishedAt": "2025-07-27T03:40:56.779Z",
    "featured": false,
    "order": 0,
    "createdAt": "2025-07-27T03:40:56.717Z",
    "updatedAt": "2025-07-27T03:40:56.780Z",
    "category": {
      "id": "cmdl4tb9j0033js75sy16yvzc",
      "name": {
        "en": "News",
        "ne": "समाचार"
      },
      "description": null,
      "slug": "news",
      "parentId": null,
      "order": 0,
      "isActive": true,
      "createdAt": "2025-07-27T03:40:56.263Z",
      "updatedAt": "2025-07-27T03:40:56.263Z",
      "children": [],
      "contentCount": 0
    },
    "attachments": [
      {
        "id": "cmdl4tbn7003djs758kz7wnub",
        "contentId": "cmdl4tbm5003bjs75sn6oeylo",
        "fileName": "infrastructure-project-details.txt",
        "filePath": "content-attachments/cmdl4tbm5003bjs75sn6oeylo/1753587656748-rvjm83vfoc-infrastructure-project-details.txt",
        "fileSize": 180,
        "mimeType": "text/plain",
        "order": 0,
        "createdAt": "2025-07-27T03:40:56.755Z",
        "downloadUrl": "/api/v1/attachments/cmdl4tbn7003djs758kz7wnub/download"
      }
    ],
    "createdBy": {
      "id": "cmdl4tbf10034js75o60bbiio",
      "email": "sita.sharma@icms.gov.np",
      "firstName": "Sita",
      "lastName": "Sharma"
    },
    "updatedBy": {
      "id": "cmdl4tbf10034js75o60bbiio",
      "email": "sita.sharma@icms.gov.np",
      "firstName": "Sita",
      "lastName": "Sharma"
    }
  },
  "meta": {
    "timestamp": "2025-07-27T03:40:56.783Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Publishing makes government information immediately accessible to citizens and media

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Sita Sharma successfully completed all 4 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of create and publish government content.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 4
- **Successful**: 4
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.52s

### Performance Metrics
- **editor-login**: 429ms ✅
- **create-content-draft**: 33ms ✅
- **add-document-attachment**: 34ms ✅
- **publish-content**: 23ms ✅