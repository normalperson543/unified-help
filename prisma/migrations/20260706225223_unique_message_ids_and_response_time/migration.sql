/*
  Warnings:

  - A unique constraint covering the columns `[message]` on the table `Reply` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[messageId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "responseTime" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Reply_message_key" ON "Reply"("message");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_messageId_key" ON "Ticket"("messageId");
