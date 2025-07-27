# ✅ John Smith (Tourist): Access Categorized Footer Links

**Generated**: 2025-07-27T11:08:56.131Z  
**Duration**: 0.01s  
**Status**: Success  
**Test Results**: 2/2 steps passed

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

## 🎯 The Mission: Access Categorized Footer Links

🟢 **Difficulty**: EASY  
📁 **Category**: Public Access  
⏱️ **Estimated Duration**: 30 seconds

### What needs to happen:
A visitor accesses categorized footer links for quick navigation to different types of government resources.

### Prerequisites:
- Footer links are categorized properly
- Links are organized by type (quick, government, social, contact)
- Categories contain active links

---

## 🎬 The Story Begins

As a Software Developer / Tourist, John Smith (Tourist) expects to easily access the footer links to find categorized government resources quickly.

---

## 🚀 The Journey

### Step 1: John Smith (Tourist) scrolls to the website footer to find categorized quick access links ✅

**What John Smith (Tourist) expects**: He expects to see links organized into categories like quick links, government portals, social media, and contact information

**API Call**: `GET /api/v1/important-links/footer`

**Response**: 🟢 200 (8ms)

```json
{
  "success": true,
  "data": {
    "quickLinks": [
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
    "governmentLinks": [],
    "socialMediaLinks": [],
    "contactLinks": []
  },
  "meta": {
    "timestamp": "2025-07-27T11:08:56.121Z",
    "version": "1.0.0"
  }
}
```

**What happened**: The footer provides categorized important links for quick navigation to different types of resources

---

### Step 2: John Smith (Tourist) requests footer links in English for better understanding ✅

**What John Smith (Tourist) expects**: The system should return footer links with English language preference

**API Call**: `GET /api/v1/important-links/footer`

**Response**: 🟢 200 (7ms)

```json
{
  "success": true,
  "data": {
    "quickLinks": [
      {
        "id": "cmdlktfdw0003jsvcsymy91ay",
        "linkTitle": {
          "en": "Government Portal",
          "ne": "सरकारी पोर्टल",
          "value": "Government Portal"
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
          "ne": "शिक्षा मन्त्रालय",
          "value": "Ministry of Education"
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
          "ne": "राष्ट्रिय पोर्टल",
          "value": "National Portal"
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
          "ne": "पर्यटक सूचना",
          "value": "Tourist Information"
        },
        "linkUrl": "https://tourism.gov.np",
        "order": 4,
        "isActive": true,
        "createdAt": "2025-07-27T11:08:55.467Z",
        "updatedAt": "2025-07-27T11:08:55.467Z"
      }
    ],
    "governmentLinks": [],
    "socialMediaLinks": [],
    "contactLinks": []
  },
  "meta": {
    "timestamp": "2025-07-27T11:08:56.128Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Language filtering ensures tourists can access information in their preferred language

---



## 🎯 The Outcome

✅ **Journey Completed Successfully**
        
        John Smith (Tourist) successfully completed all 2 steps of their journey. 
        The system responded appropriately at each stage, allowing them to achieve their goal 
        of access categorized footer links.
        
        This demonstrates that the API is working correctly for this user scenario.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 2
- **Successful**: 2
- **Failed**: 0
- **Success Rate**: 100.0%
- **Total Duration**: 0.01s

### Performance Metrics
- **access-footer-links**: 8ms ✅
- **access-footer-with-language**: 7ms ✅