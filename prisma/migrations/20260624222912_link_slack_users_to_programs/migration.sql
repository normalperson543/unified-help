-- CreateTable
CREATE TABLE "_ProgramToSlackUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgramToSlackUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProgramToSlackUser_B_index" ON "_ProgramToSlackUser"("B");

-- AddForeignKey
ALTER TABLE "_ProgramToSlackUser" ADD CONSTRAINT "_ProgramToSlackUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProgramToSlackUser" ADD CONSTRAINT "_ProgramToSlackUser_B_fkey" FOREIGN KEY ("B") REFERENCES "SlackUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
