import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function keepOnlyAdmin() {
  const deleted = await prisma.user.deleteMany({
    where: {
      username: { not: 'admin' }
    }
  });
  console.log(`Deleted ${deleted.count} users. Preserved admin user.`);
  const remaining = await prisma.user.findMany();
  console.log('Remaining Users:', remaining.map(u => ({ id: u.id, username: u.username, email: u.email })));
  await prisma.$disconnect();
}

keepOnlyAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
