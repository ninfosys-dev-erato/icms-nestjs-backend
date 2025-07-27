# ❌ Priya Gurung: Uploading Event Photos to the Media Library

**Generated**: 2025-07-27T08:50:19.435Z  
**Duration**: 0.39s  
**Status**: Failed  
**Test Results**: 7/8 steps passed

---

## 👤 Our Story's Hero: Priya Gurung

📷 **Priya Gurung** | 29 years old | Government Event Photographer

### Background

    Priya Gurung is a 29-year-old professional photographer who has been documenting 
    government events and programs for the past 5 years. She started as a freelance 
    photographer and was hired by the government to maintain visual records of all 
    official activities, ceremonies, and public programs.
    
    She's responsible for capturing high-quality photos and videos during government 
    events, organizing them into meaningful collections, and ensuring they're properly 
    stored and accessible for future reference. Priya often works with large volumes 
    of media files and needs efficient tools to upload, organize, and manage visual content.
    
    She has intermediate technical skills and understands the importance of proper 
    file organization, metadata management, and creating visual albums that tell 
    the story of government activities. Priya frequently collaborates with content 
    managers and PR teams who need access to her media.
  

### What Priya Gurung wants to achieve:
- Upload and organize photos/videos from government events efficiently
- Create meaningful photo albums that tell complete stories
- Ensure all media has proper descriptions in both English and Nepali
- Manage large volumes of high-resolution media files
- Provide quick access to media for content teams and press releases
- Maintain a searchable archive of government visual history
- Optimize media files for web use while preserving originals

### Priya Gurung's challenges:
- Uploading large batches of photos takes too long
- Difficult to organize hundreds of photos from a single event
- No efficient way to add captions and descriptions to multiple photos
- Hard to find specific photos from past events
- Manual resizing and optimization is time-consuming
- Sharing media with other departments is cumbersome
- Limited storage space for high-resolution originals
- No way to track which photos have been used in publications

---

## 🎯 The Mission: Uploading Event Photos to the Media Library

🟡 **Difficulty**: MEDIUM  
📁 **Category**: Media Management  
⏱️ **Estimated Duration**: 10-15 minutes

### What needs to happen:

    A photographer needs to upload photos from a government event to the media library. 
    This involves uploading multiple high-resolution images, adding proper metadata 
    in both English and Nepali, and organizing them for easy discovery by content teams.
  

### Prerequisites:
- User has EDITOR or ADMIN role
- User is authenticated in the system
- High-quality images ready for upload
- Image descriptions prepared in both languages

---

## 🎬 The Story Begins


      Priya has just finished photographing the annual Community Development Program 
      ceremony. She has 25 high-quality photos that showcase the event, including 
      speeches by government officials, community participation, and award ceremonies. 
      
      Now she needs to upload these photos to the government media system with proper 
      descriptions in both English and Nepali so that the content team can use them 
      for press releases and the website gallery.
    

---

## 🚀 The Journey

### Step 1: Priya logs into the media management system using her photographer credentials ✅

**What Priya Gurung expects**: System should authenticate her as an EDITOR and provide access to media upload features

**API Call**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "priya.gurung@icms.gov.np",
  "password": "[PROTECTED]"
}
```

**Response**: 🟢 200 (225ms)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmdlfv67m0000jslblx7trpdo",
      "email": "priya.gurung@icms.gov.np",
      "firstName": "Priya",
      "lastName": "Gurung",
      "role": "EDITOR",
      "isActive": true,
      "isEmailVerified": false,
      "lastLoginAt": null,
      "createdAt": "2025-07-27T08:50:18.802Z",
      "updatedAt": "2025-07-27T08:50:18.802Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsZnY2N20wMDAwanNsYmx4N3RycGRvIiwiaWF0IjoxNzUzNjA2MjE5LCJqdGkiOiJhY2QwMDhmYTVhY2VkMGFlNDBiYTBkMGE4OGZmNWQzNyIsImV4cCI6MTc1MzYwOTgxOX0.WI4MYAKDc1gadn1gUkS_3dxbErotKBYVNY4Erw6zb-A",
    "refreshToken": "6c8fb41e537a2d31906cefd30cc23fab5ae885c2c8d3b770937a8615de6299e7654aaadc1db42f13e84a0ea5cc04b0c2c34332b03fd79b3a44c194ce259db732",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  },
  "meta": {
    "timestamp": "2025-07-27T08:50:19.270Z",
    "version": "1.0.0"
  }
}
```

**What happened**: 
          Priya successfully logs in with her photographer account. The system recognizes 
          her EDITOR role, which gives her permission to upload and manage media content. 
          She receives an authentication token that she'll use for subsequent operations.
        

---

### Step 2: Priya checks the current media library to see what content already exists ✅

**What Priya Gurung expects**: Should see a list of existing media files and understand the organization system

**API Call**: `GET /api/v1/admin/media`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsZnY2N20wMDAwanNsYmx4N3RycGRvIiwiaWF0IjoxNzUzNjA2MjE5LCJqdGkiOiJhY2QwMDhmYTVhY2VkMGFlNDBiYTBkMGE4OGZmNWQzNyIsImV4cCI6MTc1MzYwOTgxOX0.WI4MYAKDc1gadn1gUkS_3dxbErotKBYVNY4Erw6zb-A
```

**Response**: 🟢 200 (23ms)

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 0,
    "totalPages": 0,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-07-27T08:50:19.291Z",
    "version": "1.0.0"
  }
}
```

**What happened**: 
          Priya reviews the existing media to understand how photos are organized and 
          to ensure her new uploads will fit well with the current content structure. 
          This helps her plan her upload and organization strategy.
        

---

### Step 3: Priya uploads the first photo showing government officials at the ceremony ✅

**What Priya Gurung expects**: Photo should upload successfully with bilingual metadata and be ready for use

**API Call**: `POST /api/v1/admin/media/upload`

**Request Body**:
```json
{
  "file": "[FILE: ceremony-photo.jpg]",
  "altText[en]": "Government officials at Community Development Program ceremony",
  "altText[ne]": "सामुदायिक विकास कार्यक्रम समारोहमा सरकारी अधिकारीहरू",
  "caption[en]": "Chief District Officer presenting awards to community leaders during the annual ceremony",
  "caption[ne]": "प्रमुख जिल्ला अधिकारीले वार्षिक समारोहमा समुदायिक नेताहरूलाई पुरस्कार प्रदान गर्दै",
  "isActive": "true"
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsZnY2N20wMDAwanNsYmx4N3RycGRvIiwiaWF0IjoxNzUzNjA2MjE5LCJqdGkiOiJhY2QwMDhmYTVhY2VkMGFlNDBiYTBkMGE4OGZmNWQzNyIsImV4cCI6MTc1MzYwOTgxOX0.WI4MYAKDc1gadn1gUkS_3dxbErotKBYVNY4Erw6zb-A
Content-Type: multipart/form-data
```

**Response**: 🟢 201 (38ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlfv6m20007jslbn57obyzq",
    "fileName": "media/1753606219320-ssytik6o3z8-test-ceremony-photo.jpg",
    "originalName": "test-ceremony-photo.jpg",
    "filePath": "media/1753606219320-ssytik6o3z8-test-ceremony-photo.jpg",
    "fileSize": 24,
    "mimeType": "image/jpeg",
    "mediaType": "IMAGE",
    "altText": {
      "en": "Government officials at Community Development Program ceremony",
      "ne": "सामुदायिक विकास कार्यक्रम समारोहमा सरकारी अधिकारीहरू"
    },
    "caption": {
      "en": "Chief District Officer presenting awards to community leaders during the annual ceremony",
      "ne": "प्रमुख जिल्ला अधिकारीले वार्षिक समारोहमा समुदायिक नेताहरूलाई पुरस्कार प्रदान गर्दै"
    },
    "width": null,
    "height": null,
    "duration": null,
    "isActive": true,
    "url": "https://cdn.example.com/media/1753606219320-ssytik6o3z8-test-ceremony-photo.jpg",
    "thumbnailUrl": "https://cdn.example.com/thumbnails/media/1753606219320-ssytik6o3z8-test-ceremony-photo.jpg",
    "createdAt": "2025-07-27T08:50:19.323Z",
    "updatedAt": "2025-07-27T08:50:19.323Z",
    "albums": []
  },
  "meta": {
    "timestamp": "2025-07-27T08:50:19.330Z",
    "version": "1.0.0"
  }
}
```

**What happened**: 
          Priya successfully uploads her first photo with comprehensive metadata in both 
          English and Nepali. The system automatically detects it as an IMAGE type and 
          generates the necessary thumbnails. The photo is now available in the media 
          library for content teams to discover and use.
        

---

### Step 4: Priya verifies that her uploaded photo has all the correct metadata and is properly stored ✅

**What Priya Gurung expects**: Should see the photo details with bilingual captions and proper file information

**API Call**: `GET /api/v1/admin/media/cmdlfv6m20007jslbn57obyzq`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsZnY2N20wMDAwanNsYmx4N3RycGRvIiwiaWF0IjoxNzUzNjA2MjE5LCJqdGkiOiJhY2QwMDhmYTVhY2VkMGFlNDBiYTBkMGE4OGZmNWQzNyIsImV4cCI6MTc1MzYwOTgxOX0.WI4MYAKDc1gadn1gUkS_3dxbErotKBYVNY4Erw6zb-A
```

**Response**: 🟢 200 (11ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlfv6m20007jslbn57obyzq",
    "fileName": "media/1753606219320-ssytik6o3z8-test-ceremony-photo.jpg",
    "originalName": "test-ceremony-photo.jpg",
    "filePath": "media/1753606219320-ssytik6o3z8-test-ceremony-photo.jpg",
    "fileSize": 24,
    "mimeType": "image/jpeg",
    "mediaType": "IMAGE",
    "altText": {
      "en": "Government officials at Community Development Program ceremony",
      "ne": "सामुदायिक विकास कार्यक्रम समारोहमा सरकारी अधिकारीहरू"
    },
    "caption": {
      "en": "Chief District Officer presenting awards to community leaders during the annual ceremony",
      "ne": "प्रमुख जिल्ला अधिकारीले वार्षिक समारोहमा समुदायिक नेताहरूलाई पुरस्कार प्रदान गर्दै"
    },
    "width": null,
    "height": null,
    "duration": null,
    "isActive": true,
    "url": "https://cdn.example.com/media/1753606219320-ssytik6o3z8-test-ceremony-photo.jpg",
    "thumbnailUrl": "https://cdn.example.com/thumbnails/media/1753606219320-ssytik6o3z8-test-ceremony-photo.jpg",
    "createdAt": "2025-07-27T08:50:19.323Z",
    "updatedAt": "2025-07-27T08:50:19.323Z",
    "albums": []
  },
  "meta": {
    "timestamp": "2025-07-27T08:50:19.339Z",
    "version": "1.0.0"
  }
}
```

**What happened**: 
          Priya confirms that her photo was uploaded correctly with all metadata intact. 
          The system shows the file size, dimensions, and both English and Nepali 
          descriptions. The photo is active and ready for use by content teams.
        

---

### Step 5: Priya creates a dedicated album to organize all photos from the Community Development Program ✅

**What Priya Gurung expects**: Album should be created with bilingual name and description, ready to hold event photos

**API Call**: `POST /api/v1/albums`

**Request Body**:
```json
{
  "name": {
    "en": "Community Development Program 2024",
    "ne": "२०२४ सामुदायिक विकास कार्यक्रम"
  },
  "description": {
    "en": "Photos from the annual Community Development Program ceremony showcasing government and community collaboration",
    "ne": "सरकार र समुदायको सहकार्यलाई देखाउने वार्षिक सामुदायिक विकास कार्यक्रम समारोहका तस्बिरहरू"
  },
  "isActive": true
}
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsZnY2N20wMDAwanNsYmx4N3RycGRvIiwiaWF0IjoxNzUzNjA2MjE5LCJqdGkiOiJhY2QwMDhmYTVhY2VkMGFlNDBiYTBkMGE4OGZmNWQzNyIsImV4cCI6MTc1MzYwOTgxOX0.WI4MYAKDc1gadn1gUkS_3dxbErotKBYVNY4Erw6zb-A
```

**Response**: 🟢 201 (20ms)

```json
{
  "success": true,
  "data": {
    "id": "cmdlfv6mz0008jslbozxieq4o",
    "name": {
      "en": "Community Development Program 2024",
      "ne": "२०२४ सामुदायिक विकास कार्यक्रम"
    },
    "description": {
      "en": "Photos from the annual Community Development Program ceremony showcasing government and community collaboration",
      "ne": "सरकार र समुदायको सहकार्यलाई देखाउने वार्षिक सामुदायिक विकास कार्यक्रम समारोहका तस्बिरहरू"
    },
    "isActive": true,
    "createdAt": "2025-07-27T08:50:19.355Z",
    "updatedAt": "2025-07-27T08:50:19.355Z",
    "mediaCount": 0,
    "media": []
  },
  "meta": {
    "timestamp": "2025-07-27T08:50:19.360Z",
    "version": "1.0.0"
  }
}
```

**What happened**: 
          Priya creates a dedicated album for the event photos. This helps organize the 
          content and makes it easier for visitors and content teams to find related 
          photos. The album has descriptive names in both languages and provides context 
          about the event.
        

---

### Step 6: Priya adds her uploaded photo to the newly created event album ✅

**What Priya Gurung expects**: Photo should be successfully associated with the album and organized properly

**API Call**: `POST /api/v1/albums/cmdlfv6mz0008jslbozxieq4o/media/cmdlfv6m20007jslbn57obyzq`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsZnY2N20wMDAwanNsYmx4N3RycGRvIiwiaWF0IjoxNzUzNjA2MjE5LCJqdGkiOiJhY2QwMDhmYTVhY2VkMGFlNDBiYTBkMGE4OGZmNWQzNyIsImV4cCI6MTc1MzYwOTgxOX0.WI4MYAKDc1gadn1gUkS_3dxbErotKBYVNY4Erw6zb-A
```

**Response**: 🟢 200 (32ms)

```json
{
  "success": true,
  "data": {
    "message": "Media added to album successfully"
  },
  "meta": {
    "timestamp": "2025-07-27T08:50:19.391Z",
    "version": "1.0.0"
  }
}
```

**What happened**: 
          Priya links her uploaded photo to the event album. This creates a logical 
          organization that allows visitors to browse all photos from the event in 
          one place. The photo is now part of the structured gallery for this event.
        

---

### Step 7: Priya searches for her uploaded content to ensure it can be discovered easily ❌

**What Priya Gurung expects**: Should find the uploaded photo and album when searching for event-related keywords

**API Call**: `GET /api/v1/admin/media/search`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsZnY2N20wMDAwanNsYmx4N3RycGRvIiwiaWF0IjoxNzUzNjA2MjE5LCJqdGkiOiJhY2QwMDhmYTVhY2VkMGFlNDBiYTBkMGE4OGZmNWQzNyIsImV4cCI6MTc1MzYwOTgxOX0.WI4MYAKDc1gadn1gUkS_3dxbErotKBYVNY4Erw6zb-A
```

**Response**: 🔴 500 (16ms)

```json
{
  "success": false,
  "error": {
    "code": "MEDIA_SEARCH_ERROR",
    "message": "Cannot read properties of undefined (reading 'id')"
  },
  "meta": {
    "timestamp": "2025-07-27T08:50:19.407Z",
    "version": "1.0.0"
  }
}
```

**What happened**: 
          Priya tests the search functionality to ensure her content can be found easily. 
          The search returns her uploaded photo and album when searching for relevant 
          keywords, confirming that the metadata and organization are working correctly.
        

---

### Step 8: Priya checks the overall media statistics to see how her uploads contribute to the system ✅

**What Priya Gurung expects**: Should see updated statistics reflecting the new photo upload and storage usage

**API Call**: `GET /api/v1/admin/media/statistics`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWRsZnY2N20wMDAwanNsYmx4N3RycGRvIiwiaWF0IjoxNzUzNjA2MjE5LCJqdGkiOiJhY2QwMDhmYTVhY2VkMGFlNDBiYTBkMGE4OGZmNWQzNyIsImV4cCI6MTc1MzYwOTgxOX0.WI4MYAKDc1gadn1gUkS_3dxbErotKBYVNY4Erw6zb-A
```

**Response**: 🟢 200 (23ms)

```json
{
  "success": true,
  "data": {
    "total": 1,
    "byType": {
      "IMAGE": 1,
      "VIDEO": 0,
      "AUDIO": 0,
      "DOCUMENT": 0
    },
    "totalSize": 24,
    "averageSize": 24
  },
  "meta": {
    "timestamp": "2025-07-27T08:50:19.432Z",
    "version": "1.0.0"
  }
}
```

**What happened**: 
          Priya reviews the system statistics to understand the current state of media 
          storage and to ensure her uploads are contributing appropriately to the 
          overall media library. This helps her plan future uploads and storage needs.
        

---



## 🎯 The Outcome

❌ **Journey Encountered Issues**
        
        Priya Gurung completed 7 out of 8 steps successfully. 
        1 step(s) failed, preventing them from fully achieving 
        their goal of uploading event photos to the media library.
        
        This indicates areas where the API or user experience could be improved.

---

## 📊 Technical Details

### Test Summary
- **Total Steps**: 8
- **Successful**: 7
- **Failed**: 1
- **Success Rate**: 87.5%
- **Total Duration**: 0.39s

### Performance Metrics
- **authenticate**: 225ms ✅
- **check-existing-media**: 23ms ✅
- **upload-first-photo**: 38ms ✅
- **verify-uploaded-photo**: 11ms ✅
- **create-event-album**: 20ms ✅
- **add-photo-to-album**: 32ms ✅
- **search-uploaded-content**: 16ms ❌
- **check-media-statistics**: 23ms ✅

### ❌ Failed Steps
- **search-uploaded-content**: Unknown error