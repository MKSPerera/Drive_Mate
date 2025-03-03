-- CreateEnum
CREATE TYPE "JobState" AS ENUM ('PENDING', 'ACCEPTED', 'ONGOING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Job" (
    "jobId" SERIAL NOT NULL,
    "numberOfPassengers" INTEGER NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "pickupTime" TIMESTAMP(3) NOT NULL,
    "additionalDetails" TEXT,
    "currentState" "JobState" NOT NULL DEFAULT 'PENDING',
    "jobCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("jobId")
);
