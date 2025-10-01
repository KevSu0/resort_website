import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a default brand
  const brand = await prisma.brand.upsert({
    where: { slug: 'resort-cms' },
    update: {},
    create: {
      name: 'Resort CMS',
      slug: 'resort-cms',
      description: 'Enterprise Resort Management System',
      primaryColor: '#2563eb',
      secondaryColor: '#ffffff',
      accentColor: '#f59e0b',
      isActive: true,
    },
  });

  console.log(`✅ Created brand: ${brand.name}`);

  // Create a default site
  const site = await prisma.site.upsert({
    where: {
      brandId_slug: {
        brandId: brand.id,
        slug: 'main-site'
      }
    },
    update: {},
    create: {
      brandId: brand.id,
      name: 'Main Resort Site',
      slug: 'main-site',
      title: 'Luxury Resort & Spa',
      description: 'Experience luxury and relaxation at our world-class resort',
      language: 'en',
      timezone: 'UTC',
      isActive: true,
      isDefault: true,
      theme: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1e293b',
      },
      settings: {
        contactEmail: 'info@luxuryresort.com',
        contactPhone: '+1-555-RESORT',
        address: '123 Paradise Beach, Maldives',
        socialMedia: {
          facebook: 'https://facebook.com/luxuryresort',
          instagram: 'https://instagram.com/luxuryresort',
          twitter: 'https://twitter.com/luxuryresort',
        },
      },
    },
  });

  console.log(`✅ Created site: ${site.name}`);

  // Create super admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@resort-cms.com' },
    update: {},
    create: {
      email: 'admin@resort-cms.com',
      username: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      passwordHash: hashedPassword,
      brandId: brand.id,
      preferences: {
        language: 'en',
        timezone: 'UTC',
        theme: 'light',
        notifications: {
          email: true,
          browser: true,
        },
      },
    },
  });

  console.log(`✅ Created super admin user: ${superAdmin.email}`);

  // Create site admin user
  const siteAdminPassword = await bcrypt.hash('siteadmin123', 12);
  const siteAdmin = await prisma.user.upsert({
    where: { email: 'siteadmin@resort-cms.com' },
    update: {},
    create: {
      email: 'siteadmin@resort-cms.com',
      username: 'siteadmin',
      firstName: 'Site',
      lastName: 'Admin',
      role: 'SITE_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      passwordHash: siteAdminPassword,
      brandId: brand.id,
      preferences: {
        language: 'en',
        timezone: 'UTC',
        theme: 'light',
        notifications: {
          email: true,
          browser: true,
        },
      },
    },
  });

  console.log(`✅ Created site admin user: ${siteAdmin.email}`);

  // Assign users to the site
  await prisma.siteUser.upsert({
    where: {
      userId_siteId: {
        userId: superAdmin.id,
        siteId: site.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      siteId: site.id,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  await prisma.siteUser.upsert({
    where: {
      userId_siteId: {
        userId: siteAdmin.id,
        siteId: site.id,
      },
    },
    update: {},
    create: {
      userId: siteAdmin.id,
      siteId: site.id,
      role: 'SITE_ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Assigned users to site`);

  // Create default navigation
  const mainNavigation = await prisma.navigation.create({
    data: {
      siteId: site.id,
      name: 'Main Navigation',
      handle: 'main',
      description: 'Primary site navigation menu',
      structure: [],
      isActive: true,
    },
  });

  console.log(`✅ Created main navigation: ${mainNavigation.name}`);

  // Create default navigation items
  const homePage = await prisma.page.create({
    data: {
      siteId: site.id,
      title: 'Home',
      slug: 'home',
      path: '/',
      content: {
        hero: {
          title: 'Welcome to Paradise',
          subtitle: 'Experience luxury redefined',
          backgroundImage: '/images/hero-bg.jpg',
        },
        features: [
          {
            title: 'Luxury Suites',
            description: 'Spacious accommodations with ocean views',
            icon: 'bed',
          },
          {
            title: 'World-Class Spa',
            description: 'Rejuvenate your body and soul',
            icon: 'spa',
          },
          {
            title: 'Fine Dining',
            description: 'Culinary excellence from renowned chefs',
            icon: 'restaurant',
          },
        ],
      },
      metaTitle: 'Luxury Resort & Spa - Home',
      metaDescription: 'Experience luxury and relaxation at our world-class resort',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      publishedAt: new Date(),
      sortOrder: 0,
    },
  });

  console.log(`✅ Created home page: ${homePage.title}`);

  // Add navigation items
  await prisma.navigationItem.createMany({
    data: [
      {
        navigationId: mainNavigation.id,
        pageId: homePage.id,
        label: 'Home',
        url: '/',
        order: 1,
        isActive: true,
      },
      {
        navigationId: mainNavigation.id,
        label: 'About',
        url: '/about',
        order: 2,
        isActive: true,
      },
      {
        navigationId: mainNavigation.id,
        label: 'Accommodations',
        url: '/accommodations',
        order: 3,
        isActive: true,
      },
      {
        navigationId: mainNavigation.id,
        label: 'Dining',
        url: '/dining',
        order: 4,
        isActive: true,
      },
      {
        navigationId: mainNavigation.id,
        label: 'Spa & Wellness',
        url: '/spa',
        order: 5,
        isActive: true,
      },
      {
        navigationId: mainNavigation.id,
        label: 'Contact',
        url: '/contact',
        order: 6,
        isActive: true,
      },
    ],
  });

  console.log(`✅ Created navigation items`);

  // Create brand settings
  await prisma.brandSetting.createMany({
    data: [
      {
        brandId: brand.id,
        key: 'company.name',
        value: 'Luxury Resort International',
        description: 'Official company name',
        isPublic: true,
      },
      {
        brandId: brand.id,
        key: 'company.email',
        value: 'contact@luxuryresort.com',
        description: 'Main contact email',
        isPublic: true,
      },
      {
        brandId: brand.id,
        key: 'company.phone',
        value: '+1-555-RESORT',
        description: 'Main contact phone',
        isPublic: true,
      },
      {
        brandId: brand.id,
        key: 'seo.default_title',
        value: 'Luxury Resort & Spa - Experience Paradise',
        description: 'Default SEO title',
        isPublic: true,
      },
      {
        brandId: brand.id,
        key: 'seo.default_description',
        value: 'Experience luxury and relaxation at our world-class resort destination',
        description: 'Default SEO description',
        isPublic: true,
      },
    ],
  });

  console.log(`✅ Created brand settings`);

  // Create site settings
  await prisma.siteSetting.createMany({
    data: [
      {
        siteId: site.id,
        key: 'site.timezone',
        value: 'UTC',
        description: 'Site timezone',
        isPublic: false,
      },
      {
        siteId: site.id,
        key: 'site.language',
        value: 'en',
        description: 'Default site language',
        isPublic: true,
      },
      {
        siteId: site.id,
        key: 'contact.email',
        value: 'info@luxuryresort.com',
        description: 'Contact email',
        isPublic: true,
      },
      {
        siteId: site.id,
        key: 'contact.phone',
        value: '+1-555-RESORT',
        description: 'Contact phone',
        isPublic: true,
      },
      {
        siteId: site.id,
        key: 'social.facebook',
        value: 'https://facebook.com/luxuryresort',
        description: 'Facebook URL',
        isPublic: true,
      },
      {
        siteId: site.id,
        key: 'social.instagram',
        value: 'https://instagram.com/luxuryresort',
        description: 'Instagram URL',
        isPublic: true,
      },
    ],
  });

  console.log(`✅ Created site settings`);

  // Create a sample workflow
  const contentApprovalWorkflow = await prisma.workflow.create({
    data: {
      siteId: site.id,
      name: 'Content Approval Workflow',
      description: 'Standard content approval process for all pages',
      definition: {
        steps: [
          {
            name: 'Draft Review',
            description: 'Initial review of the content draft',
            assignedRole: 'EDITOR',
            required: true,
          },
          {
            name: 'Editorial Review',
            description: 'Detailed editorial review and fact-checking',
            assignedRole: 'EDITOR',
            required: true,
          },
          {
            name: 'Final Approval',
            description: 'Final approval by site administrator',
            assignedRole: 'SITE_ADMIN',
            required: true,
          },
        ],
      },
      isActive: true,
    },
  });

  console.log(`✅ Created content approval workflow: ${contentApprovalWorkflow.name}`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('Super Admin: admin@resort-cms.com / admin123');
  console.log('Site Admin: siteadmin@resort-cms.com / siteadmin123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });