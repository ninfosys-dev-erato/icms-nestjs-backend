# ✅ Kiran Shrestha: Organize and Reorder FAQ Content

**Generated**: 2025-07-27T06:51:52.598Z  
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

## 🎯 The Mission: Organize and Reorder FAQ Content

🟡 **Difficulty**: MEDIUM  
📁 **Category**: FAQ Management  
⏱️ **Estimated Duration**: 90 seconds

### What needs to happen:
An admin organizes FAQs by priority and reorders them for better user experience.

### Prerequisites:
- Multiple FAQs exist in the system
- Admin privileges for reordering
- Clear organization strategy

---

## 🎬 The Story Begins


          After monitoring citizen interactions for a month, Kiran has gathered 
          valuable insights about which FAQs are most important to users. She 
          notices that the second FAQ is actually more popular than the first 
          one, so she decides to reorder them to improve user experience.
        

---

## 🚀 The Journey

### Step 1: Kiran logs in to reorganize FAQ content based on usage analytics ✅

**What Kiran Shrestha expects**: Authentication for FAQ organization capabilities

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "kiran.shrestha@icms.gov.np",
  "password": "KiranHelp@2024"
}
```

**Response**: 🟢 200 (216ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlbmunm000tjs7p4pqvjigy",
      "email": "kiran.shrestha@icms.gov.np",
      "firstName": "Kiran",
      "lastName": "Shrestha",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": "2025-07-27T06:51:52.317Z",
      "createdAt": "2025-07-27T06:51:52.115Z",
      "updatedAt": "2025-07-27T06:51:52.319Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYm11bm0wMDB0anM3cDRwcXZqaWd5IiwiaWF0IjoxNzUzNTk5MTEyLCJqdGkiOiI1YzliNTRiNmI4YmFkMzMyMjI2N2Q2MWVhYjQ0MTk1MSIsImV4cCI6MTc1MzYwMjcxMn0.lcg7uzHlk7YCGb1fkfMOX1Od6Vh0Oe96A3u1U-UhL7M",
    "refreshToken": "46eedd16b342e32e8b9bdc86640da7d5b601442fa3471fff8b45b8f437dd1ba3ff05de926ad4ffdbd13cba817b980a0f73e12b75b73afdb7e313b63b618e7884",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T06:51:52.569Z",
    "version": "1.0.0"
  }
}
```

**What happened**: FAQ organization requires admin access to maintain content quality

---

### Step 2: Kiran reorders the FAQs to put the most popular one first ✅

**What Kiran Shrestha expects**: The system should update the order of FAQs successfully

**API Call**: `POST /api/v1/admin/faq/reorder`

**Request Body**:
```json
{
  "orders": [
    {
      "id": "cmdlbmutx000zjs7pr1bhsi6n",
      "order": 2
    },
    {
      "id": "cmdlbmuu70010js7p8g8q9h83",
      "order": 1
    }
  ]
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYm11bm0wMDB0anM3cDRwcXZqaWd5IiwiaWF0IjoxNzUzNTk5MTEyLCJqdGkiOiI1YzliNTRiNmI4YmFkMzMyMjI2N2Q2MWVhYjQ0MTk1MSIsImV4cCI6MTc1MzYwMjcxMn0.lcg7uzHlk7YCGb1fkfMOX1Od6Vh0Oe96A3u1U-UhL7M
```

**Response**: 🟢 200 (14ms)

```json
{
  "success": true,
  "data": {
    "message": "FAQs reordered successfully"
  },
  "meta": {
    "timestamp": "2025-07-27T06:51:52.581Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Reordering helps prioritize the most important information for users

---

### Step 3: Kiran verifies that the FAQs are now displayed in the new order ✅

**What Kiran Shrestha expects**: The FAQs should be returned in the updated order

**API Call**: `GET /api/v1/admin/faq`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsYm11bm0wMDB0anM3cDRwcXZqaWd5IiwiaWF0IjoxNzUzNTk5MTEyLCJqdGkiOiI1YzliNTRiNmI4YmFkMzMyMjI2N2Q2MWVhYjQ0MTk1MSIsImV4cCI6MTc1MzYwMjcxMn0.lcg7uzHlk7YCGb1fkfMOX1Od6Vh0Oe96A3u1U-UhL7M
```

**Response**: 🟢 200 (13ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlbmuu70010js7p8g8q9h83",
      "question": {
        "en": "How can I track the status of my application?",
        "ne": "म कसरी मेरो आवेदनको स्थिति ट्र्याक गर्न सक्छु?"
      },
      "answer": {
        "en": "You can track your application status online using your reference number, or visit our office during business hours for updates.",
        "ne": "तपाईं आफ्नो सन्दर्भ नम्बर प्रयोग गरेर अनलाइन आफ्नो आवेदनको स्थिति ट्र्याक गर्न सक्नुहुन्छ, वा अपडेटको लागि व्यापार घण्टामा हाम्रो कार्यालयमा आउन सक्नुहुन्छ।"
      },
      "order": 1,
      "isActive": true,
      "createdAt": "2025-07-27T06:51:52.351Z",
      "updatedAt": "2025-07-27T06:51:52.579Z"
    },
    {
      "id": "cmdlbmutx000zjs7pr1bhsi6n",
      "question": {
        "en": "What are the required documents for citizenship verification?",
        "ne": "नागरिकता प्रमाणीकरणको लागि आवश्यक कागजातहरू के के हुन्?"
      },
      "answer": {
        "en": "You need to bring your original citizenship certificate, passport-size photos, and any supporting identification documents.",
        "ne": "तपाईंले आफ्नो मूल नागरिकता प्रमाणपत्र, पासपोर्ट साइजका फोटोहरू, र कुनै पनि सहयोगी पहिचान कागजातहरू ल्याउनुपर्छ।"
      },
      "order": 2,
      "isActive": true,
      "createdAt": "2025-07-27T06:51:52.341Z",
      "updatedAt": "2025-07-27T06:51:52.579Z"
    }
  ],
  "meta": {
    "timestamp": "2025-07-27T06:51:52.595Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Verification ensures that the reordering operation was successful

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        Kiran Shrestha successfully completed all 3 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of organize and reorder faq content.
        
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
- **login-for-organization**: 216ms ✅
- **reorder-faqs**: 14ms ✅
- **verify-new-order**: 13ms ✅