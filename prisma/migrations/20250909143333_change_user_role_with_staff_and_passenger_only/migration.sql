/*
  Warnings:

  - The values [ADMIN,SUPER_ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [CONDUCTOR,SUPERVISOR] on the enum `StaffPosition` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `licenseNumber` on the `Staff` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('PASSENGER', 'STAFF');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'PASSENGER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."StaffPosition_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TICKETER', 'DRIVER');
ALTER TABLE "public"."Staff" ALTER COLUMN "position" TYPE "public"."StaffPosition_new" USING ("position"::text::"public"."StaffPosition_new");
ALTER TYPE "public"."StaffPosition" RENAME TO "StaffPosition_old";
ALTER TYPE "public"."StaffPosition_new" RENAME TO "StaffPosition";
DROP TYPE "public"."StaffPosition_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_passengerId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "staffId" TEXT,
ALTER COLUMN "passengerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Staff" DROP COLUMN "licenseNumber";

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "public"."Passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
