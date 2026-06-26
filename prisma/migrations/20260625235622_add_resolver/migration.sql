/*
  Warnings:

  - Added the required column `resolverId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "resolverId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_resolverId_fkey" FOREIGN KEY ("resolverId") REFERENCES "SlackUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
