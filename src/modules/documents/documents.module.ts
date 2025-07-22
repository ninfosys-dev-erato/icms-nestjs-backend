import { Module } from '@nestjs/common';
import { PublicDocumentController } from './controllers/public-document.controller';
import { AdminDocumentController } from './controllers/admin-document.controller';
import { DocumentService } from './services/document.service';
import { DocumentRepository } from './repositories/document.repository';
import { DocumentDownloadRepository } from './repositories/document-download.repository';
import { DocumentVersionRepository } from './repositories/document-version.repository';
import { S3Service } from '../media/services/s3.service';

@Module({
  controllers: [
    PublicDocumentController,
    AdminDocumentController
  ],
  providers: [
    DocumentService,
    DocumentRepository,
    DocumentDownloadRepository,
    DocumentVersionRepository,
    S3Service
  ],
  exports: [
    DocumentService,
    DocumentRepository,
    DocumentDownloadRepository,
    DocumentVersionRepository
  ],
})
export class DocumentsModule {} 