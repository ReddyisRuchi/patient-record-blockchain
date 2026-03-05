/*
  Warnings:

  - You are about to drop the column `treatment` on the `PatientRecord` table. All the data in the column will be lost.
  - Added the required column `department` to the `PatientRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followUp` to the `PatientRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prescription` to the `PatientRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severity` to the `PatientRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symptoms` to the `PatientRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visitType` to the `PatientRecord` table without a default value. This is not possible if the table is not empty.
  - Made the column `blockchainHash` on table `PatientRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PatientRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "visitType" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "prescription" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "followUp" TEXT NOT NULL,
    "notes" TEXT,
    "blockchainHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PatientRecord" ("blockchainHash", "createdAt", "diagnosis", "id", "patientId") SELECT "blockchainHash", "createdAt", "diagnosis", "id", "patientId" FROM "PatientRecord";
DROP TABLE "PatientRecord";
ALTER TABLE "new_PatientRecord" RENAME TO "PatientRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
