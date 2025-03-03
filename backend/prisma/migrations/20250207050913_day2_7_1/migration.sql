/*
  Warnings:

  - Added the required column `clientName` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "clientName" TEXT NOT NULL,
ADD COLUMN     "nationality" TEXT NOT NULL;
