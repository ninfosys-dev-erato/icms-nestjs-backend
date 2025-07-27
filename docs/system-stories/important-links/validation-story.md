# ❌ Sita Sharma: Validate Important Links Data

**Generated**: 2025-07-27T11:08:57.100Z  
**Duration**: 0.03s  
**Status**: Failed  
**Test Results**: 0/3 steps passed

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

## 🎯 The Mission: Validate Important Links Data

🟡 **Difficulty**: MEDIUM  
📁 **Category**: Data Validation  
⏱️ **Estimated Duration**: 90 seconds

### What needs to happen:
The system validates important links data including URL format, required fields, and business rules.

### Prerequisites:
- Validation rules are configured
- Test data with various validation scenarios
- Error handling is properly implemented

---

## 🎬 The Story Begins

Sita Sharma rushes to their computer to understand how the system validates important links data and handles errors before the end of the day.

---

## 🚀 The Journey

### Step 1: Sita Sharma attempts to create a link without required fields to test validation ❌

**What Sita Sharma expects**: The system should reject the request and provide clear validation errors

**API Call**: `POST /api/v1/admin/important-links`

**Request Body**:
```json
{
  "linkTitle": {
    "en": "",
    "ne": ""
  },
  "linkUrl": "",
  "order": 1,
  "isActive": true
}
```

**Response**: 🔴 401 (12ms)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ERROR",
    "message": "Unauthorized"
  },
  "meta": {
    "timestamp": "2025-07-27T11:08:57.084Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Input validation ensures data quality by requiring essential fields for important links

---

### Step 2: Sita Sharma tests URL validation by submitting an invalid URL format ❌

**What Sita Sharma expects**: The system should validate URL format and reject invalid URLs

**API Call**: `POST /api/v1/admin/important-links`

**Request Body**:
```json
{
  "linkTitle": {
    "en": "Test Link",
    "ne": "परीक्षण लिङ्क"
  },
  "linkUrl": "not-a-valid-url",
  "order": 1,
  "isActive": true
}
```

**Response**: 🔴 401 (8ms)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ERROR",
    "message": "Unauthorized"
  },
  "meta": {
    "timestamp": "2025-07-27T11:08:57.094Z",
    "version": "1.0.0"
  }
}
```

**What happened**: URL validation prevents broken links and ensures users can access the resources

---

### Step 3: Sita Sharma tests order validation with a negative order value ❌

**What Sita Sharma expects**: The system should require positive order values for proper sorting

**API Call**: `POST /api/v1/admin/important-links`

**Request Body**:
```json
{
  "linkTitle": {
    "en": "Test Link",
    "ne": "परीक्षण लिङ्क"
  },
  "linkUrl": "https://valid.gov.np",
  "order": -1,
  "isActive": true
}
```

**Response**: 🔴 401 (4ms)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ERROR",
    "message": "Unauthorized"
  },
  "meta": {
    "timestamp": "2025-07-27T11:08:57.099Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Order validation ensures proper link sequencing and display priority

---



## 🎯 The Outcome

❌ **Journey Encountered Issues**
        
        Sita Sharma completed 0 out of 3 steps successfully. 
        3 step(s) failed, preventing them from fully achieving 
        their goal of validate important links data.
        
        This indicates areas where the API or user experience could be improved.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 3
- **Successful**: 0
- **Failed**: 3
- **Success Rate**: 0.0%
- **Total Duration**: 0.03s

### Performance Metrics
- **test-required-fields**: 12ms ❌
- **test-url-validation**: 8ms ❌
- **test-order-validation**: 4ms ❌

### ❌ Failed Steps
- **test-required-fields**: Unknown error
- **test-url-validation**: Unknown error
- **test-order-validation**: Unknown error