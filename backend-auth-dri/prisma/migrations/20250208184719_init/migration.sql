/*
  Warnings:

  - You are about to drop the column `displayNumber` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `Job` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY');

-- DropIndex
DROP INDEX "Driver_displayNumber_key";

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "displayNumber",
ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "cancellationRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "totalJobsCompleted" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "destination",
ADD COLUMN     "assignedDriverId" INTEGER;

-- CreateTable
CREATE TABLE "AdminDriverRelation" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminDriverRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminDriverRelation_adminId_driverId_key" ON "AdminDriverRelation"("adminId", "driverId");

-- AddForeignKey
ALTER TABLE "AdminDriverRelation" ADD CONSTRAINT "AdminDriverRelation_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminDriverRelation" ADD CONSTRAINT "AdminDriverRelation_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
