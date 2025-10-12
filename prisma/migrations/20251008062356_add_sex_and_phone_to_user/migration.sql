-- CreateEnum
CREATE TYPE "public"."Sex" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "explanationImg" TEXT;

-- AlterTable
ALTER TABLE "public"."QuestionBank" ADD COLUMN     "explanationImg" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "emailVerificationExpiry" TIMESTAMP(3),
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "sex" "public"."Sex";

-- CreateTable
CREATE TABLE "public"."University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriveLink" (
    "id" TEXT NOT NULL,
    "studyYear" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriveLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "University_name_idx" ON "public"."University"("name");

-- CreateIndex
CREATE INDEX "DriveLink_universityId_idx" ON "public"."DriveLink"("universityId");

-- CreateIndex
CREATE INDEX "DriveLink_studyYear_idx" ON "public"."DriveLink"("studyYear");

-- CreateIndex
CREATE INDEX "DriveLink_year_idx" ON "public"."DriveLink"("year");

-- AddForeignKey
ALTER TABLE "public"."DriveLink" ADD CONSTRAINT "DriveLink_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "public"."University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
