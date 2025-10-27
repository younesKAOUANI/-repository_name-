// prisma/seed-exams-3rd-year.ts
// Seed script for exams and question bank questions for 3rd year
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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

  // Create question bank questions for 3rd year with options
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

  console.log('Seeded exams (Quiz type EXAM) and question bank questions for 3rd year');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
