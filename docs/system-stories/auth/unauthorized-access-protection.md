# ❌ John Smith (Tourist): Handling Unauthorized Access Attempts

**Generated**: 2025-07-27T06:40:26.401Z  
**Duration**: 0.02s  
**Status**: Failed  
**Test Results**: 0/2 steps passed

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

## 🎯 The Mission: Handling Unauthorized Access Attempts

🟢 **Difficulty**: EASY  
📁 **Category**: Security  
⏱️ **Estimated Duration**: 20 seconds

### What needs to happen:
The system properly rejects requests from unauthenticated users and provides clear feedback.

### Prerequisites:
- No valid authentication token
- Protected endpoint exists
- Proper error handling is configured

---

## 🎬 The Story Begins


          John Smith, a tourist visiting Nepal, is browsing the government website 
          looking for information about local regulations. Out of curiosity, he 
          tries to access what appears to be an admin section to see if he can 
          get more detailed information.
          
          This scenario tests how the system handles unauthorized access attempts 
          from public users.
        

---

## 🚀 The Journey

### Step 1: John tries to access user profile information without logging in ❌

**What John Smith (Tourist) expects**: The system should deny access and provide a clear error message

**API Call**: `GET /api/v1/auth/me`

**Response**: 🔴 401 (12ms)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ERROR",
    "message": "Unauthorized"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:26.390Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Security systems must protect sensitive endpoints from unauthorized access

---

### Step 2: John tries using a fake authorization token ❌

**What John Smith (Tourist) expects**: The system should reject the invalid token and return an error

**API Call**: `GET /api/v1/auth/me`

**Headers**:
```
Authorization: Bearer invalid-token-12345
```

**Response**: 🔴 401 (6ms)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_ERROR",
    "message": "Unauthorized"
  },
  "meta": {
    "timestamp": "2025-07-27T06:40:26.398Z",
    "version": "1.0.0"
  }
}
```

**What happened**: Token validation prevents unauthorized access with forged credentials

---



## 🎯 The Outcome

❌ **Journey Encountered Issues**
        
        John Smith (Tourist) completed 0 out of 2 steps successfully. 
        2 step(s) failed, preventing them from fully achieving 
        their goal of handling unauthorized access attempts.
        
        This indicates areas where the API or user experience could be improved.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 2
- **Successful**: 0
- **Failed**: 2
- **Success Rate**: 0.0%
- **Total Duration**: 0.02s

### Performance Metrics
- **attempt-protected-access**: 12ms ❌
- **attempt-with-invalid-token**: 6ms ❌

### ❌ Failed Steps
- **attempt-protected-access**: Unknown error
- **attempt-with-invalid-token**: Unknown error