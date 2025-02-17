/*
  Warnings:

  - A unique constraint covering the columns `[displayNumber]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleType` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "displayNumber" SERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vehicleType" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Driver_displayNumber_key" ON "Driver"("displayNumber");
