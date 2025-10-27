-- Migration: Remove difficulty from QuestionBank, add questionImage
ALTER TABLE "QuestionBank" DROP COLUMN IF EXISTS "difficulty";
ALTER TABLE "QuestionBank" ADD COLUMN IF NOT EXISTS "questionImage" TEXT;
