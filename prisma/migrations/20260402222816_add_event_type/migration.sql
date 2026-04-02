-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('KAPT', 'MCL', 'TOURNAMENT');

-- AlterTable
ALTER TABLE "Capture" ADD COLUMN     "eventType" "EventType" NOT NULL DEFAULT 'KAPT';
