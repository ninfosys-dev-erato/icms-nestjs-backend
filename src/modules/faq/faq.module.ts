import { Module } from '@nestjs/common';

import { FAQController } from './controllers/faq.controller';
import { AdminFAQController } from './controllers/admin-faq.controller';

import { FAQService } from './services/faq.service';

import { FAQRepository } from './repositories/faq.repository';

@Module({
  controllers: [
    FAQController,
    AdminFAQController,
  ],
  providers: [
    FAQService,
    FAQRepository,
  ],
  exports: [FAQService],
})
export class FAQModule {} 