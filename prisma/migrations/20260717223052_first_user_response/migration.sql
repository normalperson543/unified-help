-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "firstResponseUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_firstResponseUserId_fkey" FOREIGN KEY ("firstResponseUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
