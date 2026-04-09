/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bloodGroup` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyPhone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PatientRecord" ADD COLUMN     "createdById" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
DROP COLUMN "bloodGroup",
DROP COLUMN "dateOfBirth",
DROP COLUMN "emergencyContact",
DROP COLUMN "emergencyPhone",
DROP COLUMN "phone",
DROP COLUMN "profileImage";

-- AddForeignKey
ALTER TABLE "PatientRecord" ADD CONSTRAINT "PatientRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
