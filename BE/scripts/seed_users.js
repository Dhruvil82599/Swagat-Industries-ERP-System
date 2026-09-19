import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUsers() {
  const hash = await bcrypt.hash('admin123', 10);

  const users = [
    { username: 'admin', email: 'umaretiyadhruvil.2002@gmail.com', fullName: 'Dhruvil Umaretiya', passwordHash: hash, role: 'ADMIN', createdAt: new Date('2026-09-16T10:00:00Z') },
    { username: 'yash', email: 'yashkoyani66@gmail.com', fullName: 'Yash Koyani', passwordHash: hash, role: 'ADMIN', createdAt: new Date('2026-09-19T11:00:00Z') },
    { username: 'nimit', email: 'nimitdesai412@gmail.com', fullName: 'Nimit Desai', passwordHash: hash, role: 'ADMIN', createdAt: new Date('2026-09-19T12:00:00Z') },
    { username: 'darshan', email: 'darshandesai284@gmail.com', fullName: 'Darshan Desai', passwordHash: hash, role: 'ADMIN', createdAt: new Date('2026-09-19T13:00:00Z') },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: { email: u.email, fullName: u.fullName },
      create: u,
    });
  }

  console.log('Successfully seeded 4 User Management accounts!');
  await prisma.$disconnect();
}

seedUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
