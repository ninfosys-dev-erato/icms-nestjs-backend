# ✅ John Smith (Tourist): Search and Browse FAQ Information

**Generated**: 2025-07-27T06:51:51.610Z  
**Duration**: 0.04s  
**Status**: Success  
**Test Results**: 4/4 steps passed

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

## 🎯 The Mission: Search and Browse FAQ Information

🟢 **Difficulty**: EASY  
📁 **Category**: Public Access  
⏱️ **Estimated Duration**: 90 seconds

### What needs to happen:
A citizen searches for answers to common questions using the FAQ system.

### Prerequisites:
- Published FAQ content exists
- Search functionality is working
- FAQ categories are properly organized

---

## 🎬 The Story Begins


          John Smith, a software developer visiting Nepal, needs information 
          about government office procedures. He's planning to visit a government 
          office for some documentation work and wants to find out the office 
          hours and requirements beforehand to save time.
          
          Instead of calling the office, he decides to check if there's a 
          FAQ section on the website that might have the answers he needs.
        

---

## 🚀 The Journey

### Step 1: John browses all available FAQs to get an overview of common questions ✅

**What John Smith (Tourist) expects**: The system should return all active FAQs in an organized manner

**API Call**: `GET /api/v1/faq`

**Response**: 🟢 200 (9ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlbmu8a000sjs7pk5zbsrdg",
      "question": {
        "en": "What are the office hours?",
        "ne": "कार्यालयको समय के हो?"
      },
      "answer": {
        "en": "Office is open 9 AM to 5 PM Monday to Friday",
        "ne": "कार्यालय सोमबार देखि शुक्रबार बिहान ९ देखि बेलुका ५ सम्म खुला"
      },
      "order": 1,
      "isActive": true,
      "createdAt": "2025-07-27T06:51:51.563Z",
      "updatedAt": "2025-07-27T06:51:51.563Z"
    }
  ],
  "meta": {
    "timestamp": "2025-07-27T06:51:51.572Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Public FAQ browsing helps citizens discover relevant information without authentication

---

### Step 2: John searches specifically for 'office hours' to find relevant information ✅

**What John Smith (Tourist) expects**: The search should return FAQs containing information about office hours

**API Call**: `GET /api/v1/faq/search?q=office+hours`

**Response**: 🟢 200 (21ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlbmu8a000sjs7pk5zbsrdg",
      "question": {
        "en": "What are the office hours?",
        "ne": "कार्यालयको समय के हो?"
      },
      "answer": {
        "en": "Office is open 9 AM to 5 PM Monday to Friday",
        "ne": "कार्यालय सोमबार देखि शुक्रबार बिहान ९ देखि बेलुका ५ सम्म खुला"
      },
      "order": 1,
      "isActive": true,
      "createdAt": "2025-07-27T06:51:51.563Z",
      "updatedAt": "2025-07-27T06:51:51.563Z"
    }
  ],
  "meta": {
    "timestamp": "2025-07-27T06:51:51.592Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Search functionality helps users quickly find specific information they need

---

### Step 3: John checks the most popular FAQs to see what others commonly ask ✅

**What John Smith (Tourist) expects**: The system should return the most frequently accessed or relevant FAQs

**API Call**: `GET /api/v1/faq/popular?limit=5`

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlbmu8a000sjs7pk5zbsrdg",
      "question": {
        "en": "What are the office hours?",
        "ne": "कार्यालयको समय के हो?"
      },
      "answer": {
        "en": "Office is open 9 AM to 5 PM Monday to Friday",
        "ne": "कार्यालय सोमबार देखि शुक्रबार बिहान ९ देखि बेलुका ५ सम्म खुला"
      },
      "order": 1,
      "isActive": true,
      "createdAt": "2025-07-27T06:51:51.563Z",
      "updatedAt": "2025-07-27T06:51:51.563Z"
    }
  ],
  "meta": {
    "timestamp": "2025-07-27T06:51:51.600Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Popular FAQs help users discover commonly needed information

---

### Step 4: John browses some random FAQs to discover other useful information ✅

**What John Smith (Tourist) expects**: The system should return a random selection of active FAQs

**API Call**: `GET /api/v1/faq/random?limit=3`

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": [
    {
      "id": "cmdlbmu8a000sjs7pk5zbsrdg",
      "question": {
        "en": "What are the office hours?",
        "ne": "कार्यालयको समय के हो?"
      },
      "answer": {
        "en": "Office is open 9 AM to 5 PM Monday to Friday",
        "ne": "कार्यालय सोमबार देखि शुक्रबार बिहान ९ देखि बेलुका ५ सम्म खुला"
      },
      "order": 1,
      "isActive": true,
      "createdAt": "2025-07-27T06:51:51.563Z",
      "updatedAt": "2025-07-27T06:51:51.563Z"
    }
  ],
  "meta": {
    "timestamp": "2025-07-27T06:51:51.607Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Random FAQs help users discover information they might not have thought to search for

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        John Smith (Tourist) successfully completed all 4 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of search and browse faq information.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 4
- **Successful**: 4
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.04s

### Performance Metrics
- **browse-all-faqs**: 9ms ✅
- **search-office-hours**: 21ms ✅
- **get-popular-faqs**: 7ms ✅
- **get-random-faqs**: 7ms ✅