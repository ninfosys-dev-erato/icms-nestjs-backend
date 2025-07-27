# ❌ John Smith (Tourist): Rate Limiting Protection

**Generated**: 2025-07-27T06:40:26.755Z  
**Duration**: 0.09s  
**Status**: Failed  
**Test Results**: 0/1 steps passed

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

## 🎯 The Mission: Rate Limiting Protection

🟡 **Difficulty**: MEDIUM  
📁 **Category**: Security  
⏱️ **Estimated Duration**: 45 seconds

### What needs to happen:
Testing the system's ability to prevent brute force attacks through rate limiting.

### Prerequisites:
- Rate limiting is configured
- Test account for failed attempts
- Throttling mechanism is active

---

## 🎬 The Story Begins


          This scenario simulates a malicious actor attempting to brute force 
          their way into the system by repeatedly trying different passwords. 
          The system should detect this pattern and temporarily block the attempts.
        

---

## 🚀 The Journey

### Step 1: Multiple rapid login attempts with wrong credentials are made ❌

**What John Smith (Tourist) expects**: After several attempts, the system should start blocking requests

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "nonexistent@example.com",
  "password": "wrongpassword5"
}
```

**Response**: 🔴 401 (91ms)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ERROR",
    "message": "Too many failed attempts. Please try again later."
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:26.752Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Rate limiting prevents brute force attacks by temporarily blocking repeated failed attempts

---



## 🎯 The Outcome

❌ **Journey Encountered Issues**
        
        John Smith (Tourist) completed 0 out of 1 steps successfully. 
        1 step(s) failed, preventing them from fully achieving 
        their goal of rate limiting protection.
        
        This indicates areas where the API or user experience could be improved.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 1
- **Successful**: 0
- **Failed**: 1
- **Success Rate**: 0.0%
- **Total Duration**: 0.09s

### Performance Metrics
- **multiple-failed-attempts**: 91ms ❌

### ❌ Failed Steps
- **multiple-failed-attempts**: Unknown error