-- AlterTable
ALTER TABLE "public"."Lesson" ADD COLUMN     "description" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Lesson_moduleId_order_idx" ON "public"."Lesson"("moduleId", "order");
