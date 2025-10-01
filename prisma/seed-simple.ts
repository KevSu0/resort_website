import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple database seeding...');

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
    },
  });

  console.log(`✅ Created site: ${site.name}`);

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

  console.log('🎉 Simple database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });