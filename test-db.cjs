const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing database connection...');

    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);

    const brands = await prisma.brand.findMany();
    console.log('✅ Brands count:', brands.length);

    const sites = await prisma.site.findMany();
    console.log('✅ Sites count:', sites.length);

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();