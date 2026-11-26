CREATE TABLE "IgnoredThread" (
    "programId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IgnoredThread_pkey" PRIMARY KEY ("programId", "messageId"),
    CONSTRAINT "IgnoredThread_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
