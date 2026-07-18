-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_firstResponseUserId_fkey";

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_firstResponseUserId_fkey" FOREIGN KEY ("firstResponseUserId") REFERENCES "SlackUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
