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
    "blockchainHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PatientRecord" ("blockchainHash", "createdAt", "department", "diagnosis", "followUp", "id", "notes", "patientId", "prescription", "severity", "symptoms", "visitType") SELECT "blockchainHash", "createdAt", "department", "diagnosis", "followUp", "id", "notes", "patientId", "prescription", "severity", "symptoms", "visitType" FROM "PatientRecord";
DROP TABLE "PatientRecord";
ALTER TABLE "new_PatientRecord" RENAME TO "PatientRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
