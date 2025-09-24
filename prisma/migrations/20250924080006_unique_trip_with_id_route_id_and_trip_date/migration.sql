/*
  Warnings:

  - A unique constraint covering the columns `[id,tripDate,routeId]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Trip_id_tripDate_routeId_key" ON "public"."Trip"("id", "tripDate", "routeId");
