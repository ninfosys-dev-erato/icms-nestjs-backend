import { Module } from '@nestjs/common';
import { PublicSliderController } from './controllers/public-slider.controller';
import { AdminSliderController } from './controllers/admin-slider.controller';
import { SliderService } from './services/slider.service';
import { SliderRepository } from './repositories/slider.repository';
import { SliderClickRepository } from './repositories/slider-click.repository';
import { SliderViewRepository } from './repositories/slider-view.repository';
import { DatabaseModule } from '../../database/database.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [DatabaseModule, MediaModule],
  controllers: [
    PublicSliderController,
    AdminSliderController
  ],
  providers: [
    SliderService,
    SliderRepository,
    SliderClickRepository,
    SliderViewRepository
  ],
  exports: [
    SliderService,
    SliderRepository,
    SliderClickRepository,
    SliderViewRepository
  ],
})
export class SliderModule {} 