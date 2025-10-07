import { Module } from '@nestjs/common';
import { FileStorageModule } from '../../common/services/file-storage/file-storage.module';

import { CategoryController } from './controllers/category.controller';
import { AdminCategoryController } from './controllers/admin-category.controller';
import { ContentController } from './controllers/content.controller';
import { AdminContentController } from './controllers/admin-content.controller';
import { ContentAttachmentController } from './controllers/content-attachment.controller';

import { CategoryService } from './services/category.service';
import { ContentService } from './services/content.service';
import { ContentAttachmentService } from './services/content-attachment.service';

import { CategoryRepository } from './repositories/category.repository';
import { ContentRepository } from './repositories/content.repository';
import { ContentAttachmentRepository } from './repositories/content-attachment.repository';

@Module({
  imports: [FileStorageModule],
  controllers: [
    CategoryController,
    AdminCategoryController,
    ContentController,
    AdminContentController,
    ContentAttachmentController,
  ],
  providers: [
    CategoryService,
    ContentService,
    ContentAttachmentService,
    CategoryRepository,
    ContentRepository,
    ContentAttachmentRepository,
  ],
  exports: [CategoryService, ContentService, ContentAttachmentService],
})
export class ContentManagementModule {} 