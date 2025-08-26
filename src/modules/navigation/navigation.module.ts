import { Module } from '@nestjs/common';
import { PublicNavigationController } from './controllers/public-navigation.controller';
import { AdminNavigationController } from './controllers/admin-navigation.controller';
import { MenuService } from './services/menu.service';
import { MenuItemService } from './services/menu-item.service';
import { MenuRepository } from './repositories/menu.repository';
import { MenuItemRepository } from './repositories/menu-item.repository';
import { ContentManagementModule } from '../content-management/content-management.module';

@Module({
  imports: [ContentManagementModule],
  controllers: [PublicNavigationController, AdminNavigationController],
  providers: [MenuService, MenuItemService, MenuRepository, MenuItemRepository],
  exports: [MenuService, MenuItemService],
})
export class NavigationModule {} 