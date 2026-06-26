-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_resolverId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "resolverId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_resolverId_fkey" FOREIGN KEY ("resolverId") REFERENCES "SlackUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
