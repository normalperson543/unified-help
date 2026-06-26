-- CreateTable
CREATE TABLE "_ticketAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ticketAssignees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ticketAssignees_B_index" ON "_ticketAssignees"("B");

-- AddForeignKey
ALTER TABLE "_ticketAssignees" ADD CONSTRAINT "_ticketAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "SlackUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ticketAssignees" ADD CONSTRAINT "_ticketAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
