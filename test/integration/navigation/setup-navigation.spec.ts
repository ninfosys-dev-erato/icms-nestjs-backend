import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { MenuLocation } from '@prisma/client';
import { MenuItemType } from '../../../src/modules/navigation/entities/menu-item.entity';

describe('Navigation Module Setup', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  const cleanupDatabase = async () => {
    await prisma.menuItem.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.user.deleteMany();
  };

  describe('Database Setup', () => {
    it('should have clean database', async () => {
      const menuCount = await prisma.menu.count();
      const menuItemCount = await prisma.menuItem.count();
      const userCount = await prisma.user.count();

      expect(menuCount).toBe(0);
      expect(menuItemCount).toBe(0);
      expect(userCount).toBe(0);
    });
  });

  describe('Test Data Creation', () => {
    it('should create test users', async () => {
      // Create regular user
      const regularUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: '$2b$10$test',
          firstName: 'Test',
          lastName: 'User',
          role: 'VIEWER',
          isActive: true,
        },
      });

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: '$2b$10$test',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
        },
      });

      expect(regularUser).toBeDefined();
      expect(regularUser.email).toBe('test@example.com');
      expect(regularUser.role).toBe('USER');

      expect(adminUser).toBeDefined();
      expect(adminUser.email).toBe('admin@example.com');
      expect(adminUser.role).toBe('ADMIN');
    });

    it('should create test menu', async () => {
      const testMenu = await prisma.menu.create({
        data: {
          name: { en: 'Test Menu', ne: 'परीक्षण मेनु' },
          description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
          location: MenuLocation.HEADER,
          isActive: true,
          isPublished: false,
          createdBy: { connect: { email: 'admin@example.com' } },
          updatedBy: { connect: { email: 'admin@example.com' } },
        },
      });

      expect(testMenu).toBeDefined();
      expect((testMenu.name as any).en).toBe('Test Menu');
      expect(testMenu.location).toBe(MenuLocation.HEADER);
      expect(testMenu.isActive).toBe(true);
      expect(testMenu.isPublished).toBe(false);
    });

    it('should create test menu item', async () => {
      const testMenu = await prisma.menu.findFirst({
        where: { name: { path: ['en'], equals: 'Test Menu' } },
      });

      expect(testMenu).toBeDefined();

      const testMenuItem = await prisma.menuItem.create({
        data: {
          menu: { connect: { id: testMenu!.id } },
          title: { en: 'Test Item', ne: 'परीक्षण आइटम' },
          description: { en: 'Test Description', ne: 'परीक्षण विवरण' },
          url: '/test',
          target: 'self',
          icon: 'test-icon',
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdBy: { connect: { email: 'admin@example.com' } },
          updatedBy: { connect: { email: 'admin@example.com' } },
        },
      });

      expect(testMenuItem).toBeDefined();
      expect((testMenuItem.title as any).en).toBe('Test Item');
      expect(testMenuItem.menuId).toBe(testMenu!.id);
      expect(testMenuItem.itemType).toBe(MenuItemType.LINK);
      expect(testMenuItem.isActive).toBe(true);
      expect(testMenuItem.isPublished).toBe(true);
    });

    it('should create nested menu items', async () => {
      const testMenu = await prisma.menu.findFirst({
        where: { name: { path: ['en'], equals: 'Test Menu' } },
      });

      const parentItem = await prisma.menuItem.findFirst({
        where: { title: { path: ['en'], equals: 'Test Item' } },
      });

      expect(testMenu).toBeDefined();
      expect(parentItem).toBeDefined();

      const childItem = await prisma.menuItem.create({
        data: {
          menu: { connect: { id: testMenu!.id } },
          parent: { connect: { id: parentItem!.id } },
          title: { en: 'Child Item', ne: 'बाल आइटम' },
          description: { en: 'Child Description', ne: 'बाल विवरण' },
          url: '/test/child',
          target: 'self',
          icon: 'child-icon',
          order: 1,
          isActive: true,
          isPublished: true,
          itemType: MenuItemType.LINK,
          createdBy: { connect: { email: 'admin@example.com' } },
          updatedBy: { connect: { email: 'admin@example.com' } },
        },
      });

      expect(childItem).toBeDefined();
      expect((childItem.title as any).en).toBe('Child Item');
      expect(childItem.parentId).toBe(parentItem!.id);
      expect(childItem.menuId).toBe(testMenu!.id);
    });

    it('should create multiple menus for different locations', async () => {
      const footerMenu = await prisma.menu.create({
        data: {
          name: { en: 'Footer Menu', ne: 'फुटर मेनु' },
          description: { en: 'Footer Description', ne: 'फुटर विवरण' },
          location: MenuLocation.FOOTER,
          isActive: true,
          isPublished: true,
          createdBy: { connect: { email: 'admin@example.com' } },
          updatedBy: { connect: { email: 'admin@example.com' } },
        },
      });

      const sidebarMenu = await prisma.menu.create({
        data: {
          name: { en: 'Sidebar Menu', ne: 'साइडबार मेनु' },
          description: { en: 'Sidebar Description', ne: 'साइडबार विवरण' },
          location: MenuLocation.SIDEBAR,
          isActive: true,
          isPublished: false,
          createdBy: { connect: { email: 'admin@example.com' } },
          updatedBy: { connect: { email: 'admin@example.com' } },
        },
      });

      expect(footerMenu).toBeDefined();
      expect(footerMenu.location).toBe(MenuLocation.FOOTER);
      expect(footerMenu.isPublished).toBe(true);

      expect(sidebarMenu).toBeDefined();
      expect(sidebarMenu.location).toBe(MenuLocation.SIDEBAR);
      expect(sidebarMenu.isPublished).toBe(false);
    });

    it('should create menu items of different types', async () => {
      const testMenu = await prisma.menu.findFirst({
        where: { name: { path: ['en'], equals: 'Test Menu' } },
      });

      expect(testMenu).toBeDefined();

      const contentItem = await prisma.menuItem.create({
        data: {
          menu: { connect: { id: testMenu!.id } },
          title: { en: 'Content Item', ne: 'सामग्री आइटम' },
          description: { en: 'Content Description', ne: 'सामग्री विवरण' },
          itemType: MenuItemType.CONTENT,
          itemId: 'content-123',
          order: 2,
          isActive: true,
          isPublished: true,
          createdBy: { connect: { email: 'admin@example.com' } },
          updatedBy: { connect: { email: 'admin@example.com' } },
        },
      });

      const pageItem = await prisma.menuItem.create({
        data: {
          menu: { connect: { id: testMenu!.id } },
          title: { en: 'Page Item', ne: 'पृष्ठ आइटम' },
          description: { en: 'Page Description', ne: 'पृष्ठ विवरण' },
          itemType: MenuItemType.PAGE,
          itemId: 'page-456',
          order: 3,
          isActive: true,
          isPublished: true,
          createdBy: { connect: { email: 'admin@example.com' } },
          updatedBy: { connect: { email: 'admin@example.com' } },
        },
      });

      expect(contentItem).toBeDefined();
      expect(contentItem.itemType).toBe(MenuItemType.CONTENT);
      expect(contentItem.itemId).toBe('content-123');

      expect(pageItem).toBeDefined();
      expect(pageItem.itemType).toBe(MenuItemType.PAGE);
      expect(pageItem.itemId).toBe('page-456');
    });
  });

  describe('Data Validation', () => {
    it('should validate menu data structure', async () => {
      const menus = await prisma.menu.findMany({
        include: {
          menuItems: true,
          createdBy: true,
          updatedBy: true,
        },
      });

      expect(menus.length).toBeGreaterThan(0);

      for (const menu of menus) {
        expect(menu.id).toBeDefined();
        expect(menu.name).toBeDefined();
        expect((menu.name as any).en).toBeDefined();
        expect((menu.name as any).ne).toBeDefined();
        expect(menu.location).toBeDefined();
        expect(menu.isActive).toBeDefined();
        expect(menu.isPublished).toBeDefined();
        expect(menu.createdAt).toBeDefined();
        expect(menu.updatedAt).toBeDefined();
        expect(menu.createdBy).toBeDefined();
        expect(menu.updatedBy).toBeDefined();
      }
    });

    it('should validate menu item data structure', async () => {
      const menuItems = await prisma.menuItem.findMany({
        include: {
          menu: true,
          parent: true,
          children: true,
          createdBy: true,
          updatedBy: true,
        },
      });

      expect(menuItems.length).toBeGreaterThan(0);

      for (const item of menuItems) {
        expect(item.id).toBeDefined();
        expect(item.menuId).toBeDefined();
        expect(item.title).toBeDefined();
        expect((item.title as any).en).toBeDefined();
        expect((item.title as any).ne).toBeDefined();
        expect(item.target).toBeDefined();
        expect(item.order).toBeDefined();
        expect(item.isActive).toBeDefined();
        expect(item.isPublished).toBeDefined();
        expect(item.itemType).toBeDefined();
        expect(item.createdAt).toBeDefined();
        expect(item.updatedAt).toBeDefined();
        expect(item.menu).toBeDefined();
        expect(item.createdBy).toBeDefined();
        expect(item.updatedBy).toBeDefined();
      }
    });

    it('should validate hierarchical relationships', async () => {
      const parentItem = await prisma.menuItem.findFirst({
        where: { title: { path: ['en'], equals: 'Test Item' } },
        include: { children: true },
      });

      const childItem = await prisma.menuItem.findFirst({
        where: { title: { path: ['en'], equals: 'Child Item' } },
        include: { parent: true },
      });

      expect(parentItem).toBeDefined();
      expect(parentItem!.children.length).toBeGreaterThan(0);
      expect((parentItem!.children[0].title as any).en).toBe('Child Item');

      expect(childItem).toBeDefined();
      expect(childItem!.parent).toBeDefined();
      expect((childItem!.parent!.title as any).en).toBe('Test Item');
    });
  });

  describe('Cleanup', () => {
    it('should clean up test data', async () => {
      await cleanupDatabase();

      const menuCount = await prisma.menu.count();
      const menuItemCount = await prisma.menuItem.count();
      const userCount = await prisma.user.count();

      expect(menuCount).toBe(0);
      expect(menuItemCount).toBe(0);
      expect(userCount).toBe(0);
    });
  });
}); 