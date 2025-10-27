const {PrismaClient}=require('@prisma/client');
(async ()=>{
  const p=new PrismaClient();
  try{
    const modules=await p.module.findMany({include:{semester:{include:{studyYear:true}}}});
    console.log(JSON.stringify(modules.slice(0,5),null,2));
  }catch(e){
    console.error('ERR',e);
  }finally{
    await p.$disconnect();
  }
})();
