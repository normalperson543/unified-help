-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "createMessage" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "managed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "resolveMessage" TEXT NOT NULL DEFAULT '';
