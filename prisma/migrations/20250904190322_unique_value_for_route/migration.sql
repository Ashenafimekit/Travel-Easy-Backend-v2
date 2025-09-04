/*
  Warnings:

  - A unique constraint covering the columns `[departure,destination]` on the table `Route` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Route_departure_destination_key" ON "public"."Route"("departure", "destination");
