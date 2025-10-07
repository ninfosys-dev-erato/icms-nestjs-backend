import { StoryBuilder } from '../../framework/story-builder';
import { arjunMediaAdmin } from '../../personas/arjun-media-admin';
import { bulkMediaOperationsScenario } from './media-scenarios';
import * as path from 'path';
import * as fs from 'fs';

export async function createArjunBulkOperationsStory(app: any) {
  return StoryBuilder.create(app)
    .withPersona(arjunMediaAdmin)
    .withScenario(bulkMediaOperationsScenario)
    .withNarrative(`
      Arjun has received a large collection of media files from multiple government 
      departments that need to be processed and organized. This includes 150 photos 
      from various events, 20 policy documents, and 10 promotional videos. 
      
      He needs to perform bulk uploads, organize content efficiently, update metadata 
      for multiple files, and ensure the system performs optimally under the load.
    `)
    .withTestData({
      totalFiles: 180,
      photoCount: 150,
      documentCount: 20,
      videoCount: 10,
      departments: ['Health', 'Education', 'Agriculture', 'Infrastructure']
    })
    
    // Step 1: Authentication as Admin
    .step('authenticate-admin', async (persona, context) => {
      const response = await context.request
        .post('/api/v1/auth/login')
        .send({
          email: persona.email,
          password: persona.password
        });

      context.testData.authToken = response.body.data.accessToken;
      context.testData.userId = response.body.data.user.id;

      return {
        narrative: 'Arjun logs in with his administrator credentials to access bulk operation features',
        expectation: 'System should authenticate him as ADMIN with full media management permissions',
        response,
        explanation: `
          Arjun successfully authenticates with his administrator account, gaining access 
          to advanced media management features including bulk operations, system statistics, 
          and administrative controls. His ADMIN role allows him to perform system-wide operations.
        `,
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/auth/login',
          payload: {
            email: persona.email,
            password: '[PROTECTED]'
          }
        }
      };
    })
    
    // Step 2: Get current system statistics
    .step('check-system-statistics', async (persona, context) => {
      const response = await context.request
        .get('/api/v1/admin/media/statistics')
        .set('Authorization', `Bearer ${context.testData.authToken}`);

      context.testData.initialStats = response.body.data;

      return {
        narrative: 'Arjun reviews current system statistics to understand storage usage and performance',
        expectation: 'Should see comprehensive media statistics including file counts, storage usage, and type distribution',
        response,
        explanation: `
          Arjun checks the current system state before beginning bulk operations. This baseline 
          helps him monitor the impact of his bulk uploads and ensures the system can handle 
          the additional load. He notes current storage usage and file distribution.
        `,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/admin/media/statistics',
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`
          }
        }
      };
    })
    
    // Step 3: Bulk create media entries
    .step('bulk-create-media', async (persona, context) => {
      const bulkMediaData = {
        media: [
          {
            fileName: 'health-dept-event-1.jpg',
            originalName: 'health-department-vaccination-drive.jpg',
            filePath: 'uploads/health/health-dept-event-1.jpg',
            fileSize: 2048000,
            mimeType: 'image/jpeg',
            mediaType: 'IMAGE',
            altText: {
              en: 'Health Department vaccination drive event',
              ne: 'स्वास्थ्य विभागको खोप अभियान कार्यक्रम'
            },
            caption: {
              en: 'Community vaccination program organized by Health Department',
              ne: 'स्वास्थ्य विभागद्वारा आयोजित सामुदायिक खोप कार्यक्रम'
            },
            isActive: true
          },
          {
            fileName: 'education-policy-2024.pdf',
            originalName: 'education-policy-reform-document.pdf',
            filePath: 'uploads/documents/education-policy-2024.pdf',
            fileSize: 5120000,
            mimeType: 'application/pdf',
            mediaType: 'DOCUMENT',
            altText: {
              en: 'Education Policy Reform Document 2024',
              ne: '२०२४ शिक्षा नीति सुधार दस्तावेज'
            },
            caption: {
              en: 'Comprehensive education policy reform guidelines for 2024',
              ne: '२०२४ का लागि व्यापक शिक्षा नीति सुधार दिशानिर्देशहरू'
            },
            isActive: true
          },
          {
            fileName: 'agriculture-training-video.mp4',
            originalName: 'modern-farming-techniques-training.mp4',
            filePath: 'uploads/videos/agriculture-training-video.mp4',
            fileSize: 52428800,
            mimeType: 'video/mp4',
            mediaType: 'VIDEO',
            altText: {
              en: 'Modern farming techniques training video',
              ne: 'आधुनिक कृषि प्रविधि प्रशिक्षण भिडियो'
            },
            caption: {
              en: 'Training video demonstrating modern agricultural techniques for farmers',
              ne: 'किसानहरूका लागि आधुनिक कृषि प्रविधि प्रदर्शन गर्ने प्रशिक्षण भिडियो'
            },
            isActive: true,
            duration: 1800
          }
        ]
      };

      const response = await context.request
        .post('/api/v1/admin/media/bulk-create')
        .set('Authorization', `Bearer ${context.testData.authToken}`)
        .send(bulkMediaData);

      context.testData.bulkCreatedIds = response.body.data?.map((item: any) => item.id) || [];

      return {
        narrative: 'Arjun performs a bulk creation of multiple media entries with different types and metadata',
        expectation: 'Should successfully create multiple media entries with proper type detection and metadata',
        response,
        explanation: `
          Arjun successfully creates multiple media entries in a single operation, including 
          images, documents, and videos. The system correctly processes each file type and 
          stores the bilingual metadata. This bulk operation is much more efficient than 
          individual uploads for large collections.
        `,
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/admin/media/bulk-create',
          payload: {
            media: [
              {
                fileName: 'health-dept-event-1.jpg',
                mediaType: 'IMAGE',
                altText: { en: 'Health Department vaccination drive event', ne: 'स्वास्थ्य विभागको खोप अभियान कार्यक्रम' },
                isActive: true
              },
              {
                fileName: 'education-policy-2024.pdf',
                mediaType: 'DOCUMENT',
                altText: { en: 'Education Policy Reform Document 2024', ne: '२०२४ शिक्षा नीति सुधार दस्तावेज' },
                isActive: true
              },
              {
                fileName: 'agriculture-training-video.mp4',
                mediaType: 'VIDEO',
                altText: { en: 'Modern farming techniques training video', ne: 'आधुनिक कृषि प्रविधि प्रशिक्षण भिडियो' },
                duration: 1800,
                isActive: true
              }
            ]
          },
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`
          }
        }
      };
    })
    
    // Step 4: Create albums for organization
    .step('create-department-albums', async (persona, context) => {
      const albumResponse = await context.request
        .post('/api/v1/albums')
        .set('Authorization', `Bearer ${context.testData.authToken}`)
        .send({
          name: {
            en: 'Health Department Media Collection',
            ne: 'स्वास्थ्य विभाग मिडिया संग्रह'
          },
          description: {
            en: 'Collection of photos, videos, and documents from Health Department activities',
            ne: 'स्वास्थ्य विभागका गतिविधिहरूका तस्बिर, भिडियो र दस्तावेजहरूको संग्रह'
          },
          isActive: true
        });

      context.testData.healthAlbumId = albumResponse.body.data?.id;

      return {
        narrative: 'Arjun creates departmental albums to organize media content by government departments',
        expectation: 'Should create albums with proper multilingual metadata for content organization',
        response: albumResponse,
        explanation: `
          Arjun creates structured albums to organize content by government departments. 
          This organizational strategy makes it easier for users to find relevant content 
          and maintains a logical structure as the media library grows.
        `,
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/albums',
          payload: {
            name: {
              en: 'Health Department Media Collection',
              ne: 'स्वास्थ्य विभाग मिडिया संग्रह'
            },
            description: {
              en: 'Collection of photos, videos, and documents from Health Department activities',
              ne: 'स्वास्थ्य विभागका गतिविधिहरूका तस्बिर, भिडियो र दस्तावेजहरूको संग्रह'
            },
            isActive: true
          },
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`
          }
        }
      };
    })
    
    // Step 5: Bulk update media metadata
    .step('bulk-update-metadata', async (persona, context) => {
      const updateData = {
        ids: context.testData.bulkCreatedIds.slice(0, 2), // Update first 2 items
        updates: {
          isActive: true,
          altText: {
            en: 'Updated media content for better accessibility',
            ne: 'राम्रो पहुँचका लागि अपडेट गरिएको मिडिया सामग्री'
          }
        }
      };

      const response = await context.request
        .put('/api/v1/admin/media/bulk-update')
        .set('Authorization', `Bearer ${context.testData.authToken}`)
        .send(updateData);

      return {
        narrative: 'Arjun performs bulk metadata updates to improve content accessibility and organization',
        expectation: 'Should successfully update multiple media items with consistent metadata changes',
        response,
        explanation: `
          Arjun efficiently updates metadata for multiple media items simultaneously. 
          This bulk operation ensures consistency across related content and saves 
          significant time compared to individual updates. The operation maintains 
          data integrity while improving content quality.
        `,
        apiCall: {
          method: 'PUT',
          endpoint: '/api/v1/admin/media/bulk-update',
          payload: {
            ids: context.testData.bulkCreatedIds.slice(0, 2),
            updates: {
              isActive: true,
              altText: {
                en: 'Updated media content for better accessibility',
                ne: 'राम्रो पहुँचका लागि अपडेट गरिएको मिडिया सामग्री'
              }
            }
          },
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`
          }
        }
      };
    })
    
    // Step 6: Process media for optimization
    .step('process-media-optimization', async (persona, context) => {
      if (context.testData.bulkCreatedIds.length > 0) {
        const firstMediaId = context.testData.bulkCreatedIds[0];
        
        const processingOptions = {
          resize: {
            width: 1200,
            height: 800,
            quality: 85
          },
          optimize: true,
          generateThumbnail: true,
          watermark: {
            text: 'Government of Nepal',
            position: 'bottom-right'
          }
        };

        const response = await context.request
          .post(`/api/v1/admin/media/${firstMediaId}/process`)
          .set('Authorization', `Bearer ${context.testData.authToken}`)
          .send(processingOptions);

        return {
          narrative: 'Arjun processes media files for optimization including resizing, watermarking, and thumbnail generation',
          expectation: 'Should apply processing options to improve media quality and branding',
          response,
          explanation: `
            Arjun applies automated processing to optimize media files for web use. This includes 
            resizing for consistent dimensions, adding government watermarks for branding, and 
            generating thumbnails for faster loading. These optimizations improve user experience 
            while maintaining professional standards.
          `,
          apiCall: {
            method: 'POST',
            endpoint: `/api/v1/admin/media/${firstMediaId}/process`,
            payload: processingOptions,
            headers: {
              'Authorization': `Bearer ${context.testData.authToken}`
            }
          }
        };
      } else {
        // If no media was created, skip this step
        return {
          narrative: 'Arjun attempts to process media but no media items are available',
          expectation: 'Should handle the case when no media is available for processing',
          response: { status: 404, body: { message: 'No media available for processing' } },
          explanation: 'No media items were available for processing in this test run.'
        };
      }
    })
    
    // Step 7: Check updated statistics
    .step('verify-updated-statistics', async (persona, context) => {
      const response = await context.request
        .get('/api/v1/admin/media/statistics')
        .set('Authorization', `Bearer ${context.testData.authToken}`);

      return {
        narrative: 'Arjun verifies that system statistics reflect the bulk operations and new content',
        expectation: 'Should see updated statistics showing increased file counts and storage usage',
        response,
        explanation: `
          Arjun confirms that the bulk operations have been properly reflected in the system 
          statistics. The updated metrics show increased storage usage, file counts by type, 
          and overall system health. This verification ensures the operations completed successfully.
        `,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/admin/media/statistics',
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`
          }
        }
      };
    })
    
    // Step 8: Search and verify content organization
    .step('verify-content-organization', async (persona, context) => {
      const response = await context.request
        .get('/api/v1/admin/media/search')
        .set('Authorization', `Bearer ${context.testData.authToken}`)
        .query({ q: 'Health Department', mediaType: 'IMAGE' });

      return {
        narrative: 'Arjun searches for specific content to verify that bulk operations maintained proper organization',
        expectation: 'Should find the uploaded content with correct metadata and organization',
        response,
        explanation: `
          Arjun validates that the bulk operations maintained content discoverability and 
          organization. The search functionality correctly finds content based on metadata, 
          confirming that the bulk upload and update processes preserved data integrity 
          and search optimization.
        `,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/admin/media/search',
          query: { q: 'Health Department', mediaType: 'IMAGE' },
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`
          }
        }
      };
    })
    
    .run();
} 