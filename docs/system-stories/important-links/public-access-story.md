# ✅ John Smith (Tourist): Browse Important Government Links

**Generated**: 2025-07-27T11:08:55.648Z  
**Duration**: 0.07s  
**Status**: Success  
**Test Results**: 3/3 steps passed

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

## 🎯 The Mission: Browse Important Government Links

🟢 **Difficulty**: EASY  
📁 **Category**: Public Access  
⏱️ **Estimated Duration**: 45 seconds

### What needs to happen:
A visitor browses important government links to find useful resources and official portals.

### Prerequisites:
- Important links are published and active
- Website is accessible
- Links are properly categorized

---

## 🎬 The Story Begins

As a Software Developer / Tourist, John Smith (Tourist) expects to easily find important government links and resources for his Nepal trip.

---

## 🚀 The Journey

### Step 1: John Smith (Tourist) visits the government website and navigates to the important links section ✅

**What John Smith (Tourist) expects**: He expects to see a list of useful government portals and resources

**API Call**: `GET /api/v1/important-links`

**Response**: 🟢 200 (51ms)

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
  "meta": {
    "timestamp": "2025-07-27T11:08:55.624Z",
    "version": "1.0.0"
  }
}
```

**What happened**: The system returns all published important links organized by priority order

---

### Step 2: John Smith (Tourist) wants to see only the currently active and relevant links ✅

**What John Smith (Tourist) expects**: The system should filter out inactive or outdated links

**API Call**: `GET /api/v1/important-links/active`

**Response**: 🟢 200 (8ms)

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
  "meta": {
    "timestamp": "2025-07-27T11:08:55.638Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Only active important links are displayed, ensuring tourists get current information

---

### Step 3: John Smith (Tourist) clicks on the first important link to get more details ✅

**What John Smith (Tourist) expects**: He should see detailed information about the selected government portal

**API Call**: `GET /api/v1/important-links/cmdlktfdw0003jsvcsymy91ay`

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": {
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
  "meta": {
    "timestamp": "2025-07-27T11:08:55.645Z",
    "version": "1.0.0"
  }
}
```

**What happened**: The system provides comprehensive details about the selected important link

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        John Smith (Tourist) successfully completed all 3 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of browse important government links.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 3
- **Successful**: 3
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.07s

### Performance Metrics
- **view-all-links**: 51ms ✅
- **filter-active-links**: 8ms ✅
- **view-specific-link**: 7ms ✅