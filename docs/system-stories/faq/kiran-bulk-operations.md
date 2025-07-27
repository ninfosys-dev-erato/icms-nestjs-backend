# ✅ Kiran Shrestha: Perform Bulk FAQ Management

**Generated**: 2025-07-27T06:51:50.831Z  
**Duration**: 0.24s  
**Status**: Success  
**Test Results**: 3/3 steps passed

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

## 🎯 The Mission: Perform Bulk FAQ Management

🔴 **Difficulty**: HARD  
📁 **Category**: FAQ Management  
⏱️ **Estimated Duration**: 2 minutes

### What needs to happen:
An admin efficiently manages multiple FAQs through bulk operations like import, export, and batch updates.

### Prerequisites:
- Multiple FAQs in the system
- Admin privileges
- Bulk operation understanding

---

## 🎬 The Story Begins


          Kiran has received a comprehensive list of frequently asked questions 
          from various departments. Instead of creating each FAQ individually, 
          she decides to use the bulk operations feature to efficiently manage 
          multiple FAQs at once. This will save significant time and ensure 
          consistency across all entries.
        

---

## 🚀 The Journey

### Step 1: Kiran logs in to perform bulk FAQ operations ✅

**What Kiran Shrestha expects**: Authentication for bulk FAQ management capabilities

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "kiran.shrestha@icms.gov.np",
  "password": "KiranHelp@2024"
}
```

**Response**: 🟢 200 (215ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlbmtbc0008js7pyo044se0",
      "email": "kiran.shrestha@icms.gov.np",
      "firstName": "Kiran",
      "lastName": "Shrestha",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T06:51:50.577Z",
      "createdAt": "2025-07-27T06:51:50.376Z",
      "updatedAt": "2025-07-27T06:51:50.578Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYm10YmMwMDA4anM3cHlvMDQ0c2UwIiwiaWF0IjoxNzUzNTk5MTEwLCJqdGkiOiJjYTljZTJlNGMxM2UxNGJkOGZlZjk3Y2ZiODQ4ZWMyYyIsImV4cCI6MTc1MzYwMjcxMH0.-RHF37uNapM0SwC4H_CHtjtIp1InJgDIpPfKO7x8xuQ",
    "refreshToken": "e9415048eac5aff72109dbfd781abb3c8471c821063daf4ec2ef35d7b58c59cd94fcb9a14580c9a1fb1362f9c127a639e39cf941f8d698cd08d9e29558a8e163",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:51:50.805Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Bulk operations require admin privileges to ensure data integrity

---

### Step 2: Kiran creates multiple FAQs at once using bulk create operation ✅

**What Kiran Shrestha expects**: The system should create all FAQs efficiently in a single operation

**API Call**: `POST /api/v1/admin/faq/bulk-create`

**Request Body**:
```json
{
  "faqs": [
    {
      "question": {
        "en": "What documents do I need to bring?",
        "ne": "मले के के कागजातहरू ल्याउनुपर्छ?"
      },
      "answer": {
        "en": "Please bring your original citizenship certificate, a copy of citizenship, passport-size photos, and any relevant supporting documents.",
        "ne": "कृपया आफ्नो मूल नागरिकता प्रमाणपत्र, नागरिकताको प्रतिलिपि, पासपोर्ट साइजका फोटोहरू, र सम्बन्धित सहायक कागजातहरू ल्याउनुहोस्।"
      },
      "order": 3,
      "isActive": true
    }
  ]
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYm10YmMwMDA4anM3cHlvMDQ0c2UwIiwiaWF0IjoxNzUzNTk5MTEwLCJqdGkiOiJjYTljZTJlNGMxM2UxNGJkOGZlZjk3Y2ZiODQ4ZWMyYyIsImV4cCI6MTc1MzYwMjcxMH0.-RHF37uNapM0SwC4H_CHtjtIp1InJgDIpPfKO7x8xuQ
```

**Response**: 🟢 201 (15ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlbmtnj000jjs7pcunfaqwx",
      "question": {
        "en": "What documents do I need to bring?",
        "ne": "मले के के कागजातहरू ल्याउनुपर्छ?"
      },
      "answer": {
        "en": "Please bring your original citizenship certificate, a copy of citizenship, passport-size photos, and any relevant supporting documents.",
        "ne": "कृपया आफ्नो मूल नागरिकता प्रमाणपत्र, नागरिकताको प्रतिलिपि, पासपोर्ट साइजका फोटोहरू, र सम्बन्धित सहायक कागजातहरू ल्याउनुहोस्।"
      },
      "order": 3,
      "isActive": true,
      "createdAt": "2025-07-27T06:51:50.815Z",
      "updatedAt": "2025-07-27T06:51:50.815Z"
    },
    {
      "id": "cmdlbmtnj000kjs7pwaxoahgm",
      "question": {
        "en": "How long does processing take?",
        "ne": "प्रक्रियामा कति समय लाग्छ?"
      },
      "answer": {
        "en": "Processing time varies by service type. Most services take 3-7 working days. Urgent services may be available for additional fees.",
        "ne": "प्रक्रिया समय सेवाको प्रकार अनुसार फरक हुन्छ। धेरैजसो सेवाहरूमा ३-७ कार्य दिन लाग्छ। तत्काल सेवाहरू अतिरिक्त शुल्कमा उपलब्ध हुन सक्छ।"
      },
      "order": 4,
      "isActive": true,
      "createdAt": "2025-07-27T06:51:50.815Z",
      "updatedAt": "2025-07-27T06:51:50.815Z"
    },
    {
      "id": "cmdlbmtnj000ljs7p7fagxdcx",
      "question": {
        "en": "Is there an online application system?",
        "ne": "के अनलाइन आवेदन प्रणाली छ?"
      },
      "answer": {
        "en": "Yes, many services are available online through our digital portal. Visit our website for online application forms and tracking.",
        "ne": "हो, धेरै सेवाहरू हाम्रो डिजिटल पोर्टल मार्फत अनलाइन उपलब्ध छन्। अनलाइन आवेदन फर्म र ट्र्याकिङको लागि हाम्रो वेबसाइट हेर्नुहोस्।"
      },
      "order": 5,
      "isActive": true,
      "createdAt": "2025-07-27T06:51:50.815Z",
      "updatedAt": "2025-07-27T06:51:50.815Z"
    }
  ],
  "meta": {
    "timestamp": "2025-07-27T06:51:50.820Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Bulk creation improves efficiency when adding multiple related FAQs

---

### Step 3: Kiran exports all FAQs for backup and sharing with other departments ✅

**What Kiran Shrestha expects**: The system should generate a comprehensive export of all FAQ data

**API Call**: `GET /api/v1/admin/faq/export/all`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYm10YmMwMDA4anM3cHlvMDQ0c2UwIiwiaWF0IjoxNzUzNTk5MTEwLCJqdGkiOiJjYTljZTJlNGMxM2UxNGJkOGZlZjk3Y2ZiODQ4ZWMyYyIsImV4cCI6MTc1MzYwMjcxMH0.-RHF37uNapM0SwC4H_CHtjtIp1InJgDIpPfKO7x8xuQ
```

**Response**: 🟢 200 (9ms)

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "cmdlbmtnj000jjs7pcunfaqwx",
        "question": {
          "en": "What documents do I need to bring?",
          "ne": "मले के के कागजातहरू ल्याउनुपर्छ?"
        },
        "answer": {
          "en": "Please bring your original citizenship certificate, a copy of citizenship, passport-size photos, and any relevant supporting documents.",
          "ne": "कृपया आफ्नो मूल नागरिकता प्रमाणपत्र, नागरिकताको प्रतिलिपि, पासपोर्ट साइजका फोटोहरू, र सम्बन्धित सहायक कागजातहरू ल्याउनुहोस्।"
        },
        "order": 3,
        "isActive": true,
        "createdAt": "2025-07-27T06:51:50.815Z",
        "updatedAt": "2025-07-27T06:51:50.815Z"
      },
      {
        "id": "cmdlbmtnj000kjs7pwaxoahgm",
        "question": {
          "en": "How long does processing take?",
          "ne": "प्रक्रियामा कति समय लाग्छ?"
        },
        "answer": {
          "en": "Processing time varies by service type. Most services take 3-7 working days. Urgent services may be available for additional fees.",
          "ne": "प्रक्रिया समय सेवाको प्रकार अनुसार फरक हुन्छ। धेरैजसो सेवाहरूमा ३-७ कार्य दिन लाग्छ। तत्काल सेवाहरू अतिरिक्त शुल्कमा उपलब्ध हुन सक्छ।"
        },
        "order": 4,
        "isActive": true,
        "createdAt": "2025-07-27T06:51:50.815Z",
        "updatedAt": "2025-07-27T06:51:50.815Z"
      },
      {
        "id": "cmdlbmtnj000ljs7p7fagxdcx",
        "question": {
          "en": "Is there an online application system?",
          "ne": "के अनलाइन आवेदन प्रणाली छ?"
        },
        "answer": {
          "en": "Yes, many services are available online through our digital portal. Visit our website for online application forms and tracking.",
          "ne": "हो, धेरै सेवाहरू हाम्रो डिजिटल पोर्टल मार्फत अनलाइन उपलब्ध छन्। अनलाइन आवेदन फर्म र ट्र्याकिङको लागि हाम्रो वेबसाइट हेर्नुहोस्।"
        },
        "order": 5,
        "isActive": true,
        "createdAt": "2025-07-27T06:51:50.815Z",
        "updatedAt": "2025-07-27T06:51:50.815Z"
      }
    ],
    "total": 3,
    "exportedAt": "2025-07-27T06:51:50.828Z"
  },
  "meta": {
    "timestamp": "2025-07-27T06:51:50.828Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Export functionality enables backup and sharing of FAQ content with other systems

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Kiran Shrestha successfully completed all 3 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of perform bulk faq management.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 3
- **Successful**: 3
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.24s

### Performance Metrics
- **login-for-bulk-ops**: 215ms ✅
- **bulk-create-faqs**: 15ms ✅
- **export-all-faqs**: 9ms ✅