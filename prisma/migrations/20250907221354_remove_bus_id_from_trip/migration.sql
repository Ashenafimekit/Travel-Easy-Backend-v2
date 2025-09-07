/*
  Warnings:

  - You are about to drop the column `busId` on the `Trip` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Trip" DROP CONSTRAINT "Trip_busId_fkey";

-- AlterTable
ALTER TABLE "public"."Trip" DROP COLUMN "busId";

-- CreateTable
CREATE TABLE "public"."_TripBus" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TripBus_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TripBus_B_index" ON "public"."_TripBus"("B");

-- AddForeignKey
ALTER TABLE "public"."_TripBus" ADD CONSTRAINT "_TripBus_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Bus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TripBus" ADD CONSTRAINT "_TripBus_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
