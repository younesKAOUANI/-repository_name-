-- CreateTable
CREATE TABLE "public"."QuestionBank" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "questionType" "public"."QuestionType" NOT NULL,
    "lessonId" INTEGER,
    "moduleId" INTEGER,
    "difficulty" TEXT,
    "explanation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionBankOption" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "questionBankId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBankOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GeneratedQuizQuestion" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "questionBankId" INTEGER NOT NULL,
    "order" INTEGER,

    CONSTRAINT "GeneratedQuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionBank_lessonId_idx" ON "public"."QuestionBank"("lessonId");

-- CreateIndex
CREATE INDEX "QuestionBank_moduleId_idx" ON "public"."QuestionBank"("moduleId");

-- CreateIndex
CREATE INDEX "QuestionBank_isActive_idx" ON "public"."QuestionBank"("isActive");

-- CreateIndex
CREATE INDEX "QuestionBankOption_questionBankId_idx" ON "public"."QuestionBankOption"("questionBankId");

-- CreateIndex
CREATE INDEX "GeneratedQuizQuestion_quizId_idx" ON "public"."GeneratedQuizQuestion"("quizId");

-- CreateIndex
CREATE INDEX "GeneratedQuizQuestion_questionBankId_idx" ON "public"."GeneratedQuizQuestion"("questionBankId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedQuizQuestion_quizId_questionBankId_key" ON "public"."GeneratedQuizQuestion"("quizId", "questionBankId");

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
