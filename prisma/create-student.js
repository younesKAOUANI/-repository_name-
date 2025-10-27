const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { createId } = require('@paralleldrive/cuid2');

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('password123', 10);

  const student = await prisma.user.upsert({
    where: { email: 'student@pharmapedia.com' },
    update: {
      password: hashed,
      name: 'Student User',
      role: 'STUDENT',
      year: 3
    },
    create: {
      id: createId(),
      email: 'student@pharmapedia.com',
      name: 'Student User',
      role: 'STUDENT',
      password: hashed,
      emailVerified: new Date(),
      year: 3,
      sex: 'MALE'
    }
  });

  console.log('✅ Student upserted:', student.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
