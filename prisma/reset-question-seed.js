// prisma/reset-question-seed.js
// Delete specific old seeded questions and create a fresh set with options
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const oldTexts = [
    'What is the mechanism of action of beta-blockers?',
    'Describe the stages of inflammation.',
    'Name three gram-negative bacteria.',
    'Explain the difference between bactericidal and bacteriostatic drugs.',
    'List the side effects of corticosteroids.'
  ];

  console.log('Deleting old seeded questions (if present)...');
  const del = await prisma.questionBank.deleteMany({ where: { text: { in: oldTexts } } });
  console.log(`Deleted ${del.count} old questions`);

  const newQuestions = [
    {
      text: 'Which receptor type do beta-blockers primarily antagonize?',
      questionType: 'QCMA',
      options: [
        { text: 'Beta-adrenergic receptors', isCorrect: true },
        { text: 'Alpha-adrenergic receptors', isCorrect: false },
        { text: 'Muscarinic receptors', isCorrect: false },
        { text: 'Dopamine receptors', isCorrect: false }
      ]
    },
    {
      text: 'Select the common adverse effects of systemic corticosteroids.',
      questionType: 'QCMP',
      options: [
        { text: 'Hyperglycemia', isCorrect: true },
        { text: 'Weight gain', isCorrect: true },
        { text: 'Immunosuppression', isCorrect: true },
        { text: 'Hypotension', isCorrect: false }
      ]
    },
    {
      text: 'Briefly describe the vascular and cellular phases of acute inflammation.',
      questionType: 'QROC',
      options: [
        { text: 'Vascular: vasodilation and increased permeability; Cellular: neutrophil recruitment and phagocytosis', isCorrect: true }
      ]
    },
    {
      text: 'Which of the following are Gram-negative rods?',
      questionType: 'QCMP',
      options: [
        { text: 'Escherichia coli', isCorrect: true },
        { text: 'Staphylococcus aureus', isCorrect: false },
        { text: 'Pseudomonas aeruginosa', isCorrect: true },
        { text: 'Clostridium difficile', isCorrect: false }
      ]
    },
    {
      text: 'Differentiate bactericidal from bacteriostatic antibiotics in one sentence.',
      questionType: 'QROC',
      options: [
        { text: 'Bactericidal antibiotics kill bacteria; bacteriostatic antibiotics inhibit bacterial growth so the immune system can clear the infection.', isCorrect: true }
      ]
    }
  ];

  for (const q of newQuestions) {
    const created = await prisma.questionBank.create({
      data: {
        text: q.text,
        questionType: q.questionType,
        isActive: true,
        options: {
          create: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
        }
      },
      include: { options: true }
    });
    console.log(`Created question: ${created.text} (options: ${created.options.length})`);
  }

  console.log('Reset seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
