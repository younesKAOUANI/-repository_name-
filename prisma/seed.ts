import { PrismaClient, Role, QuizType, QuestionType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // Check if database is accessible
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Hash password for all test accounts
    const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  console.log('👥 Creating user accounts...');
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pharmapedia.com' },
    update: {},
    create: {
      id: createId(),
      email: 'admin@pharmapedia.com',
      name: 'Dr. Sarah Martin',
      role: Role.ADMIN,
      password: hashedPassword,
      emailVerified: new Date(),
      university: 'Université d\'Alger - Faculté de Pharmacie',
      year: null,
    },
  });
  console.log(`✅ Admin: ${admin.name}`);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@pharmapedia.com' },
    update: {},
    create: {
      id: createId(),
      email: 'teacher@pharmapedia.com',
      name: 'Prof. Ahmed Benali',
      role: Role.INSTRUCTOR,
      password: hashedPassword,
      emailVerified: new Date(),
      university: 'Université d\'Oran - Faculté de Pharmacie',
      year: null,
    },
  });
  console.log(`✅ Teacher: ${teacher.name}`);

  const students = [];
  const studentData = [
    { email: 'student1@pharmapedia.com', name: 'Amina Khelifi', year: 3, university: 'Université d\'Alger - Faculté de Pharmacie' },
    { email: 'student2@pharmapedia.com', name: 'Youcef Meziane', year: 4, university: 'Université de Constantine - Faculté de Pharmacie' },
    { email: 'student3@pharmapedia.com', name: 'Fatima Boudiaf', year: 5, university: 'Université d\'Oran - Faculté de Pharmacie' },
    { email: 'student4@pharmapedia.com', name: 'Karim Belhadj', year: 3, university: 'Université d\'Alger - Faculté de Pharmacie' },
    { email: 'student5@pharmapedia.com', name: 'Lina Berkane', year: 4, university: 'Université de Tlemcen - Faculté de Pharmacie' },
  ];

  for (const data of studentData) {
    const student = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        id: createId(),
        email: data.email,
        name: data.name,
        role: Role.STUDENT,
        password: hashedPassword,
        emailVerified: new Date(),
        university: data.university,
        year: data.year,
      },
    });
    students.push(student);
    console.log(`✅ Student: ${student.name} (Année ${student.year})`);
  }

  // 2. Create Academic Structure
  console.log('\n📚 Creating academic structure...');
  
  const studyYears = [];
  for (let i = 1; i <= 6; i++) {
    const studyYear = await prisma.studyYear.create({
      data: {
        id: createId(),
        name: `${i}ème année Pharmacie`,
      },
    });
    studyYears.push(studyYear);
    console.log(`✅ Study Year: ${studyYear.name}`);
  }

  // Create semesters
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

  // Create comprehensive modules
  console.log('\n📖 Creating modules...');
  const moduleData = [
    // 3ème année - Semestre 1
    { name: 'Pharmacologie Générale', semesterId: semesters[4].id, description: 'Étude des mécanismes d\'action des médicaments' },
    { name: 'Chimie Thérapeutique', semesterId: semesters[4].id, description: 'Relation structure-activité des médicaments' },
    { name: 'Pharmacognosie', semesterId: semesters[4].id, description: 'Étude des substances actives d\'origine naturelle' },
    
    // 3ème année - Semestre 2
    { name: 'Toxicologie', semesterId: semesters[5].id, description: 'Étude des effets toxiques des substances' },
    { name: 'Biochimie Clinique', semesterId: semesters[5].id, description: 'Applications cliniques de la biochimie' },
    { name: 'Microbiologie Pharmaceutique', semesterId: semesters[5].id, description: 'Microorganismes en pharmacie' },
    
    // 4ème année - Semestre 1
    { name: 'Pharmacie Clinique', semesterId: semesters[6].id, description: 'Optimisation des traitements médicamenteux' },
    { name: 'Pharmacocinétique', semesterId: semesters[6].id, description: 'Devenir des médicaments dans l\'organisme' },
    { name: 'Immunologie', semesterId: semesters[6].id, description: 'Système immunitaire et immunopharmacologie' },
    
    // 4ème année - Semestre 2
    { name: 'Pharmacie Hospitalière', semesterId: semesters[7].id, description: 'Gestion pharmaceutique en milieu hospitalier' },
    { name: 'Contrôle de Qualité', semesterId: semesters[7].id, description: 'Méthodes de contrôle pharmaceutique' },
    { name: 'Réglementation Pharmaceutique', semesterId: semesters[7].id, description: 'Législation et éthique pharmaceutique' },
  ];

  const modules = [];
  for (const modData of moduleData) {
    const module = await prisma.module.create({
      data: {
        id: createId(),
        name: modData.name,
        description: modData.description,
        semesterId: modData.semesterId,
      },
    });
    modules.push(module);
    console.log(`✅ Module: ${module.name}`);
  }

  // 3. Create Lessons
  console.log('\n📝 Creating lessons...');
  const lessons = [];
  const lessonData = [
    // Pharmacologie Générale
    { title: 'Introduction à la Pharmacologie', content: 'Concepts de base en pharmacologie', moduleId: modules[0].id, order: 1 },
    { title: 'Pharmacodynamie', content: 'Mécanismes d\'action des médicaments', moduleId: modules[0].id, order: 2 },
    { title: 'Récepteurs Pharmacologiques', content: 'Types et fonctions des récepteurs', moduleId: modules[0].id, order: 3 },
    { title: 'Pharmacocinétique Clinique', content: 'ADME des médicaments', moduleId: modules[0].id, order: 4 },
    
    // Chimie Thérapeutique
    { title: 'Structure-Activité', content: 'Relation entre structure chimique et effet biologique', moduleId: modules[1].id, order: 1 },
    { title: 'Médicaments du SNC', content: 'Agents actifs sur le système nerveux central', moduleId: modules[1].id, order: 2 },
    { title: 'Anti-inflammatoires', content: 'AINS et corticoïdes', moduleId: modules[1].id, order: 3 },
    
    // Toxicologie
    { title: 'Toxicologie Générale', content: 'Principes de base en toxicologie', moduleId: modules[3].id, order: 1 },
    { title: 'Intoxications Médicamenteuses', content: 'Gestion des surdosages', moduleId: modules[3].id, order: 2 },
    { title: 'Toxicologie Environnementale', content: 'Polluants et santé', moduleId: modules[3].id, order: 3 },
    
    // Pharmacie Clinique
    { title: 'Soins Pharmaceutiques', content: 'Rôle du pharmacien clinicien', moduleId: modules[6].id, order: 1 },
    { title: 'Interactions Médicamenteuses', content: 'Identification et gestion des interactions', moduleId: modules[6].id, order: 2 },
    { title: 'Suivi Thérapeutique', content: 'Monitoring des traitements', moduleId: modules[6].id, order: 3 },
  ];

  for (const lessonInfo of lessonData) {
    const lesson = await prisma.lesson.create({
      data: {
        id: createId(),
        title: lessonInfo.title,
        content: lessonInfo.content,
        description: `Cours détaillé sur ${lessonInfo.title.toLowerCase()}`,
        moduleId: lessonInfo.moduleId,
        order: lessonInfo.order,
      },
    });
    lessons.push(lesson);
    console.log(`✅ Lesson: ${lesson.title}`);
  }

  // 4. Create Question Bank
  console.log('\n❓ Creating question bank...');
  const questionBank = [];
  const bankQuestions = [
    // Pharmacologie Générale
    {
      text: 'Quel est le principal mécanisme d\'action des bêta-bloquants ?',
      moduleId: modules[0].id,
      lessonId: lessons[1].id,
      difficulty: 'MEDIUM',
      explanation: 'Les bêta-bloquants bloquent les récepteurs bêta-adrénergiques',
      options: [
        { text: 'Blocage des récepteurs bêta-adrénergiques', isCorrect: true },
        { text: 'Activation des récepteurs alpha-adrénergiques', isCorrect: false },
        { text: 'Inhibition de l\'enzyme de conversion', isCorrect: false },
        { text: 'Blocage des canaux calciques', isCorrect: false },
      ]
    },
    {
      text: 'Quelle phase de la pharmacocinétique correspond à la distribution ?',
      moduleId: modules[0].id,
      lessonId: lessons[3].id,
      difficulty: 'EASY',
      explanation: 'La distribution est la phase où le médicament se répartit dans l\'organisme',
      options: [
        { text: 'Phase où le médicament se répartit dans les tissus', isCorrect: true },
        { text: 'Phase d\'absorption du médicament', isCorrect: false },
        { text: 'Phase de métabolisation hépatique', isCorrect: false },
        { text: 'Phase d\'élimination rénale', isCorrect: false },
      ]
    },
    // Chimie Thérapeutique
    {
      text: 'Quel groupe pharmacologique appartient l\'aspirine ?',
      moduleId: modules[1].id,
      lessonId: lessons[6].id,
      difficulty: 'EASY',
      explanation: 'L\'aspirine est un anti-inflammatoire non stéroïdien (AINS)',
      options: [
        { text: 'AINS (Anti-inflammatoires non stéroïdiens)', isCorrect: true },
        { text: 'Corticoïdes', isCorrect: false },
        { text: 'Analgésiques opioïdes', isCorrect: false },
        { text: 'Antihistaminiques', isCorrect: false },
      ]
    },
    // Toxicologie
    {
      text: 'Quelle est la dose létale médiane appelée ?',
      moduleId: modules[3].id,
      lessonId: lessons[7].id,
      difficulty: 'MEDIUM',
      explanation: 'La DL50 est la dose qui tue 50% des animaux testés',
      options: [
        { text: 'DL50', isCorrect: true },
        { text: 'DE50', isCorrect: false },
        { text: 'CI50', isCorrect: false },
        { text: 'EC50', isCorrect: false },
      ]
    },
    // Pharmacie Clinique
    {
      text: 'Que signifie l\'interaction médicamenteuse synergique ?',
      moduleId: modules[6].id,
      lessonId: lessons[11].id,
      difficulty: 'HARD',
      explanation: 'Une synergie amplifie l\'effet thérapeutique au-delà de la simple addition',
      options: [
        { text: 'L\'effet combiné est supérieur à la somme des effets individuels', isCorrect: true },
        { text: 'Un médicament annule l\'effet de l\'autre', isCorrect: false },
        { text: 'Les deux médicaments ont le même effet', isCorrect: false },
        { text: 'L\'effet combiné est égal à la somme des effets', isCorrect: false },
      ]
    },
  ];

  for (const bankQ of bankQuestions) {
    const question = await prisma.questionBank.create({
      data: {
        id: createId(),
        text: bankQ.text,
        questionType: QuestionType.QCMA,
        moduleId: bankQ.moduleId,
        lessonId: bankQ.lessonId,
        difficulty: bankQ.difficulty,
        explanation: bankQ.explanation,
        isActive: true,
      },
    });

    // Create options for the question
    for (const opt of bankQ.options) {
      await prisma.questionBankOption.create({
        data: {
          id: createId(),
          text: opt.text,
          isCorrect: opt.isCorrect,
          questionBankId: question.id,
        },
      });
    }

    questionBank.push(question);
    console.log(`✅ Question Bank: ${question.text.substring(0, 50)}...`);
  }

  // 5. Create Quizzes and Exams
  console.log('\n🧭 Creating quizzes and exams...');
  const quizzes = [];
  
  // Lesson Quizzes
  for (let i = 0; i < 5; i++) {
    const lesson = lessons[i];
    const quiz = await prisma.quiz.create({
      data: {
        id: createId(),
        title: `Quiz: ${lesson.title}`,
        description: `Quiz d'évaluation pour le cours "${lesson.title}"`,
        type: QuizType.QUIZ,
        lessonId: lesson.id,
        order: 1,
        timeLimit: 15, // 15 minutes
      },
    });

    // Create questions for this quiz
    const quizQuestions = [
      {
        text: `Question principale sur ${lesson.title} - Quelle est la notion clé ?`,
        options: [
          { text: 'Option correcte A', isCorrect: true },
          { text: 'Option incorrecte B', isCorrect: false },
          { text: 'Option incorrecte C', isCorrect: false },
          { text: 'Option incorrecte D', isCorrect: false },
        ]
      },
      {
        text: `Question secondaire sur ${lesson.title} - Comment appliquer ces concepts ?`,
        options: [
          { text: 'Application incorrecte A', isCorrect: false },
          { text: 'Application correcte B', isCorrect: true },
          { text: 'Application incorrecte C', isCorrect: false },
          { text: 'Application incorrecte D', isCorrect: false },
        ]
      }
    ];

    for (let qIndex = 0; qIndex < quizQuestions.length; qIndex++) {
      const qData = quizQuestions[qIndex];
      const question = await prisma.question.create({
        data: {
          id: createId(),
          text: qData.text,
          questionType: QuestionType.QCMA,
          quizId: quiz.id,
          order: qIndex + 1,
        },
      });

      for (const opt of qData.options) {
        await prisma.answerOption.create({
          data: {
            id: createId(),
            text: opt.text,
            isCorrect: opt.isCorrect,
            questionId: question.id,
          },
        });
      }
    }

    quizzes.push(quiz);
    console.log(`✅ Lesson Quiz: ${quiz.title}`);
  }

  // Module Exams
  for (let i = 0; i < 3; i++) {
    const module = modules[i];
    const exam = await prisma.quiz.create({
      data: {
        id: createId(),
        title: `Examen: ${module.name}`,
        description: `Examen final pour le module "${module.name}"`,
        type: QuizType.EXAM,
        moduleId: module.id,
        timeLimit: 90, // 90 minutes
      },
    });

    // Create comprehensive exam questions
    const examQuestions = [
      {
        text: `Question d'examen sur ${module.name} - Analyse théorique`,
        options: [
          { text: 'Réponse théorique correcte', isCorrect: true },
          { text: 'Réponse théorique incorrecte 1', isCorrect: false },
          { text: 'Réponse théorique incorrecte 2', isCorrect: false },
          { text: 'Réponse théorique incorrecte 3', isCorrect: false },
        ]
      },
      {
        text: `Question d'examen sur ${module.name} - Application pratique`,
        options: [
          { text: 'Application incorrecte 1', isCorrect: false },
          { text: 'Application correcte', isCorrect: true },
          { text: 'Application incorrecte 2', isCorrect: false },
          { text: 'Application incorrecte 3', isCorrect: false },
        ]
      },
      {
        text: `Question d'examen sur ${module.name} - Cas clinique`,
        options: [
          { text: 'Diagnostic incorrect A', isCorrect: false },
          { text: 'Diagnostic incorrect B', isCorrect: false },
          { text: 'Diagnostic correct C', isCorrect: true },
          { text: 'Diagnostic incorrect D', isCorrect: false },
        ]
      }
    ];

    for (let qIndex = 0; qIndex < examQuestions.length; qIndex++) {
      const qData = examQuestions[qIndex];
      const question = await prisma.question.create({
        data: {
          id: createId(),
          text: qData.text,
          questionType: QuestionType.QCMA,
          quizId: exam.id,
          order: qIndex + 1,
        },
      });

      for (const opt of qData.options) {
        await prisma.answerOption.create({
          data: {
            id: createId(),
            text: opt.text,
            isCorrect: opt.isCorrect,
            questionId: question.id,
          },
        });
      }
    }

    quizzes.push(exam);
    console.log(`✅ Module Exam: ${exam.title}`);
  }

  // Session Quiz (revision quiz)
  const sessionQuiz = await prisma.quiz.create({
    data: {
      id: createId(),
      title: 'Quiz de Révision - Pharmacologie',
      description: 'Quiz de révision générale basé sur plusieurs leçons',
      type: QuizType.SESSION,
      questionCount: 20,
      timeLimit: 45,
    },
  });

  // Link some lessons to the session quiz
  for (let i = 0; i < 3; i++) {
    await prisma.sessionQuizLesson.create({
      data: {
        id: createId(),
        quizId: sessionQuiz.id,
        lessonId: lessons[i].id,
      },
    });
  }

  quizzes.push(sessionQuiz);
  console.log(`✅ Session Quiz: ${sessionQuiz.title}`);

  // 6. Create sample quiz attempts for students
  console.log('\n📊 Creating sample quiz attempts...');
  
  for (const student of students.slice(0, 3)) { // First 3 students
    for (let i = 0; i < 3; i++) { // First 3 quizzes
      const quiz = quizzes[i];
      const attempt = await prisma.quizAttempt.create({
        data: {
          id: createId(),
          userId: student.id,
          quizId: quiz.id,
          startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
          finishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // +30 minutes
          score: Math.floor(Math.random() * 50) + 50, // Score between 50-100
        },
      });

      console.log(`✅ Quiz Attempt: ${student.name} - ${quiz.title} (Score: ${attempt.score})`);
    }
  }

  // Summary
  console.log('\n🎉 Comprehensive database seeding completed!');
  console.log('\n📊 Database Summary:');
  console.log('==========================================');
  console.log(`👥 Users: ${studentData.length + 2} (${studentData.length} students, 1 teacher, 1 admin)`);
  console.log(`📚 Study Years: ${studyYears.length}`);
  console.log(`📖 Semesters: ${semesters.length}`);
  console.log(`📑 Modules: ${modules.length}`);
  console.log(`📝 Lessons: ${lessons.length}`);
  console.log(`❓ Question Bank: ${questionBank.length} questions`);
  console.log(`🧭 Quizzes/Exams: ${quizzes.length} (lessons + exams + session)`);
  console.log('\n🔑 Test Account Credentials:');
  console.log('==========================================');
  console.log('Password for all accounts: "password123"');
  console.log('');
    console.log('👑 ADMIN: admin@pharmapedia.com');
    console.log('👨‍🏫 TEACHER: teacher@pharmapedia.com');
    console.log('👨‍🎓 STUDENTS:');
    studentData.forEach(s => console.log(`   ${s.email} (${s.name} - ${s.year}ème année)`));
    console.log('==========================================');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
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
