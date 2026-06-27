-- CreateTable
CREATE TABLE "_programsHelping" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_programsHelping_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_programsOrganizing" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_programsOrganizing_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_programsHelping_B_index" ON "_programsHelping"("B");

-- CreateIndex
CREATE INDEX "_programsOrganizing_B_index" ON "_programsOrganizing"("B");

-- AddForeignKey
ALTER TABLE "_programsHelping" ADD CONSTRAINT "_programsHelping_A_fkey" FOREIGN KEY ("A") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_programsHelping" ADD CONSTRAINT "_programsHelping_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_programsOrganizing" ADD CONSTRAINT "_programsOrganizing_A_fkey" FOREIGN KEY ("A") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_programsOrganizing" ADD CONSTRAINT "_programsOrganizing_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
