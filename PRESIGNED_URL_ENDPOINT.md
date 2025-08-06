# Presigned URL Endpoint for Media

## Overview

The presigned URL endpoint allows you to generate temporary, secure URLs for accessing media files stored in Backblaze B2 (or other storage providers). These URLs are perfect for:

- **Image previews** in web applications
- **Secure file downloads** with expiration
- **Temporary access** to private media files
- **CDN-like functionality** with controlled access

## Endpoint Details

### GET `/api/v1/media/{id}/presigned-url`

Generate a presigned URL for a specific media file.

**Authentication:** Required (JWT Bearer Token)

**Authorization:**

- Public media: Accessible by any authenticated user
- Private media: Only accessible by the owner or admin users

### Query Parameters

| Parameter   | Type   | Required | Default | Description                                       |
| ----------- | ------ | -------- | ------- | ------------------------------------------------- |
| `expiresIn` | number | No       | 86400   | URL expiration time in seconds (24 hours default) |
| `operation` | string | No       | 'get'   | Operation type: 'get' or 'put'                    |

### Response Format

```json
{
  "presignedUrl": "https://f003.backblazeb2.com/file/bucket/file.jpg?Authorization=...",
  "expiresIn": 86400,
  "operation": "get",
  "mediaId": "cmdzykuai00010sdd85w93e2c",
  "fileName": "office-settings/1754484168314-5ktbq9f3xag-lq.jpg",
  "contentType": "image/jpeg"
}
```

### Example Usage

#### Basic Usage (GET operation)

```bash
curl -X GET "http://localhost:3000/api/v1/media/cmdzykuai00010sdd85w93e2c/presigned-url" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### With Custom Expiration

```bash
curl -X GET "http://localhost:3000/api/v1/media/cmdzykuai00010sdd85w93e2c/presigned-url?expiresIn=7200" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### For Upload Operations (PUT)

```bash
curl -X GET "http://localhost:3000/api/v1/media/cmdzykuai00010sdd85w93e2c/presigned-url?operation=put&expiresIn=1800" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Use Cases

### 1. Image Preview in Web Applications

```javascript
// Frontend JavaScript example
async function getImagePreview(mediaId) {
  const response = await fetch(`/api/v1/media/${mediaId}/presigned-url`, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  const data = await response.json();

  // Use the presigned URL in an img tag
  const img = document.createElement('img');
  img.src = data.presignedUrl;
  img.alt = 'Preview';

  return img;
}
```

### 2. Secure File Downloads

```javascript
// Generate a download link with 30-minute expiration
async function getDownloadLink(mediaId) {
  const response = await fetch(
    `/api/v1/media/${mediaId}/presigned-url?expiresIn=1800`,
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  );

  const data = await response.json();

  // Create a download link
  const link = document.createElement('a');
  link.href = data.presignedUrl;
  link.download = data.fileName.split('/').pop();
  link.click();
}
```

### 3. Temporary Access for External Services

```javascript
// Generate a short-lived URL for external service
async function getTemporaryAccess(mediaId) {
  const response = await fetch(
    `/api/v1/media/${mediaId}/presigned-url?expiresIn=300`,
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  );

  const data = await response.json();

  // Send to external service
  await externalService.processImage(data.presignedUrl);
}
```

## Security Features

### 1. Authentication Required

All requests must include a valid JWT token.

### 2. Authorization Checks

- **Public media**: Accessible by any authenticated user
- **Private media**: Only accessible by the owner or admin users

### 3. URL Expiration

- URLs automatically expire after the specified time
- Default expiration: 24 hours (86400 seconds)
- Maximum recommended: 24 hours (86400 seconds)

### 4. Operation-Specific URLs

- `get` operation: For downloading/viewing files
- `put` operation: For uploading files (if needed)

## Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Access denied to this media"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Media not found"
}
```

## Storage Provider Support

The endpoint works with all configured storage providers:

- **Backblaze B2**: Full presigned URL support
- **AWS S3**: Full presigned URL support
- **MinIO**: Full presigned URL support
- **Local Storage**: Returns static URLs (no expiration)

## Best Practices

### 1. URL Expiration

- Use short expiration times for sensitive files
- Use longer expiration times for frequently accessed public files
- Consider user session duration when setting expiration

### 2. Error Handling

```javascript
try {
  const response = await fetch(`/api/v1/media/${mediaId}/presigned-url`);
  const data = await response.json();

  if (response.ok) {
    // Use presigned URL
    displayImage(data.presignedUrl);
  } else {
    // Handle error
    console.error('Failed to get presigned URL:', data.message);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### 3. Caching

- Don't cache presigned URLs for long periods
- Regenerate URLs when they're close to expiration
- Consider implementing URL refresh logic

### 4. Monitoring

- Monitor URL generation frequency
- Track expiration times and usage patterns
- Set up alerts for unusual access patterns

## Integration Examples

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

function MediaPreview({ mediaId, userToken }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadImage() {
      try {
        const response = await fetch(`/api/v1/media/${mediaId}/presigned-url`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setImageUrl(data.presignedUrl);
        } else {
          setError('Failed to load image');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    loadImage();
  }, [mediaId, userToken]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!imageUrl) return <div>No image available</div>;

  return <img src={imageUrl} alt="Media preview" />;
}
```

### Vue.js Component Example

```vue
<template>
  <div>
    <img v-if="imageUrl" :src="imageUrl" alt="Media preview" />
    <div v-else-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
  </div>
</template>

<script>
export default {
  props: ['mediaId', 'userToken'],
  data() {
    return {
      imageUrl: null,
      loading: true,
      error: null,
    };
  },
  async mounted() {
    try {
      const response = await fetch(
        `/api/v1/media/${this.mediaId}/presigned-url`,
        {
          headers: {
            Authorization: `Bearer ${this.userToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        this.imageUrl = data.presignedUrl;
      } else {
        this.error = 'Failed to load image';
      }
    } catch (err) {
      this.error = 'Network error';
    } finally {
      this.loading = false;
    }
  },
};
</script>
```

## Testing

Use the provided test script to verify the endpoint:

```bash
# Install dependencies
npm install axios

# Run the test (update the JWT token first)
node test-presigned-url.js
```

## Configuration

The endpoint uses the same storage configuration as the rest of the application. Ensure your environment variables are properly set:

```env
# For Backblaze B2
STORAGE_PROVIDER=backblaze-b2
BACKBLAZE_APPLICATION_KEY_ID=your_key_id
BACKBLAZE_APPLICATION_KEY=your_application_key
BACKBLAZE_BUCKET_ID=your_bucket_id
BACKBLAZE_BUCKET_NAME=your_bucket_name

# For AWS S3
STORAGE_PROVIDER=s3
STORAGE_S3_BUCKET=your_bucket
STORAGE_S3_ACCESS_KEY_ID=your_access_key
STORAGE_S3_SECRET_ACCESS_KEY=your_secret_key
```
