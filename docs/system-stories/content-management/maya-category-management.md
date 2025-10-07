# ✅ Maya Adhikari: Create and Manage Content Categories

**Generated**: 2025-07-27T03:40:55.482Z  
**Duration**: 0.54s  
**Status**: Success  
**Test Results**: 5/5 steps passed

---

## 👤 Our Story's Hero: Maya Adhikari

👩🏽‍💼 **Maya Adhikari** | 38 years old | Content Manager

### Background

    Maya Adhikari is a 38-year-old content manager who has been working with 
    digital content systems for over 15 years. She started her career as a 
    librarian and transitioned into digital content management when the 
    government began digitizing its information systems.
    
    Maya is responsible for organizing the entire content structure of the 
    government website. She creates and manages categories, ensures content 
    is properly classified, and maintains the overall information architecture 
    that helps citizens find what they need quickly.
    
    She's technically savvy and understands both the administrative and 
    user perspectives of content management. Maya often works with large 
    volumes of documents and needs efficient tools to organize and categorize 
    content systematically.
  

### What Maya Adhikari wants to achieve:
- Create and maintain logical content categories
- Organize documents and announcements efficiently
- Ensure content is easy to find and well-structured
- Maintain consistent categorization across the website
- Upload and organize file attachments properly
- Generate reports on content organization and usage

### Maya Adhikari's challenges:
- Dealing with large volumes of unorganized content
- Inconsistent categorization by different content creators
- Difficulty finding content that needs reorganization
- File attachment management becoming cumbersome
- No bulk operations for managing multiple items
- Lack of analytics on how content categories are being used

---

## 🎯 The Mission: Create and Manage Content Categories

🟡 **Difficulty**: MEDIUM  
📁 **Category**: Content Management  
⏱️ **Estimated Duration**: 2 minutes

### What needs to happen:
A content manager creates categories to organize government information systematically.

### Prerequisites:
- Admin access to the system
- Understanding of content organization needs
- Clear categorization strategy

---

## 🎬 The Story Begins


          Maya Adhikari arrives at her office Monday morning with a big task ahead. 
          The government has announced new policy initiatives, and she needs to 
          reorganize the website's content structure to accommodate the new information.
          
          As the content manager, Maya knows that good categorization is the 
          foundation of an effective government website. Citizens need to find 
          information quickly, and journalists need clear organization to access 
          public documents efficiently.
        

---

## 🚀 The Journey

### Step 1: Maya sets up her content manager account in the system ✅

**What Maya Adhikari expects**: The system should create her admin account with full content management access

**API Call**: `POST unknown`

**Request Body**:
```json
{
  "email": "maya.adhikari@icms.gov.np",
  "password": "MayaContent@2024",
  "confirmPassword": "MayaContent@2024",
  "firstName": "Maya",
  "lastName": "Adhikari",
  "role": "ADMIN"
}
```

**Headers**:
```
content-type: application/json
```

**Response**: 🟢 201 (220ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdl4taei002ojs759az9dqp4",
      "email": "maya.adhikari@icms.gov.np",
      "firstName": "Maya",
      "lastName": "Adhikari",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T03:40:55.146Z",
      "updatedAt": "2025-07-27T03:40:55.146Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsNHRhZWkwMDJvanM3NTlhejlkcXA0IiwiaWF0IjoxNzUzNTg3NjU1LCJqdGkiOiIxNmYzMjFmMmNlOTk5MjU4OWU3N2E5MDQ1YjRhMGRiMCIsImV4cCI6MTc1MzU5MTI1NX0.NGrtNqQWcya9mRESq_NK-pn7hii90jqXuC9LJH_Av9w",
    "refreshToken": "2a39d3722b912ee408a513f4a8b5aa8f375c64e82f0479ab3397b01bbada7d3e53faa2b276a355e899ef15f447c73cbd234f614df39fa020ebecc3fadeaa0749",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T03:40:55.157Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Content managers need admin privileges to create and organize categories

---

### Step 2: Maya logs into the content management system ✅

**What Maya Adhikari expects**: Successful authentication with content management privileges

**API Call**: `POST unknown`

**Request Body**:
```json
{
  "email": "maya.adhikari@icms.gov.np",
  "password": "MayaContent@2024"
}
```

**Headers**:
```
content-type: application/json
```

**Response**: 🟢 200 (242ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdl4taei002ojs759az9dqp4",
      "email": "maya.adhikari@icms.gov.np",
      "firstName": "Maya",
      "lastName": "Adhikari",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T03:40:55.146Z",
      "updatedAt": "2025-07-27T03:40:55.146Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsNHRhZWkwMDJvanM3NTlhejlkcXA0IiwiaWF0IjoxNzUzNTg3NjU1LCJqdGkiOiI2NjhkYTliOTEyYTdjYjIxNGEzYmI5YmI5NjMzNTllZCIsImV4cCI6MTc1MzU5MTI1NX0.-Hv8gKudWh6LDRpbcyObRBUPtk2LLT2qUn8KgNzYSzo",
    "refreshToken": "73ab54f5f1ba28e8f4b8dc0cf2a05919826c253297666dfa2732ddbf3d61f63fbf6abf03545168e30a5b3bebf9c29b6f6c248ffdb1f6dbd4aa9f6f7f07399083",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T03:40:55.400Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Authentication provides the necessary tokens for content management operations

---

### Step 3: Maya creates the main 'Policy Announcements' category for the new content structure ✅

**What Maya Adhikari expects**: The system should create the category with bilingual support

**API Call**: `POST unknown`

**Request Body**:
```json
{
  "name": {
    "en": "Policy Announcements",
    "ne": "नीति घोषणाहरू"
  },
  "description": {
    "en": "Government policy announcements and updates",
    "ne": "सरकारी नीति घोषणाहरू र अद्यावधिकहरू"
  },
  "slug": "policy-announcements",
  "isActive": true
}
```

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsNHRhZWkwMDJvanM3NTlhejlkcXA0IiwiaWF0IjoxNzUzNTg3NjU1LCJqdGkiOiI2NjhkYTliOTEyYTdjYjIxNGEzYmI5YmI5NjMzNTllZCIsImV4cCI6MTc1MzU5MTI1NX0.-Hv8gKudWh6LDRpbcyObRBUPtk2LLT2qUn8KgNzYSzo
content-type: application/json
```

**Response**: 🟢 201 (26ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdl4tam9002ujs75yviz0r40",
    "name": {
      "en": "Policy Announcements",
      "ne": "नीति घोषणाहरू"
    },
    "description": {
      "en": "Government policy announcements and updates",
      "ne": "सरकारी नीति घोषणाहरू र अद्यावधिकहरू"
    },
    "slug": "policy-announcements",
    "parentId": null,
    "order": 0,
    "isActive": true,
    "createdAt": "2025-07-27T03:40:55.425Z",
    "updatedAt": "2025-07-27T03:40:55.425Z",
    "children": [],
    "contentCount": 0
  },
  "meta": {
    "timestamp": "2025-07-27T03:40:55.429Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Categories form the backbone of content organization and support both English and Nepali

---

### Step 4: Maya creates a subcategory for 'Economic Policies' under the main category ✅

**What Maya Adhikari expects**: The system should create a nested category structure

**API Call**: `POST unknown`

**Request Body**:
```json
{
  "name": {
    "en": "Economic Policies",
    "ne": "आर्थिक नीतिहरू"
  },
  "description": {
    "en": "Economic and financial policy announcements",
    "ne": "आर्थिक र वित्तीय नीति घोषणाहरू"
  },
  "slug": "economic-policies",
  "parentId": "cmdl4tam9002ujs75yviz0r40",
  "isActive": true
}
```

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsNHRhZWkwMDJvanM3NTlhejlkcXA0IiwiaWF0IjoxNzUzNTg3NjU1LCJqdGkiOiI2NjhkYTliOTEyYTdjYjIxNGEzYmI5YmI5NjMzNTllZCIsImV4cCI6MTc1MzU5MTI1NX0.-Hv8gKudWh6LDRpbcyObRBUPtk2LLT2qUn8KgNzYSzo
content-type: application/json
```

**Response**: 🟢 201 (28ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdl4tamx002wjs75kd48kqdm",
    "name": {
      "en": "Economic Policies",
      "ne": "आर्थिक नीतिहरू"
    },
    "description": {
      "en": "Economic and financial policy announcements",
      "ne": "आर्थिक र वित्तीय नीति घोषणाहरू"
    },
    "slug": "economic-policies",
    "parentId": "cmdl4tam9002ujs75yviz0r40",
    "order": 0,
    "isActive": true,
    "createdAt": "2025-07-27T03:40:55.450Z",
    "updatedAt": "2025-07-27T03:40:55.450Z",
    "children": [],
    "contentCount": 0
  },
  "meta": {
    "timestamp": "2025-07-27T03:40:55.454Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Hierarchical categories help organize content more granularly for better navigation

---

### Step 5: Maya reviews the category statistics to understand the current organization ✅

**What Maya Adhikari expects**: The system should show metrics about categories and their usage

**API Call**: `GET unknown`

**Headers**:
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsNHRhZWkwMDJvanM3NTlhejlkcXA0IiwiaWF0IjoxNzUzNTg3NjU1LCJqdGkiOiI2NjhkYTliOTEyYTdjYjIxNGEzYmI5YmI5NjMzNTllZCIsImV4cCI6MTc1MzU5MTI1NX0.-Hv8gKudWh6LDRpbcyObRBUPtk2LLT2qUn8KgNzYSzo
```

**Response**: 🟢 200 (23ms)

```json
{
  "success": true,
  "data": {
    "total": 2,
    "active": 2,
    "withContent": 0,
    "averageContentPerCategory": 0
  },
  "meta": {
    "timestamp": "2025-07-27T03:40:55.479Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Statistics help content managers understand how their categorization strategy is working

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Maya Adhikari successfully completed all 5 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of create and manage content categories.
        
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
- **register-content-manager**: 220ms ✅
- **login-content-manager**: 242ms ✅
- **create-main-category**: 26ms ✅
- **create-subcategory**: 28ms ✅
- **check-category-statistics**: 23ms ✅