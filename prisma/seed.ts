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
    // 3rd Year Students (Main Focus)
    { email: 'student1@pharmapedia.com', name: 'Amina Khelifi', year: 3, university: 'Université d\'Alger - Faculté de Pharmacie' },

    // Other years for diversity
    { email: 'student11@pharmapedia.com', name: 'Youcef Meziane', year: 4, university: 'Université de Constantine - Faculté de Pharmacie' },
    { email: 'student12@pharmapedia.com', name: 'Fatima Boudiaf', year: 5, university: 'Université d\'Oran - Faculté de Pharmacie' },
    { email: 'student13@pharmapedia.com', name: 'Lina Berkane', year: 4, university: 'Université de Tlemcen - Faculté de Pharmacie' },
    { email: 'student14@pharmapedia.com', name: 'Ahmed Brahimi', year: 2, university: 'Université d\'Alger - Faculté de Pharmacie' },
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

  // Create comprehensive modules with focus on 3rd year
  console.log('\n📖 Creating modules...');
  const moduleData = [
    // 1ère année - Semestre 1
    { name: 'Mathématiques et Statistiques', semesterId: semesters[0].id, description: 'Bases mathématiques pour la pharmacie' },
    { name: 'Physique Pharmaceutique', semesterId: semesters[0].id, description: 'Principes physiques appliqués à la pharmacie' },
    { name: 'Chimie Générale', semesterId: semesters[0].id, description: 'Fondements de la chimie générale' },
    
    // 1ère année - Semestre 2
    { name: 'Chimie Organique I', semesterId: semesters[1].id, description: 'Introduction à la chimie organique' },
    { name: 'Biologie Cellulaire', semesterId: semesters[1].id, description: 'Structure et fonction des cellules' },
    { name: 'Anatomie Humaine', semesterId: semesters[1].id, description: 'Structure du corps humain' },

    // 2ème année - Semestre 1
    { name: 'Chimie Organique II', semesterId: semesters[2].id, description: 'Chimie organique avancée' },
    { name: 'Biochimie Structurale', semesterId: semesters[2].id, description: 'Structure des biomolécules' },
    { name: 'Physiologie Humaine I', semesterId: semesters[2].id, description: 'Fonctionnement du corps humain' },
    
    // 2ème année - Semestre 2
    { name: 'Physiologie Humaine II', semesterId: semesters[3].id, description: 'Physiologie des systèmes' },
    { name: 'Biochimie Métabolique', semesterId: semesters[3].id, description: 'Métabolisme et régulation' },
    { name: 'Botanique Pharmaceutique', semesterId: semesters[3].id, description: 'Plantes médicinales' },
    
    // 3ème année - Semestre 1 (FOCUS PRINCIPAL)
    { name: 'Pharmacologie Générale', semesterId: semesters[4].id, description: 'Étude des mécanismes d\'action des médicaments' },
    { name: 'Chimie Thérapeutique', semesterId: semesters[4].id, description: 'Relation structure-activité des médicaments' },
    { name: 'Pharmacognosie', semesterId: semesters[4].id, description: 'Étude des substances actives d\'origine naturelle' },
    { name: 'Chimie Analytique', semesterId: semesters[4].id, description: 'Méthodes d\'analyse pharmaceutique' },
    { name: 'Galénique I', semesterId: semesters[4].id, description: 'Formulation pharmaceutique de base' },
    
    // 3ème année - Semestre 2 (FOCUS PRINCIPAL)
    { name: 'Toxicologie', semesterId: semesters[5].id, description: 'Étude des effets toxiques des substances' },
    { name: 'Biochimie Clinique', semesterId: semesters[5].id, description: 'Applications cliniques de la biochimie' },
    { name: 'Microbiologie Pharmaceutique', semesterId: semesters[5].id, description: 'Microorganismes en pharmacie' },
    { name: 'Galénique II', semesterId: semesters[5].id, description: 'Formulation pharmaceutique avancée' },
    { name: 'Hématologie', semesterId: semesters[5].id, description: 'Étude du sang et des maladies hématologiques' },
    { name: 'Parasitologie', semesterId: semesters[5].id, description: 'Étude des parasites et parasitoses' },
    
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

  // 3. Create Lessons with extensive 3rd year content
  console.log('\n📝 Creating lessons...');
  const lessons = [];
  const lessonData = [
    // Pharmacologie Générale (3ème année S1) - Module index 12
    { title: 'Introduction à la Pharmacologie', content: 'Concepts de base en pharmacologie, définitions et classifications', moduleId: modules[12].id, order: 1 },
    { title: 'Pharmacodynamie', content: 'Mécanismes d\'action des médicaments sur l\'organisme', moduleId: modules[12].id, order: 2 },
    { title: 'Récepteurs Pharmacologiques', content: 'Types et fonctions des récepteurs membranaires et intracellulaires', moduleId: modules[12].id, order: 3 },
    { title: 'Pharmacocinétique Clinique', content: 'ADME des médicaments : absorption, distribution, métabolisme, excrétion', moduleId: modules[12].id, order: 4 },
    { title: 'Système Nerveux Autonome', content: 'Pharmacologie du système sympathique et parasympathique', moduleId: modules[12].id, order: 5 },
    { title: 'Neurotransmetteurs', content: 'Mécanismes de neurotransmission et neuromodulation', moduleId: modules[12].id, order: 6 },
    { title: 'Anesthésiques', content: 'Anesthésiques locaux et généraux : mécanismes et utilisations', moduleId: modules[12].id, order: 7 },
    { title: 'Analgésiques', content: 'Pharmacologie de la douleur et antalgiques', moduleId: modules[12].id, order: 8 },
    
    // Chimie Thérapeutique (3ème année S1) - Module index 13
    { title: 'Structure-Activité', content: 'Relations structure-activité des médicaments (RSA)', moduleId: modules[13].id, order: 1 },
    { title: 'Médicaments du SNC', content: 'Agents actifs sur le système nerveux central', moduleId: modules[13].id, order: 2 },
    { title: 'Anti-inflammatoires', content: 'AINS et corticoïdes : mécanismes et structures', moduleId: modules[13].id, order: 3 },
    { title: 'Antibiotiques', content: 'Classification et mécanismes d\'action des antibiotiques', moduleId: modules[13].id, order: 4 },
    { title: 'Antifongiques', content: 'Agents antifongiques : structures et mécanismes', moduleId: modules[13].id, order: 5 },
    { title: 'Antiviraux', content: 'Médicaments antiviraux et leur mode d\'action', moduleId: modules[13].id, order: 6 },
    { title: 'Cardiovasculaires', content: 'Médicaments cardiovasculaires : structures et SAR', moduleId: modules[13].id, order: 7 },
    
    // Pharmacognosie (3ème année S1) - Module index 14
    { title: 'Introduction à la Pharmacognosie', content: 'Historique et importance des substances naturelles', moduleId: modules[14].id, order: 1 },
    { title: 'Métabolites Primaires', content: 'Glucides, lipides et protéines d\'origine végétale', moduleId: modules[14].id, order: 2 },
    { title: 'Alcaloïdes', content: 'Structure, classification et activités biologiques des alcaloïdes', moduleId: modules[14].id, order: 3 },
    { title: 'Polyphénols', content: 'Tanins, flavonoïdes et autres composés phénoliques', moduleId: modules[14].id, order: 4 },
    { title: 'Glycosides', content: 'Hétérosides : classification et propriétés thérapeutiques', moduleId: modules[14].id, order: 5 },
    { title: 'Huiles Essentielles', content: 'Composition chimique et propriétés des huiles essentielles', moduleId: modules[14].id, order: 6 },
    { title: 'Saponosides', content: 'Structure et activités biologiques des saponosides', moduleId: modules[14].id, order: 7 },
    
    // Chimie Analytique (3ème année S1) - Module index 15
    { title: 'Spectrophotométrie UV-Visible', content: 'Principe et applications analytiques', moduleId: modules[15].id, order: 1 },
    { title: 'Chromatographie', content: 'HPLC, CCM et chromatographie en phase gazeuse', moduleId: modules[15].id, order: 2 },
    { title: 'Spectrométrie de Masse', content: 'Principe et interprétation des spectres de masse', moduleId: modules[15].id, order: 3 },
    { title: 'RMN', content: 'Résonance magnétique nucléaire : 1H et 13C NMR', moduleId: modules[15].id, order: 4 },
    { title: 'Analyse Quantitative', content: 'Méthodes de dosage et validation analytique', moduleId: modules[15].id, order: 5 },
    
    // Galénique I (3ème année S1) - Module index 16
    { title: 'Formes Galéniques Solides', content: 'Comprimés, gélules et poudres pharmaceutiques', moduleId: modules[16].id, order: 1 },
    { title: 'Formes Galéniques Liquides', content: 'Solutions, suspensions et émulsions', moduleId: modules[16].id, order: 2 },
    { title: 'Excipients Pharmaceutiques', content: 'Classification et propriétés des excipients', moduleId: modules[16].id, order: 3 },
    { title: 'Contrôle des Formes Pharmaceutiques', content: 'Tests de contrôle qualité des médicaments', moduleId: modules[16].id, order: 4 },
    
    // Toxicologie (3ème année S2) - Module index 17
    { title: 'Toxicologie Générale', content: 'Principes de base en toxicologie et mécanismes', moduleId: modules[17].id, order: 1 },
    { title: 'Intoxications Médicamenteuses', content: 'Gestion des surdosages et antidotes', moduleId: modules[17].id, order: 2 },
    { title: 'Toxicologie Environnementale', content: 'Polluants industriels et santé publique', moduleId: modules[17].id, order: 3 },
    { title: 'Toxicocinétique', content: 'Devenir des toxiques dans l\'organisme', moduleId: modules[17].id, order: 4 },
    { title: 'Cancérogenèse Chimique', content: 'Mécanismes de la cancérogenèse par les substances chimiques', moduleId: modules[17].id, order: 5 },
    { title: 'Toxicologie Alimentaire', content: 'Contaminants alimentaires et additifs', moduleId: modules[17].id, order: 6 },
    
    // Biochimie Clinique (3ème année S2) - Module index 18
    { title: 'Enzymologie Clinique', content: 'Dosage enzymatique et diagnostic biologique', moduleId: modules[18].id, order: 1 },
    { title: 'Métabolisme Glucidique', content: 'Diabète et troubles glycémiques', moduleId: modules[18].id, order: 2 },
    { title: 'Métabolisme Lipidique', content: 'Dyslipidémies et athérosclérose', moduleId: modules[18].id, order: 3 },
    { title: 'Fonction Rénale', content: 'Marqueurs de la fonction rénale', moduleId: modules[18].id, order: 4 },
    { title: 'Fonction Hépatique', content: 'Tests hépatiques et diagnostic des hépatopathies', moduleId: modules[18].id, order: 5 },
    { title: 'Équilibre Hydroélectrolytique', content: 'Électrolytes sanguins et troubles associés', moduleId: modules[18].id, order: 6 },
    
    // Microbiologie Pharmaceutique (3ème année S2) - Module index 19
    { title: 'Bactériologie Systématique', content: 'Classification et identification bactérienne', moduleId: modules[19].id, order: 1 },
    { title: 'Virologie Pharmaceutique', content: 'Virus pathogènes et antiviraux', moduleId: modules[19].id, order: 2 },
    { title: 'Mycologie Médicale', content: 'Champignons pathogènes et antifongiques', moduleId: modules[19].id, order: 3 },
    { title: 'Stérilisation', content: 'Méthodes de stérilisation pharmaceutique', moduleId: modules[19].id, order: 4 },
    { title: 'Contrôle Microbiologique', content: 'Tests de stérilité et d\'endotoxines', moduleId: modules[19].id, order: 5 },
    { title: 'Résistance aux Antibiotiques', content: 'Mécanismes de résistance et prévention', moduleId: modules[19].id, order: 6 },
    
    // Some lessons from other years for completeness
    // Pharmacie Clinique (4ème année)
    { title: 'Soins Pharmaceutiques', content: 'Rôle du pharmacien clinicien', moduleId: modules[22].id, order: 1 },
    { title: 'Interactions Médicamenteuses', content: 'Identification et gestion des interactions', moduleId: modules[22].id, order: 2 },
    { title: 'Suivi Thérapeutique', content: 'Monitoring des traitements', moduleId: modules[22].id, order: 3 },
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

  // 4. Create Extensive Question Bank (Focus on 3rd year)
  console.log('\n❓ Creating extensive question bank...');
  const questionBank = [];
  const bankQuestions = [
    // Pharmacologie Générale (3rd year)
    {
      text: 'Quel est le principal mécanisme d\'action des bêta-bloquants ?',
      moduleId: modules[12].id,
      lessonId: lessons[1].id,
      difficulty: 'MEDIUM',
      explanation: 'Les bêta-bloquants bloquent les récepteurs bêta-adrénergiques, empêchant l\'action de l\'adrénaline et de la noradrénaline.',
      options: [
        { text: 'Blocage des récepteurs bêta-adrénergiques', isCorrect: true },
        { text: 'Activation des récepteurs alpha-adrénergiques', isCorrect: false },
        { text: 'Inhibition de l\'enzyme de conversion', isCorrect: false },
        { text: 'Blocage des canaux calciques', isCorrect: false },
      ]
    },
    {
      text: 'Quelle phase de la pharmacocinétique correspond à la distribution ?',
      moduleId: modules[12].id,
      lessonId: lessons[3].id,
      difficulty: 'EASY',
      explanation: 'La distribution est la phase où le médicament se répartit dans l\'organisme après absorption.',
      options: [
        { text: 'Phase où le médicament se répartit dans les tissus', isCorrect: true },
        { text: 'Phase d\'absorption du médicament', isCorrect: false },
        { text: 'Phase de métabolisation hépatique', isCorrect: false },
        { text: 'Phase d\'élimination rénale', isCorrect: false },
      ]
    },
    {
      text: 'Quel récepteur est principalement impliqué dans l\'action de la morphine ?',
      moduleId: modules[12].id,
      lessonId: lessons[7].id,
      difficulty: 'MEDIUM',
      explanation: 'La morphine agit principalement sur les récepteurs opioïdes μ (mu).',
      options: [
        { text: 'Récepteurs opioïdes μ (mu)', isCorrect: true },
        { text: 'Récepteurs GABA-A', isCorrect: false },
        { text: 'Récepteurs dopaminergiques D2', isCorrect: false },
        { text: 'Récepteurs sérotoninergiques 5-HT2', isCorrect: false },
      ]
    },
    {
      text: 'Quelle enzyme est inhibée par l\'aspirine ?',
      moduleId: modules[12].id,
      lessonId: lessons[7].id,
      difficulty: 'MEDIUM',
      explanation: 'L\'aspirine inhibe la cyclooxygénase (COX), enzyme clé dans la synthèse des prostaglandines.',
      options: [
        { text: 'Cyclooxygénase (COX)', isCorrect: true },
        { text: 'Phosphodiestérase', isCorrect: false },
        { text: 'Monoamine oxydase', isCorrect: false },
        { text: 'Adénylyl cyclase', isCorrect: false },
      ]
    },
    {
      text: 'Quel neurotransmetteur est principalement déficient dans la maladie de Parkinson ?',
      moduleId: modules[12].id,
      lessonId: lessons[5].id,
      difficulty: 'MEDIUM',
      explanation: 'La maladie de Parkinson est caractérisée par une dégénérescence des neurones dopaminergiques.',
      options: [
        { text: 'Dopamine', isCorrect: true },
        { text: 'Sérotonine', isCorrect: false },
        { text: 'Acétylcholine', isCorrect: false },
        { text: 'Noradrénaline', isCorrect: false },
      ]
    },
    {
      text: 'Quelle voie d\'administration permet d\'éviter le premier passage hépatique ?',
      moduleId: modules[12].id,
      lessonId: lessons[3].id,
      difficulty: 'EASY',
      explanation: 'La voie sublinguale évite le premier passage hépatique car l\'absorption se fait directement dans la circulation systémique.',
      options: [
        { text: 'Sublinguale', isCorrect: true },
        { text: 'Orale', isCorrect: false },
        { text: 'Rectale haute', isCorrect: false },
        { text: 'Gastrique', isCorrect: false },
      ]
    },
    
    // Chimie Thérapeutique (3rd year)
    {
      text: 'À quel groupe pharmacologique appartient l\'aspirine ?',
      moduleId: modules[13].id,
      lessonId: lessons[10].id,
      difficulty: 'EASY',
      explanation: 'L\'aspirine est un anti-inflammatoire non stéroïdien (AINS) de la famille des salicylés.',
      options: [
        { text: 'AINS (Anti-inflammatoires non stéroïdiens)', isCorrect: true },
        { text: 'Corticoïdes', isCorrect: false },
        { text: 'Analgésiques opioïdes', isCorrect: false },
        { text: 'Antihistaminiques', isCorrect: false },
      ]
    },
    {
      text: 'Quel est le mécanisme d\'action principal des pénicillines ?',
      moduleId: modules[13].id,
      lessonId: lessons[11].id,
      difficulty: 'MEDIUM',
      explanation: 'Les pénicillines inhibent la synthèse du peptidoglycane de la paroi bactérienne.',
      options: [
        { text: 'Inhibition de la synthèse du peptidoglycane', isCorrect: true },
        { text: 'Inhibition de la synthèse protéique', isCorrect: false },
        { text: 'Inhibition de la synthèse de l\'ADN', isCorrect: false },
        { text: 'Altération de la membrane cytoplasmique', isCorrect: false },
      ]
    },
    {
      text: 'Quelle caractéristique structurale est essentielle pour l\'activité des bêta-lactamines ?',
      moduleId: modules[13].id,
      lessonId: lessons[11].id,
      difficulty: 'HARD',
      explanation: 'Le cycle bêta-lactame est la structure pharmacophore essentielle des antibiotiques bêta-lactamines.',
      options: [
        { text: 'Le cycle bêta-lactame', isCorrect: true },
        { text: 'Le groupement carboxyle', isCorrect: false },
        { text: 'Le groupement amino', isCorrect: false },
        { text: 'Le cycle benzénique', isCorrect: false },
      ]
    },
    {
      text: 'Quel médicament cardiovasculaire agit en inhibant l\'ECA ?',
      moduleId: modules[13].id,
      lessonId: lessons[14].id,
      difficulty: 'MEDIUM',
      explanation: 'Les inhibiteurs de l\'ECA (enzyme de conversion de l\'angiotensine) comme l\'énalapril sont des antihypertenseurs.',
      options: [
        { text: 'Énalapril', isCorrect: true },
        { text: 'Propranolol', isCorrect: false },
        { text: 'Nifédipine', isCorrect: false },
        { text: 'Digoxine', isCorrect: false },
      ]
    },
    
    // Pharmacognosie (3rd year)
    {
      text: 'Quel alcaloïde est extrait de l\'opium ?',
      moduleId: modules[14].id,
      lessonId: lessons[17].id,
      difficulty: 'EASY',
      explanation: 'La morphine est le principal alcaloïde extrait de l\'opium (Papaver somniferum).',
      options: [
        { text: 'Morphine', isCorrect: true },
        { text: 'Caféine', isCorrect: false },
        { text: 'Quinine', isCorrect: false },
        { text: 'Atropine', isCorrect: false },
      ]
    },
    {
      text: 'Quelle famille de composés est responsable de l\'effet astringent des tanins ?',
      moduleId: modules[14].id,
      lessonId: lessons[19].id,
      difficulty: 'MEDIUM',
      explanation: 'Les tanins sont des polyphénols qui se lient aux protéines, créant un effet astringent.',
      options: [
        { text: 'Polyphénols', isCorrect: true },
        { text: 'Alcaloïdes', isCorrect: false },
        { text: 'Saponosides', isCorrect: false },
        { text: 'Monoterpènes', isCorrect: false },
      ]
    },
    {
      text: 'Quelle plante est la source principale de la digitaline ?',
      moduleId: modules[14].id,
      lessonId: lessons[20].id,
      difficulty: 'MEDIUM',
      explanation: 'La digitaline (digitoxine et digoxine) est extraite de la digitale pourpre (Digitalis purpurea).',
      options: [
        { text: 'Digitale pourpre (Digitalis purpurea)', isCorrect: true },
        { text: 'Belladone (Atropa belladonna)', isCorrect: false },
        { text: 'Quinquina (Cinchona sp.)', isCorrect: false },
        { text: 'Pavot (Papaver somniferum)', isCorrect: false },
      ]
    },
    {
      text: 'Quel est le composant actif principal du ginseng ?',
      moduleId: modules[14].id,
      lessonId: lessons[22].id,
      difficulty: 'MEDIUM',
      explanation: 'Les ginsénosides sont les saponosides triterpéniques responsables de l\'activité du ginseng.',
      options: [
        { text: 'Ginsénosides', isCorrect: true },
        { text: 'Flavonoïdes', isCorrect: false },
        { text: 'Alcaloïdes', isCorrect: false },
        { text: 'Coumarines', isCorrect: false },
      ]
    },
    
    // Chimie Analytique (3rd year)
    {
      text: 'Quelle loi régit l\'absorption lumineuse en spectrophotométrie UV-Vis ?',
      moduleId: modules[15].id,
      lessonId: lessons[23].id,
      difficulty: 'EASY',
      explanation: 'La loi de Beer-Lambert (A = ε × l × c) régit l\'absorption lumineuse.',
      options: [
        { text: 'Loi de Beer-Lambert', isCorrect: true },
        { text: 'Loi de Raoult', isCorrect: false },
        { text: 'Loi de Henry', isCorrect: false },
        { text: 'Loi de Fick', isCorrect: false },
      ]
    },
    {
      text: 'Quel détecteur est le plus couramment utilisé en HPLC pour les molécules aromatiques ?',
      moduleId: modules[15].id,
      lessonId: lessons[24].id,
      difficulty: 'MEDIUM',
      explanation: 'Le détecteur UV-Vis est idéal pour les molécules possédant des chromophores.',
      options: [
        { text: 'Détecteur UV-Vis', isCorrect: true },
        { text: 'Détecteur à indice de réfraction', isCorrect: false },
        { text: 'Détecteur conductimétrique', isCorrect: false },
        { text: 'Détecteur fluorimétrique', isCorrect: false },
      ]
    },
    {
      text: 'En RMN du proton, à combien de ppm apparaît généralement le signal des protons aromatiques ?',
      moduleId: modules[15].id,
      lessonId: lessons[26].id,
      difficulty: 'MEDIUM',
      explanation: 'Les protons aromatiques résonnent dans la zone 7-8 ppm en RMN 1H.',
      options: [
        { text: '7-8 ppm', isCorrect: true },
        { text: '1-2 ppm', isCorrect: false },
        { text: '3-4 ppm', isCorrect: false },
        { text: '10-12 ppm', isCorrect: false },
      ]
    },
    
    // Toxicologie (3rd year)
    {
      text: 'Quelle est la dose létale médiane appelée ?',
      moduleId: modules[17].id,
      lessonId: lessons[30].id,
      difficulty: 'EASY',
      explanation: 'La DL50 est la dose qui provoque la mort de 50% des animaux testés.',
      options: [
        { text: 'DL50', isCorrect: true },
        { text: 'DE50', isCorrect: false },
        { text: 'CI50', isCorrect: false },
        { text: 'EC50', isCorrect: false },
      ]
    },
    {
      text: 'Quel antidote est utilisé en cas d\'intoxication par le paracétamol ?',
      moduleId: modules[17].id,
      lessonId: lessons[31].id,
      difficulty: 'MEDIUM',
      explanation: 'La N-acétylcystéine (NAC) est l\'antidote spécifique du paracétamol.',
      options: [
        { text: 'N-acétylcystéine', isCorrect: true },
        { text: 'Naloxone', isCorrect: false },
        { text: 'Flumazénil', isCorrect: false },
        { text: 'Atropine', isCorrect: false },
      ]
    },
    {
      text: 'Quel organe est principalement responsable de la biotransformation des xénobiotiques ?',
      moduleId: modules[17].id,
      lessonId: lessons[33].id,
      difficulty: 'EASY',
      explanation: 'Le foie est l\'organe principal de détoxification et de métabolisation des substances étrangères.',
      options: [
        { text: 'Foie', isCorrect: true },
        { text: 'Rein', isCorrect: false },
        { text: 'Poumon', isCorrect: false },
        { text: 'Cerveau', isCorrect: false },
      ]
    },
    {
      text: 'Quelle phase de biotransformation implique la conjugaison ?',
      moduleId: modules[17].id,
      lessonId: lessons[33].id,
      difficulty: 'MEDIUM',
      explanation: 'La phase II de biotransformation implique des réactions de conjugaison (glucuronidation, sulfatation, etc.).',
      options: [
        { text: 'Phase II', isCorrect: true },
        { text: 'Phase I', isCorrect: false },
        { text: 'Phase III', isCorrect: false },
        { text: 'Phase 0', isCorrect: false },
      ]
    },
    
    // Biochimie Clinique (3rd year)
    {
      text: 'Quelle enzyme est élevée en cas d\'infarctus du myocarde ?',
      moduleId: modules[18].id,
      lessonId: lessons[36].id,
      difficulty: 'MEDIUM',
      explanation: 'La troponine cardiaque est le marqueur le plus spécifique de l\'infarctus du myocarde.',
      options: [
        { text: 'Troponine cardiaque', isCorrect: true },
        { text: 'Phosphatase alcaline', isCorrect: false },
        { text: 'Gamma-GT', isCorrect: false },
        { text: 'Lipase', isCorrect: false },
      ]
    },
    {
      text: 'Quel est le marqueur principal du diabète à long terme ?',
      moduleId: modules[18].id,
      lessonId: lessons[37].id,
      difficulty: 'EASY',
      explanation: 'L\'hémoglobine glyquée (HbA1c) reflète la glycémie moyenne des 2-3 derniers mois.',
      options: [
        { text: 'Hémoglobine glyquée (HbA1c)', isCorrect: true },
        { text: 'Glycémie à jeun', isCorrect: false },
        { text: 'Fructosamine', isCorrect: false },
        { text: 'Peptide C', isCorrect: false },
      ]
    },
    {
      text: 'Quelle valeur normale de créatinine sérique chez l\'adulte ?',
      moduleId: modules[18].id,
      lessonId: lessons[39].id,
      difficulty: 'MEDIUM',
      explanation: 'La créatinine sérique normale est de 60-120 μmol/L chez l\'adulte.',
      options: [
        { text: '60-120 μmol/L', isCorrect: true },
        { text: '200-400 μmol/L', isCorrect: false },
        { text: '10-50 μmol/L', isCorrect: false },
        { text: '150-300 μmol/L', isCorrect: false },
      ]
    },
    
    // Microbiologie Pharmaceutique (3rd year)
    {
      text: 'Quelle coloration permet de différencier les bactéries Gram+ et Gram- ?',
      moduleId: modules[19].id,
      lessonId: lessons[42].id,
      difficulty: 'EASY',
      explanation: 'La coloration de Gram différencie les bactéries selon la structure de leur paroi.',
      options: [
        { text: 'Coloration de Gram', isCorrect: true },
        { text: 'Coloration de Ziehl-Neelsen', isCorrect: false },
        { text: 'Coloration au bleu de méthylène', isCorrect: false },
        { text: 'Coloration de Giemsa', isCorrect: false },
      ]
    },
    {
      text: 'Quelle température est requise pour la stérilisation à la chaleur humide ?',
      moduleId: modules[19].id,
      lessonId: lessons[45].id,
      difficulty: 'MEDIUM',
      explanation: 'L\'autoclavage à 121°C pendant 15-20 minutes assure une stérilisation efficace.',
      options: [
        { text: '121°C', isCorrect: true },
        { text: '100°C', isCorrect: false },
        { text: '80°C', isCorrect: false },
        { text: '160°C', isCorrect: false },
      ]
    },
    {
      text: 'Quel mécanisme de résistance est le plus fréquent pour les pénicillines ?',
      moduleId: modules[19].id,
      lessonId: lessons[47].id,
      difficulty: 'MEDIUM',
      explanation: 'La production de bêta-lactamases qui hydrolysent le cycle bêta-lactame est le mécanisme principal.',
      options: [
        { text: 'Production de bêta-lactamases', isCorrect: true },
        { text: 'Modification de la cible', isCorrect: false },
        { text: 'Efflux actif', isCorrect: false },
        { text: 'Imperméabilité membranaire', isCorrect: false },
      ]
    },
    
    // Additional questions for other subjects
    // Galénique I (3rd year)
    {
      text: 'Quel excipient est couramment utilisé comme liant dans les comprimés ?',
      moduleId: modules[16].id,
      lessonId: lessons[27].id,
      difficulty: 'MEDIUM',
      explanation: 'La povidone (PVP) est un liant couramment utilisé en compression directe.',
      options: [
        { text: 'Povidone (PVP)', isCorrect: true },
        { text: 'Stéarate de magnésium', isCorrect: false },
        { text: 'Talc', isCorrect: false },
        { text: 'Amidon de maïs', isCorrect: false },
      ]
    },
    {
      text: 'Quelle est la taille limite pour les particules injectables ?',
      moduleId: modules[16].id,
      lessonId: lessons[28].id,
      difficulty: 'HARD',
      explanation: 'Les particules dans les préparations injectables ne doivent pas dépasser 25 μm.',
      options: [
        { text: '25 μm', isCorrect: true },
        { text: '50 μm', isCorrect: false },
        { text: '100 μm', isCorrect: false },
        { text: '10 μm', isCorrect: false },
      ]
    },
    
    // More questions for comprehensive coverage
    {
      text: 'Quel est le pH physiologique du sang artériel ?',
      moduleId: modules[18].id,
      lessonId: lessons[41].id,
      difficulty: 'EASY',
      explanation: 'Le pH sanguin artériel normal est de 7,35-7,45.',
      options: [
        { text: '7,35-7,45', isCorrect: true },
        { text: '6,8-7,0', isCorrect: false },
        { text: '7,8-8,0', isCorrect: false },
        { text: '7,0-7,2', isCorrect: false },
      ]
    },
    {
      text: 'Quelle voie métabolique est principalement affectée par l\'alcool éthylique ?',
      moduleId: modules[17].id,
      lessonId: lessons[33].id,
      difficulty: 'MEDIUM',
      explanation: 'L\'alcool déshydrogénase hépatique convertit l\'éthanol en acétaldéhyde.',
      options: [
        { text: 'Alcool déshydrogénase', isCorrect: true },
        { text: 'Cytochrome P450 2E1', isCorrect: false },
        { text: 'Catalase', isCorrect: false },
        { text: 'Aldéhyde déshydrogénase', isCorrect: false },
      ]
    },
    {
      text: 'Que signifie l\'interaction médicamenteuse synergique ?',
      moduleId: modules[22].id,
      lessonId: lessons[49].id,
      difficulty: 'HARD',
      explanation: 'Une synergie amplifie l\'effet thérapeutique au-delà de la simple addition',
      options: [
        { text: 'L\'effet combiné est supérieur à la somme des effets individuels', isCorrect: true },
        { text: 'Un médicament annule l\'effet de l\'autre', isCorrect: false },
        { text: 'Les deux médicaments ont le même effet', isCorrect: false },
        { text: 'L\'effet combiné est égal à la somme des effets', isCorrect: false },
      ]
    }
  ];

  for (const bankQ of bankQuestions) {
    // Find the study year for this question based on its module
    const module = modules.find(m => m.id === bankQ.moduleId);
    const semester = semesters.find(s => s.id === module?.semesterId);
    const studyYearId = semester?.studyYearId;

    const question = await prisma.questionBank.create({
      data: {
        id: createId(),
        text: bankQ.text,
        questionType: QuestionType.QCMA,
        studyYearId: studyYearId,
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

  // 5. Create Extensive Quizzes and Exams (Focus on 3rd year)
  console.log('\n🧭 Creating extensive quizzes and exams...');
  const quizzes = [];
  
  // Create detailed quiz questions for different topics
  const pharmacologyQuestions = [
    {
      text: 'Quel récepteur est bloqué par l\'atropine ?',
      options: [
        { text: 'Récepteurs muscariniques', isCorrect: true },
        { text: 'Récepteurs nicotiniques', isCorrect: false },
        { text: 'Récepteurs α-adrénergiques', isCorrect: false },
        { text: 'Récepteurs β-adrénergiques', isCorrect: false },
      ]
    },
    {
      text: 'Quelle est la voie d\'administration la plus rapide pour un effet systémique ?',
      options: [
        { text: 'Intraveineuse', isCorrect: true },
        { text: 'Intramusculaire', isCorrect: false },
        { text: 'Orale', isCorrect: false },
        { text: 'Sous-cutanée', isCorrect: false },
      ]
    },
    {
      text: 'Quel paramètre pharmacocinétique indique la capacité d\'élimination d\'un médicament ?',
      options: [
        { text: 'Clairance', isCorrect: true },
        { text: 'Volume de distribution', isCorrect: false },
        { text: 'Biodisponibilité', isCorrect: false },
        { text: 'Temps de demi-vie', isCorrect: false },
      ]
    },
    {
      text: 'Quel neurotransmetteur est libéré aux synapses cholinergiques ?',
      options: [
        { text: 'Acétylcholine', isCorrect: true },
        { text: 'Noradrénaline', isCorrect: false },
        { text: 'Dopamine', isCorrect: false },
        { text: 'Sérotonine', isCorrect: false },
      ]
    },
    {
      text: 'Quel mécanisme explique la tolérance aux opioïdes ?',
      options: [
        { text: 'Désensibilisation des récepteurs', isCorrect: true },
        { text: 'Induction enzymatique', isCorrect: false },
        { text: 'Augmentation du métabolisme', isCorrect: false },
        { text: 'Diminution de l\'absorption', isCorrect: false },
      ]
    }
  ];

  const chemotherapyQuestions = [
    {
      text: 'Quelle caractéristique structurale rend un médicament plus lipophile ?',
      options: [
        { text: 'Présence de groupements alkyles', isCorrect: true },
        { text: 'Présence de groupements hydroxyles', isCorrect: false },
        { text: 'Présence de groupements carboxyles', isCorrect: false },
        { text: 'Présence de groupements amines', isCorrect: false },
      ]
    },
    {
      text: 'Quel mécanisme de résistance aux quinolones est le plus fréquent ?',
      options: [
        { text: 'Mutation de la gyrase', isCorrect: true },
        { text: 'Inactivation enzymatique', isCorrect: false },
        { text: 'Efflux actif', isCorrect: false },
        { text: 'Imperméabilité', isCorrect: false },
      ]
    },
    {
      text: 'Quelle fonction chimique est présente dans tous les AINS ?',
      options: [
        { text: 'Fonction acide carboxylique ou énolique', isCorrect: true },
        { text: 'Fonction amine primaire', isCorrect: false },
        { text: 'Fonction alcool', isCorrect: false },
        { text: 'Fonction phénol', isCorrect: false },
      ]
    },
    {
      text: 'Quel substituant améliore généralement l\'activité antibactérienne des pénicillines ?',
      options: [
        { text: 'Chaîne latérale volumineuse', isCorrect: true },
        { text: 'Groupe méthyle simple', isCorrect: false },
        { text: 'Groupe hydroxyle', isCorrect: false },
        { text: 'Halogène', isCorrect: false },
      ]
    }
  ];

  const toxicologyQuestions = [
    {
      text: 'Quel est l\'antidote spécifique des benzodiazépines ?',
      options: [
        { text: 'Flumazénil', isCorrect: true },
        { text: 'Naloxone', isCorrect: false },
        { text: 'Atropine', isCorrect: false },
        { text: 'N-acétylcystéine', isCorrect: false },
      ]
    },
    {
      text: 'Quelle enzyme du cytochrome P450 métabolise principalement l\'éthanol ?',
      options: [
        { text: 'CYP2E1', isCorrect: true },
        { text: 'CYP3A4', isCorrect: false },
        { text: 'CYP2D6', isCorrect: false },
        { text: 'CYP1A2', isCorrect: false },
      ]
    },
    {
      text: 'Quel organe est la cible principale de la toxicité du paracétamol ?',
      options: [
        { text: 'Foie', isCorrect: true },
        { text: 'Rein', isCorrect: false },
        { text: 'Cœur', isCorrect: false },
        { text: 'Poumon', isCorrect: false },
      ]
    }
  ];

  // Create lesson quizzes for all 3rd year lessons (extensive coverage)
  for (let i = 0; i < lessons.length && i < 25; i++) { // First 25 lessons (mostly 3rd year)
    const lesson = lessons[i];
    let quizQuestions = [];
    
    // Select appropriate questions based on lesson content
    if (lesson.title.toLowerCase().includes('pharmacol') || lesson.title.toLowerCase().includes('récepteur') || lesson.title.toLowerCase().includes('neurotransmett')) {
      quizQuestions = pharmacologyQuestions.slice(0, 3);
    } else if (lesson.title.toLowerCase().includes('chimie') || lesson.title.toLowerCase().includes('structure') || lesson.title.toLowerCase().includes('antibiotique')) {
      quizQuestions = chemotherapyQuestions.slice(0, 3);
    } else if (lesson.title.toLowerCase().includes('toxicol')) {
      quizQuestions = toxicologyQuestions;
    } else {
      // Generic questions for other lessons
      quizQuestions = [
        {
          text: `Concept clé de ${lesson.title} - Quelle est la définition correcte ?`,
          options: [
            { text: 'Définition correcte basée sur le cours', isCorrect: true },
            { text: 'Définition incorrecte A', isCorrect: false },
            { text: 'Définition incorrecte B', isCorrect: false },
            { text: 'Définition incorrecte C', isCorrect: false },
          ]
        },
        {
          text: `Application pratique de ${lesson.title} - Comment l'utiliser en pharmacie ?`,
          options: [
            { text: 'Application incorrecte A', isCorrect: false },
            { text: 'Application correcte en pratique pharmaceutique', isCorrect: true },
            { text: 'Application incorrecte B', isCorrect: false },
            { text: 'Application incorrecte C', isCorrect: false },
          ]
        },
        {
          text: `Cas clinique lié à ${lesson.title} - Quelle est la meilleure approche ?`,
          options: [
            { text: 'Approche incorrecte A', isCorrect: false },
            { text: 'Approche incorrecte B', isCorrect: false },
            { text: 'Approche thérapeutique optimale', isCorrect: true },
            { text: 'Approche incorrecte C', isCorrect: false },
          ]
        }
      ];
    }

    const quiz = await prisma.quiz.create({
      data: {
        id: createId(),
        title: `Quiz: ${lesson.title}`,
        description: `Évaluation approfondie du cours "${lesson.title}" avec questions théoriques et pratiques`,
        type: QuizType.QUIZ,
        lessonId: lesson.id,
        order: 1,
        timeLimit: 20, // 20 minutes
      },
    });

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

  // Module Exams (Focus on all 3rd year modules)
  const thirdYearModuleIndexes = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21]; // 3rd year modules
  
  for (const moduleIndex of thirdYearModuleIndexes) {
    if (moduleIndex < modules.length) {
      const module = modules[moduleIndex];
      const exam = await prisma.quiz.create({
        data: {
          id: createId(),
          title: `Examen: ${module.name}`,
          description: `Examen final complet pour le module "${module.name}" - Évaluation théorique et pratique`,
          type: QuizType.EXAM,
          moduleId: module.id,
          timeLimit: 120, // 2 hours
        },
      });

      // Create specific exam questions based on module
      let examQuestions = [];
      
      if (module.name.includes('Pharmacologie')) {
        examQuestions = [
          {
            text: 'Un patient traité par warfarine présente un INR élevé. Quel médicament peut expliquer cette interaction ?',
            options: [
              { text: 'Miconazole (inhibiteur enzymatique)', isCorrect: true },
              { text: 'Rifampicine (inducteur enzymatique)', isCorrect: false },
              { text: 'Paracétamol (pas d\'interaction)', isCorrect: false },
              { text: 'Vitamine K (antagoniste)', isCorrect: false },
            ]
          },
          {
            text: 'Quel paramètre pharmacocinétique est le plus affecté chez le sujet âgé ?',
            options: [
              { text: 'Clairance rénale', isCorrect: true },
              { text: 'Absorption gastrique', isCorrect: false },
              { text: 'Liaison protéique', isCorrect: false },
              { text: 'Métabolisme de phase I', isCorrect: false },
            ]
          },
          {
            text: 'Quel récepteur couple à une protéine Gs active l\'adénylyl cyclase ?',
            options: [
              { text: 'Récepteur β-adrénergique', isCorrect: true },
              { text: 'Récepteur α2-adrénergique', isCorrect: false },
              { text: 'Récepteur muscarinique M2', isCorrect: false },
              { text: 'Récepteur GABA-A', isCorrect: false },
            ]
          },
          {
            text: 'Dans quel cas utilise-t-on la voie sublinguale ?',
            options: [
              { text: 'Éviter le premier passage hépatique', isCorrect: true },
              { text: 'Absorption lente et prolongée', isCorrect: false },
              { text: 'Action locale uniquement', isCorrect: false },
              { text: 'Molécules hydrophiles', isCorrect: false },
            ]
          },
          {
            text: 'Quel mécanisme explique la résistance à l\'insuline dans le diabète de type 2 ?',
            options: [
              { text: 'Diminution de la sensibilité des récepteurs', isCorrect: true },
              { text: 'Absence de sécrétion d\'insuline', isCorrect: false },
              { text: 'Destruction auto-immune des cellules β', isCorrect: false },
              { text: 'Augmentation de la clearance de l\'insuline', isCorrect: false },
            ]
          }
        ];
      } else if (module.name.includes('Chimie Thérapeutique')) {
        examQuestions = [
          {
            text: 'Quelle modification structurale améliore la biodisponibilité orale d\'un médicament ?',
            options: [
              { text: 'Augmentation de la lipophilie', isCorrect: true },
              { text: 'Ajout de groupements ionisables', isCorrect: false },
              { text: 'Augmentation du poids moléculaire', isCorrect: false },
              { text: 'Ajout de liaisons hydrogène', isCorrect: false },
            ]
          },
          {
            text: 'Quel mécanisme d\'action caractérise les inhibiteurs de l\'ECA ?',
            options: [
              { text: 'Inhibition compétitive de l\'enzyme', isCorrect: true },
              { text: 'Blocage des récepteurs AT1', isCorrect: false },
              { text: 'Inhibition de la rénine', isCorrect: false },
              { text: 'Blocage des canaux calciques', isCorrect: false },
            ]
          },
          {
            text: 'Quelle caractéristique structurale est commune aux macrolides ?',
            options: [
              { text: 'Cycle lactone à 14-16 chaînons', isCorrect: true },
              { text: 'Cycle β-lactame', isCorrect: false },
              { text: 'Noyau quinoléine', isCorrect: false },
              { text: 'Système aromatique polycyclique', isCorrect: false },
            ]
          },
          {
            text: 'Comment les sulfonamides exercent-ils leur effet antibactérien ?',
            options: [
              { text: 'Inhibition de la synthèse des folates', isCorrect: true },
              { text: 'Inhibition de la synthèse protéique', isCorrect: false },
              { text: 'Altération de la membrane cellulaire', isCorrect: false },
              { text: 'Inhibition de la synthèse d\'ADN', isCorrect: false },
            ]
          }
        ];
      } else if (module.name.includes('Toxicologie')) {
        examQuestions = [
          {
            text: 'Un patient présente une métahémoglobinémie. Quel antidote administrer ?',
            options: [
              { text: 'Bleu de méthylène', isCorrect: true },
              { text: 'N-acétylcystéine', isCorrect: false },
              { text: 'Naloxone', isCorrect: false },
              { text: 'Charbon activé', isCorrect: false },
            ]
          },
          {
            text: 'Quelle est la principale voie de biotransformation de l\'éthanol ?',
            options: [
              { text: 'Alcool déshydrogénase hépatique', isCorrect: true },
              { text: 'CYP2E1 uniquement', isCorrect: false },
              { text: 'Catalase', isCorrect: false },
              { text: 'Excrétion rénale directe', isCorrect: false },
            ]
          },
          {
            text: 'Quel mécanisme explique la toxicité du monoxyde de carbone ?',
            options: [
              { text: 'Liaison irréversible à l\'hémoglobine', isCorrect: true },
              { text: 'Inhibition de la cytochrome oxydase', isCorrect: false },
              { text: 'Blocage des canaux sodium', isCorrect: false },
              { text: 'Dénaturation protéique', isCorrect: false },
            ]
          }
        ];
      } else if (module.name.includes('Biochimie Clinique')) {
        examQuestions = [
          {
            text: 'Quelle enzyme est spécifique du muscle cardiaque en cas d\'infarctus ?',
            options: [
              { text: 'Troponine I cardiaque', isCorrect: true },
              { text: 'CK-MM', isCorrect: false },
              { text: 'LDH1', isCorrect: false },
              { text: 'ASAT', isCorrect: false },
            ]
          },
          {
            text: 'Quel marqueur reflète la fonction glomérulaire ?',
            options: [
              { text: 'Créatinine sérique', isCorrect: true },
              { text: 'Urée sanguine', isCorrect: false },
              { text: 'Acide urique', isCorrect: false },
              { text: 'Protéines totales', isCorrect: false },
            ]
          },
          {
            text: 'Dans le diabète, que mesure l\'HbA1c ?',
            options: [
              { text: 'Glycémie moyenne des 2-3 derniers mois', isCorrect: true },
              { text: 'Glycémie actuelle', isCorrect: false },
              { text: 'Réserve insulinique', isCorrect: false },
              { text: 'Résistance à l\'insuline', isCorrect: false },
            ]
          }
        ];
      } else if (module.name.includes('Microbiologie')) {
        examQuestions = [
          {
            text: 'Quelle température et durée pour l\'autoclavage standard ?',
            options: [
              { text: '121°C pendant 15-20 minutes', isCorrect: true },
              { text: '100°C pendant 30 minutes', isCorrect: false },
              { text: '134°C pendant 5 minutes', isCorrect: false },
              { text: '80°C pendant 60 minutes', isCorrect: false },
            ]
          },
          {
            text: 'Quel test confirme la présence de bêta-lactamases ?',
            options: [
              { text: 'Test à la nitrocéfine', isCorrect: true },
              { text: 'Test à la catalase', isCorrect: false },
              { text: 'Test à l\'oxydase', isCorrect: false },
              { text: 'Coloration de Gram', isCorrect: false },
            ]
          },
          {
            text: 'Quel milieu sélectionne les entérobactéries ?',
            options: [
              { text: 'Mac Conkey', isCorrect: true },
              { text: 'Gélose au sang', isCorrect: false },
              { text: 'Sabouraud', isCorrect: false },
              { text: 'Chapman', isCorrect: false },
            ]
          }
        ];
      } else {
        // Generic comprehensive exam questions
        examQuestions = [
          {
            text: `Analyse approfondie du module ${module.name} - Quel est le concept fondamental ?`,
            options: [
              { text: 'Concept central basé sur les objectifs pédagogiques', isCorrect: true },
              { text: 'Concept secondaire non prioritaire', isCorrect: false },
              { text: 'Concept obsolète', isCorrect: false },
              { text: 'Concept hors programme', isCorrect: false },
            ]
          },
          {
            text: `Application clinique de ${module.name} - Comment intégrer ces connaissances en pratique ?`,
            options: [
              { text: 'Approche théorique uniquement', isCorrect: false },
              { text: 'Intégration multidisciplinaire en pratique pharmaceutique', isCorrect: true },
              { text: 'Application limitée au laboratoire', isCorrect: false },
              { text: 'Pas d\'application pratique', isCorrect: false },
            ]
          },
          {
            text: `Cas complexe lié à ${module.name} - Quelle démarche adopter ?`,
            options: [
              { text: 'Approche empirique', isCorrect: false },
              { text: 'Démarche scientifique structurée', isCorrect: true },
              { text: 'Solution basée sur l\'intuition', isCorrect: false },
              { text: 'Approche non systématique', isCorrect: false },
            ]
          },
          {
            text: `Évolution du domaine ${module.name} - Quelles sont les perspectives d\'avenir ?`,
            options: [
              { text: 'Stagnation des connaissances', isCorrect: false },
              { text: 'Régression des applications', isCorrect: false },
              { text: 'Innovation et développement continu', isCorrect: true },
              { text: 'Abandon progressif du domaine', isCorrect: false },
            ]
          }
        ];
      }

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
  }

  // Additional specialized exams for 3rd year
  const specializedExams = [
    {
      title: 'Examen Intégré: Pharmacologie-Toxicologie',
      description: 'Examen intégratif combinant pharmacologie et toxicologie',
      questions: [
        {
          text: 'Une intoxication digitalique provoque des arythmies. Quel mécanisme est impliqué ?',
          options: [
            { text: 'Inhibition de la Na+/K+-ATPase', isCorrect: true },
            { text: 'Blocage des canaux calcium', isCorrect: false },
            { text: 'Activation excessive des récepteurs β', isCorrect: false },
            { text: 'Inhibition de l\'acétylcholinestérase', isCorrect: false },
          ]
        },
        {
          text: 'Quel antidote utiliser en cas d\'intoxication par les organophosphorés ?',
          options: [
            { text: 'Atropine + Pralidoxime', isCorrect: true },
            { text: 'Naloxone', isCorrect: false },
            { text: 'Flumazénil', isCorrect: false },
            { text: 'N-acétylcystéine', isCorrect: false },
          ]
        }
      ]
    },
    {
      title: 'Examen Pratique: Analyse Pharmaceutique',
      description: 'Évaluation pratique des méthodes d\'analyse en pharmacie',
      questions: [
        {
          text: 'Pour analyser un mélange de paracétamol et caféine, quelle méthode chromatographique choisir ?',
          options: [
            { text: 'HPLC en phase inverse', isCorrect: true },
            { text: 'Chromatographie d\'exclusion', isCorrect: false },
            { text: 'Chromatographie d\'échange d\'ions', isCorrect: false },
            { text: 'CCM simple', isCorrect: false },
          ]
        }
      ]
    }
  ];

  for (const specialExam of specializedExams) {
    const exam = await prisma.quiz.create({
      data: {
        id: createId(),
        title: specialExam.title,
        description: specialExam.description,
        type: QuizType.EXAM,
        timeLimit: 180, // 3 hours for comprehensive exams
      },
    });

    for (let qIndex = 0; qIndex < specialExam.questions.length; qIndex++) {
      const qData = specialExam.questions[qIndex];
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
    console.log(`✅ Specialized Exam: ${exam.title}`);
  }

  // Multiple Session Quizzes (revision quizzes) for different topics
  const sessionQuizData = [
    {
      title: 'Quiz de Révision - Pharmacologie Générale',
      description: 'Révision complète des concepts de pharmacologie générale',
      lessonRange: [0, 7], // First 8 lessons (pharmacology)
      questionCount: 25
    },
    {
      title: 'Quiz de Révision - Chimie Thérapeutique',
      description: 'Révision des mécanismes d\'action et structures chimiques',
      lessonRange: [8, 14], // Chemistry lessons
      questionCount: 20
    },
    {
      title: 'Quiz de Révision - Pharmacognosie',
      description: 'Révision des substances naturelles et métabolites',
      lessonRange: [15, 21], // Pharmacognosy lessons
      questionCount: 18
    },
    {
      title: 'Quiz de Révision - Sciences Analytiques',
      description: 'Révision des méthodes d\'analyse pharmaceutique',
      lessonRange: [22, 26], // Analytical chemistry lessons
      questionCount: 15
    },
    {
      title: 'Quiz de Révision - Toxicologie',
      description: 'Révision des mécanismes toxiques et antidotes',
      lessonRange: [29, 35], // Toxicology lessons
      questionCount: 22
    },
    {
      title: 'Quiz de Révision - Biochimie Clinique',
      description: 'Révision des analyses biologiques et interprétations',
      lessonRange: [35, 41], // Clinical biochemistry lessons
      questionCount: 20
    },
    {
      title: 'Quiz de Révision - Microbiologie',
      description: 'Révision de la microbiologie pharmaceutique',
      lessonRange: [41, 47], // Microbiology lessons
      questionCount: 18
    },
    {
      title: 'Quiz de Révision Intégrative - 3ème Année S1',
      description: 'Révision globale du premier semestre de 3ème année',
      lessonRange: [0, 26], // All first semester lessons
      questionCount: 30
    },
    {
      title: 'Quiz de Révision Intégrative - 3ème Année S2',
      description: 'Révision globale du second semestre de 3ème année',
      lessonRange: [27, 47], // All second semester lessons
      questionCount: 35
    },
    {
      title: 'Quiz de Révision - Préparation aux Examens',
      description: 'Quiz intensif de préparation aux examens finaux',
      lessonRange: [0, 47], // All 3rd year lessons
      questionCount: 50
    }
  ];

  for (const sessionData of sessionQuizData) {
    const sessionQuiz = await prisma.quiz.create({
      data: {
        id: createId(),
        title: sessionData.title,
        description: sessionData.description,
        type: QuizType.SESSION,
        questionCount: sessionData.questionCount,
        timeLimit: Math.ceil(sessionData.questionCount * 1.5), // 1.5 minutes per question
      },
    });

    // Link lessons to the session quiz
    const [startIdx, endIdx] = sessionData.lessonRange;
    for (let i = startIdx; i <= endIdx && i < lessons.length; i++) {
      await prisma.sessionQuizLesson.create({
        data: {
          id: createId(),
          quizId: sessionQuiz.id,
          lessonId: lessons[i].id,
        },
      });
    }

    quizzes.push(sessionQuiz);
    console.log(`✅ Session Quiz: ${sessionQuiz.title} (${sessionData.questionCount} questions)`);
  }

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

  // 7. Create Plan Types and Student Licenses
  console.log('\n🎫 Creating plan types and student licenses...');

  // Create Plan Types
  const annualPlanTypeId = createId();
  const annualPlanType = await prisma.planType.upsert({
    where: { id: annualPlanTypeId },
    update: {},
    create: {
      id: annualPlanTypeId,
      name: 'ANNUAL',
      duration: 365, // 1 year in days
    },
  });

  const semestrialPlanTypeId = createId();
  const semestrialPlanType = await prisma.planType.upsert({
    where: { id: semestrialPlanTypeId },
    update: {},
    create: {
      id: semestrialPlanTypeId,
      name: 'SEMESTRIAL',
      duration: 180, // 6 months in days
    },
  });

  console.log(`✅ Plan Types: ANNUAL (365 days), SEMESTRIAL (180 days)`);

  // Create Plans
  const annualPlan = await prisma.plan.create({
    data: {
      id: createId(),
      planTypeId: annualPlanType.id,
    },
  });

  console.log(`✅ Annual Plan created`);

  // Create licenses for each student based on their study year
  const today = new Date();
  const oneYearLater = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);

  for (const student of students) {
    // Skip if student doesn't have a year assigned
    if (!student.year) continue;
    
    // Find the student's study year (index based on year number)
    const studentStudyYear = studyYears[student.year - 1]; // Array is 0-indexed, years start at 1
    
    if (studentStudyYear) {
      // Create license for the student
      const license = await prisma.license.create({
        data: {
          id: createId(),
          userId: student.id,
          planId: annualPlan.id,
          startDate: today,
          endDate: oneYearLater,
          isActive: true,
        },
      });

      // Create license study year scope (gives access to their year)
      await prisma.licenseStudyYear.create({
        data: {
          id: createId(),
          licenseId: license.id,
          studyYearId: studentStudyYear.id,
        },
      });

      console.log(`✅ License: ${student.name} - Access to ${studentStudyYear.name} (${today.toLocaleDateString()} to ${oneYearLater.toLocaleDateString()})`);
    }
  }

  // Create Universities and Drive Links
  console.log('\n🏛️ Creating universities and drive links...');
  
  const universityData = [
    { name: 'Université d\'Alger - Faculté de Pharmacie' },
    { name: 'Université de Constantine - Faculté de Pharmacie' },
    { name: 'Université d\'Oran - Faculté de Pharmacie' },
    { name: 'Université de Tlemcen - Faculté de Pharmacie' },
    { name: 'Université de Sétif - Faculté de Pharmacie' },
    { name: 'Université de Batna - Faculté de Pharmacie' },
    { name: 'Université de Blida - Faculté de Pharmacie' },
    { name: 'Université d\'Annaba - Faculté de Pharmacie' },
    { name: 'Université de Béjaïa - Faculté de Pharmacie' },
    { name: 'Université de Mostaganem - Faculté de Pharmacie' },
  ];

  const universities = [];
  for (const data of universityData) {
    const university = await prisma.university.create({
      data: {
        id: createId(),
        name: data.name,
      },
    });
    universities.push(university);
    console.log(`✅ University: ${university.name}`);
  }

  // Create Drive Links for each university
  console.log('\n🔗 Creating drive links...');
  
  const academicYears = ['2022/2023', '2023/2024', '2024/2025', '2025/2026'];
  const studyYearNames = ['1ère année', '2ème année', '3ème année', '4ème année', '5ème année', '6ème année'];
  const driveLinks = [];

  for (const university of universities) {
    // Create drive links for different study years and academic years
    const yearsToCreate = academicYears.slice(Math.floor(Math.random() * 2), Math.floor(Math.random() * 2) + 3);
    const studyYearsToCreate = studyYearNames.slice(0, Math.floor(Math.random() * 4) + 3); // 3-6 study years per university
    
    for (const studyYear of studyYearsToCreate) {
      for (const academicYear of yearsToCreate) {
        // Not all study years have resources for all academic years
        if (Math.random() > 0.3) { // 70% chance of having resources
          const driveLink = await prisma.driveLink.create({
            data: {
              id: createId(),
              studyYear: studyYear,
              year: academicYear,
              link: `https://drive.google.com/drive/folders/${createId()}?usp=sharing`,
              universityId: university.id,
            },
          });
          driveLinks.push(driveLink);
          console.log(`✅ Drive Link: ${university.name} - ${studyYear} - ${academicYear}`);
        }
      }
    }
  }

  // Summary
  console.log('\n🎉 COMPREHENSIVE DATABASE SEEDING COMPLETED!');

  console.log('\n📊 DETAILED DATABASE SUMMARY:');
  console.log('==============================================');
  console.log(`👥 Users: ${studentData.length + 2} (${studentData.filter(s => s.year === 3).length} 3rd year students + others, 1 teacher, 1 admin)`);
  console.log(`📚 Study Years: ${studyYears.length} (1st to 6th year)`);
  console.log(`📖 Semesters: ${semesters.length} (2 per year)`);
  console.log(`📑 Modules: ${modules.length} (FOCUS: 3rd year with ${thirdYearModuleIndexes.length} modules)`);
  console.log(`📝 Lessons: ${lessons.length} (Extensive 3rd year content)`);
  console.log(`❓ Question Bank: ${questionBank.length} comprehensive questions (3rd year focus)`);
  console.log(`🧭 Quizzes: ${quizzes.length} total assessments including:`);
  console.log(`   📋 Lesson Quizzes: ~25 (detailed per lesson)`);
  console.log(`   📊 Module Exams: ${thirdYearModuleIndexes.length} (comprehensive 3rd year)`);
  console.log(`   🔄 Session Quizzes: ${sessionQuizData.length} (revision & integration)`);
  console.log(`   🎯 Specialized Exams: 2 (integrative assessments)`);
  console.log(`🎫 Student Licenses: ${students.length} (Annual - Year-specific access)`);
  console.log(`🏛️ Universities: ${universities.length} (Algerian pharmacy faculties)`);
  console.log(`🔗 Drive Links: ${driveLinks.length} (Academic year resources)`);
  
  console.log('\n🎯 3RD YEAR FOCUS HIGHLIGHTS:');
  console.log('==============================================');
  console.log('� Core 3rd Year Modules:');
  console.log('   S1: Pharmacologie Générale, Chimie Thérapeutique, Pharmacognosie');
  console.log('   S1: Chimie Analytique, Galénique I');
  console.log('   S2: Toxicologie, Biochimie Clinique, Microbiologie Pharmaceutique');
  console.log('   S2: Galénique II, Hématologie, Parasitologie');
  
  console.log(`\n📊 3rd Year Students: ${studentData.filter(s => s.year === 3).length}/15 students`);
  console.log(`📝 3rd Year Lessons: ~40+ detailed lessons with practical applications`);
  console.log(`❓ 3rd Year Questions: ${questionBank.length} bank questions + quiz questions`);
  console.log(`🧭 3rd Year Assessments: Multiple quizzes, exams, and revision sessions`);
  
  console.log('\n🔑 TEST ACCOUNT CREDENTIALS:');
  console.log('==============================================');
  console.log('Password for all accounts: "password123"');
  console.log('');
  console.log('👑 ADMIN: admin@pharmapedia.com');
  console.log('👨‍🏫 TEACHER: teacher@pharmapedia.com');
  console.log('\n👨‍🎓 3RD YEAR STUDENTS (MAIN FOCUS):');
  studentData.filter(s => s.year === 3).forEach(s => 
    console.log(`   ${s.email} (${s.name} - ${s.university})`)
  );
  console.log('\n👨‍🎓 OTHER STUDENTS:');
  studentData.filter(s => s.year !== 3).forEach(s => 
    console.log(`   ${s.email} (${s.name} - ${s.year}ème année)`)
  );
  console.log('==============================================');
  
  console.log('\n🚀 READY FOR TESTING:');
  console.log('- Extensive 3rd year content with real pharmaceutical knowledge');
  console.log('- Multiple assessment types (quizzes, exams, revision sessions)');
  console.log('- Comprehensive question bank with detailed explanations');
  console.log('- Realistic student cohort with university diversity');
  console.log('- Complete academic structure from 1st to 6th year');
  console.log('==============================================');
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
