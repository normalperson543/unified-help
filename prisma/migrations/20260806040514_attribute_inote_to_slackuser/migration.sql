/*
  Warnings:

  - You are about to drop the column `userId` on the `INote` table. All the data in the column will be lost.
  - Added the required column `slackUserId` to the `INote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "INote" DROP CONSTRAINT "INote_userId_fkey";

-- AlterTable
ALTER TABLE "INote" DROP COLUMN "userId",
ADD COLUMN     "slackUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "INote" ADD CONSTRAINT "INote_slackUserId_fkey" FOREIGN KEY ("slackUserId") REFERENCES "SlackUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
