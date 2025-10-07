import { StoryBuilder } from '../../framework/story-builder';
import { priyaPhotographer } from '../../personas/priya-photographer';
import { mediaUploadScenario } from './media-scenarios';
import * as path from 'path';
import * as fs from 'fs';

export async function createPriyaMediaUploadStory(app: any) {
  return StoryBuilder.create(app)
    .withPersona(priyaPhotographer)
    .withScenario(mediaUploadScenario)
    .withNarrative(`
      Priya has just finished photographing the annual Community Development Program 
      ceremony. She has 25 high-quality photos that showcase the event, including 
      speeches by government officials, community participation, and award ceremonies. 
      
      Now she needs to upload these photos to the government media system with proper 
      descriptions in both English and Nepali so that the content team can use them 
      for press releases and the website gallery.
    `)
    .withTestData({
      eventName: 'Community Development Program 2024',
      totalPhotos: 25,
      albumName: 'Community Development Ceremony'
    })
    
    // Step 1: Authentication
    .step('authenticate', async (persona, context) => {
      const response = await context.request
        .post('/api/v1/auth/login')
        .send({
          email: persona.email,
          password: persona.password
        });

      context.testData.authToken = response.body.data.accessToken;
      context.testData.userId = response.body.data.user.id;

      return {
        narrative: 'Priya logs into the media management system using her photographer credentials',
        expectation: 'System should authenticate her as an EDITOR and provide access to media upload features',
        response,
        explanation: `
          Priya successfully logs in with her photographer account. The system recognizes 
          her EDITOR role, which gives her permission to upload and manage media content. 
          She receives an authentication token that she'll use for subsequent operations.
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
    
    // Step 2: Check existing media to understand current state
    .step('check-existing-media', async (persona, context) => {
      const response = await context.request
        .get('/api/v1/admin/media')
        .set('Authorization', `Bearer ${context.testData.authToken}`)
        .query({ page: 1, limit: 5 });

      return {
        narrative: 'Priya checks the current media library to see what content already exists',
        expectation: 'Should see a list of existing media files and understand the organization system',
        response,
        explanation: `
          Priya reviews the existing media to understand how photos are organized and 
          to ensure her new uploads will fit well with the current content structure. 
          This helps her plan her upload and organization strategy.
        `,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/admin/media',
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`
          }
        }
      };
    })
    
    // Step 3: Upload first photo with metadata
    .step('upload-first-photo', async (persona, context) => {
      // Create a test image file
      const testImagePath = path.join(__dirname, 'test-ceremony-photo.jpg');
      const jpegHeader = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43
      ]);
      fs.writeFileSync(testImagePath, jpegHeader);

      const response = await context.request
        .post('/api/v1/admin/media/upload')
        .set('Authorization', `Bearer ${context.testData.authToken}`)
        .attach('file', testImagePath)
        .field('altText[en]', 'Government officials at Community Development Program ceremony')
        .field('altText[ne]', 'सामुदायिक विकास कार्यक्रम समारोहमा सरकारी अधिकारीहरू')
        .field('caption[en]', 'Chief District Officer presenting awards to community leaders during the annual ceremony')
        .field('caption[ne]', 'प्रमुख जिल्ला अधिकारीले वार्षिक समारोहमा समुदायिक नेताहरूलाई पुरस्कार प्रदान गर्दै')
        .field('isActive', 'true');

      context.testData.firstPhotoId = response.body.data?.id;
      
      // Clean up test file
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }

      return {
        narrative: 'Priya uploads the first photo showing government officials at the ceremony',
        expectation: 'Photo should upload successfully with bilingual metadata and be ready for use',
        response,
        explanation: `
          Priya successfully uploads her first photo with comprehensive metadata in both 
          English and Nepali. The system automatically detects it as an IMAGE type and 
          generates the necessary thumbnails. The photo is now available in the media 
          library for content teams to discover and use.
        `,
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/admin/media/upload',
          payload: {
            file: '[FILE: ceremony-photo.jpg]',
            'altText[en]': 'Government officials at Community Development Program ceremony',
            'altText[ne]': 'सामुदायिक विकास कार्यक्रम समारोहमा सरकारी अधिकारीहरू',
            'caption[en]': 'Chief District Officer presenting awards to community leaders during the annual ceremony',
            'caption[ne]': 'प्रमुख जिल्ला अधिकारीले वार्षिक समारोहमा समुदायिक नेताहरूलाई पुरस्कार प्रदान गर्दै',
            'isActive': 'true'
          },
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      };
    })
    
    // Step 4: Verify uploaded photo
    .step('verify-uploaded-photo', async (persona, context) => {
      const response = await context.request
        .get(`/api/v1/admin/media/${context.testData.firstPhotoId}`)
        .set('Authorization', `Bearer ${context.testData.authToken}`);

      return {
        narrative: 'Priya verifies that her uploaded photo has all the correct metadata and is properly stored',
        expectation: 'Should see the photo details with bilingual captions and proper file information',
        response,
        explanation: `
          Priya confirms that her photo was uploaded correctly with all metadata intact. 
          The system shows the file size, dimensions, and both English and Nepali 
          descriptions. The photo is active and ready for use by content teams.
        `,
        apiCall: {
          method: 'GET',
          endpoint: `/api/v1/admin/media/${context.testData.firstPhotoId}`,
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`
          }
        }
      };
    })
    
    // Step 5: Create album for event photos
    .step('create-event-album', async (persona, context) => {
      const response = await context.request
        .post('/api/v1/albums')
        .set('Authorization', `Bearer ${context.testData.authToken}`)
        .send({
          name: {
            en: 'Community Development Program 2024',
            ne: '२०२४ सामुदायिक विकास कार्यक्रम'
          },
          description: {
            en: 'Photos from the annual Community Development Program ceremony showcasing government and community collaboration',
            ne: 'सरकार र समुदायको सहकार्यलाई देखाउने वार्षिक सामुदायिक विकास कार्यक्रम समारोहका तस्बिरहरू'
          },
          isActive: true
        });

      context.testData.albumId = response.body.data?.id;

      return {
        narrative: 'Priya creates a dedicated album to organize all photos from the Community Development Program',
        expectation: 'Album should be created with bilingual name and description, ready to hold event photos',
        response,
        explanation: `
          Priya creates a dedicated album for the event photos. This helps organize the 
          content and makes it easier for visitors and content teams to find related 
          photos. The album has descriptive names in both languages and provides context 
          about the event.
        `,
        apiCall: {
          method: 'POST',
          endpoint: '/api/v1/albums',
          payload: {
            name: {
              en: 'Community Development Program 2024',
              ne: '२०२४ सामुदायिक विकास कार्यक्रम'
            },
            description: {
              en: 'Photos from the annual Community Development Program ceremony showcasing government and community collaboration',
              ne: 'सरकार र समुदायको सहकार्यलाई देखाउने वार्षिक सामुदायिक विकास कार्यक्रम समारोहका तस्बिरहरू'
            },
            isActive: true
          },
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`
          }
        }
      };
    })
    
    // Step 6: Add photo to album
    .step('add-photo-to-album', async (persona, context) => {
      const response = await context.request
        .post(`/api/v1/albums/${context.testData.albumId}/media/${context.testData.firstPhotoId}`)
        .set('Authorization', `Bearer ${context.testData.authToken}`);

      return {
        narrative: 'Priya adds her uploaded photo to the newly created event album',
        expectation: 'Photo should be successfully associated with the album and organized properly',
        response,
        explanation: `
          Priya links her uploaded photo to the event album. This creates a logical 
          organization that allows visitors to browse all photos from the event in 
          one place. The photo is now part of the structured gallery for this event.
        `,
        apiCall: {
          method: 'POST',
          endpoint: `/api/v1/albums/${context.testData.albumId}/media/${context.testData.firstPhotoId}`,
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`
          }
        }
      };
    })
    
    // Step 7: Search for the uploaded content
    .step('search-uploaded-content', async (persona, context) => {
      const response = await context.request
        .get('/api/v1/admin/media/search')
        .set('Authorization', `Bearer ${context.testData.authToken}`)
        .query({ q: 'Community Development' });

      return {
        narrative: 'Priya searches for her uploaded content to ensure it can be discovered easily',
        expectation: 'Should find the uploaded photo and album when searching for event-related keywords',
        response,
        explanation: `
          Priya tests the search functionality to ensure her content can be found easily. 
          The search returns her uploaded photo and album when searching for relevant 
          keywords, confirming that the metadata and organization are working correctly.
        `,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/admin/media/search',
          query: { q: 'Community Development' },
          headers: {
            'Authorization': `Bearer ${context.testData.authToken}`
          }
        }
      };
    })
    
    // Step 8: Check media statistics
    .step('check-media-statistics', async (persona, context) => {
      const response = await context.request
        .get('/api/v1/admin/media/statistics')
        .set('Authorization', `Bearer ${context.testData.authToken}`);

      return {
        narrative: 'Priya checks the overall media statistics to see how her uploads contribute to the system',
        expectation: 'Should see updated statistics reflecting the new photo upload and storage usage',
        response,
        explanation: `
          Priya reviews the system statistics to understand the current state of media 
          storage and to ensure her uploads are contributing appropriately to the 
          overall media library. This helps her plan future uploads and storage needs.
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
    
    .run();
} 