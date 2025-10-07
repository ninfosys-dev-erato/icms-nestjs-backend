import { Scenario } from '../../framework/types';

export const mediaUploadScenario: Scenario = {
  id: 'media-upload-basic',
  title: 'Uploading Event Photos to the Media Library',
  description: `
    A photographer needs to upload photos from a government event to the media library. 
    This involves uploading multiple high-resolution images, adding proper metadata 
    in both English and Nepali, and organizing them for easy discovery by content teams.
  `,
  category: 'Media Management',
  prerequisites: [
    'User has EDITOR or ADMIN role',
    'User is authenticated in the system',
    'High-quality images ready for upload',
    'Image descriptions prepared in both languages'
  ],
  estimatedDuration: '10-15 minutes',
  difficulty: 'MEDIUM'
};

export const albumCreationScenario: Scenario = {
  id: 'album-creation-organization',
  title: 'Creating Photo Albums for Government Events',
  description: `
    An administrator creates photo albums to organize media from different government 
    events and programs. This includes creating albums with multilingual names and 
    descriptions, adding media to albums, and organizing content for public viewing.
  `,
  category: 'Media Organization',
  prerequisites: [
    'User has ADMIN role',
    'Media files already uploaded to the system',
    'Event information and descriptions available',
    'Understanding of content organization structure'
  ],
  estimatedDuration: '15-20 minutes',
  difficulty: 'MEDIUM'
};

export const bulkMediaOperationsScenario: Scenario = {
  id: 'bulk-media-operations',
  title: 'Managing Large Volumes of Media Content',
  description: `
    A media administrator performs bulk operations on media files including batch 
    uploads, bulk metadata updates, mass organization into albums, and system 
    optimization tasks. This scenario covers efficient management of hundreds of files.
  `,
  category: 'System Administration',
  prerequisites: [
    'User has ADMIN role',
    'Large volume of media files ready for processing',
    'System resources available for bulk operations',
    'Backup and recovery procedures in place'
  ],
  estimatedDuration: '25-30 minutes',
  difficulty: 'HARD'
};

export const mediaSearchAndDiscoveryScenario: Scenario = {
  id: 'media-search-discovery',
  title: 'Finding and Accessing Government Media Content',
  description: `
    A citizen or content team member searches for specific media content using 
    various filters and search criteria. This includes browsing albums, searching 
    by keywords, filtering by media type, and accessing media URLs for use.
  `,
  category: 'Content Discovery',
  prerequisites: [
    'Media content available in the system',
    'Search functionality operational',
    'User understands basic search concepts'
  ],
  estimatedDuration: '8-12 minutes',
  difficulty: 'EASY'
};

export const mediaProcessingScenario: Scenario = {
  id: 'media-processing-optimization',
  title: 'Processing and Optimizing Media Files',
  description: `
    A technical administrator processes uploaded media files by resizing images, 
    generating thumbnails, optimizing file sizes, and applying watermarks for 
    official use. This ensures optimal performance and proper branding.
  `,
  category: 'Technical Operations',
  prerequisites: [
    'User has ADMIN role',
    'Raw media files uploaded to system',
    'Processing parameters and standards defined',
    'Sufficient system resources for processing'
  ],
  estimatedDuration: '20-25 minutes',
  difficulty: 'HARD'
};

export const publicMediaAccessScenario: Scenario = {
  id: 'public-media-access',
  title: 'Accessing Government Media as a Citizen',
  description: `
    A citizen visits the government website to view photos and videos from recent 
    events, browse image galleries, and access visual content that helps them 
    stay informed about government activities and community programs.
  `,
  category: 'Public Access',
  prerequisites: [
    'Public media content available',
    'Website accessible to general public',
    'Media properly organized for public viewing'
  ],
  estimatedDuration: '5-8 minutes',
  difficulty: 'EASY'
};

export const mediaStatisticsScenario: Scenario = {
  id: 'media-statistics-reporting',
  title: 'Generating Media Usage and Performance Reports',
  description: `
    An administrator generates comprehensive reports on media usage, storage 
    consumption, popular content, and system performance. This helps in making 
    informed decisions about media management and resource allocation.
  `,
  category: 'Analytics and Reporting',
  prerequisites: [
    'User has ADMIN role',
    'Sufficient media data for meaningful statistics',
    'Reporting system operational',
    'Understanding of key performance metrics'
  ],
  estimatedDuration: '10-15 minutes',
  difficulty: 'MEDIUM'
}; 