# Storage Configuration

This project supports both local file storage and S3-compatible storage (including MinIO and AWS S3). The storage provider is configured via environment variables.

## Environment Variables

Add these variables to your `.env` file:

```env
# Storage Configuration
STORAGE_PROVIDER=local # 'local' or 's3'

# Local Storage Configuration (when STORAGE_PROVIDER=local)
STORAGE_LOCAL_PATH=./uploads
STORAGE_LOCAL_BASE_URL=http://localhost:3000/uploads

# S3 Storage Configuration (when STORAGE_PROVIDER=s3)
STORAGE_S3_ENDPOINT=http://localhost:9000 # For MinIO, leave empty for AWS S3
STORAGE_S3_REGION=us-east-1
STORAGE_S3_BUCKET=your-bucket-name
STORAGE_S3_ACCESS_KEY_ID=your-access-key
STORAGE_S3_SECRET_ACCESS_KEY=your-secret-key
STORAGE_S3_FORCE_PATH_STYLE=true # Required for MinIO, false for AWS S3
STORAGE_S3_SIGNED_URL_EXPIRES=3600 # URL expiration in seconds
```

## Local Storage

When `STORAGE_PROVIDER=local`:
- Files are stored in the local filesystem
- `STORAGE_LOCAL_PATH`: Directory where files will be stored
- `STORAGE_LOCAL_BASE_URL`: Base URL for accessing files via HTTP

## S3-Compatible Storage

When `STORAGE_PROVIDER=s3`:

### MinIO Configuration
```env
STORAGE_PROVIDER=s3
STORAGE_S3_ENDPOINT=http://localhost:9000
STORAGE_S3_REGION=us-east-1
STORAGE_S3_BUCKET=my-bucket
STORAGE_S3_ACCESS_KEY_ID=minioadmin
STORAGE_S3_SECRET_ACCESS_KEY=minioadmin
STORAGE_S3_FORCE_PATH_STYLE=true
```

### AWS S3 Configuration
```env
STORAGE_PROVIDER=s3
# STORAGE_S3_ENDPOINT= # Leave empty for AWS S3
STORAGE_S3_REGION=us-west-2
STORAGE_S3_BUCKET=my-aws-bucket
STORAGE_S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
STORAGE_S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
STORAGE_S3_FORCE_PATH_STYLE=false
```

## Required Dependencies

To use S3 storage, install the AWS SDK:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Usage

The storage service is automatically configured based on the `STORAGE_PROVIDER` environment variable. All modules (content management, media, etc.) will use the configured storage provider seamlessly.

### Switching Storage Providers

To switch from local to S3 storage:
1. Update `STORAGE_PROVIDER=s3` in your `.env` file
2. Configure the S3 environment variables
3. Restart your application

The application will automatically use the new storage provider without code changes.

## File Organization

### Content Attachments
- Stored in: `content-attachments/{contentId}/{timestamp}-{random}-{filename}`

### Media Files
- Stored in: `media/{timestamp}-{random}-{filename}`

This organization helps maintain file organization and prevents naming conflicts. 