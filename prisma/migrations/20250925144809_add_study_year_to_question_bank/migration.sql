-- AlterTable
ALTER TABLE "public"."QuestionBank" ADD COLUMN     "studyYearId" TEXT;

-- CreateIndex
CREATE INDEX "QuestionBank_studyYearId_idx" ON "public"."QuestionBank"("studyYearId");

-- AddForeignKey
ALTER TABLE "public"."QuestionBank" ADD CONSTRAINT "QuestionBank_studyYearId_fkey" FOREIGN KEY ("studyYearId") REFERENCES "public"."StudyYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
