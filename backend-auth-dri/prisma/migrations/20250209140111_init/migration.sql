/*
  Warnings:

  - You are about to drop the column `pickupDate` on the `Job` table. All the data in the column will be lost.
  - Added the required column `clientName` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distance` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentAmount` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "pickupDate",
ADD COLUMN     "clientName" TEXT NOT NULL,
ADD COLUMN     "distance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "nationality" TEXT NOT NULL,
ADD COLUMN     "paymentAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
