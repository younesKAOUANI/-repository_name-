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

    // 5. Create modules, lessons and question bank for 3rd year
    console.log('\n📘 Creating modules, lessons and questions for 3rd year...');
    const thirdYear = studyYears[2]; // zero-based: index 2 is 3rd year
    if (thirdYear) {
      // Create 3 modules
      const moduleNames = ['Pharmacology', 'Pathology', 'Microbiology'];
      const createdModules = [];
      for (const modName of moduleNames) {
        let mod = await prisma.module.findFirst({ where: { name: modName } });
        if (!mod) {
          // attach to first semester of 3rd year
          const sem = await prisma.semester.findFirst({ where: { studyYearId: thirdYear.id } });
          mod = await prisma.module.create({
            data: {
              id: createId(),
              name: modName,
              semesterId: sem ? sem.id : semesters[0].id,
            },
          });
          console.log(`✅ Module created: ${mod.name}`);
        } else {
          console.log(`ℹ️ Module exists: ${mod.name}`);
        }
        createdModules.push(mod);
      }

      // Create one lesson per module
      const createdLessons = [];
      for (const mod of createdModules) {
        const lessonTitle = `${mod.name} - Introduction`;
        let lesson = await prisma.lesson.findFirst({ where: { title: lessonTitle } });
        if (!lesson) {
          lesson = await prisma.lesson.create({
            data: {
              id: createId(),
              title: lessonTitle,
              moduleId: mod.id,
              description: `Introductory lesson for ${mod.name}`,
            },
          });
          console.log(`✅ Lesson created: ${lesson.title}`);
        } else {
          console.log(`ℹ️ Lesson exists: ${lesson.title}`);
        }
        createdLessons.push(lesson);
      }

      // Create 5 question bank items for 3rd year, each with the same placeholder image
      const placeholderImage = '/uploads/schemas/1761512473276-32x32.png';
      const questions = [
        'What is the mechanism of action of beta-blockers?',
        'Describe the stages of inflammation.',
        'Name three gram-negative bacteria.',
        'Explain the difference between bactericidal and bacteriostatic drugs.',
        'List the side effects of corticosteroids.'
      ];

      for (let i = 0; i < questions.length; i++) {
        const text = questions[i];
        const qType = i % 2 === 0 ? 'QCMA' : 'QROC';
        // assign to module/lesson in round-robin
        const mod = createdModules[i % createdModules.length];
        const lesson = createdLessons[i % createdLessons.length];

        const exists = await prisma.questionBank.findFirst({ where: { text } });
        if (!exists) {
          await prisma.questionBank.create({
            data: {
              id: createId(),
              text,
              questionType: qType,
              lessonId: lesson ? lesson.id : null,
              moduleId: mod ? mod.id : null,
              explanation: 'See lecture notes',
              explanationImg: placeholderImage,
              questionImage: placeholderImage,
              studyYearId: thirdYear.id,
              isActive: true,
            },
          });
          console.log(`✅ Question created: ${text}`);
        } else {
          console.log(`ℹ️ Question exists: ${text}`);
        }
      }
    } else {
      console.log('⚠️ 3rd study year not found; skipping module/question seeding');
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
