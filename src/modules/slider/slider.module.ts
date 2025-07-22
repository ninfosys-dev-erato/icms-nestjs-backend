import { Module } from '@nestjs/common';
import { PublicSliderController } from './controllers/public-slider.controller';
import { AdminSliderController } from './controllers/admin-slider.controller';
import { SliderService } from './services/slider.service';
import { SliderRepository } from './repositories/slider.repository';

@Module({
  controllers: [
    PublicSliderController,
    AdminSliderController
  ],
  providers: [
    SliderService,
    SliderRepository
  ],
  exports: [
    SliderService,
    SliderRepository
  ],
})
export class SliderModule {} 