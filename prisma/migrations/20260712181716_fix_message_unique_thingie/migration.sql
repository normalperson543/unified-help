/*
  Warnings:

  - A unique constraint covering the columns `[messageId]` on the table `Reply` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Reply_message_key";

-- CreateIndex
CREATE UNIQUE INDEX "Reply_messageId_key" ON "Reply"("messageId");
