/*
  Warnings:

  - The primary key for the `AnswerOption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GeneratedQuizQuestion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Lesson` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LessonPDF` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LessonVideo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `License` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LicenseModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LicenseSemester` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LicenseStudyYear` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Module` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Plan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PlanType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QuestionBank` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QuestionBankOption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Quiz` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QuizAttempt` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QuizAttemptAnswer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `QuizProgress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Semester` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SessionQuizLesson` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `StudyYear` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."AnswerOption" DROP CONSTRAINT "AnswerOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GeneratedQuizQuestion" DROP CONSTRAINT "GeneratedQuizQuestion_questionBankId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GeneratedQuizQuestion" DROP CONSTRAINT "GeneratedQuizQuestion_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LessonPDF" DROP CONSTRAINT "LessonPDF_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LessonVideo" DROP CONSTRAINT "LessonVideo_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."License" DROP CONSTRAINT "License_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LicenseModule" DROP CONSTRAINT "LicenseModule_licenseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LicenseModule" DROP CONSTRAINT "LicenseModule_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LicenseSemester" DROP CONSTRAINT "LicenseSemester_licenseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LicenseSemester" DROP CONSTRAINT "LicenseSemester_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LicenseStudyYear" DROP CONSTRAINT "LicenseStudyYear_licenseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LicenseStudyYear" DROP CONSTRAINT "LicenseStudyYear_studyYearId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Module" DROP CONSTRAINT "Module_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Plan" DROP CONSTRAINT "Plan_planTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuestionBank" DROP CONSTRAINT "QuestionBank_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuestionBank" DROP CONSTRAINT "QuestionBank_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuestionBankOption" DROP CONSTRAINT "QuestionBankOption_questionBankId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuizAttempt" DROP CONSTRAINT "QuizAttempt_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuizAttemptAnswer" DROP CONSTRAINT "QuizAttemptAnswer_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuizAttemptAnswer" DROP CONSTRAINT "QuizAttemptAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuizAttemptAnswer" DROP CONSTRAINT "QuizAttemptAnswer_selectedOptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuizProgress" DROP CONSTRAINT "QuizProgress_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Semester" DROP CONSTRAINT "Semester_studyYearId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionQuizLesson" DROP CONSTRAINT "SessionQuizLesson_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionQuizLesson" DROP CONSTRAINT "SessionQuizLesson_quizId_fkey";

-- AlterTable
ALTER TABLE "public"."AnswerOption" DROP CONSTRAINT "AnswerOption_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "questionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "AnswerOption_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AnswerOption_id_seq";

-- AlterTable
ALTER TABLE "public"."GeneratedQuizQuestion" DROP CONSTRAINT "GeneratedQuizQuestion_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "quizId" SET DATA TYPE TEXT,
ALTER COLUMN "questionBankId" SET DATA TYPE TEXT,
ADD CONSTRAINT "GeneratedQuizQuestion_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GeneratedQuizQuestion_id_seq";

-- AlterTable
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "moduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Lesson_id_seq";

-- AlterTable
ALTER TABLE "public"."LessonPDF" DROP CONSTRAINT "LessonPDF_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "lessonId" SET DATA TYPE TEXT,
ADD CONSTRAINT "LessonPDF_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LessonPDF_id_seq";

-- AlterTable
ALTER TABLE "public"."LessonVideo" DROP CONSTRAINT "LessonVideo_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "lessonId" SET DATA TYPE TEXT,
ADD CONSTRAINT "LessonVideo_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LessonVideo_id_seq";

-- AlterTable
ALTER TABLE "public"."License" DROP CONSTRAINT "License_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "planId" SET DATA TYPE TEXT,
ADD CONSTRAINT "License_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "License_id_seq";

-- AlterTable
ALTER TABLE "public"."LicenseModule" DROP CONSTRAINT "LicenseModule_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "licenseId" SET DATA TYPE TEXT,
ALTER COLUMN "moduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "LicenseModule_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LicenseModule_id_seq";

-- AlterTable
ALTER TABLE "public"."LicenseSemester" DROP CONSTRAINT "LicenseSemester_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "licenseId" SET DATA TYPE TEXT,
ALTER COLUMN "semesterId" SET DATA TYPE TEXT,
ADD CONSTRAINT "LicenseSemester_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LicenseSemester_id_seq";

-- AlterTable
ALTER TABLE "public"."LicenseStudyYear" DROP CONSTRAINT "LicenseStudyYear_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "licenseId" SET DATA TYPE TEXT,
ALTER COLUMN "studyYearId" SET DATA TYPE TEXT,
ADD CONSTRAINT "LicenseStudyYear_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LicenseStudyYear_id_seq";

-- AlterTable
ALTER TABLE "public"."Module" DROP CONSTRAINT "Module_pkey",
ADD COLUMN     "description" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "semesterId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Module_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Module_id_seq";

-- AlterTable
ALTER TABLE "public"."Plan" DROP CONSTRAINT "Plan_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "planTypeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Plan_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Plan_id_seq";

-- AlterTable
ALTER TABLE "public"."PlanType" DROP CONSTRAINT "PlanType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PlanType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PlanType_id_seq";

-- AlterTable
ALTER TABLE "public"."Question" DROP CONSTRAINT "Question_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "quizId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Question_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Question_id_seq";

-- AlterTable
ALTER TABLE "public"."QuestionBank" DROP CONSTRAINT "QuestionBank_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "lessonId" SET DATA TYPE TEXT,
ALTER COLUMN "moduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QuestionBank_id_seq";

-- AlterTable
ALTER TABLE "public"."QuestionBankOption" DROP CONSTRAINT "QuestionBankOption_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "questionBankId" SET DATA TYPE TEXT,
ADD CONSTRAINT "QuestionBankOption_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QuestionBankOption_id_seq";

-- AlterTable
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "lessonId" SET DATA TYPE TEXT,
ALTER COLUMN "moduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Quiz_id_seq";

-- AlterTable
ALTER TABLE "public"."QuizAttempt" DROP CONSTRAINT "QuizAttempt_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "quizId" SET DATA TYPE TEXT,
ADD CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QuizAttempt_id_seq";

-- AlterTable
ALTER TABLE "public"."QuizAttemptAnswer" DROP CONSTRAINT "QuizAttemptAnswer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "attemptId" SET DATA TYPE TEXT,
ALTER COLUMN "questionId" SET DATA TYPE TEXT,
ALTER COLUMN "selectedOptionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "QuizAttemptAnswer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QuizAttemptAnswer_id_seq";

-- AlterTable
ALTER TABLE "public"."QuizProgress" DROP CONSTRAINT "QuizProgress_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "quizId" SET DATA TYPE TEXT,
ADD CONSTRAINT "QuizProgress_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "QuizProgress_id_seq";

-- AlterTable
ALTER TABLE "public"."Semester" DROP CONSTRAINT "Semester_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "studyYearId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Semester_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Semester_id_seq";

-- AlterTable
ALTER TABLE "public"."SessionQuizLesson" DROP CONSTRAINT "SessionQuizLesson_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "quizId" SET DATA TYPE TEXT,
ALTER COLUMN "lessonId" SET DATA TYPE TEXT,
ADD CONSTRAINT "SessionQuizLesson_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SessionQuizLesson_id_seq";

-- AlterTable
ALTER TABLE "public"."StudyYear" DROP CONSTRAINT "StudyYear_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "StudyYear_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "StudyYear_id_seq";

-- CreateIndex
CREATE INDEX "Semester_name_idx" ON "public"."Semester"("name");

-- CreateIndex
CREATE INDEX "StudyYear_name_idx" ON "public"."StudyYear"("name");

-- AddForeignKey
ALTER TABLE "public"."Semester" ADD CONSTRAINT "Semester_studyYearId_fkey" FOREIGN KEY ("studyYearId") REFERENCES "public"."StudyYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonPDF" ADD CONSTRAINT "LessonPDF_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonVideo" ADD CONSTRAINT "LessonVideo_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionBank" ADD CONSTRAINT "QuestionBank_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionBank" ADD CONSTRAINT "QuestionBank_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionBankOption" ADD CONSTRAINT "QuestionBankOption_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "public"."QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GeneratedQuizQuestion" ADD CONSTRAINT "GeneratedQuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GeneratedQuizQuestion" ADD CONSTRAINT "GeneratedQuizQuestion_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "public"."QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnswerOption" ADD CONSTRAINT "AnswerOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAttemptAnswer" ADD CONSTRAINT "QuizAttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAttemptAnswer" ADD CONSTRAINT "QuizAttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAttemptAnswer" ADD CONSTRAINT "QuizAttemptAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "public"."AnswerOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizProgress" ADD CONSTRAINT "QuizProgress_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionQuizLesson" ADD CONSTRAINT "SessionQuizLesson_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionQuizLesson" ADD CONSTRAINT "SessionQuizLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Plan" ADD CONSTRAINT "Plan_planTypeId_fkey" FOREIGN KEY ("planTypeId") REFERENCES "public"."PlanType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."License" ADD CONSTRAINT "License_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LicenseStudyYear" ADD CONSTRAINT "LicenseStudyYear_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "public"."License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LicenseStudyYear" ADD CONSTRAINT "LicenseStudyYear_studyYearId_fkey" FOREIGN KEY ("studyYearId") REFERENCES "public"."StudyYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LicenseSemester" ADD CONSTRAINT "LicenseSemester_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "public"."License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LicenseSemester" ADD CONSTRAINT "LicenseSemester_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LicenseModule" ADD CONSTRAINT "LicenseModule_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "public"."License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LicenseModule" ADD CONSTRAINT "LicenseModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
