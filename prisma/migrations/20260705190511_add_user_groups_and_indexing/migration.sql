-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "canAutoIndex" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "userGroup" TEXT;
