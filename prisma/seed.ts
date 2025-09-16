import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for all test accounts
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Admin Account
  console.log('👑 Creating Admin account...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pharmapedia.com' },
    update: {},
    create: {
      email: 'admin@pharmapedia.com',
      name: 'Dr. Sarah Martin',
      role: Role.ADMIN,
      password: hashedPassword,
      emailVerified: new Date(),
      image: null, // Could add a placeholder image URL
      university: 'Université d\'Alger - Faculté de Pharmacie',
      year: null, // Admins don't have a study year
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Admin created: ${admin.name} (${admin.email})`);

  // 2. Create Teacher/Instructor Account
  console.log('👨‍🏫 Creating Teacher account...');
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@pharmapedia.com' },
    update: {},
    create: {
      email: 'teacher@pharmapedia.com',
      name: 'Prof. Ahmed Benali',
      role: Role.INSTRUCTOR,
      password: hashedPassword,
      emailVerified: new Date(),
      image: null,
      university: 'Université d\'Oran - Faculté de Pharmacie',
      year: null, // Teachers don't have a study year
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Teacher created: ${teacher.name} (${teacher.email})`);

  // 3. Create Student Accounts (multiple students with different years)
  console.log('👨‍🎓 Creating Student accounts...');
  
  const students = [
    {
      email: 'student1@pharmapedia.com',
      name: 'Amina Khelifi',
      year: 3,
      university: 'Université d\'Alger - Faculté de Pharmacie',
    },
    {
      email: 'student2@pharmapedia.com',
      name: 'Youcef Meziane',
      year: 4,
      university: 'Université de Constantine - Faculté de Pharmacie',
    },
    {
      email: 'student3@pharmapedia.com',
      name: 'Fatima Boudiaf',
      year: 5,
      university: 'Université d\'Oran - Faculté de Pharmacie',
    },
  ];

  for (const studentData of students) {
    const student = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        email: studentData.email,
        name: studentData.name,
        role: Role.STUDENT,
        password: hashedPassword,
        emailVerified: new Date(),
        image: null,
        university: studentData.university,
        year: studentData.year,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Student created: ${student.name} (${student.email}) - Year ${student.year}`);
  }

  // 4. Create additional sample data if needed (study years, semesters, modules)
  console.log('📚 Creating academic structure...');
  
  // Create study years
  const studyYears = [];
  for (let i = 1; i <= 6; i++) {
    const studyYear = await prisma.studyYear.upsert({
      where: { id: i },
      update: {},
      create: {
        id: i,
        name: `${i}ème année`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    studyYears.push(studyYear);
    console.log(`✅ Study year created: ${studyYear.name}`);
  }

  // Create semesters for each study year
  for (const studyYear of studyYears) {
    for (let sem = 1; sem <= 2; sem++) {
      await prisma.semester.upsert({
        where: { 
          id: (studyYear.id - 1) * 2 + sem 
        },
        update: {},
        create: {
          id: (studyYear.id - 1) * 2 + sem,
          name: `Semestre ${sem}`,
          studyYearId: studyYear.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
    console.log(`✅ Semesters created for ${studyYear.name}`);
  }

  // Create some sample modules
  const sampleModules = [
    { name: 'Pharmacologie Générale', semesterId: 1 },
    { name: 'Chimie Thérapeutique', semesterId: 1 },
    { name: 'Pharmacognosie', semesterId: 2 },
    { name: 'Toxicologie', semesterId: 2 },
    { name: 'Pharmacie Clinique', semesterId: 5 },
    { name: 'Pharmacie Hospitalière', semesterId: 6 },
  ];

  for (const moduleData of sampleModules) {
    await prisma.module.create({
      data: {
        name: moduleData.name,
        semesterId: moduleData.semesterId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Module created: ${moduleData.name}`);
  }

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Accounts Summary:');
  console.log('==========================================');
  console.log('🔑 All accounts use password: "password123"');
  console.log('');
  console.log('👑 ADMIN:');
  console.log('   Email: admin@pharmapedia.com');
  console.log('   Name: Dr. Sarah Martin');
  console.log('   Role: ADMIN');
  console.log('');
  console.log('👨‍🏫 TEACHER:');
  console.log('   Email: teacher@pharmapedia.com');
  console.log('   Name: Prof. Ahmed Benali');
  console.log('   Role: INSTRUCTOR');
  console.log('');
  console.log('👨‍🎓 STUDENTS:');
  console.log('   Email: student1@pharmapedia.com');
  console.log('   Name: Amina Khelifi (3ème année)');
  console.log('   Role: STUDENT');
  console.log('');
  console.log('   Email: student2@pharmapedia.com');
  console.log('   Name: Youcef Meziane (4ème année)');
  console.log('   Role: STUDENT');
  console.log('');
  console.log('   Email: student3@pharmapedia.com');
  console.log('   Name: Fatima Boudiaf (5ème année)');
  console.log('   Role: STUDENT');
  console.log('==========================================');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
