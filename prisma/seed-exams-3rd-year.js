// prisma/seed-exams-3rd-year.js
// JS seed script for exams and question bank questions for 3rd year (runtime-friendly)

async function main() {
  // Create exams for 3rd year as Quiz with type EXAM
  await prisma.quiz.createMany({
    data: [
      { title: 'Pharmacology Final Exam', type: 'EXAM', description: '3rd year pharmacology final', questionCount: 5 },
      { title: 'Pathology Midterm', type: 'EXAM', description: '3rd year pathology midterm', questionCount: 3 },
      { title: 'Microbiology Exam', type: 'EXAM', description: '3rd year microbiology exam', questionCount: 2 },
    ],
    skipDuplicates: true,
  });

  // Create question bank questions for 3rd year (skip duplicates)
  await prisma.questionBank.createMany({
    data: [
      { text: 'What is the mechanism of action of beta-blockers?', questionType: 'QCMA' },
      { text: 'Describe the stages of inflammation.', questionType: 'QROC' },
      { text: 'Name three gram-negative bacteria.', questionType: 'QROC' },
      { text: 'Explain the difference between bactericidal and bacteriostatic drugs.', questionType: 'QROC' },
      { text: 'List the side effects of corticosteroids.', questionType: 'QCMA' },
    ],
    skipDuplicates: true,
  });

  // Add options for the seeded questions (create individually to attach options)
  const q1 = await prisma.questionBank.findFirst({ where: { text: 'What is the mechanism of action of beta-blockers?' } });
  if (q1) {
    await prisma.questionBankOption.createMany({
      data: [
        { text: 'Block beta-adrenergic receptors', isCorrect: true, questionBankId: q1.id },
        { text: 'Stimulate alpha-adrenergic receptors', isCorrect: false, questionBankId: q1.id },
        { text: 'Increase intracellular calcium', isCorrect: false, questionBankId: q1.id },
        { text: 'Inhibit angiotensin-converting enzyme', isCorrect: false, questionBankId: q1.id },
      ],
      skipDuplicates: true,
    });
  }

  const q5 = await prisma.questionBank.findFirst({ where: { text: 'List the side effects of corticosteroids.' } });
  if (q5) {
    await prisma.questionBankOption.createMany({
      data: [
        { text: 'Hyperglycemia', isCorrect: true, questionBankId: q5.id },
        { text: 'Weight gain', isCorrect: true, questionBankId: q5.id },
        { text: 'Immunosuppression', isCorrect: true, questionBankId: q5.id },
        { text: 'Bradycardia', isCorrect: false, questionBankId: q5.id },
      ],
      skipDuplicates: true,
    });
  }

  // For QROC (open response) seeded items, create one illustrative option as an expected answer
  const q2 = await prisma.questionBank.findFirst({ where: { text: 'Describe the stages of inflammation.' } });
  if (q2) {
    await prisma.questionBankOption.createMany({
      data: [
        { text: 'Vascular phase, cellular phase, resolution/repair', isCorrect: true, questionBankId: q2.id },
      ],
      skipDuplicates: true,
    });
  }

  const q3 = await prisma.questionBank.findFirst({ where: { text: 'Name three gram-negative bacteria.' } });
  if (q3) {
    await prisma.questionBankOption.createMany({
      data: [
        { text: 'Escherichia coli, Pseudomonas aeruginosa, Salmonella spp.', isCorrect: true, questionBankId: q3.id },
      ],
      skipDuplicates: true,
    });
  }

  const q4 = await prisma.questionBank.findFirst({ where: { text: 'Explain the difference between bactericidal and bacteriostatic drugs.' } });
  if (q4) {
    await prisma.questionBankOption.createMany({
      data: [
        { text: 'Bactericidal agents kill bacteria; bacteriostatic agents inhibit growth.', isCorrect: true, questionBankId: q4.id },
      ],
      skipDuplicates: true,
    });
  }

  console.log('Seeded exams and question bank (with options) for 3rd year');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
const { PrismaClient } = require('@prisma/client');
const { createId } = require('@paralleldrive/cuid2');

const prisma = new PrismaClient();

async function main() {
  console.log('\n📘 Running 3rd-year exams & questions seed...');

  // find 3rd year StudyYear
  const thirdYear = await prisma.studyYear.findFirst({ where: { name: { contains: '3' } } });
  if (!thirdYear) {
    console.log('⚠️ 3rd year StudyYear not found; aborting 3rd-year seed.');
    return;
  }

  // Ensure semesters for the 3rd year exist
  const sem = await prisma.semester.findFirst({ where: { studyYearId: thirdYear.id } });

  // Create modules
  const moduleNames = ['Pharmacology', 'Pathology', 'Microbiology'];
  const createdModules = [];
  for (const name of moduleNames) {
    let mod = await prisma.module.findFirst({ where: { name } });
    if (!mod) {
      mod = await prisma.module.create({
        data: {
          id: createId(),
          name,
          semesterId: sem ? sem.id : undefined,
        },
      });
      console.log(`✅ Module created: ${name}`);
    } else {
      console.log(`ℹ️ Module exists: ${name}`);
    }
    createdModules.push(mod);
  }

  // Create one lesson per module
  const createdLessons = [];
  for (const mod of createdModules) {
    const title = `${mod.name} - Introduction`;
    let lesson = await prisma.lesson.findFirst({ where: { title } });
    if (!lesson) {
      lesson = await prisma.lesson.create({
        data: {
          id: createId(),
          title,
          moduleId: mod.id,
          description: `Introductory lesson for ${mod.name}`,
        },
      });
      console.log(`✅ Lesson created: ${title}`);
    } else {
      console.log(`ℹ️ Lesson exists: ${title}`);
    }
    createdLessons.push(lesson);
  }

  // Create 5 question bank items and attach to 3rd year, modules and lessons
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

  console.log('\n🎯 3rd-year exams & questions seed finished');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
