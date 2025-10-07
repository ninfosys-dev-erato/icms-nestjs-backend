// Note: PrismaClient import error will be resolved after running: npm run db:generate
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin@123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@icms.gov.np' },
    update: {},
    create: {
      email: 'admin@icms.gov.np',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create default global translations
  const defaultTranslations = [
    {
      key: 'welcome_message',
      enValue: 'Welcome to ICMS',
      neValue: 'ICMS मा स्वागत छ',
      groupName: 'common',
    },
    {
      key: 'home',
      enValue: 'Home',
      neValue: 'गृह',
      groupName: 'navigation',
    },
    {
      key: 'about',
      enValue: 'About',
      neValue: 'हाम्रो बारेमा',
      groupName: 'navigation',
    },
    {
      key: 'contact',
      enValue: 'Contact',
      neValue: 'सम्पर्क',
      groupName: 'navigation',
    },
    {
      key: 'news',
      enValue: 'News',
      neValue: 'समाचार',
      groupName: 'navigation',
    },
    {
      key: 'publications',
      enValue: 'Publications',
      neValue: 'प्रकाशनहरू',
      groupName: 'navigation',
    },
    {
      key: 'downloads',
      enValue: 'Downloads',
      neValue: 'डाउनलोडहरू',
      groupName: 'navigation',
    },
    {
      key: 'legal_documents',
      enValue: 'Legal Documents',
      neValue: 'कानूनी कागजातहरू',
      groupName: 'content',
    },
  ];

  for (const translation of defaultTranslations) {
    await prisma.globalTranslation.upsert({
      where: { key: translation.key },
      update: {},
      create: translation,
    });
  }

  console.log('✅ Default translations created');

  // Create default categories
  const defaultCategories = [
    {
      name: { en: 'Legal Documents', ne: 'कानूनी कागजातहरू' },
      description: { en: 'Official legal documents and policies', ne: 'आधिकारिक कानूनी कागजातहरू र नीतिहरू' },
      slug: 'legal-documents',
      order: 1,
    },
    {
      name: { en: 'News & Information', ne: 'समाचार र जानकारी' },
      description: { en: 'Latest news and announcements', ne: 'नयाँ समाचार र घोषणाहरू' },
      slug: 'news-information',
      order: 2,
    },
    {
      name: { en: 'Publications', ne: 'प्रकाशनहरू' },
      description: { en: 'Official publications and reports', ne: 'आधिकारिक प्रकाशनहरू र प्रतिवेदनहरू' },
      slug: 'publications',
      order: 3,
    },
    {
      name: { en: 'Downloads', ne: 'डाउनलोडहरू' },
      description: { en: 'Downloadable documents and resources', ne: 'डाउनलोड गर्न सकिने कागजातहरू र स्रोतहरू' },
      slug: 'downloads',
      order: 4,
    },
  ];

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Default categories created');

  // Create default office settings
  const officeSettings = await prisma.officeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      directorate: { en: 'Ministry of Information and Communications', ne: 'सूचना तथा सञ्चार मन्त्रालय' },
      officeName: { en: 'Department of Information Technology', ne: 'सूचना प्रविधि विभाग' },
      officeAddress: { en: 'Singha Durbar, Kathmandu, Nepal', ne: 'सिंहदरबार, काठमाडौं, नेपाल' },
      email: 'info@icms.gov.np',
      phoneNumber: { en: '+977-1-4211000', ne: '+९७७-१-४२११०००' },
      website: 'https://icms.gov.np',
    },
  });

  console.log('✅ Default office settings created');

  // Create default office descriptions
  const officeDescriptions = [
    {
      officeDescriptionType: 'INTRODUCTION',
      content: {
        en: 'Welcome to the Department of Information Technology. We are committed to providing efficient and transparent services to the citizens of Nepal.',
        ne: 'सूचना प्रविधि विभागमा स्वागत छ। हामी नेपालका नागरिकहरूलाई कुशल र पारदर्शी सेवाहरू प्रदान गर्न प्रतिबद्ध छौं।',
      },
    },
    {
      officeDescriptionType: 'OBJECTIVE',
      content: {
        en: 'Our objective is to modernize government services through the effective use of information technology.',
        ne: 'हाम्रो उद्देश्य सूचना प्रविधिको प्रभावकारी प्रयोग मार्फत सरकारी सेवाहरूलाई आधुनिकीकरण गर्नु हो।',
      },
    },
  ];

  for (const description of officeDescriptions) {
    // Check if description already exists
    const existing = await prisma.officeDescription.findFirst({
      where: {
        officeDescriptionType: description.officeDescriptionType as any,
      },
    });

    if (existing) {
      // Update existing
      await prisma.officeDescription.update({
        where: { id: existing.id },
        data: description as any,
      });
    } else {
      // Create new
      await prisma.officeDescription.create({
        data: description as any,
      });
    }
  }

  console.log('✅ Default office descriptions created');

  // Create default important links
  const importantLinks = [
    {
      linkTitle: { en: 'Government Portal', ne: 'सरकारी पोर्टल' },
      linkUrl: 'https://nepal.gov.np',
      order: 1,
    },
    {
      linkTitle: { en: 'Ministry Website', ne: 'मन्त्रालयको वेबसाइट' },
      linkUrl: 'https://moic.gov.np',
      order: 2,
    },
    {
      linkTitle: { en: 'National Portal', ne: 'राष्ट्रिय पोर्टल' },
      linkUrl: 'https://nepal.gov.np',
      order: 3,
    },
  ];

  for (const link of importantLinks) {
    await prisma.importantLink.create({
      data: link,
    });
  }

  console.log('✅ Default important links created');

  // Create default FAQ
  const defaultFaqs = [
    {
      question: { en: 'How can I contact the department?', ne: 'म विभागसँग कसरी सम्पर्क गर्न सक्छु?' },
      answer: { en: 'You can contact us through email at info@icms.gov.np or call us at +977-1-4211000.', ne: 'तपाईंले info@icms.gov.np मा इमेल मार्फत वा +९७७-१-४२११००० मा फोन गरेर हामीसँग सम्पर्क गर्न सक्नुहुन्छ।' },
      order: 1,
    },
    {
      question: { en: 'What services do you provide?', ne: 'तपाईंले के के सेवाहरू प्रदान गर्नुहुन्छ?' },
      answer: { en: 'We provide various IT services including digital transformation, e-governance, and technology consulting.', ne: 'हामीले डिजिटल परिवर्तन, इ-शासन, र प्रविधि परामर्श सहित विभिन्न आईटी सेवाहरू प्रदान गर्दछौं।' },
      order: 2,
    },
  ];

  for (const faq of defaultFaqs) {
    await prisma.fAQ.create({
      data: faq,
    });
  }

  console.log('✅ Default FAQs created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 