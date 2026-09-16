const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';

  console.log(`🌱 Seeding initial admin user: "${adminUsername}"...`);

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      passwordHash,
      role: 'ADMIN'
    },
    create: {
      username: adminUsername,
      passwordHash,
      fullName: 'Swagat ERP Administrator',
      role: 'ADMIN'
    }
  });

  console.log(`🎉 Admin User "${admin.username}" synchronized successfully! (ID: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Error during Prisma seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
