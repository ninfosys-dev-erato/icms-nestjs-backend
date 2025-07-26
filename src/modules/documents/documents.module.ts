import { Module } from '@nestjs/common';
import { PublicDocumentController } from './controllers/public-document.controller';
import { AdminDocumentController } from './controllers/admin-document.controller';
import { DocumentService } from './services/document.service';
import { DocumentRepository } from './repositories/document.repository';
import { DocumentDownloadRepository } from './repositories/document-download.repository';
import { DocumentVersionRepository } from './repositories/document-version.repository';
import { FileStorageModule } from '../../common/services/file-storage/file-storage.module';

@Module({
  imports: [FileStorageModule],
  controllers: [
    PublicDocumentController,
    AdminDocumentController
  ],
  providers: [
    DocumentService,
    DocumentRepository,
    DocumentDownloadRepository,
    DocumentVersionRepository
  ],
  exports: [
    DocumentService,
    DocumentRepository,
    DocumentDownloadRepository,
    DocumentVersionRepository
  ],
})
export class DocumentsModule {} 