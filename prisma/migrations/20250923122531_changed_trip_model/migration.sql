/*
  Warnings:

  - You are about to drop the column `arrivalTime` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `departureTime` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `tripDate` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Trip" DROP COLUMN "arrivalTime",
DROP COLUMN "departureTime",
ADD COLUMN     "tripDate" TIMESTAMP(3) NOT NULL;
