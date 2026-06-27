-- AlterTable
ALTER TABLE "user" ADD COLUMN     "slackId" TEXT,
ADD COLUMN     "slackUserId" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_slackUserId_fkey" FOREIGN KEY ("slackUserId") REFERENCES "SlackUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
