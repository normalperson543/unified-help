/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `SuggestedSolution` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `TicketEmbedding` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SuggestedSolution_id_key" ON "SuggestedSolution"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TicketEmbedding_id_key" ON "TicketEmbedding"("id");
