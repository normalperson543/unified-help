-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "claimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pocUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_pocUserId_fkey" FOREIGN KEY ("pocUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
