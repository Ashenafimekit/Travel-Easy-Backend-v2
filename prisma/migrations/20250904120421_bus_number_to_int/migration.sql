/*
  Warnings:

  - Changed the type of `busNumber` on the `Bus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Bus" DROP COLUMN "busNumber",
ADD COLUMN     "busNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bus_busNumber_key" ON "public"."Bus"("busNumber");
