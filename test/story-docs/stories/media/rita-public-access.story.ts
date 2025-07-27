import { StoryBuilder } from '../../framework/story-builder';
import { ritaCitizen } from '../../personas/rita-citizen';
import { publicMediaAccessScenario } from './media-scenarios';

export async function createRitaPublicAccessStory(app: any) {
  return StoryBuilder.create(app)
    .withPersona(ritaCitizen)
    .withScenario(publicMediaAccessScenario)
    .withNarrative(`
      Rita has heard about a recent community development program in her area and 
      wants to see photos from the event. She's also interested in viewing other 
      government activities to stay informed about what's happening in her community.
      
      She visits the government website to browse photo galleries and find visual 
      content that helps her understand government programs and activities.
    `)
    .withTestData({
      searchTerms: ['community development', 'vaccination', 'health program'],
      preferredLanguage: 'ne' // Rita prefers Nepali content
    })
    
    // Step 1: Browse public media without authentication
    .step('browse-public-media', async (persona, context) => {
      const response = await context.request
        .get('/api/v1/media')
        .query({ page: 1, limit: 10 });

      context.testData.availableMedia = response.body.data;

      return {
        narrative: 'Rita visits the government website and browses the public media gallery',
        expectation: 'Should see a collection of photos and videos available to the public',
        response,
        explanation: `
          Rita successfully accesses the public media gallery without needing to log in. 
          The system shows her a collection of government photos and videos that are 
          marked as public content. She can see thumbnail images and basic information 
          about each media item.
        `,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/media',
          query: { page: 1, limit: 10 }
        }
      };
    })
    
    // Step 2: View available albums
    .step('view-public-albums', async (persona, context) => {
      const response = await context.request
        .get('/api/v1/albums/active');

      context.testData.availableAlbums = response.body.data;

      return {
        narrative: 'Rita looks for photo albums to see organized collections of government events',
        expectation: 'Should see active photo albums with names and descriptions in Nepali',
        response,
        explanation: `
          Rita browses the available photo albums to find organized collections of government 
          events. She can see album names and descriptions in both English and Nepali, 
          helping her understand what each album contains. The albums provide a structured 
          way to explore related photos from specific events or programs.
        `,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/albums/active'
        }
      };
    })
    
    // Step 3: Search for specific content
    .step('search-community-photos', async (persona, context) => {
      const response = await context.request
        .get('/api/v1/media/search')
        .query({ q: 'community development' });

      context.testData.searchResults = response.body.data;

      return {
        narrative: 'Rita searches for photos related to community development programs',
        expectation: 'Should find relevant photos with descriptions that match her search terms',
        response,
        explanation: `
          Rita uses the search functionality to find specific content about community 
          development programs. The search system looks through photo captions and 
          descriptions in both languages, returning relevant results that help her 
          find exactly what she's looking for.
        `,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/media/search',
          query: { q: 'community development' }
        }
      };
    })
    
    // Step 4: View specific media item
    .step('view-specific-photo', async (persona, context) => {
      let mediaId = null;
      
      // Try to get a media ID from previous steps
      if (context.testData.searchResults && context.testData.searchResults.length > 0) {
        mediaId = context.testData.searchResults[0].id;
      } else if (context.testData.availableMedia && context.testData.availableMedia.length > 0) {
        mediaId = context.testData.availableMedia[0].id;
      }

      if (mediaId) {
        const response = await context.request
          .get(`/api/v1/media/${mediaId}`);

        return {
          narrative: 'Rita clicks on a specific photo to view it in detail with full descriptions',
          expectation: 'Should see the full image with bilingual captions and context information',
          response,
          explanation: `
            Rita views a specific photo in detail, seeing the full image along with 
            comprehensive descriptions in both English and Nepali. This gives her a 
            complete understanding of what the photo shows and the context of the 
            government activity it documents.
          `,
          apiCall: {
            method: 'GET',
            endpoint: `/api/v1/media/${mediaId}`
          }
        };
      } else {
        // Handle case where no media is available
        return {
          narrative: 'Rita tries to view a specific photo but no media items are currently available',
          expectation: 'Should handle the case gracefully when no media is available',
          response: { status: 200, body: { message: 'No media items available for viewing' } },
          explanation: 'No media items were available for viewing in this test run.'
        };
      }
    })
    
    // Step 5: Access media URL for sharing
    .step('get-photo-url', async (persona, context) => {
      let mediaId = null;
      
      // Try to get a media ID from previous steps
      if (context.testData.searchResults && context.testData.searchResults.length > 0) {
        mediaId = context.testData.searchResults[0].id;
      } else if (context.testData.availableMedia && context.testData.availableMedia.length > 0) {
        mediaId = context.testData.availableMedia[0].id;
      }

      if (mediaId) {
        const response = await context.request
          .get(`/api/v1/media/${mediaId}/url`);

        return {
          narrative: 'Rita gets the direct URL for a photo she wants to share with her family',
          expectation: 'Should receive a direct URL that she can use to share the photo',
          response,
          explanation: `
            Rita obtains a direct URL for a government photo that she wants to share 
            with her family or on social media. The URL provides direct access to the 
            image file, making it easy for her to share interesting government activities 
            with others in her community.
          `,
          apiCall: {
            method: 'GET',
            endpoint: `/api/v1/media/${mediaId}/url`
          }
        };
      } else {
        return {
          narrative: 'Rita tries to get a photo URL but no media items are available',
          expectation: 'Should handle the case when no media is available for URL generation',
          response: { status: 200, body: { message: 'No media available for URL generation' } },
          explanation: 'No media items were available for URL generation in this test run.'
        };
      }
    })
    
    // Step 6: Browse images by type
    .step('browse-images-only', async (persona, context) => {
      const response = await context.request
        .get('/api/v1/media/images')
        .query({ page: 1, limit: 8 });

      return {
        narrative: 'Rita specifically looks for photo content, filtering out videos and documents',
        expectation: 'Should see only image files with thumbnails optimized for quick browsing',
        response,
        explanation: `
          Rita filters the content to see only photographs, which is her preferred way 
          to consume government information. The image gallery shows optimized thumbnails 
          that load quickly on her mobile device, making it easy to browse through 
          multiple photos efficiently.
        `,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/media/images',
          query: { page: 1, limit: 8 }
        }
      };
    })
    
    // Step 7: View album contents
    .step('browse-album-contents', async (persona, context) => {
      let albumId = null;
      
      // Try to get an album ID from available albums
      if (context.testData.availableAlbums && context.testData.availableAlbums.length > 0) {
        albumId = context.testData.availableAlbums[0].id;
      }

      if (albumId) {
        const response = await context.request
          .get(`/api/v1/albums/${albumId}`);

        return {
          narrative: 'Rita explores a specific album to see all photos from a government event',
          expectation: 'Should see an organized collection of photos with event context and descriptions',
          response,
          explanation: `
            Rita explores a complete album showing photos from a specific government 
            event. The album provides organized access to related images with context 
            about the event, helping her understand the full scope of government 
            activities and community engagement.
          `,
          apiCall: {
            method: 'GET',
            endpoint: `/api/v1/albums/${albumId}`
          }
        };
      } else {
        return {
          narrative: 'Rita tries to browse album contents but no albums are currently available',
          expectation: 'Should handle the case when no albums are available',
          response: { status: 200, body: { message: 'No albums available for browsing' } },
          explanation: 'No albums were available for browsing in this test run.'
        };
      }
    })
    
    // Step 8: Search for health-related content
    .step('search-health-content', async (persona, context) => {
      const response = await context.request
        .get('/api/v1/media/search')
        .query({ q: 'vaccination' });

      return {
        narrative: 'Rita searches for health-related content, particularly vaccination programs that affect her community',
        expectation: 'Should find photos and information about health programs and vaccination drives',
        response,
        explanation: `
          Rita searches for health-related content to stay informed about vaccination 
          programs and health services in her area. Finding visual content about these 
          programs helps her understand what services are available and when they might 
          be offered in her community.
        `,
        apiCall: {
          method: 'GET',
          endpoint: '/api/v1/media/search',
          query: { q: 'vaccination' }
        }
      };
    })
    
    .run();
} 