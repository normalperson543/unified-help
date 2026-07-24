/*
  Warnings:

  - Added the required column `assignDate` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resolveDate` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "assignDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "resolveDate" TIMESTAMP(3) NOT NULL;
