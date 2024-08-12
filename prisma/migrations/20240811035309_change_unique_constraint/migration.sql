/*
  Warnings:

  - The primary key for the `Assignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `assignmentID` on table `Assignment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_pkey",
ALTER COLUMN "assignmentID" SET NOT NULL,
ADD CONSTRAINT "Assignment_pkey" PRIMARY KEY ("assignmentID", "mcvCourseID");
