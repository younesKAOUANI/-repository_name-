-- Migration: add questionImage column to Question model
-- Generated manually by assistant

ALTER TABLE "Question"
ADD COLUMN IF NOT EXISTS "questionImage" TEXT;
