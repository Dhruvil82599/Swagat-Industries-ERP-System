import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showUsers() {
  const users = await prisma.user.findMany({ select: { id: true, username: true, email: true, fullName: true, role: true } });
  console.log('Active Users:', users);
  const invitations = await prisma.userInvitation.findMany();
  console.log('User Invitations:', invitations);
  await prisma.$disconnect();
}

showUsers();
