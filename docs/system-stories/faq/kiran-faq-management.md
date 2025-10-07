# ✅ Kiran Shrestha: Create and Manage FAQ Content

**Generated**: 2025-07-27T06:51:49.895Z  
**Duration**: 0.54s  
**Status**: Success  
**Test Results**: 5/5 steps passed

---

## 👤 Our Story's Hero: Kiran Shrestha

👩🏽‍💼 **Kiran Shrestha** | 31 years old | Government Help Desk Coordinator

### Background

    Kiran Shrestha is a 31-year-old Government Help Desk Coordinator who has been 
    working in citizen services for 6 years. She started as a front desk officer 
    and was promoted to coordinate the help desk operations due to her excellent 
    communication skills and problem-solving abilities.
    
    She's responsible for managing frequently asked questions, ensuring citizens 
    get accurate and timely information, and continuously improving the self-service 
    resources. Kiran speaks fluent English and Nepali, making her ideal for creating 
    bilingual FAQ content that serves Nepal's diverse population.
    
    She understands that well-organized FAQs can significantly reduce call volume 
    and improve citizen satisfaction by providing instant access to common answers.
  

### What Kiran Shrestha wants to achieve:
- Create comprehensive FAQ content that addresses common citizen questions
- Organize FAQ information in a logical and accessible manner
- Reduce repetitive inquiries by providing clear self-service options
- Ensure all FAQ content is available in both English and Nepali
- Monitor FAQ usage patterns to identify knowledge gaps
- Maintain up-to-date and accurate information for citizens
- Improve overall citizen satisfaction through better information access

### Kiran Shrestha's challenges:
- Receiving the same questions repeatedly via phone and email
- Difficulty in organizing large amounts of FAQ content efficiently
- Challenges in keeping FAQ information current and accurate
- Language barriers when creating bilingual content
- Limited analytics on which FAQs are most helpful
- Time-consuming process of updating multiple FAQs simultaneously
- Ensuring consistency in tone and format across all FAQ entries

---

## 🎯 The Mission: Create and Manage FAQ Content

🟡 **Difficulty**: MEDIUM  
📁 **Category**: FAQ Management  
⏱️ **Estimated Duration**: 3 minutes

### What needs to happen:
An admin creates and manages frequently asked questions to help citizens find answers quickly.

### Prerequisites:
- Admin access to the system
- Understanding of common citizen questions
- Bilingual content preparation (English and Nepali)

---

## 🎬 The Story Begins


          Kiran Shrestha starts her Monday morning with an important mission. The office 
          has been receiving numerous calls asking the same questions about office hours, 
          document requirements, and contact information. She decides to create a 
          comprehensive FAQ section to help citizens find answers quickly.
          
          As a Government Help Desk Coordinator with 6 years of experience, Kiran 
          understands that well-organized FAQs can dramatically reduce phone call 
          volume while improving citizen satisfaction. She plans to create bilingual 
          content that serves both English and Nepali speakers effectively.
        

---

## 🚀 The Journey

### Step 1: Kiran sets up her help desk coordinator account in the system ✅

**What Kiran Shrestha expects**: The system should create her admin account with FAQ management access

**API Call**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "kiran.shrestha@icms.gov.np",
  "password": "KiranHelp@2024",
  "confirmPassword": "KiranHelp@2024",
  "firstName": "Kiran",
  "lastName": "Shrestha",
  "role": "ADMIN"
}
```

**Response**: 🟢 201 (257ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlbmspt0000js7pzlwppq3l",
      "email": "kiran.shrestha@icms.gov.np",
      "firstName": "Kiran",
      "lastName": "Shrestha",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T06:51:49.602Z",
      "updatedAt": "2025-07-27T06:51:49.602Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYm1zcHQwMDAwanM3cHpsd3BwcTNsIiwiaWF0IjoxNzUzNTk5MTA5LCJqdGkiOiI1NDQ0OTZmNjBjM2M1MmY0ZGEzYTFmMTNlMGJhNGRmZiIsImV4cCI6MTc1MzYwMjcwOX0.ulRR0SoP-x6TblSYgHyhXtywDwUDM9X4Ms2lBlvUZTc",
    "refreshToken": "e0d34d0371ff30cb4f6e9819f5d789de3961ee5975744228348156e09de25265bb972887c1f36bc4f80f6658a03e604ecde5b0a6712d2d5b5fd5c539e5ce7ba4",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:51:49.611Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Help desk coordinators need admin privileges to create and manage FAQ content

---

### Step 2: Kiran logs into the FAQ management system ✅

**What Kiran Shrestha expects**: Successful authentication with FAQ management capabilities

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "kiran.shrestha@icms.gov.np",
  "password": "KiranHelp@2024"
}
```

**Response**: 🟢 200 (218ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlbmspt0000js7pzlwppq3l",
      "email": "kiran.shrestha@icms.gov.np",
      "firstName": "Kiran",
      "lastName": "Shrestha",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T06:51:49.602Z",
      "updatedAt": "2025-07-27T06:51:49.602Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYm1zcHQwMDAwanM3cHpsd3BwcTNsIiwiaWF0IjoxNzUzNTk5MTA5LCJqdGkiOiJjZmZiM2JmMWVhMTEwODIxZDNkYWIxMmMxMTM1ZTNiZiIsImV4cCI6MTc1MzYwMjcwOX0.UQ2vIIxWrVs5uO_w1PEGu9eTv2195klmy49BzU4STnQ",
    "refreshToken": "6962a605d1c482218632e0834cf64996ab56d5645638d3ba902c42816fce6b85fa8309f1f5213320a2201b3c2bccab3f59ad0b044e0207b0992d99fe451e8732",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:51:49.833Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Authentication provides the necessary tokens for FAQ operations

---

### Step 3: Kiran creates the first FAQ about office hours with bilingual content ✅

**What Kiran Shrestha expects**: The system should create the FAQ with proper English and Nepali translations

**API Call**: `POST /api/v1/admin/faq`

**Request Body**:
```json
{
  "question": {
    "en": "What are the office hours?",
    "ne": "कार्यालयको समय के हो?"
  },
  "answer": {
    "en": "Our office is open from 9:00 AM to 5:00 PM, Monday through Friday. We are closed on weekends and public holidays.",
    "ne": "हाम्रो कार्यालय सोमबार देखि शुक्रबार सम्म बिहान ९:०० बजे देखि बेलुका ५:०० बजेसम्म खुला हुन्छ। हामी सप्ताहन्त र सार्वजनिक बिदाहरूमा बन्द हुन्छौं।"
  },
  "order": 1,
  "isActive": true
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYm1zcHQwMDAwanM3cHpsd3BwcTNsIiwiaWF0IjoxNzUzNTk5MTA5LCJqdGkiOiJjZmZiM2JmMWVhMTEwODIxZDNkYWIxMmMxMTM1ZTNiZiIsImV4cCI6MTc1MzYwMjcwOX0.UQ2vIIxWrVs5uO_w1PEGu9eTv2195klmy49BzU4STnQ
```

**Response**: 🟢 201 (28ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlbmswx0006js7prtolu3pd",
    "question": {
      "en": "What are the office hours?",
      "ne": "कार्यालयको समय के हो?"
    },
    "answer": {
      "en": "Our office is open from 9:00 AM to 5:00 PM, Monday through Friday. We are closed on weekends and public holidays.",
      "ne": "हाम्रो कार्यालय सोमबार देखि शुक्रबार सम्म बिहान ९:०० बजे देखि बेलुका ५:०० बजेसम्म खुला हुन्छ। हामी सप्ताहन्त र सार्वजनिक बिदाहरूमा बन्द हुन्छौं।"
    },
    "order": 1,
    "isActive": true,
    "createdAt": "2025-07-27T06:51:49.857Z",
    "updatedAt": "2025-07-27T06:51:49.857Z"
  },
  "meta": {
    "timestamp": "2025-07-27T06:51:49.860Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Office hours is one of the most common questions citizens ask

---

### Step 4: Kiran creates a contact information FAQ with multiple contact methods ✅

**What Kiran Shrestha expects**: The system should create the FAQ with comprehensive contact details

**API Call**: `POST /api/v1/admin/faq`

**Request Body**:
```json
{
  "question": {
    "en": "How can I contact the office?",
    "ne": "म कसरी कार्यालयसँग सम्पर्क गर्न सक्छु?"
  },
  "answer": {
    "en": "You can contact us by phone at +977-1-4567890, email at info@office.gov.np, or visit us in person during office hours.",
    "ne": "तपाईंले हामीलाई फोन +९७७-१-४५६७८९० मा, इमेल info@office.gov.np मा, वा कार्यालय समयमा व्यक्तिगत रूपमा भेट्न सक्नुहुन्छ।"
  },
  "order": 2,
  "isActive": true
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYm1zcHQwMDAwanM3cHpsd3BwcTNsIiwiaWF0IjoxNzUzNTk5MTA5LCJqdGkiOiJjZmZiM2JmMWVhMTEwODIxZDNkYWIxMmMxMTM1ZTNiZiIsImV4cCI6MTc1MzYwMjcwOX0.UQ2vIIxWrVs5uO_w1PEGu9eTv2195klmy49BzU4STnQ
```

**Response**: 🟢 201 (13ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlbmsxb0007js7phjja701o",
    "question": {
      "en": "How can I contact the office?",
      "ne": "म कसरी कार्यालयसँग सम्पर्क गर्न सक्छु?"
    },
    "answer": {
      "en": "You can contact us by phone at +977-1-4567890, email at info@office.gov.np, or visit us in person during office hours.",
      "ne": "तपाईंले हामीलाई फोन +९७७-१-४५६७८९० मा, इमेल info@office.gov.np मा, वा कार्यालय समयमा व्यक्तिगत रूपमा भेट्न सक्नुहुन्छ।"
    },
    "order": 2,
    "isActive": true,
    "createdAt": "2025-07-27T06:51:49.871Z",
    "updatedAt": "2025-07-27T06:51:49.871Z"
  },
  "meta": {
    "timestamp": "2025-07-27T06:51:49.872Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Contact information helps citizens reach the office through their preferred method

---

### Step 5: Kiran checks the FAQ statistics to understand the current status ✅

**What Kiran Shrestha expects**: The system should show statistics about total, active, and inactive FAQs

**API Call**: `GET /api/v1/admin/faq/statistics`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYm1zcHQwMDAwanM3cHpsd3BwcTNsIiwiaWF0IjoxNzUzNTk5MTA5LCJqdGkiOiJjZmZiM2JmMWVhMTEwODIxZDNkYWIxMmMxMTM1ZTNiZiIsImV4cCI6MTc1MzYwMjcwOX0.UQ2vIIxWrVs5uO_w1PEGu9eTv2195klmy49BzU4STnQ
```

**Response**: 🟢 200 (19ms)

```json
{
  "success": true,
  "data": {
    "total": 2,
    "active": 2,
    "inactive": 0,
    "lastUpdated": "2025-07-27T06:51:49.871Z"
  },
  "meta": {
    "timestamp": "2025-07-27T06:51:49.891Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Statistics help FAQ managers understand the current state and growth of the FAQ database

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Kiran Shrestha successfully completed all 5 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of create and manage faq content.
        
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
- **setup-faq-coordinator**: 257ms ✅
- **login-faq-coordinator**: 218ms ✅
- **create-office-hours-faq**: 28ms ✅
- **create-contact-faq**: 13ms ✅
- **view-faq-statistics**: 19ms ✅