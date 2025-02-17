/*
  Warnings:

  - Added the required column `vehicleCapacity` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleLicense` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "vehicleCapacity" INTEGER NOT NULL,
ADD COLUMN     "vehicleLicense" TEXT NOT NULL;
