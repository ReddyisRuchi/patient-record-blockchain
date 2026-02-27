/*
  Warnings:

  - You are about to drop the `patient_records` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "PatientRecord" ADD COLUMN "blockchainHash" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "patient_records";
PRAGMA foreign_keys=on;
