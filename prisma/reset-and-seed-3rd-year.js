Failed to load resource: the server responded with a status of 403 (Forbidden)// prisma/reset-and-seed-3rd-year.js
// Delete old seeded 3rd-year questions and create a fresh set with options
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
  console.log(`Deleted ${del.count} old question(s)`);

  const newQuestions = [
    {
      text: 'Which receptor do non-selective beta-blockers primarily antagonize?',
      questionType: 'QCMA',
      options: [
        { text: 'Beta-1 and Beta-2 adrenergic receptors', isCorrect: true },
        { text: 'Alpha-1 adrenergic receptors', isCorrect: false },
        { text: 'Muscarinic receptors', isCorrect: false },
        { text: 'Dopamine receptors', isCorrect: false }
      ]
    },
    {
      text: 'List the cardinal signs of acute inflammation.',
      questionType: 'QROC',
      options: [
        { text: 'Rubor, calor, tumor, dolor, functio laesa', isCorrect: true }
      ]
    },
    {
      text: 'Which of the following are common gram-negative bacilli? (select all that apply)',
      questionType: 'QCMP',
      options: [
        { text: 'Escherichia coli', isCorrect: true },
        { text: 'Staphylococcus aureus', isCorrect: false },
        { text: 'Pseudomonas aeruginosa', isCorrect: true },
        { text: 'Klebsiella pneumoniae', isCorrect: true }
      ]
    },
    {
      text: 'How do bactericidal antibiotics differ from bacteriostatic ones?',
      questionType: 'QROC',
      options: [
        { text: 'Bactericidal kill bacteria; bacteriostatic inhibit growth', isCorrect: true }
      ]
    },
    {
      text: 'Select the adverse effects commonly associated with systemic corticosteroid therapy.',
      questionType: 'QCMP',
      options: [
        { text: 'Hyperglycemia', isCorrect: true },
        { text: 'Weight gain', isCorrect: true },
        { text: 'Increased infection risk', isCorrect: true },
        { text: 'Hypotension', isCorrect: false }
      ]
    }
  ];

  for (const q of newQuestions) {
    const created = await prisma.questionBank.create({
      data: {
        text: q.text,
        questionType: q.questionType,
        // create nested options
        options: {
          create: q.options.map(opt => ({ text: opt.text, isCorrect: opt.isCorrect }))
        }
      }
    });
    console.log('Created question:', created.text, 'id=', created.id);
  }

  console.log('Reset and seeded new 3rd-year questions with options');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
