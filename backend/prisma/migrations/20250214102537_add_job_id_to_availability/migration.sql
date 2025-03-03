/*
  Warnings:

  - A unique constraint covering the columns `[driverId,jobId]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "jobId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Availability_driverId_jobId_key" ON "Availability"("driverId", "jobId");

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("jobId") ON DELETE SET NULL ON UPDATE CASCADE;
