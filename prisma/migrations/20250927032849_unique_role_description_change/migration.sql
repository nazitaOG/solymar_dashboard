/*
  Warnings:

  - A unique constraint covering the columns `[description]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Role_description_key" ON "public"."Role"("description");
