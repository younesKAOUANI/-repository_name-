// prisma/attach-questions-to-module.js
// Finds a 3rd-year module and sets moduleId on specific questionBank items
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async function main(){
  try{
    // Find a study year that looks like 3rd year
    let studyYear = await prisma.studyYear.findFirst({ where: { name: { contains: '3' } } });
    if(!studyYear){
      console.log('No studyYear found with "3" in the name. Available studyYears:');
      const all = await prisma.studyYear.findMany();
      console.log(all);
      return;
    }

    console.log('Using studyYear:', studyYear.name, studyYear.id);

    const modules = await prisma.module.findMany({ where: { semester: { studyYearId: studyYear.id } }, include: { semester: { select: { id:true, name:true } } } });
    if(modules.length === 0){
      console.log('No modules found for studyYear', studyYear.id);
      return;
    }

    const mod = modules[0];
    console.log('Selected module:', mod.name, mod.id, 'semester:', mod.semester.name);

    const texts = [
      'test',
      'Which receptor type do beta-blockers primarily antagonize?',
      'Select the common adverse effects of systemic corticosteroids.',
      'Briefly describe the vascular and cellular phases of acute inflammation.',
      'Which of the following are Gram-negative rods?',
      'Differentiate bactericidal from bacteriostatic antibiotics in one sentence.'
    ];

    const res = await prisma.questionBank.updateMany({ where: { text: { in: texts } }, data: { moduleId: mod.id } });
    console.log('Updated count:', res.count);

    const rows = await prisma.questionBank.findMany({ where: { text: { in: texts } }, include: { module: { select: { id:true, name:true } }, lesson: { select: { id:true, title:true } } } });
    console.log('Updated rows:\n', JSON.stringify(rows, null, 2));
  }catch(e){
    console.error(e);
  }finally{
    await prisma.$disconnect();
  }
})();
