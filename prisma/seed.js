const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { createId } = require('@paralleldrive/cuid2');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting minimal database seeding...');

    // Check if database is accessible
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Hash password for admin account
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Admin User Only
    console.log('👥 Creating admin account...');
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@pharmapedia.com' },
      update: {},
      create: {
        id: createId(),
        email: 'admin@pharmapedia.com',
        name: 'Administrator',
        role: Role.ADMIN,
        password: hashedPassword,
        emailVerified: new Date(),
        university: 'Université d\'Alger - Faculté de Pharmacie',
        year: null,
        sex: 'MALE',
        phoneNumber: '+213 555 000 000',
      },
    });
    console.log(`✅ Admin: ${admin.name} (${admin.email})`);

    // 2. Create Study Years (1-6)
    console.log('\n📚 Creating study years...');
    
    const studyYears = [];
    for (let i = 1; i <= 6; i++) {
      const studyYear = await prisma.studyYear.create({
        data: {
          id: createId(),
          name: `${i}${i === 1 ? 'ère' : 'ème'} année Pharmacie`,
        },
      });
      studyYears.push(studyYear);
      console.log(`✅ Study Year: ${studyYear.name}`);
    }

    // 3. Create Semesters (2 per year)
    console.log('\n📆 Creating semesters...');
    
    const semesters = [];
    for (const studyYear of studyYears) {
      for (let sem = 1; sem <= 2; sem++) {
        const semester = await prisma.semester.create({
          data: {
            id: createId(),
            name: `Semestre ${sem}`,
            studyYearId: studyYear.id,
          },
        });
        semesters.push(semester);
        console.log(`✅ Semester: ${semester.name} - ${studyYear.name}`);
      }
    }

    // 4. Create Universities (Alger and Constantine only)
    console.log('\n🏛️ Creating universities...');
    
    const universities = [
      {
        name: 'Université d\'Alger - Faculté de Pharmacie',
      },
      {
        name: 'Université de Constantine - Faculté de Pharmacie',
      },
    ];

    for (const uniData of universities) {
      const university = await prisma.university.create({
        data: {
          id: createId(),
          ...uniData,
        },
      });
      console.log(`✅ University: ${university.name}`);
    }

    console.log('\n🎉 MINIMAL DATABASE SEEDING COMPLETED!');
    console.log('\n📊 SUMMARY:');
    console.log('==============================================');
    console.log(`👥 Admin Users: 1`);
    console.log(`📚 Study Years: ${studyYears.length} (1st to 6th year)`);
    console.log(`📆 Semesters: ${semesters.length} (2 per year)`);
    console.log(`🏛️ Universities: 2 (Alger, Constantine)`);
    console.log('==============================================');
    
    console.log('\n🔑 ADMIN CREDENTIALS:');
    console.log('==============================================');
    console.log('Email: admin@pharmapedia.com');
    console.log('Password: password123');
    console.log('==============================================');

    console.log('\n✅ Database ready for production!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
